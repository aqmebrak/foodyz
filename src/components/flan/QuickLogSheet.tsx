"use client";

import imageCompression from "browser-image-compression";
import { Camera, Check, Loader2, LocateFixed, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { Drawer } from "vaul";

import { createFlan, uploadFlanPhoto } from "@/actions/flan";
import { LocationCombobox, type PastryLocation } from "@/components/flan/LocationCombobox";
import { cn, formatDistance, rankLocationsByDistance } from "@/lib/utils";

const NEAREST_RADIUS_M = 300;

interface QuickLogSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locations: PastryLocation[];
  /** Mobile: full-height bottom drawer. Desktop: right-side drawer. */
  isMobile: boolean;
}

type GeoState = "idle" | "pending" | "granted" | "denied";

function todayLocal(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function RatingInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const move = (to: number) => {
    const next = Math.min(5, Math.max(1, to));
    onChange(next);
    refs.current[next - 1]?.focus();
  };
  return (
    <div role="radiogroup" aria-label="Rating" className="flex justify-between gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          ref={(el) => {
            refs.current[s - 1] = el;
          }}
          type="button"
          role="radio"
          aria-checked={value === s}
          aria-label={`${s} out of 5`}
          tabIndex={value === s || (value === 0 && s === 1) ? 0 : -1}
          onClick={() => onChange(s)}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight" || e.key === "ArrowUp") {
              e.preventDefault();
              move((value || 0) + 1);
            } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
              e.preventDefault();
              move((value || 2) - 1);
            }
          }}
          className={cn(
            "flex size-12 cursor-pointer items-center justify-center rounded-lg text-4xl leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-basil",
            s <= value ? "text-yolk" : "text-steam",
          )}
        >
          <span aria-hidden="true">★</span>
        </button>
      ))}
    </div>
  );
}

interface QuickLogFormProps {
  locations: PastryLocation[];
  onClose: () => void;
  onBusyChange: (busy: boolean) => void;
}

