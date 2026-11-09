export interface Draft<T> {
  values: T;
  savedAt: number;
}

export function serializeDraft<T>(values: T, savedAt: number): string {
  return JSON.stringify({ values, savedAt } satisfies Draft<T>);
}

export function parseDraft<T>(raw: string | null): Draft<T> | null {
  if (!raw) return null;
  try {
    const d = JSON.parse(raw) as Partial<Draft<T>> | null;
    if (
      !d ||
      typeof d !== "object" ||
      typeof d.savedAt !== "number" ||
      d.values === undefined ||
      d.values === null ||
      typeof d.values !== "object"
    ) {
      return null;
    }
    return { values: d.values, savedAt: d.savedAt };
  } catch {
    return null;
  }
}

export function formatRelativeTime(timestamp: number, now: number): string {
  const diff = Math.max(0, now - timestamp);
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} minute${min === 1 ? "" : "s"} ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hour${hr === 1 ? "" : "s"} ago`;
  const day = Math.floor(hr / 24);
  return `${day} day${day === 1 ? "" : "s"} ago`;
}
