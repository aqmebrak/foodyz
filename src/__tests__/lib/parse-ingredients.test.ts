import { describe, expect, it } from "vitest";

import { parseIngredientLine, parseIngredientList } from "@/lib/parse-ingredients";

const units = [
  { id: "u-ml", name: "millilitre", abbreviation: "mL" },
  { id: "u-cl", name: "centilitre", abbreviation: "cL" },
  { id: "u-l", name: "litre", abbreviation: "L" },
  { id: "u-g", name: "gramme", abbreviation: "g" },
  { id: "u-kg", name: "kilogramme", abbreviation: "kg" },
  { id: "u-cac", name: "cuillère à café", abbreviation: "cac" },
  { id: "u-cas", name: "cuillère à soupe", abbreviation: "cas" },
  { id: "u-cup", name: "cup", abbreviation: "cup" },
  { id: "u-gousse", name: "gousse", abbreviation: "gousse" },
  { id: "u-piece", name: "pièce", abbreviation: "(empty)" },
];

const ingredients = [
  { id: "i-spag", name: "spaghetti" },
  { id: "i-oeuf", name: "œuf" },
  { id: "i-lait", name: "lait" },
  { id: "i-huile", name: "huile d'olive" },
  { id: "i-sel", name: "sel" },
  { id: "i-peco", name: "pecorino" },
  { id: "i-tom", name: "tomate" },
  { id: "i-cit", name: "citron" },
  { id: "i-sucre", name: "sucre" },
  { id: "i-ail", name: "ail" },
];

const p = (line: string) => parseIngredientLine(line, units, ingredients);

describe("parseIngredientLine", () => {
  it("parses qty, abbreviated unit and name", () => {
    expect(p("200 g spaghetti")).toMatchObject({
      quantity: 200,
      unitId: "u-g",
      ingredientId: "i-spag",
      ingredientName: "spaghetti",
      notes: "",
    });
  });

  it("parses a count with no unit and matches plural to singular (oe ligature)", () => {
    expect(p("2 oeufs")).toMatchObject({
      quantity: 2,
      unitId: "",
      ingredientId: "i-oeuf",
    });
  });

  it("accepts comma decimals and strips 'de'", () => {
    expect(p("1,5 l de lait")).toMatchObject({
      quantity: 1.5,
      unitId: "u-l",
      ingredientId: "i-lait",
      ingredientName: "lait",
    });
  });

  it("maps French spoon aliases and strips d'", () => {
    expect(p("1 c. à soupe d'huile d'olive")).toMatchObject({
      quantity: 1,
      unitId: "u-cas",
      ingredientId: "i-huile",
      ingredientName: "huile d'olive",
    });
  });

  it("maps long spoon names and plurals", () => {
    expect(p("2 cuillères à café de sel")).toMatchObject({
      quantity: 2,
      unitId: "u-cac",
      ingredientId: "i-sel",
    });
  });

  it("bare ingredient has qty 0 and no unit", () => {
    expect(p("sel")).toMatchObject({
      quantity: 0,
      unitId: "",
      ingredientId: "i-sel",
      ingredientName: "sel",
    });
  });

  it("extracts parenthetical as notes and handles glued unit", () => {
    expect(p("40g pecorino (râpé)")).toMatchObject({
      quantity: 40,
      unitId: "u-g",
      ingredientId: "i-peco",
      notes: "râpé",
    });
  });

  it("strips bullets", () => {
    expect(p("- 3 tomates")).toMatchObject({ quantity: 3, ingredientId: "i-tom" });
    expect(p("• 3 tomates")).toMatchObject({ quantity: 3, ingredientId: "i-tom" });
    expect(p("* 3 tomates")).toMatchObject({ quantity: 3, ingredientId: "i-tom" });
  });

  it("parses unicode fractions", () => {
    expect(p("½ citron")).toMatchObject({ quantity: 0.5, ingredientId: "i-cit" });
    expect(p("1½ citron")).toMatchObject({ quantity: 1.5, ingredientId: "i-cit" });
  });

  it("parses slash fractions and english units", () => {
    expect(p("1/2 cup sugar")).toMatchObject({
      quantity: 0.5,
      unitId: "u-cup",
      ingredientId: null,
      ingredientName: "sugar",
    });
  });

  it("parses mixed numbers", () => {
    expect(p("1 1/2 kg tomates")).toMatchObject({
      quantity: 1.5,
      unitId: "u-kg",
      ingredientId: "i-tom",
    });
  });

  it("matches the unit 'pièce' by name, never by (empty)", () => {
    expect(p("3 pièces de citron")).toMatchObject({
      quantity: 3,
      unitId: "u-piece",
      ingredientId: "i-cit",
    });
    expect(p("3 (empty) citron").unitId).toBe("");
  });

  it("matches units by name with plural (gousses)", () => {
    expect(p("2 gousses d'ail")).toMatchObject({
      quantity: 2,
      unitId: "u-gousse",
      ingredientId: "i-ail",
    });
  });

  it("is accent and case insensitive for ingredients", () => {
    expect(p("200 G SPAGHETTI")).toMatchObject({ unitId: "u-g", ingredientId: "i-spag" });
    expect(p("1 Œuf").ingredientId).toBe("i-oeuf");
  });

  it("returns null ingredientId for unknown ingredients", () => {
    expect(p("100 g quinoa")).toMatchObject({
      ingredientId: null,
      ingredientName: "quinoa",
      unitId: "u-g",
    });
  });

  it("keeps unmatched unit words in notes", () => {
    expect(p("1 pincée de sel")).toMatchObject({
      quantity: 1,
      unitId: "",
      ingredientId: "i-sel",
      notes: "pincée",
    });
  });

  it("treats comma suffix as notes", () => {
    expect(p("2 tomates, coupées en dés")).toMatchObject({
      quantity: 2,
      ingredientId: "i-tom",
      notes: "coupées en dés",
    });
  });

  it("handles 'une' as 1 and keeps raw", () => {
    const r = p("une pincée de sel");
    expect(r.quantity).toBe(1);
    expect(r.raw).toBe("une pincée de sel");
  });

  it("combines unit-word and parenthetical notes", () => {
    expect(p("1 pincée de sel (fin)").notes).toBe("pincée, fin");
  });
});

