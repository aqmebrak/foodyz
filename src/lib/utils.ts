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

/**
 * Extracts [lat, lng] from a full Google Maps URL.
 * Supports: /@lat,lng,zoom  |  ?q=lat,lng  |  /place/name/lat,lng
 * Returns null if coordinates cannot be extracted.
 */
export function parseGoogleMapsUrl(url: string): [number, number] | null {
  const atMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (atMatch) return [parseFloat(atMatch[1]), parseFloat(atMatch[2])];

  const qMatch = url.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (qMatch) return [parseFloat(qMatch[1]), parseFloat(qMatch[2])];

  const placeMatch = url.match(/\/place\/[^/]+\/(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (placeMatch) return [parseFloat(placeMatch[1]), parseFloat(placeMatch[2])];

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
