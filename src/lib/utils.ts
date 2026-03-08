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
