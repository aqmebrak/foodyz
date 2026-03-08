"use client";

import { Pencil, Plus, Star, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState, useTransition } from "react";

import {
  createFlan,
  deleteFlan,
  type FlanFormValues,
  updateFlan,
  uploadFlanPhoto,
} from "@/actions/flan";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { LocationCombobox } from "@/components/flan/LocationCombobox";
import type { PastryLocation } from "@/components/flan/LocationCombobox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface Flan {
  id: string;
  name: string;
  location: PastryLocation;
  photoUrl: string | null;
  rating: number;
  tried: boolean;
  triedAt: Date | null;
  comment: string | null;
}

interface FlansClientProps {
  flans: Flan[];
  locations: PastryLocation[];
}

const EMPTY: FlanFormValues = {
  name: "",
  locationId: "",
  rating: 0,
  tried: false,
  triedAt: "",
  photoUrl: "",
  comment: "",
};

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="cursor-pointer"
        >
          <Star
            className={cn(
              "w-5 h-5",
              star <= value ? "fill-amber-400 text-amber-400" : "text-gray-300"
            )}
          />
        </button>
      ))}
    </div>
  );
}

function FlanForm({
  defaultValues,
  locations,
  onLocationCreated,
  onSave,
  onCancel,
}: {
  defaultValues: FlanFormValues;
  locations: PastryLocation[];
  onLocationCreated: (loc: PastryLocation) => void;
  onSave: (data: FlanFormValues) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<FlanFormValues>(defaultValues);
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FlanFormValues>(k: K, v: FlanFormValues[K]) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadFlanPhoto(fd);
    setUploading(false);
    if (result.url) set("photoUrl", result.url);
    else setError("Photo upload failed");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      void await onSave(form);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Flan name *</label>
          <Input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Flan parisien, Flan pistache…"
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Location *</label>
          <LocationCombobox
            value={form.locationId}
            onChange={(id) => set("locationId", id)}
            locations={locations}
            onLocationCreated={(loc) => {
              onLocationCreated(loc);
              set("locationId", loc.id);
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Rating</label>
          <StarRating value={form.rating} onChange={(v) => set("rating", v)} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Photo</label>
          <Input type="file" accept="image/*" onChange={handlePhoto} disabled={uploading} />
          {uploading && <p className="text-xs text-gray-400">Uploading…</p>}
          {form.photoUrl && (
            <p className="text-xs text-emerald-600 truncate">{form.photoUrl}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.tried}
            onChange={(e) => set("tried", e.target.checked)}
            className="w-4 h-4 rounded accent-emerald-600"
          />
          <span className="text-sm font-medium text-gray-700">Tried</span>
        </label>
        {form.tried && (
          <div className="space-y-1 flex-1">
            <label className="text-xs font-medium text-gray-600">Date tried</label>
            <Input
              type="date"
              value={form.triedAt ?? ""}
              onChange={(e) => set("triedAt", e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-600">Comment</label>
        <Textarea
          value={form.comment ?? ""}
          onChange={(e) => set("comment", e.target.value)}
          placeholder="Texture, taste, crust… anything you want to remember"
          rows={2}
        />
      </div>

      <div className="flex gap-2 pt-1">
        <Button type="submit" size="sm" disabled={isPending || uploading}>
          {isPending ? "Saving…" : "Save"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function FlansClient({ flans, locations: initialLocations }: FlansClientProps) {
  const [locationsList, setLocationsList] = useState(initialLocations);
  const [showNew, setShowNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  function handleLocationCreated(loc: PastryLocation) {
    setLocationsList((prev) => [...prev, loc].sort((a, b) => a.name.localeCompare(b.name)));
  }

  async function handleCreate(data: FlanFormValues) {
    await createFlan(data);
    setShowNew(false);
  }

  async function handleUpdate(id: string, data: FlanFormValues) {
    await updateFlan(id, data);
    setEditingId(null);
  }

  return (
    <div className="p-6 sm:p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Flans 🍮</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {flans.length} total · {locationsList.length} location{locationsList.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => { setShowNew(true); setEditingId(null); }}>
          <Plus className="w-4 h-4 mr-1.5" />
          New flan
        </Button>
      </div>

      {showNew && (
        <div className="mb-6 p-4 rounded-lg border border-emerald-200 bg-emerald-50">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">New flan</h2>
          <FlanForm
            defaultValues={EMPTY}
            locations={locationsList}
            onLocationCreated={handleLocationCreated}
            onSave={handleCreate}
            onCancel={() => setShowNew(false)}
          />
        </div>
      )}

      <div className="space-y-3">
        {flans.length === 0 && !showNew && (
          <p className="text-sm text-gray-400 py-8 text-center">
            No flans yet. Add your first one!
          </p>
        )}

        {flans.map((flan) => (
          <div key={flan.id} className="rounded-lg border border-gray-100 bg-white p-4">
            {editingId === flan.id ? (
              <>
                <h2 className="text-sm font-semibold text-gray-700 mb-3">
                  Editing: {flan.name}
                </h2>
                <FlanForm
                  defaultValues={{
                    name: flan.name,
                    locationId: flan.location.id,
                    rating: flan.rating,
                    tried: flan.tried,
                    triedAt: flan.triedAt ? flan.triedAt.toISOString().split("T")[0] : "",
                    photoUrl: flan.photoUrl ?? "",
                    comment: flan.comment ?? "",
                  }}
                  locations={locationsList}
                  onLocationCreated={handleLocationCreated}
                  onSave={(data) => handleUpdate(flan.id, data)}
                  onCancel={() => setEditingId(null)}
                />
              </>
            ) : (
              <div className="flex items-start gap-4">
                {flan.photoUrl ? (
                  <div className="relative w-16 h-16 rounded-md overflow-hidden shrink-0 bg-gray-100">
                    <Image src={flan.photoUrl} alt={flan.name} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-md bg-amber-50 flex items-center justify-center shrink-0 text-2xl">
                    🍮
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{flan.name}</h3>
                    {flan.tried ? (
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                        Tried{flan.triedAt ? ` · ${flan.triedAt.toLocaleDateString("fr-FR")}` : ""}
                      </span>
                    ) : (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        Not tried
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5 truncate">{flan.location.name}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "w-3.5 h-3.5",
                          star <= flan.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"
                        )}
                      />
                    ))}
                    {flan.rating > 0 && (
                      <span className="text-xs text-gray-400 ml-1">{flan.rating}/5</span>
                    )}
                  </div>
                  {flan.comment && (
                    <p className="text-xs text-gray-500 mt-1 italic line-clamp-2">{flan.comment}</p>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-gray-700 cursor-pointer"
                    onClick={() => { setEditingId(flan.id); setShowNew(false); }}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <ConfirmDialog
                    title="Delete flan?"
                    description={`"${flan.name}" will be permanently deleted.`}
                    action={deleteFlan.bind(null, flan.id)}
                    trigger={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-red-500 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    }
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