/** Mounted only while the sheet is open, so every open starts from a clean form. */
function QuickLogForm({ locations, onClose, onBusyChange }: QuickLogFormProps) {
  const [extraLocations, setExtraLocations] = useState<PastryLocation[]>([]);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [locationId, setLocationId] = useState("");
  const [comment, setComment] = useState("");
  const [triedAt, setTriedAt] = useState(todayLocal);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [stage, setStage] = useState<"uploading" | "saving">("saving");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [geo, setGeo] = useState<GeoState>("pending");
  const [here, setHere] = useState<[number, number] | null>(null);
  const [changing, setChanging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<string | null>(null);
  // URL of an already-uploaded photo, reused on retry if createFlan fails after the upload.
  const uploadedRef = useRef<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const locationsRef = useRef(locations);

  const allLocations = useMemo(() => [...locations, ...extraLocations], [locations, extraLocations]);
  const ranked = useMemo(
    () => (here ? rankLocationsByDistance(allLocations, here) : null),
    [allLocations, here],
  );
  const orderedLocations = ranked ? ranked.map((r) => r.location) : allLocations;
  const nearest =
    ranked?.[0] && ranked[0].distance !== null && ranked[0].distance <= NEAREST_RADIUS_M
      ? ranked[0]
      : null;
  const chosen = allLocations.find((l) => l.id === locationId);
  const showSuggestion = !!nearest && locationId === nearest.location.id && !changing;

  // Request geolocation on open. Never blocks the form; denial just shows the normal picker.
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      queueMicrotask(() => setGeo("denied"));
      return;
    }
    let cancelled = false;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (cancelled) return;
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setHere(coords);
        setGeo("granted");
        // Preselect the nearest location within range, unless the user already picked one.
        const top = rankLocationsByDistance(locationsRef.current, coords)[0];
        if (top && top.distance !== null && top.distance <= NEAREST_RADIUS_M) {
          setLocationId((cur) => cur || top.location.id);
        }
      },
      () => {
        if (!cancelled) setGeo("denied");
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(
    () => () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    [],
  );

  // The photo stays local (object-URL preview) until Save; nothing is uploaded before then.
  function handlePick(file: File) {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    const url = URL.createObjectURL(file);
    previewRef.current = url;
    setPreview(url);
    setPhotoFile(file);
    uploadedRef.current = null;
  }

  function removePhoto() {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = null;
    setPreview(null);
    setPhotoFile(null);
    uploadedRef.current = null;
  }

  async function handleSave() {
    if (rating < 1) return setError("Tap a star to rate it.");
    if (!locationId) return setError("Choose where you had it.");
    if (!name.trim()) return setError("Give the flan a name.");
    setError(null);
    setSaving(true);
    onBusyChange(true);
    try {
      let photoUrl: string | undefined = uploadedRef.current ?? undefined;
      if (photoFile && !photoUrl) {
        setStage("uploading");
        const compressed = await imageCompression(photoFile, {
          maxSizeMB: 1.5,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        });
        const fd = new FormData();
        fd.append("file", new File([compressed], photoFile.name, { type: compressed.type }));
        const up = await uploadFlanPhoto(fd);
        if (!up || !("url" in up) || !up.url) throw new Error("upload failed");
        photoUrl = up.url;
        uploadedRef.current = up.url;
      }
      setStage("saving");
      const result = await createFlan({
        name: name.trim(),
        locationId,
        rating,
        tried: true,
        triedAt: triedAt || undefined,
        photoUrl,
        comment: comment.trim() || undefined,
      });
      if (result && "error" in result && result.error) {
        setError(result.error);
        setSaving(false);
        onBusyChange(false);
        return;
      }
      setSaved(true);
      onBusyChange(false);
      closeTimer.current = setTimeout(onClose, 1000);
    } catch {
      setError("Could not save. Check your connection and try again.");
      setSaving(false);
      onBusyChange(false);
    }
  }

  const fieldClass =
    "w-full rounded-lg border border-steam bg-white px-3 text-base text-ink placeholder:text-ink/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-basil";
  const labelClass = "mb-1.5 block text-sm font-medium text-ink";

  return (
    <>
          <div className="flex shrink-0 items-center justify-between px-4 pb-2 pt-3">
            <Drawer.Title className="font-display text-xl font-semibold text-ink">Log a flan</Drawer.Title>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              aria-label="Close"
              className="flex size-11 cursor-pointer items-center justify-center rounded-lg text-ink/70 hover:bg-steam"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 pb-6">
            {/* Photo */}
            <div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handlePick(file);
                  e.target.value = "";
                }}
              />
              {preview ? (
                <div className="space-y-2">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-steam">
                    <Image src={preview} alt="Flan photo" fill unoptimized className="object-cover" />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => fileRef.current?.click()}
                      className="h-11 flex-1 cursor-pointer rounded-lg border border-steam bg-white text-base font-medium text-ink"
                    >
                      Change photo
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={removePhoto}
                      className="h-11 flex-1 cursor-pointer rounded-lg border border-steam bg-white text-base font-medium text-paprika"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex h-36 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-steam bg-white text-ink/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-basil"
                >
                  <Camera className="size-8" />
                  <span className="text-base font-medium">Add a photo</span>
                </button>
              )}
            </div>

            {/* Rating */}
            <div>
              <span id="quicklog-rating" className={labelClass}>
                Rating
              </span>
              <RatingInput value={rating} onChange={setRating} />
            </div>

            {/* Location */}
            <div>
              <span className={labelClass}>Where</span>
              {geo === "pending" && (
                <p className="mb-2 flex items-center gap-1.5 text-sm text-ink/60" role="status">
                  <Loader2 className="size-3.5 animate-spin" />
                  Finding nearby pâtisseries…
                </p>
              )}
              {showSuggestion && nearest && chosen ? (
                <div className="flex min-h-12 items-center justify-between gap-2 rounded-lg border border-basil/40 bg-white px-3 py-2">
                  <p className="flex min-w-0 items-center gap-2 text-base text-ink">
                    <LocateFixed className="size-4 shrink-0 text-basil" />
                    <span className="truncate">
                      Nearest: {chosen.name} · {formatDistance(nearest.distance ?? 0)}
                    </span>
                  </p>
                  <button
                    type="button"
                    onClick={() => setChanging(true)}
                    className="min-h-11 shrink-0 cursor-pointer px-2 text-base font-medium text-basil"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <LocationCombobox
                  value={locationId}
                  onChange={setLocationId}
                  locations={orderedLocations}
                  onLocationCreated={(loc) => setExtraLocations((prev) => [...prev, loc])}
                />
              )}
            </div>

            {/* Name */}
            <div>
              <label htmlFor="quicklog-name" className={labelClass}>
                Flan name
              </label>
              <input
                id="quicklog-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Flan nature"
                autoComplete="off"
                className={cn(fieldClass, "h-12")}
              />
            </div>

            {/* Comment */}
            <div>
              <label htmlFor="quicklog-comment" className={labelClass}>
                Comment
              </label>
              <textarea
                id="quicklog-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Texture, crust, price…"
                className={cn(fieldClass, "py-2.5")}
              />
            </div>

            {/* Date */}
            <div>
              <label htmlFor="quicklog-date" className={labelClass}>
                Tried on
              </label>
              <input
                id="quicklog-date"
                type="date"
                value={triedAt}
                onChange={(e) => setTriedAt(e.target.value)}
                className={cn(fieldClass, "h-12")}
              />
            </div>
          </div>

          <div className="shrink-0 border-t border-steam bg-enamel px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3">
            {error && (
              <p role="alert" className="mb-2 text-sm text-paprika">
                {error}
              </p>
            )}
            {saved ? (
              <p
                role="status"
                className="flex h-12 items-center justify-center gap-2 rounded-lg bg-basil/10 text-base font-medium text-basil"
              >
                <Check className="size-5" />
                Flan logged
              </p>
            ) : (
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={saving}
                className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-basil text-base font-semibold text-white transition-colors hover:bg-basil/90 disabled:opacity-60"
              >
                {saving && <Loader2 className="size-4 animate-spin" />}
                {saving ? (stage === "uploading" ? "Uploading photo…" : "Saving…") : "Save flan"}
              </button>
            )}
          </div>
    </>
  );
}

export function QuickLogSheet({ open, onOpenChange, locations, isMobile }: QuickLogSheetProps) {
  const [busy, setBusy] = useState(false);
  return (
    <Drawer.Root
      open={open}
      onOpenChange={(o) => {
        if (!o && busy) return;
        onOpenChange(o);
      }}
      direction={isMobile ? "bottom" : "right"}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[60] bg-ink/50" />
        <Drawer.Content
          aria-describedby={undefined}
          className={cn(
            "fixed z-[60] flex flex-col bg-enamel outline-none",
            isMobile
              ? "inset-x-0 bottom-0 top-3 rounded-t-2xl"
              : "inset-y-0 right-0 w-[420px] max-w-full border-l border-steam",
          )}
        >
          <QuickLogForm
            locations={locations}
            onClose={() => onOpenChange(false)}
            onBusyChange={setBusy}
          />
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
