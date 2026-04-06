"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { normalizeStr } from "@/lib/utils";

const FlanMap = dynamic(
  () => import("./FlanMap").then((m) => m.FlanMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full rounded-xl bg-amber-100 animate-pulse flex items-center justify-center">
        <p className="text-amber-500 text-sm">Loading map…</p>
      </div>
    ),
  }
);

interface Flan {
  id: string;
  name: string;
  location: { name: string; mapsUrl: string };
  photoUrl: string | null;
  rating: number;
  tried: boolean;
  triedAt: Date | null;
  comment: string | null;
}

interface FlanPageClientProps {
  flans: Flan[];
}

const RATING_OPTIONS = [
  { label: "All ratings", value: 0 },
  { label: "★ 3+", value: 3 },
  { label: "★ 4+", value: 4 },
  { label: "★ 5", value: 5 },
];

function FlanModal({ flan, onClose }: { flan: Flan; onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div className="bg-card rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Photo */}
        {flan.photoUrl ? (
          <div className="relative w-full aspect-[4/3] bg-amber-50">
            <Image src={flan.photoUrl} alt={flan.name} fill className="object-cover" sizes="448px" />
          </div>
        ) : (
          <div className="w-full aspect-[4/3] bg-amber-50 flex items-center justify-center">
            <span className="text-7xl">🍮</span>
          </div>
        )}

        {/* Content */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-foreground">{flan.name}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">{flan.location.name}</p>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              aria-label="Close"
            >
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>

          {/* Stars */}
          <div className="flex gap-1 mt-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <span key={s} className={`text-xl ${s <= flan.rating ? "text-amber-400" : "text-gray-200"}`}>★</span>
            ))}
            <span className="ml-1 text-sm text-muted-foreground self-center">{flan.rating}/5</span>
          </div>

          {/* Date */}
          {flan.triedAt && (
            <p className="text-xs text-muted-foreground mt-2">
              Tried on {new Date(flan.triedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          )}

          {/* Comment */}
          {flan.comment && (
            <p className="text-sm text-foreground mt-3 leading-relaxed border-t border-border pt-3">
              {flan.comment}
            </p>
          )}

          {/* Maps link */}
          <a
            href={flan.location.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center gap-2 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 15.01 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 6.01 3.354 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
            </svg>
            View on Google Maps
          </a>
        </div>
      </div>
    </div>
  );
}

export function FlanPageClient({ flans }: FlanPageClientProps) {
  const [query, setQuery] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [triedOnly, setTriedOnly] = useState(false);
  const [selectedFlan, setSelectedFlan] = useState<Flan | null>(null);

  const filtered = flans.filter((f) => {
    if (triedOnly && !f.tried) return false;
    if (minRating > 0 && f.rating < minRating) return false;
    if (query.trim()) {
      const q = normalizeStr(query);
      const matchName = normalizeStr(f.name).includes(q);
      const matchLocation = normalizeStr(f.location.name).includes(q);
      if (!matchName && !matchLocation) return false;
    }
    return true;
  });

  const triedCount = flans.filter((f) => f.tried).length;

  return (
    <>
      {selectedFlan && <FlanModal flan={selectedFlan} onClose={() => setSelectedFlan(null)} />}
      {/* Filters */}
      <div className="px-6 pb-4 max-w-5xl mx-auto">
        <div className="flex flex-wrap gap-2 items-center">
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-amber-400 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or location…"
              className="pl-8 pr-3 py-1.5 text-sm rounded-lg border border-amber-200 bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-amber-400 w-56"
            />
          </div>

          {/* Rating filter */}
          <div className="flex gap-1">
            {RATING_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setMinRating(opt.value)}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                  minRating === opt.value
                    ? "bg-amber-400 border-amber-400 text-white"
                    : "bg-background border-amber-200 text-foreground hover:border-amber-400"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Tried filter */}
          <button
            onClick={() => setTriedOnly((v) => !v)}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              triedOnly
                ? "bg-emerald-500 border-emerald-500 text-white"
                : "bg-background border-amber-200 text-foreground hover:border-amber-400"
            }`}
          >
            ✓ Tried only
          </button>

          {/* Result count */}
          {(query || minRating > 0 || triedOnly) && (
            <span className="text-xs text-muted-foreground">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="px-6 max-w-5xl mx-auto">
        <div className="h-120 w-full rounded-xl overflow-hidden shadow-sm border border-amber-200">
          <FlanMap flans={filtered} />
        </div>
        {/* Legend */}
        <div className="flex items-center gap-4 mt-2 px-1">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-amber-500" />
            <span className="text-xs text-muted-foreground">Tried</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-3.5 h-3.5 rounded-full bg-gray-400 border-2 border-gray-500" />
            <span className="text-xs text-muted-foreground">Not tried</span>
          </div>
        </div>
      </div>

      {/* List (tried only) */}
      {filtered.some((f) => f.tried) && (
        <div className="px-6 py-8 max-w-5xl mx-auto">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Tried{triedOnly ? "" : ` (${triedCount})`}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {filtered
              .filter((f) => f.tried)
              .map((flan) => (
                <button
                  key={flan.id}
                  onClick={() => setSelectedFlan(flan)}
                  className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border hover:border-amber-300 transition-colors cursor-pointer text-left w-full"
                >
                  {flan.photoUrl ? (
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-amber-50">
                      <Image src={flan.photoUrl} alt={flan.name} fill className="object-cover" sizes="48px" />
                    </div>
                  ) : (
                    <span className="text-2xl shrink-0">🍮</span>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{flan.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{flan.location.name}</p>
                    <div className="flex gap-0.5 mt-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <span key={s} className={s <= flan.rating ? "text-amber-400 text-xs" : "text-gray-200 text-xs"}>
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Not tried list */}
      {!triedOnly && filtered.some((f) => !f.tried) && (
        <div className="px-6 pb-8 max-w-5xl mx-auto">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            On the list ({filtered.filter((f) => !f.tried).length})
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {filtered
              .filter((f) => !f.tried)
              .map((flan) => (
                <a
                  key={flan.id}
                  href={flan.location.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border hover:border-muted-foreground transition-colors cursor-pointer opacity-70"
                >
                  {flan.photoUrl ? (
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-100 grayscale opacity-60">
                      <Image src={flan.photoUrl} alt={flan.name} fill className="object-cover" sizes="48px" />
                    </div>
                  ) : (
                    <span className="text-2xl shrink-0 grayscale">🍮</span>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{flan.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{flan.location.name}</p>
                  </div>
                </a>
              ))}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="px-6 py-16 text-center text-muted-foreground">
          <p className="text-4xl mb-3">🍮</p>
          <p className="text-base font-medium">No flans match your filters.</p>
        </div>
      )}
    </>
  );
}
