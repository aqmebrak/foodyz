"use client";

import Image from "next/image";

import { FlanStars } from "@/components/flan/FlanStars";
import type { FlanItem } from "@/lib/flan-filters";
import { cn } from "@/lib/utils";

interface FlanListProps {
  flans: FlanItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** True when filters hide flans; false when there are none at all. */
  filtered?: boolean;
}

export function FlanList({ flans, selectedId, onSelect, filtered = true }: FlanListProps) {
  if (flans.length === 0) {
    return (
      <div className="px-4 py-10 text-center text-ink/60">
        <p className="mb-2 text-3xl">🍮</p>
        {filtered ? (
          <p className="text-base font-medium">No flans match your filters.</p>
        ) : (
          <>
            <p className="text-base font-medium">No flans yet.</p>
            <p className="mt-1 text-sm">Tap “Log a flan” to add your first one.</p>
          </>
        )}
      </div>
    );
  }

  return (
    <ul className="divide-y divide-steam">
      {flans.map((flan) => (
        <li key={flan.id}>
          <button
            type="button"
            onClick={() => onSelect(flan.id)}
            className={cn(
              "flex min-h-[72px] w-full cursor-pointer items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-enamel",
              flan.id === selectedId && "bg-enamel",
            )}
          >
            {flan.photoUrl ? (
              <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-steam">
                <Image
                  src={flan.photoUrl}
                  alt=""
                  fill
                  sizes="56px"
                  className={cn("object-cover", !flan.tried && "opacity-60 grayscale")}
                />
              </span>
            ) : (
              <span
                className={cn(
                  "flex size-14 shrink-0 items-center justify-center rounded-lg bg-steam text-2xl",
                  !flan.tried && "grayscale",
                )}
              >
                🍮
              </span>
            )}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-base font-medium text-ink">{flan.name}</span>
              <span className="block truncate text-sm text-ink/60">{flan.location.name}</span>
              {flan.tried ? (
                <FlanStars rating={flan.rating} className="mt-0.5 text-sm" />
              ) : (
                <span className="mt-0.5 block text-xs text-ink/60">To try</span>
              )}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
