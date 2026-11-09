"use client";

import { Check, ExternalLink, MapPin, TriangleAlert } from "lucide-react";
import { useState, useTransition } from "react";

import { updatePastryLocation } from "@/actions/flan";
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
  const [name, setName] = useState(shop.name);
  const [url, setUrl] = useState(shop.mapsUrl);
  // Last values known to be stored: what the heading, "Open in Maps" and the dirty check compare against.
  const [saved, setSaved] = useState({ name: shop.name, mapsUrl: shop.mapsUrl });
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const dirty = name.trim() !== saved.name || url.trim() !== saved.mapsUrl;
  const triedCount = shop.flans.filter((f) => f.tried).length;

  function handleSave() {
    setError(null);
    setJustSaved(false);
    startTransition(async () => {
      const result = await updatePastryLocation(shop.id, { name, mapsUrl: url });
      if (result?.error) {
        setError(result.error);
        return;
      }
      const next = {
        name: result?.location?.name ?? name.trim(),
        mapsUrl: result?.location?.mapsUrl ?? url.trim(),
      };
      setName(next.name);
      setUrl(next.mapsUrl);
      setSaved(next);
      setJustSaved(true);
    });
  }

  const fieldClass = "h-11 bg-card text-base";

  return (
    <li data-testid="shop-row" className="rounded-lg border border-steam bg-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <h2 className="text-lg font-semibold text-ink">{saved.name}</h2>
        <p className="text-sm text-ink/60">
          {shop.flans.length === 0
            ? "No flans yet"
            : `${shop.flans.length} flan${shop.flans.length !== 1 ? "s" : ""} · ${triedCount} tried`}
        </p>
      </div>

      {shop.flans.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2" aria-label={`Flans at ${saved.name}`}>
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
        className="mt-4 flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (dirty && !isPending) handleSave();
        }}
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`shop-name-${shop.id}`} className="text-sm font-medium text-ink">
            Name
          </label>
          <Input
            id={`shop-name-${shop.id}`}
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setJustSaved(false);
            }}
            className={fieldClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={`maps-url-${shop.id}`} className="text-sm font-medium text-ink">
            Google Maps URL
          </label>
          <Input
            id={`maps-url-${shop.id}`}
            type="url"
            inputMode="url"
            required
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setJustSaved(false);
            }}
            placeholder="https://www.google.com/maps/place/… or https://maps.app.goo.gl/…"
            className={fieldClass}
          />
          <PositionHint url={url} />
        </div>

        <div className="flex items-center gap-2">
          <Button type="submit" className="h-11 flex-1 sm:flex-none" disabled={!dirty || isPending}>
            {isPending ? "Saving…" : "Save"}
          </Button>
          <Button type="button" variant="outline" className="h-11 shrink-0" asChild>
            <a
              href={saved.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${saved.name} in Google Maps`}
            >
              <ExternalLink className="size-4" />
              <span className="max-sm:sr-only">Open in Maps</span>
            </a>
          </Button>
          {justSaved && !dirty && (
            <p role="status" className="text-sm text-basil">
              Saved
            </p>
          )}
        </div>
        {error && (
          <p role="alert" className="text-sm text-paprika">
            {error}
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
          {shops.length} shop{shops.length !== 1 ? "s" : ""} · rename a shop or edit its Maps URL to move its pin
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