describe("container words and ranges", () => {
  it("keeps container words in the name when no matching unit exists", () => {
    expect(p("2 noix de coco")).toMatchObject({
      quantity: 2,
      unitId: "",
      ingredientName: "noix de coco",
      notes: "",
    });
    expect(p("1 pot de yaourt")).toMatchObject({
      unitId: "",
      ingredientName: "pot de yaourt",
      notes: "",
    });
    expect(p("3 feuilles de laurier").ingredientName).toBe("feuilles de laurier");
  });

  it("keeps container words in the name when not followed by de/d'", () => {
    expect(p("2 pièces citron")).toMatchObject({ unitId: "", ingredientName: "pièces citron" });
  });

  it("still treats a container as unit when 'de' follows and the unit exists", () => {
    expect(p("2 gousses d'ail")).toMatchObject({ unitId: "u-gousse", ingredientId: "i-ail" });
  });

  it("uses the upper bound for ranges", () => {
    expect(p("2-3 tomates")).toMatchObject({
      quantity: 3,
      ingredientName: "tomates",
      ingredientId: "i-tom",
    });
    expect(p("2 à 3 tomates")).toMatchObject({ quantity: 3, ingredientName: "tomates" });
    expect(p("100–150 g spaghetti")).toMatchObject({ quantity: 150, unitId: "u-g" });
  });
});

describe("parseIngredientList", () => {
  it("skips blank lines and parses each line", () => {
    const rows = parseIngredientList("200 g spaghetti\n\n  \n2 oeufs\r\nsel", units, ingredients);
    expect(rows.map((r) => r.ingredientId)).toEqual(["i-spag", "i-oeuf", "i-sel"]);
  });
});
