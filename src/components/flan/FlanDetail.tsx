"use client";

import { ArrowLeft, MapPin } from "lucide-react";
import Image from "next/image";

import { FlanStars } from "@/components/flan/FlanStars";
import type { FlanItem } from "@/lib/flan-filters";
import { parseGoogleMapsUrl } from "@/lib/utils";

interface FlanDetailProps {
  flan: FlanItem;
  onBack: () => void;
}

export function FlanDetail({ flan, onBack }: FlanDetailProps) {
  return (
    <div className="pb-4">
      <div className="px-2 pb-1">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-basil hover:bg-enamel"
        >
          <ArrowLeft className="size-4" />
          All flans
        </button>
      </div>

      <div className="px-4">
        {flan.photoUrl ? (
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-steam">
            <Image
              src={flan.photoUrl}
              alt={flan.name}
              fill
              sizes="(min-width: 768px) 360px, 100vw"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex aspect-[4/3] w-full items-center justify-center rounded-xl bg-steam text-6xl">
            🍮
          </div>
        )}

        <h2 className="mt-3 font-display text-xl font-semibold text-ink max-md:sr-only">{flan.name}</h2>
        <p className="mt-0.5 text-base text-ink/60">{flan.location.name}</p>

        {flan.tried ? (
          <div className="mt-2 flex items-center gap-2">
            <FlanStars rating={flan.rating} className="text-xl" />
            <span className="text-sm tabular-nums text-ink/60">{flan.rating}/5</span>
          </div>
        ) : (
          <p className="mt-2 text-sm text-ink/60">Not tried yet</p>
        )}

        {flan.triedAt && (
          <p className="mt-2 text-sm text-ink/60">
            Tried on{" "}
            {new Date(flan.triedAt).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        )}

        {flan.comment && (
          <p className="mt-3 border-t border-steam pt-3 text-base leading-relaxed text-ink">
            {flan.comment}
          </p>
        )}

        {!parseGoogleMapsUrl(flan.location.mapsUrl) && (
          <p className="mt-4 text-sm text-ink/60">No map location — open in Google Maps</p>
        )}

        <a
          href={flan.location.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-basil px-4 text-base font-medium text-on-basil transition-colors hover:bg-basil/90"
        >
          <MapPin className="size-4" />
          Open in Google Maps
        </a>
      </div>
    </div>
  );
}
