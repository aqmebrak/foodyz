"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

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

export function FlanPageClient({ flans }: FlanPageClientProps) {
  const [query, setQuery] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [triedOnly, setTriedOnly] = useState(false);

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
              className="pl-8 pr-3 py-1.5 text-sm rounded-lg border border-amber-200 bg-white focus:outline-none focus:ring-1 focus:ring-amber-400 w-56"
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
                    : "bg-white border-amber-200 text-gray-600 hover:border-amber-400"
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
                : "bg-white border-amber-200 text-gray-600 hover:border-amber-400"
            }`}
          >
            ✓ Tried only
          </button>

          {/* Result count */}
          {(query || minRating > 0 || triedOnly) && (
            <span className="text-xs text-gray-400">
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
            <span className="text-xs text-gray-500">Tried</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-3.5 h-3.5 rounded-full bg-gray-400 border-2 border-gray-500" />
            <span className="text-xs text-gray-500">Not tried</span>
          </div>
        </div>
      </div>

      {/* List (tried only) */}
      {filtered.some((f) => f.tried) && (
        <div className="px-6 py-8 max-w-5xl mx-auto">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Tried{triedOnly ? "" : ` (${triedCount})`}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {filtered
              .filter((f) => f.tried)
              .map((flan) => (
                <a
                  key={flan.id}
                  href={flan.location.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-white rounded-xl border border-amber-100 hover:border-amber-300 transition-colors cursor-pointer"
                >
                  <span className="text-2xl shrink-0">🍮</span>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{flan.name}</p>
                    <p className="text-xs text-gray-500 truncate">{flan.location.name}</p>
                    <div className="flex gap-0.5 mt-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <span key={s} className={s <= flan.rating ? "text-amber-400 text-xs" : "text-gray-200 text-xs"}>
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                </a>
              ))}
          </div>
        </div>
      )}

      {/* Not tried list */}
      {!triedOnly && filtered.some((f) => !f.tried) && (
        <div className="px-6 pb-8 max-w-5xl mx-auto">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
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
                  className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-gray-300 transition-colors cursor-pointer opacity-70"
                >
                  <span className="text-2xl shrink-0 grayscale">🍮</span>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-700 text-sm truncate">{flan.name}</p>
                    <p className="text-xs text-gray-400 truncate">{flan.location.name}</p>
                  </div>
                </a>
              ))}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="px-6 py-16 text-center text-gray-400">
          <p className="text-4xl mb-3">🍮</p>
          <p className="text-base font-medium">No flans match your filters.</p>
        </div>
      )}
    </>
  );
}
