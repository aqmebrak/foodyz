import { normalizeStr } from "@/lib/utils";

export interface ParseUnit {
  id: string;
  name: string;
  abbreviation: string;
}

export interface ParseIngredient {
  id: string;
  name: string;
}

export interface ParsedIngredient {
  quantity: number;
  unitId: string;
  ingredientId: string | null;
  ingredientName: string;
  notes: string;
  raw: string;
}

const FRACTIONS: Record<string, number> = {
  "½": 1 / 2,
  "¼": 1 / 4,
  "¾": 3 / 4,
  "⅓": 1 / 3,
  "⅔": 2 / 3,
  "⅛": 1 / 8,
  "⅜": 3 / 8,
  "⅝": 5 / 8,
  "⅞": 7 / 8,
};

/** Accent/case-insensitive, ligatures folded, dots/apostrophes normalised. */
function norm(s: string): string {
  return normalizeStr(s)
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .replace(/[’`]/g, "'")
    .replace(/\./g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Crude singular form for plural tolerance. */
function singular(s: string): string {
  return s.length > 3 && /[sx]$/.test(s) ? s.slice(0, -1) : s;
}

/**
 * Alias (normalised) -> canonical unit name (normalised). The canonical unit
 * may be absent from the user's list; the word is then kept in notes.
 */
const UNIT_ALIASES: Record<string, string> = {
  "c a soupe": "cuillere a soupe",
  "c a s": "cuillere a soupe",
  "c soupe": "cuillere a soupe",
  cs: "cuillere a soupe",
  cas: "cuillere a soupe",
  "cuillere a soupe": "cuillere a soupe",
  "cuilleres a soupe": "cuillere a soupe",
  tbsp: "cuillere a soupe",
  tablespoon: "cuillere a soupe",
  "c a cafe": "cuillere a cafe",
  "c a c": "cuillere a cafe",
  "c cafe": "cuillere a cafe",
  cc: "cuillere a cafe",
  cac: "cuillere a cafe",
  "cuillere a cafe": "cuillere a cafe",
  "cuilleres a cafe": "cuillere a cafe",
  tsp: "cuillere a cafe",
  teaspoon: "cuillere a cafe",
  g: "gramme",
  gr: "gramme",
  gramme: "gramme",
  grammes: "gramme",
  gram: "gramme",
  kilo: "kilogramme",
  kilos: "kilogramme",
  kilogramme: "kilogramme",
  l: "litre",
  litre: "litre",
  litres: "litre",
  liter: "litre",
  oz: "once",
  // Generic words kept even when the user has no such unit.
  pincee: "pincee",
  tranche: "tranche",
  verre: "verre",
  sachet: "sachet",
  botte: "botte",
  brin: "brin",
  feuille: "feuille",
  pot: "pot",
  boite: "boite",
  noix: "noix",
  noisette: "noisette",
  filet: "filet",
  cuillere: "cuillere",
  poignee: "poignee",
  morceau: "morceau",
  piece: "piece",
};

/**
 * Count/container words: only units when followed by "de"/"d'" and present in
 * the user's units; otherwise part of the ingredient name ("2 noix de coco").
 */
const CONTAINER_WORDS = new Set([
  "noix",
  "noisette",
  "pot",
  "feuille",
  "gousse",
  "brin",
  "tranche",
  "sachet",
  "botte",
  "boite",
  "filet",
  "morceau",
  "piece",
]);

function isContainerWord(tokens: string[]): boolean {
  const key = norm(tokens.join(" ").replace(/[,;:]+$/, ""));
  return CONTAINER_WORDS.has(key) || CONTAINER_WORDS.has(singular(key));
}

interface UnitIndex {
  byKey: Map<string, ParseUnit>;
}

function buildUnitIndex(units: ParseUnit[]): UnitIndex {
  const byKey = new Map<string, ParseUnit>();
  for (const u of units) {
    byKey.set(norm(u.name), u);
  }
  // abbreviations second so names win on conflicts; "(empty)" is never a key
  for (const u of units) {
    if (u.abbreviation === "(empty)") continue;
    const k = norm(u.abbreviation);
    if (!byKey.has(k)) byKey.set(k, u);
  }
  return { byKey };
}

type UnitMatch =
  | { kind: "unit"; unit: ParseUnit; tokens: number }
  | { kind: "word"; word: string; tokens: number };

function findUnit(
  tokens: string[],
  index: UnitIndex,
): UnitMatch | null {
  for (let n = Math.min(3, tokens.length); n >= 1; n--) {
    const raw = tokens.slice(0, n).join(" ").replace(/[,;:]+$/, "");
    const key = norm(raw);
    if (!key) continue;
    const candidates = [key, singular(key)];
    for (const c of candidates) {
      const direct = index.byKey.get(c);
      if (direct) return { kind: "unit", unit: direct, tokens: n };
      const alias = UNIT_ALIASES[c];
      if (alias) {
        const viaAlias = index.byKey.get(alias);
        if (viaAlias) return { kind: "unit", unit: viaAlias, tokens: n };
        // known unit word, but not in the user's list
        if (c.length > 2 && !/^(g|l|cs|cc|gr)$/.test(c)) {
          return { kind: "word", word: raw.replace(/\.$/, ""), tokens: n };
        }
      }
    }
  }
  return null;
}

const QTY_PATTERNS: Array<{
  re: RegExp;
  value: (m: RegExpMatchArray) => number;
}> = [
  {
    re: /^(\d+)?\s*([½¼¾⅓⅔⅛⅜⅝⅞])/,
    value: (m) => Number(m[1] ?? 0) + FRACTIONS[m[2]],
  },
  {
    re: /^(\d+)\s+(\d+)\/(\d+)(?!\d)/,
    value: (m) => Number(m[1]) + Number(m[2]) / Number(m[3]),
  },
  { re: /^(\d+)\/(\d+)(?!\d)/, value: (m) => Number(m[1]) / Number(m[2]) },
  {
    // Range: "2-3", "2 à 3" -> upper bound
    re: /^(\d+(?:[.,]\d+)?)\s*(?:-|–|—|à)\s*(\d+(?:[.,]\d+)?)(?![\d/])/,
    value: (m) => Number(m[2].replace(",", ".")),
  },
  {
    re: /^(\d+(?:[.,]\d+)?)/,
    value: (m) => Number(m[1].replace(",", ".")),
  },
];

function roundQty(n: number): number {
  return Math.round(n * 1000) / 1000;
}

const LEADING_ARTICLE = /^(?:d'|de la |de l'|de |du |des |l'|la |le |les )\s*/i;

function stripArticle(s: string): string {
  return s.replace(LEADING_ARTICLE, "").trim();
}

function matchKey(s: string): string {
  return singular(norm(stripArticle(s)));
}

export function parseIngredientLine(
  line: string,
  units: ParseUnit[],
  ingredients: ParseIngredient[],
): ParsedIngredient {
  const raw = line.trim();
  let text = raw.replace(/^[-*•–—·]+\s*/, "").trim();
  const noteParts: string[] = [];

  // Parentheticals -> notes
  text = text
    .replace(/\(([^)]*)\)/g, (_, inner: string) => {
      if (inner.trim()) noteParts.push(inner.trim());
      return " ";
    })
    .replace(/\s+/g, " ")
    .trim();

  // Quantity
  let quantity = 0;
  let hasQty = false;
  for (const { re, value } of QTY_PATTERNS) {
    const m = text.match(re);
    if (m) {
      quantity = roundQty(value(m));
      text = text.slice(m[0].length).trim();
      hasQty = true;
      break;
    }
  }
  if (!hasQty) {
    const m = text.match(/^(?:un|une)\s+(?!peu\b)(?=\S)/i);
    if (m) {
      quantity = 1;
      hasQty = true;
      text = text.slice(m[0].length).trim();
    }
  }

  // Unit
  const index = buildUnitIndex(units);
  let unitId = "";
  const tokens = text.split(/\s+/).filter(Boolean);
  const match = tokens.length > 1 ? findUnit(tokens, index) : null;
  if (match && match.tokens < tokens.length) {
    const rest = tokens.slice(match.tokens).join(" ");
    // Without a quantity, only accept a unit followed by "de"/"d'" (e.g. "pincée de sel").
    const afterIsPartitive = /^(?:de |d')/i.test(rest);
    const container = isContainerWord(tokens.slice(0, match.tokens));
    const accept =
      (hasQty || afterIsPartitive) &&
      (!container || (afterIsPartitive && match.kind === "unit"));
    if (accept) {
      if (match.kind === "unit") unitId = match.unit.id;
      else noteParts.unshift(match.word);
      text = rest;
    }
  }

  // Comma suffix -> notes
  const comma = text.indexOf(",");
  if (comma !== -1) {
    const tail = text.slice(comma + 1).trim();
    if (tail) noteParts.push(tail);
    text = text.slice(0, comma);
  }

  const ingredientName = stripArticle(text.trim()) || text.trim();

  // Ingredient match: exact, then singular/plural tolerant
  const target = norm(ingredientName);
  const targetSing = matchKey(ingredientName);
  const found =
    ingredients.find((i) => norm(i.name) === target) ??
    ingredients.find((i) => matchKey(i.name) === targetSing);

  return {
    quantity,
    unitId,
    ingredientId: found ? found.id : null,
    ingredientName,
    notes: noteParts.join(", "),
    raw,
  };
}

export function parseIngredientList(
  text: string,
  units: ParseUnit[],
  ingredients: ParseIngredient[],
): ParsedIngredient[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !/^[-*•–—·]+$/.test(l))
    .map((l) => parseIngredientLine(l, units, ingredients));
}
