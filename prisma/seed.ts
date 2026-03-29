import bcrypt from "bcryptjs";
import { readFileSync } from "fs";
import { join } from "path";
import { Difficulty, PrismaClient, Role } from "@prisma/client";

const db = new PrismaClient();

interface RawIngredient {
  name: string;
  quantity: string;
  unit: string;
}
interface RawRecipe {
  name: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  notes: string;
  ingredients: RawIngredient[];
  instructions: string[];
}

const rawData: RawRecipe[] = JSON.parse(
  readFileSync(join(__dirname, "../data.json"), "utf-8")
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseQuantity(str: string): number {
  if (!str || str.trim() === "") return 0;
  const s = str.trim();
  if (s.includes("/")) {
    const [num, den] = s.split("/");
    return parseFloat(num) / parseFloat(den);
  }
  return parseFloat(s) || 0;
}

const UNIT_NORMALIZE: Record<string, string> = {
  cl: "cL",
  ml: "mL",
  CL: "cL",
  ML: "mL",
  G: "g",
  KG: "kg",
};

function normalizeUnit(unit: string): string {
  return UNIT_NORMALIZE[unit] ?? unit;
}

function getDifficulty(prep: number, cook: number): Difficulty {
  const total = prep + cook;
  if (total <= 30) return Difficulty.EASY;
  if (total <= 90) return Difficulty.MEDIUM;
  return Difficulty.HARD;
}

function getCategorySlug(index: number): string {
  if (index < 17) return "salees";
  if (index < 48) return "sucrees";
  if (index < 53) return "cocktails";
  if (index < 57) return "produits-entretien";
  return "cosmetiques";
}

// ---------------------------------------------------------------------------
// Ingredient normalization
// ---------------------------------------------------------------------------
const INGREDIENT_MAP: Record<string, string | null> = {
  "- 2 cas sucre glace (en fonction du sucre de la banane)": "sucre glace",
  "- 8 gousses ail": "ail",
  "1l lait entier": "lait entier",
  "22cllait 20": null,
  "24 biscuits à la cuillère": "biscuits à la cuillère",
  "acide citrique": "acide citrique",
  "ail": "ail",
  "amandes amère achée": "amandes amère achée",
  "amandes douces": "amandes douces",
  "baileys": "baileys",
  "bananes": "bananes",
  "beurre": "beurre",
  "beurre (huile,...)": "beurre",
  "beurre fondu": "beurre",
  "beurre pommade": "beurre",
  "beurre, huile d'olive": "beurre",
  "bicarbonate": "bicarbonate",
  "bicarbonate (3g)": "bicarbonate",
  "bicarbonate de soude": "bicarbonate",
  "bicarbonatte": "bicarbonate",
  "blanc oeuf": "blanc oeuf",
  "blancs oeufs": "blanc oeuf",
  "boite pois chiches (450g égoutté)": "pois chiches",
  "bonne pincée de sel": "sel",
  "bouillon de légumes": "bouillon de légumes",
  "brin laurier": "laurier",
  "brin thym": "thym",
  "cacao en poudre": "cacao en poudre",
  "cachaca": "cachaca",
  "café": "café",
  "café fort": "café",
  "cannelle": "cannelle",
  "carottes": "carotte",
  "carrées chocolat (blanc, noir, noisette...)": "chocolat au lait",
  "carrés chocolat coeur (noir, lait, blanc etc.)": "chocolat au lait",
  "carrés chocolat noir": "chocolat noir",
  "cassonade": "sucre roux",
  "chocolat (blanc, noir, lait...)": "chocolat au lait",
  "chocolat (noir, lait, blanc...)": "chocolat au lait",
  "chocolat blanc": "chocolat blanc",
  "chocolat noir": "chocolat noir",
  "chou chinois": "chou chinois",
  "citron": "citron jaune",
  "citron combava": "citron combava",
  "citron jaune": "citron jaune",
  "citrons jaunes": "citron jaune",
  "cm gingembre frais": "gingembre",
  "compotte de pomme": "compotte de pomme",
  "concentré de fleur de sureau": "concentré de fleur de sureau",
  "confiture, nutella, chocolat, pépite de chocolat etc.": "confiture",
  "conté": "comté",
  "coriandre moulue": "coriandre moulue",
  "courge cuite": "courge",
  "creme de marron": "creme de marron",
  "creme fraiche 30%mg": "crème fraiche",
  "creme liquide": "creme liquide",
  "cristaux de soude": "cristaux de soude",
  "crème de coco (ou 2 boite de conserve de lait de coco)": "crème de coco",
  "crème entière liquide": "crème entière liquide",
  "crème fraiche": "crème fraiche",
  "crème fraiche 30%mg": "crème fraiche",
  "cuisse poulet": "poulet",
  "cuisson": null,
  "cumin": "cumin",
  "cumin moulu": "cumin",
  "curcuma en poudre": "curcuma",
  "d'eau très chaude": "eau",
  "de beurre": "beurre",
  "de farine": "farine",
  "de pépites de chocolat": "pépites de chocolat",
  "de sucre": "sucre",
  "eau": "eau",
  "eau bouillante": "eau",
  "eau chaude": "eau",
  "eau déminéralisée": "eau",
  "eau tiède": "eau",
  "epices : cube-or, sel, poivre, piment": "épices",
  "epices : poivre, piment": "épices",
  "epices : safran, curcuma, piment, sel, poivre": "épices",
  "epices/fruit : cannelle, muscade, vanille, pomme...": "épices",
  "epinards": "épinards",
  "extrait de vanille ou sucre vanillé": "extrait de vanille",
  "farce": null,
  "farine": "farine",
  "farine (poids des 6 oeufs)": "farine",
  "farine 00": "farine",
  "farine t65": "farine",
  "feta": "féta",
  "flocon d'avoine": "flocon d'avoine",
  "fraine": "farine",
  "framboise": "framboise",
  "framboise congelé": "framboise congelé",
  "fromage frais (philadelphia)": "fromage frais (philadelphia)",
  "fruits : fruit rouge, pommes, banane...": "fruits",
  "féta": "féta",
  "gingembre": "gingembre",
  "glaçon": "glaçons",
  "glaçons": "glaçons",
  "gousse ail": "ail",
  "gousses ail": "ail",
  "gousses vanille": "gousse de vanille",
  "gouttes conservateur cosgard": "gingembre conservateur cosgard",
  "gouttes huile essentielle : tea-trea, citron, menthe poivrée, eucalyptus (au choix ou mélangé)": "huile essentielle",
  "gouttes huile essentielle citron sans furocoumarines de sicile bio": "huile essentielle de citron",
  "gouttes huile essentielle d'orange douce": "huile essentielle d'orange douce",
  "gouttes huile essentielle de citron": "huile essentielle de citron",
  "gouttes huile essentielle de lavande": "huile essentielle de lavande",
  "gouttes huile essentielle de mandarine jaune": "huile essentielle de mandarine jaune",
  "graines de moutarde": "graines de moutarde",
  "graines de sésame": "graines de sésame",
  "gros sel de mer": "gros sel de mer",
  "grosses endives": "endive",
  "gruyère, parmesan": "gruyère",
  "huile": "huile",
  "huile d'olive": "huile d'olive",
  "huile de sesame": "huile de sésame",
  "huile de sésame": "huile de sésame",
  "huile d\u2019olive": "huile d'olive",
  "huile olive": "huile d'olive",
  "huile sésame": "huile de sésame",
  "huile végétale": "huile végétale",
  "jaune oeuf": "jaune d'oeuf",
  "jaunes d'oeufs": "jaune d'oeuf",
  "jus de citron (3-4 citrons)": "jus de citron",
  "jus de rôti": "jus de rôti",
  "lait": "lait",
  "lait de coco": "lait de coco",
  "lait entier": "lait entier",
  "lait végétal": "lait végétal",
  "lemoncurl": "lemon curd",
  "levure": "levure chimique",
  "levure chimique": "levure chimique",
  "levure de boulanger fraiche ou 2 sachet levure boulanger sèche": "levure de boulanger fraiche",
  "limonade": "limonade",
  "limoncelo": "limoncelo",
  "maizéna": "maïzena",
  "mascarpone": "mascarpone",
  "maïzena": "maïzena",
  "menthe": "menthe",
  "meringue": "meringue",
  "miel": "miel",
  "mixte lentilles corail et lentilles vertes": "lentilles corail",
  "moule rond diamètre 24cm": null,
  "moutarde": "moutarde",
  "noisette émondées": "noisette émondées",
  "oeuf": "oeuf",
  "oeufs": "oeuf",
  "oignon": "oignon",
  "oignons": "oignon",
  "olive verte": "olive verte",
  "oranges": "orange",
  "paquets de 48 thé lu": "biscuit thé lu",
  "pastis": "pastis",
  "petit citron": "citron jaune",
  "petits piments vert": "piment vert",
  "peu d'huile neutre": "huile",
  "pincrée sel": "sel",
  "pincé de chaque épice : gingembre, muscade, canelle, sucre vanillé": "épices",
  "poireau": "poireau",
  "poivre, noix de muscade, piment": "poivre",
  "pomme de terre": "pomme de terre",
  "pommes": "pomme",
  "poudre amande": "poudre d'amande",
  "poudre noisette": "poudre de noisette",
  "pour la ganache au chocolat blanc": null,
  "pour la mousse à la framboise": null,
  "pour la pâte": null,
  "pâte brisée": "pâte brisée",
  "pâte de spéculoos": "pâte de spéculos",
  "pâte sablée": "pâte brisée",
  "pâte à gyoza": "pâte à gyoza",
  "rhum": "rhum",
  "rhum / fleur d'oranger": "rhum / fleur d'oranger",
  "rhum blanc": "rhum blanc",
  "riz": "riz",
  "riz rond": "riz rond",
  "sachet levure": "levure chimique",
  "sachet levure chimique": "levure chimique",
  "sachet levure sèche instantanée de boulanger": "levure de boulanger fraiche",
  "sachet sucre vanillé": "sucre vanillé",
  "sauce": null,
  "sauce soja": "sauce soja",
  "saucisse fumée": "saucisse fumée",
  "saucisses de toulouse": "saucisses de toulouse",
  "savon de marseille": "savon de marseille",
  "sel": "sel",
  "sel, poivre": "sel",
  "sirop de vanille ou chocolat blanc": "sirop de vanille",
  "sirop sucre de canne": "sirop de sucre de canne",
  "sirops": null,
  "sucre": "sucre",
  "sucre (poids des 6 oeufs)": "sucre",
  "sucre blanc": "sucre",
  "sucre en grains gros grains": "sucre en grains",
  "sucre glace": "sucre glace",
  "sucre glace / noix de coco rappée / poudre de noisette": "sucre glace",
  "sucre poudre": "sucre",
  "sucre roux": "sucre roux",
  "sucre semoule": "sucre",
  "sucre si pâte sucrée": "sucre",
  "sucre vanillé": "sucre vanillé",
  "sucre vanillé (55g)": "sucre vanillé",
  "tablette chocolat blanc": "chocolat blanc",
  "tensioactif base consistance sans palme": "tensioactif base consistance sans palme",
  "tensioactif sodium coco sulfate": "tensioactif sodium coco sulfate",
  "thon en boite": "thon en boite",
  "tomates concassées": "tomates concassées",
  "vinaigre": "vinaigre",
  "vinaigre blanc": "vinaigre blanc",
  "vinaigre d'alcool 12°": "vinaigre d'alcool 12°",
  "vinaigre de cidre (7g)": "vinaigre de cidre",
  "vinaigre de riz": "vinaigre de riz",
  "vinaigre framboise": "vinaigre framboise",
  "vodka": "vodka",
  "yaourt nature": "yaourt nature",
  "zeste citron": "zeste citron",
  "zeste citron, orange ou clémentine": "zeste citron",
  "\u00bd sachet de levure": "levure chimique",
  "\u00e0 6 praline": "praline",
  "\u00e0 th\u00e9 de lait": "lait",
  "\u0153ufs": "oeuf",
};

function normalizeIngredientName(raw: string): string | null {
  const lower = raw.trim().toLowerCase();
  // Skip section headers and non-ingredients
  if (
    lower.startsWith("pour la ") ||
    lower.startsWith("pour le ") ||
    lower.startsWith("pour les ") ||
    lower.includes("diam\u00e8tre") ||
    lower === "sauce" ||
    lower === "farce" ||
    lower === "cuisson" ||
    lower === "sirops"
  ) {
    return null;
  }
  if (lower in INGREDIENT_MAP) return INGREDIENT_MAP[lower];
  // Fall back to cleaned raw name
  return lower;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log("Seeding database\u2026");

  // -------------------------------------------------------------------------
  // Units
  // -------------------------------------------------------------------------
  const unitDefs = [
    { name: "millilitre", abbreviation: "mL" },
    { name: "centilitre", abbreviation: "cL" },
    { name: "litre", abbreviation: "L" },
    { name: "gramme", abbreviation: "g" },
    { name: "milligramme", abbreviation: "mg" },
    { name: "kilogramme", abbreviation: "kg" },
    { name: "cuill\u00e8re \u00e0 caf\u00e9", abbreviation: "cac" },
    { name: "cuill\u00e8re \u00e0 soupe", abbreviation: "cas" },
    { name: "cup", abbreviation: "cup" },
    { name: "pinc\u00e9e", abbreviation: "pinc\u00e9e" },
    { name: "pi\u00e8ce", abbreviation: "(empty)" },
    { name: "bol", abbreviation: "bol" },
    { name: "bouchon", abbreviation: "bouchon" },
    { name: "gousse", abbreviation: "gousse" },
    { name: "paquet", abbreviation: "paquet" },
    { name: "tasse", abbreviation: "tasse" },
  ];

  const units = await Promise.all(
    unitDefs.map((u) =>
      db.unit.upsert({
        where: { abbreviation: u.abbreviation },
        update: {},
        create: u,
      })
    )
  );
  const unitMap = Object.fromEntries(units.map((u) => [u.abbreviation, u]));
  console.log("  \u2713 Units");

  // -------------------------------------------------------------------------
  // Categories
  // -------------------------------------------------------------------------
  const categoryDefs = [
    { name: "Desserts", slug: "desserts", description: "G\u00e2teaux, tartes et douceurs sucr\u00e9es." },
    { name: "Salades", slug: "salades", description: "Salades fra\u00eeches et nutritives." },
    { name: "Plats", slug: "plats", description: "Plats principaux chauds et r\u00e9confortants." },
    { name: "Sucr\u00e9es", slug: "sucrees", description: "Recettes sucr\u00e9es et p\u00e2tisseries." },
    { name: "Sal\u00e9es", slug: "salees", description: "Recettes sal\u00e9es et plats principaux." },
    { name: "Cocktails", slug: "cocktails", description: "Cocktails et boissons." },
    { name: "Produits d\u2019entretien", slug: "produits-entretien", description: "Recettes de produits m\u00e9nagers naturels." },
    { name: "Cosm\u00e9tiques", slug: "cosmetiques", description: "Recettes cosm\u00e9tiques naturelles." },
  ];

  const categories = await Promise.all(
    categoryDefs.map((c) =>
      db.category.upsert({ where: { slug: c.slug }, update: {}, create: c })
    )
  );
  const categoryMap = Object.fromEntries(categories.map((c) => [c.slug, c]));
  console.log("  \u2713 Categories");
  console.log("  \u2713 ", categoryMap);

  // -------------------------------------------------------------------------
  // Ingredients
  // -------------------------------------------------------------------------
  const ingredientNames = [
    "sucre glace", "gousse d'ail", "tensioactif sodium coco sulfate", "praline",
    "lait", "acide citrique", "lait entier", "lait v\u00e9g\u00e9tal",
    "amandes am\u00e8re ach\u00e9e", "amandes douces", "cacao en poudre", "baileys",
    "bananes", "beurre", "bicarbonate", "blanc oeuf", "pois chiches", "caf\u00e9",
    "sel", "rhum", "bouillon de l\u00e9gumes", "laurier", "thym", "levure chimique",
    "cannelle", "carotte", "chocolat blanc", "chocolat noir", "chocolat au lait",
    "chou chinois", "citron jaune", "citron combava", "citron vert", "gingembre",
    "compotte de pomme", "concentr\u00e9 de fleur de sureau", "confiture", "comt\u00e9",
    "coriandre moulue", "courge", "cr\u00e8me de coco", "creme de marron",
    "cr\u00e8me enti\u00e8re liquide", "cr\u00e8me fraiche", "creme liquide",
    "cristaux de soude", "poulet", "cumin", "curcuma", "eau", "farine", "miel",
    "p\u00e9pites de chocolat", "sucre", "\u00e9pices", "\u00e9pinards",
    "extrait de vanille", "sucre vanill\u00e9", "f\u00e9ta", "flocon d'avoine",
    "fraise", "framboise", "framboise congel\u00e9", "fromage frais (philadelphia)",
    "fruits", "graines de moutarde", "graines de s\u00e9same", "gros sel de mer",
    "haca", "huile", "huile d'olive", "huile de s\u00e9same", "huile v\u00e9g\u00e9tale",
    "limonade", "jaune d'oeuf", "jus de citron", "jus de r\u00f4ti", "gla\u00e7ons",
    "lait de coco", "levure de boulanger fraiche", "limoncelo", "ma\u00efzena",
    "mascarpone", "menthe", "lentilles corail", "lentilles vertes", "moutarde",
    "noisette \u00e9mond\u00e9es", "oeuf", "oignon", "olive verte", "orange",
    "gousse de vanille", "gingembre conservateur cosgard", "huile essentielle",
    "huile essentielle de citron", "huile essentielle d'orange douce",
    "huile essentielle de lavande", "huile essentielle de mandarine jaune",
    "biscuits \u00e0 la cuill\u00e8re", "biscuit th\u00e9 lu", "pastis", "p\u00e2te bris\u00e9e",
    "p\u00e2te de sp\u00e9culos", "piment vert", "poireau", "poivre", "noix de muscade",
    "piment", "pomme de terre", "pomme", "poudre d'amande", "poudre de noisette",
    "rhum / fleur d'oranger", "rhum blanc", "riz", "riz rond", "endive", "gruy\u00e8re",
    "parmesan", "sauce soja", "saucisse fum\u00e9e", "saucisses de toulouse",
    "savon de marseille", "sirop de vanille", "sirop de chocolat blanc",
    "sirop de sucre de canne", "sonade", "sucre roux",
    "tensioactif base consistance sans palme", "thon en boite", "tomates concass\u00e9es",
    "vinaigre", "vinaigre blanc", "vinaigre d'alcool 12\u00b0", "vinaigre de cidre",
    "vinaigre de riz", "vinaigre framboise", "vodka", "yaourt nature", "zeste citron",
    // New ingredients from scraped data
    "ail", "cachaca", "lemon curd", "meringue", "p\u00e2te \u00e0 gyoza", "sucre en grains",
  ];

  const ingredientMap: Record<string, { id: string }> = {};
  for (const name of ingredientNames) {
    const slug = slugify(name);
    const ingredient = await db.ingredient.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
    ingredientMap[name] = ingredient;
  }
  console.log("  \u2713 Ingredients");

  // -------------------------------------------------------------------------
  // Tags
  // -------------------------------------------------------------------------
  const classicTag = await db.tag.upsert({
    where: { slug: "classic" },
    update: {},
    create: { name: "Classic", slug: "classic" },
  });
  const dessertTag = await db.tag.upsert({
    where: { slug: "dessert" },
    update: {},
    create: { name: "Dessert", slug: "dessert" },
  });
  const vegetarienTag = await db.tag.upsert({
    where: { slug: "vegetarien" },
    update: {},
    create: { name: "V\u00e9g\u00e9tarien", slug: "vegetarien" },
  });
  console.log("  \u2713 Tags");

  // -------------------------------------------------------------------------
  // Legacy placeholder recipes (kept for DB compatibility)
  // -------------------------------------------------------------------------
  const gateau = await db.recipe.upsert({
    where: { slug: "gateau-au-chocolat" },
    update: {},
    create: {
      title: "G\u00e2teau au Chocolat",
      slug: "gateau-au-chocolat",
      description: "Un d\u00e9licieux g\u00e2teau au chocolat moelleux",
      instructions: [
        "Pr\u00e9chauffer le four \u00e0 180\u00b0C",
        "Faire fondre le chocolat et le beurre au bain-marie",
        "Battre les \u0153ufs avec le sucre jusqu'\u00e0 ce que le m\u00e9lange blanchisse",
        "Incorporer le m\u00e9lange chocolat-beurre refroidi",
        "Ajouter la farine tamis\u00e9e et m\u00e9langer d\u00e9licatement",
        "Verser dans un moule beurr\u00e9 et cuire 45 minutes",
      ]
        .map((s, i) => `${i + 1}. ${s}`)
        .join("\n\n"),
      prepTime: 20,
      cookTime: 45,
      servings: 8,
      difficulty: Difficulty.MEDIUM,
      published: true,
    },
  });
  await db.recipeIngredient.createMany({
    skipDuplicates: true,
    data: [
      { recipeId: gateau.id, ingredientId: ingredientMap["chocolat noir"].id, unitId: unitMap["g"].id, quantity: 200, notes: "70% de cacao", order: 0 },
      { recipeId: gateau.id, ingredientId: ingredientMap["beurre"].id, unitId: unitMap["g"].id, quantity: 150, order: 1 },
      { recipeId: gateau.id, ingredientId: ingredientMap["sucre"].id, unitId: unitMap["g"].id, quantity: 150, order: 2 },
      { recipeId: gateau.id, ingredientId: ingredientMap["oeuf"].id, unitId: unitMap["(empty)"].id, quantity: 3, order: 3 },
      { recipeId: gateau.id, ingredientId: ingredientMap["farine"].id, unitId: unitMap["g"].id, quantity: 100, order: 4 },
    ],
  });
  await db.recipeTag.createMany({
    skipDuplicates: true,
    data: [{ recipeId: gateau.id, tagId: classicTag.id }, { recipeId: gateau.id, tagId: dessertTag.id }],
  });

  const salade = await db.recipe.upsert({
    where: { slug: "salade-de-lentilles" },
    update: {},
    create: {
      title: "Salade de Lentilles",
      slug: "salade-de-lentilles",
      description: "Une salade nutritive et savoureuse",
      instructions: [
        "Rincer les lentilles et les cuire dans de l'eau bouillante sal\u00e9e pendant 25 minutes",
        "\u00c9plucher et couper les carottes en d\u00e9s",
        "\u00c9mincer finement l'oignon",
        "\u00c9goutter les lentilles et les laisser ti\u00e9dir",
        "M\u00e9langer les lentilles avec les l\u00e9gumes",
        "Pr\u00e9parer la vinaigrette avec l'huile, le vinaigre, sel et poivre",
        "Assaisonner la salade et laisser reposer 30 minutes avant de servir",
      ]
        .map((s, i) => `${i + 1}. ${s}`)
        .join("\n\n"),
      prepTime: 15,
      cookTime: 25,
      servings: 4,
      difficulty: Difficulty.EASY,
      published: true,
    },
  });
  await db.recipeIngredient.createMany({
    skipDuplicates: true,
    data: [
      { recipeId: salade.id, ingredientId: ingredientMap["lentilles vertes"].id, unitId: unitMap["g"].id, quantity: 250, order: 0 },
      { recipeId: salade.id, ingredientId: ingredientMap["carotte"].id, unitId: unitMap["(empty)"].id, quantity: 2, order: 1 },
      { recipeId: salade.id, ingredientId: ingredientMap["oignon"].id, unitId: unitMap["(empty)"].id, quantity: 1, order: 2 },
      { recipeId: salade.id, ingredientId: ingredientMap["huile d'olive"].id, unitId: unitMap["cas"].id, quantity: 3, order: 3 },
      { recipeId: salade.id, ingredientId: ingredientMap["vinaigre de cidre"].id, unitId: unitMap["cas"].id, quantity: 2, order: 4 },
      { recipeId: salade.id, ingredientId: ingredientMap["sel"].id, unitId: unitMap["pincée"].id, quantity: 1, order: 5 },
      { recipeId: salade.id, ingredientId: ingredientMap["poivre"].id, unitId: unitMap["pincée"].id, quantity: 1, order: 6 },
    ],
  });
  await db.recipeTag.createMany({
    skipDuplicates: true,
    data: [{ recipeId: salade.id, tagId: vegetarienTag.id }],
  });

  const risotto = await db.recipe.upsert({
    where: { slug: "risotto-aux-champignons" },
    update: {},
    create: {
      title: "Risotto aux Champignons",
      slug: "risotto-aux-champignons",
      description: "Un risotto cr\u00e9meux aux champignons",
      instructions: [
        "Faire chauffer le bouillon de l\u00e9gumes",
        "\u00c9mincer l'oignon et le faire revenir dans l'huile d'olive",
        "Ajouter le riz et le nacrer 2 minutes",
        "Verser une louche de bouillon chaud et m\u00e9langer",
        "Continuer \u00e0 ajouter le bouillon louche par louche en remuant constamment",
        "Cuire environ 18-20 minutes jusqu'\u00e0 ce que le riz soit cr\u00e9meux",
        "Incorporer le parmesan r\u00e2p\u00e9 et le beurre",
        "Servir imm\u00e9diatement",
      ]
        .map((s, i) => `${i + 1}. ${s}`)
        .join("\n\n"),
      prepTime: 10,
      cookTime: 30,
      servings: 4,
      difficulty: Difficulty.MEDIUM,
      published: true,
    },
  });
  await db.recipeIngredient.createMany({
    skipDuplicates: true,
    data: [
      { recipeId: risotto.id, ingredientId: ingredientMap["riz rond"].id, unitId: unitMap["g"].id, quantity: 300, order: 0 },
      { recipeId: risotto.id, ingredientId: ingredientMap["bouillon de légumes"].id, unitId: unitMap["L"].id, quantity: 1, order: 1 },
      { recipeId: risotto.id, ingredientId: ingredientMap["oignon"].id, unitId: unitMap["(empty)"].id, quantity: 1, order: 2 },
      { recipeId: risotto.id, ingredientId: ingredientMap["huile d'olive"].id, unitId: unitMap["cas"].id, quantity: 2, order: 3 },
      { recipeId: risotto.id, ingredientId: ingredientMap["parmesan"].id, unitId: unitMap["g"].id, quantity: 100, order: 4 },
      { recipeId: risotto.id, ingredientId: ingredientMap["beurre"].id, unitId: unitMap["g"].id, quantity: 30, order: 5 },
    ],
  });
  await db.recipeTag.createMany({
    skipDuplicates: true,
    data: [{ recipeId: risotto.id, tagId: classicTag.id }, { recipeId: risotto.id, tagId: vegetarienTag.id }],
  });

  console.log("  \u2713 Legacy recipes");

  // -------------------------------------------------------------------------
  // Scraped recipes from data.json
  // -------------------------------------------------------------------------
  console.log(`\n  Importing ${rawData.length} scraped recipes\u2026`);
  let imported = 0;
  let skippedIngredients = 0;

  for (let i = 0; i < rawData.length; i++) {
    const r = rawData[i];
    const slug = slugify(r.name);

    const recipe = await db.recipe.upsert({
      where: { slug },
      update: {},
      create: {
        title: r.name,
        slug,
        description: r.notes || null,
        instructions: r.instructions.map((s, idx) => `${idx + 1}. ${s}`).join("\n\n"),
        prepTime: r.prepTime,
        cookTime: r.cookTime,
        servings: r.servings,
        difficulty: getDifficulty(r.prepTime, r.cookTime),
        published: true,
      },
    });

    const ingredientData: {
      recipeId: string;
      ingredientId: string;
      unitId: string;
      quantity: number;
      order: number;
    }[] = [];

    for (let j = 0; j < r.ingredients.length; j++) {
      const ing = r.ingredients[j];
      const canonicalName = normalizeIngredientName(ing.name);
      if (!canonicalName) continue;

      const ingredient = ingredientMap[canonicalName];
      if (!ingredient) {
        skippedIngredients++;
        continue;
      }

      const normalizedUnit = normalizeUnit(ing.unit);
      const unit = unitMap[normalizedUnit] ?? unitMap["(empty)"];
      ingredientData.push({
        recipeId: recipe.id,
        ingredientId: ingredient.id,
        unitId: unit.id,
        quantity: parseQuantity(ing.quantity),
        order: j,
      });
    }

    if (ingredientData.length > 0) {
      await db.recipeIngredient.createMany({ skipDuplicates: true, data: ingredientData });
    }

    imported++;
    process.stdout.write(`\r  ${imported}/${rawData.length} ${r.name.slice(0, 40)}`);
  }

  console.log(`\n  \u2713 Scraped recipes (${imported} imported, ${skippedIngredients} ingredient refs skipped)`);

  // -------------------------------------------------------------------------
  // Admin user
  // -------------------------------------------------------------------------
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
  }
  const hashedPassword = await bcrypt.hash(adminPassword, 12);
  await db.user.upsert({
    where: { email: adminEmail },
    update: { password: hashedPassword },
    create: { email: adminEmail, password: hashedPassword, name: "Admin", role: Role.ADMIN },
  });
  console.log(`  \u2713 Admin user (email: ${adminEmail})`);

  console.log("\nSeeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
