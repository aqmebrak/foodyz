export interface ParsedTimer {
  label: string;
  seconds: number;
  index: number;
}

const NUM = String.raw`\d+(?:[.,]\d+)?`;
// Simple fractions ("1/2") and the "½" glyph count as numbers too.
const NUMF = String.raw`(?:\d+\s*/\s*\d+|½|${NUM})`;
const NOT_LETTER = String.raw`(?![\p{L}])`;

// number [range upper bound] + unit. "1h30" / "1 h 30" supported for hours.
const TIMER_RE = new RegExp(
  String.raw`(?<![\d.,\p{L}])(?:${NUMF}\s*(?:-|–|—|à|to)\s*)?(?<n>${NUMF})\s*(?:` +
    String.raw`(?:d['’]\s*)?(?<h>h|heures?|hours?|hrs?)${NOT_LETTER}` +
    String.raw`(?:(?<half>\s+et\s+demi[e]?)${NOT_LETTER}|\s*(?<hm>\d{1,2})(?:\s*(?:minutes?|min|mn)${NOT_LETTER}|(?![\d\p{L}°%])(?:(?<=[hH]\d{1,2})|(?!\s*(?:(?:kg|g|cl|ml|dl|l|cm|mm)${NOT_LETTER}|\p{L}{3,})))))?` +
    String.raw`|(?<m>minutes?|mins?|mn)${NOT_LETTER}` +
    String.raw`|(?<s>secondes?|seconds?|secs?|s)(?![\p{L}'’])` +
    String.raw`)`,
  "giu",
);

function num(v: string): number {
  if (v === "½") return 0.5;
  const f = v.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (f) return Number(f[2]) === 0 ? 0 : Number(f[1]) / Number(f[2]);
  return parseFloat(v.replace(",", "."));
}

function label(seconds: number): string {
  if (seconds >= 3600) {
    const h = Math.floor(seconds / 3600);
    const m = Math.round((seconds % 3600) / 60);
    return m ? `${h} h ${m}` : `${h} h`;
  }
  if (seconds >= 60) {
    const m = Math.round(seconds / 60);
    return `${m} min`;
  }
  return `${seconds} s`;
}

/** Finds durations (French + English) in a recipe step. Ranges use the upper bound. */
export function parseTimers(step: string): ParsedTimer[] {
  const out: ParsedTimer[] = [];
  for (const m of step.matchAll(TIMER_RE)) {
    const g = m.groups!;
    const n = num(g.n);
    let seconds = 0;
    if (g.h) seconds = Math.round(n * 3600) + (g.hm ? parseInt(g.hm, 10) * 60 : 0) + (g.half ? 1800 : 0);
    else if (g.m) seconds = Math.round(n * 60);
    else if (g.s) seconds = Math.round(n);
    if (seconds <= 0) continue;
    out.push({ label: label(seconds), seconds, index: m.index });
  }
  return out;
}

/** Countdown text: m:ss, or h:mm:ss from one hour up. */
export function formatCountdown(totalSeconds: number): string {
  const t = Math.max(0, Math.ceil(totalSeconds));
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${ss}` : `${m}:${ss}`;
}
