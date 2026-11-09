"use client";

import { Check, ExternalLink, MapPin, TriangleAlert } from "lucide-react";
import { useState, useTransition } from "react";

import { updatePastryLocationUrl } from "@/actions/flan";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isShortMapsUrl } from "@/lib/maps-url";
import { cn, parseGoogleMapsUrl } from "@/lib/utils";

interface ShopFlan {
  id: string;
  name: string;
  tried: boolean;
}

interface Shop {
  id: string;
  name: string;
  mapsUrl: string;
  flans: ShopFlan[];
}

interface ShopsClientProps {
  shops: Shop[];
}

function PositionHint({ url }: { url: string }) {
  const trimmed = url.trim();
  const coords = parseGoogleMapsUrl(trimmed);
  if (coords) {
    return (
      <p className="flex items-center gap-1.5 text-sm text-basil" data-testid="shop-position">
        <MapPin className="size-4 shrink-0" />
        Pin at {coords[0].toFixed(5)}, {coords[1].toFixed(5)}
      </p>
    );
  }
  if (isShortMapsUrl(trimmed)) {
    return (
      <p className="text-sm text-ink/60" data-testid="shop-position">
        Short link: the position is read when you save.
      </p>
    );
  }
  return (
    <p className="flex items-center gap-1.5 text-sm text-paprika" data-testid="shop-position">
      <TriangleAlert className="size-4 shrink-0" />
      No position found. This shop won&apos;t appear on the map.
    </p>
  );
}

function ShopCard({ shop }: { shop: Shop }) {
  const [value, setValue] = useState(shop.mapsUrl);
  const [saved, setSaved] = useState(shop.mapsUrl);
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const dirty = value.trim() !== saved;
  const triedCount = shop.flans.filter((f) => f.tried).length;

  function handleSave() {
    setError(null);
    setJustSaved(false);
    startTransition(async () => {
      const result = await updatePastryLocationUrl(shop.id, value);
      if (result?.error) {
        setError(result.error);
        return;
      }
      const next = result?.location?.mapsUrl ?? value.trim();
      setValue(next);
      setSaved(next);
      setJustSaved(true);
    });
  }

  return (
    <li data-testid="shop-row" className="rounded-lg border border-steam bg-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <h2 className="text-lg font-semibold text-ink">{shop.name}</h2>
        <p className="text-sm text-ink/60">
          {shop.flans.length === 0
            ? "No flans yet"
            : `${shop.flans.length} flan${shop.flans.length !== 1 ? "s" : ""} · ${triedCount} tried`}
        </p>
      </div>

      {shop.flans.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2" aria-label={`Flans at ${shop.name}`}>
          {shop.flans.map((flan) => (
            <li
              key={flan.id}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm",
                flan.tried
                  ? "border-yolk/50 bg-yolk/15 text-ink"
                  : "border-steam bg-enamel text-ink/60",
              )}
            >
              {flan.tried && <Check className="size-3.5 text-basil" aria-hidden />}
              <span>{flan.name}</span>
              <span className="sr-only">{flan.tried ? "(tried)" : "(not tried)"}</span>
            </li>
          ))}
        </ul>
      )}

      <form
        className="mt-4 flex flex-col gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (dirty && !isPending) handleSave();
        }}
      >
        <label htmlFor={`maps-url-${shop.id}`} className="text-sm font-medium text-ink">
          Google Maps URL
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id={`maps-url-${shop.id}`}
            type="url"
            inputMode="url"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setJustSaved(false);
            }}
            placeholder="https://www.google.com/maps/place/…"
            className="h-11 flex-1 bg-card text-base"
          />
          <div className="flex gap-2">
            <Button type="submit" className="h-11 flex-1 sm:flex-none" disabled={!dirty || isPending}>
              {isPending ? "Saving…" : "Save URL"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-11 shrink-0"
              asChild
            >
              <a
                href={saved}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${shop.name} in Google Maps`}
              >
                <ExternalLink className="size-4" />
              </a>
            </Button>
          </div>
        </div>
        <PositionHint url={value} />
        {error && (
          <p role="alert" className="text-sm text-paprika">
            {error}
          </p>
        )}
        {justSaved && !dirty && (
          <p role="status" className="text-sm text-basil">
            URL saved
          </p>
        )}
      </form>
    </li>
  );
}

export function ShopsClient({ shops }: ShopsClientProps) {
  return (
    <div className="max-w-4xl p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Flan shops</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          {shops.length} shop{shops.length !== 1 ? "s" : ""} · edit the Maps URL to move a pin
        </p>
      </div>

      {shops.length === 0 ? (
        <p className="rounded-lg border border-dashed border-steam p-8 text-center text-ink/60">
          No shops yet. Add one when you create a flan.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {shops.map((shop) => (
            <ShopCard key={shop.id} shop={shop} />
          ))}
        </ul>
      )}
    </div>
  );
}
