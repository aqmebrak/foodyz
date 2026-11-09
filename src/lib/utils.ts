import { type ClassValue,clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts a string to a URL-safe slug.
 * Example: "Pasta Carbonara!" → "pasta-carbonara"
 */
export function slugify(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Formats a duration in minutes to a human-readable string.
 * Example: 90 → "1h 30min" | 45 → "45min"
 */
/** Strips diacritics and lowercases for accent-insensitive comparisons. */
export function normalizeStr(str: string): string {
  return str.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
}

const NUM = "(-?\\d+(?:\\.\\d+)?)";

function toPoint(lat: string, lng: string): [number, number] | null {
  const la = parseFloat(lat);
  const ln = parseFloat(lng);
  if (!Number.isFinite(la) || !Number.isFinite(ln)) return null;
  if (Math.abs(la) > 90 || Math.abs(ln) > 180) return null;
  return [la, ln];
}

/**
 * Extracts the place [lat, lng] from a full Google Maps URL.
 * Priority: `!3d<lat>!4d<lng>` (real pin; last pair wins) → `q=` / `query=` / `ll=` lat,lng
 * → `/place/<name>/lat,lng` → `@lat,lng` (camera centre, offset from the pin; fallback only).
 * Returns null if coordinates cannot be extracted or are out of range.
 */
export function parseGoogleMapsUrl(url: string): [number, number] | null {
  const pins = [...url.matchAll(new RegExp(`!3d${NUM}!4d${NUM}`, "g"))];
  const lastPin = pins.at(-1);
  if (lastPin) {
    const p = toPoint(lastPin[1], lastPin[2]);
    if (p) return p;
  }

  const q = url.match(new RegExp(`[?&](?:q|query|ll)=${NUM}(?:,|%2C)${NUM}`, "i"));
  if (q) {
    const p = toPoint(q[1], q[2]);
    if (p) return p;
  }

  const place = url.match(new RegExp(`/place/[^/]+/${NUM},${NUM}`));
  if (place) {
    const p = toPoint(place[1], place[2]);
    if (p) return p;
  }

  const at = url.match(new RegExp(`@${NUM},${NUM}`));
  if (at) return toPoint(at[1], at[2]);

  return null;
}

/** Label for a quantity's unit; the "pièce" unit is stored with the placeholder abbreviation "(empty)", which renders as nothing. */
export function unitLabel(unit: { abbreviation: string } | null): string {
  if (!unit || unit.abbreviation === "(empty)") return "";
  return unit.abbreviation;
}

/** Great-circle distance in meters between two [lat, lng] points. */
export function haversineMeters(a: [number, number], b: [number, number]): number {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** "120 m" under 1 km, "1.5 km" above. */
export function formatDistance(meters: number): string {
  return meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(1)} km`;
}

export interface RankedLocation<T> {
  location: T;
  /** Meters from `here`; null when the Maps URL has no parseable coordinates. */
  distance: number | null;
}

/** Nearest first; locations without parseable coords come last in input order. */
export function rankLocationsByDistance<T extends { mapsUrl: string }>(
  locations: T[],
  here: [number, number],
): RankedLocation<T>[] {
  const withDistance = locations.map((location) => {
    const coords = parseGoogleMapsUrl(location.mapsUrl);
    return { location, distance: coords ? haversineMeters(here, coords) : null };
  });
  const ranked = withDistance
    .filter((r): r is RankedLocation<T> & { distance: number } => r.distance !== null)
    .sort((x, y) => x.distance - y.distance);
  return [...ranked, ...withDistance.filter((r) => r.distance === null)];
}
