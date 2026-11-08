import { normalizeStr } from "@/lib/utils";

export interface FlanItem {
  id: string;
  name: string;
  location: { name: string; mapsUrl: string };
  photoUrl: string | null;
  rating: number;
  tried: boolean;
  triedAt: Date | null;
  comment: string | null;
}

export type FlanStatus = "all" | "tried" | "to-try";

export interface FlanFilterState {
  query: string;
  minRating: number;
  status: FlanStatus;
}

export const RATING_OPTIONS = [3, 4, 5] as const;

export function filterFlans<T extends FlanItem>(
  flans: T[],
  { query, minRating, status }: FlanFilterState,
): T[] {
  const q = normalizeStr(query.trim());
  return flans.filter((f) => {
    if (status === "tried" && !f.tried) return false;
    if (status === "to-try" && f.tried) return false;
    if (minRating > 0 && (!f.tried || f.rating < minRating)) return false;
    if (q) {
      return (
        normalizeStr(f.name).includes(q) ||
        normalizeStr(f.location.name).includes(q)
      );
    }
    return true;
  });
}

export function countTried(flans: FlanItem[]): { tried: number; toTry: number } {
  const tried = flans.filter((f) => f.tried).length;
  return { tried, toTry: flans.length - tried };
}
