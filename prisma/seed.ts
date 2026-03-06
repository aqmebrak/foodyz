import { PrismaClient, Difficulty, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  console.log("Seeding database…");

  // ---------------------------------------------------------------------------
  // Units
  // ---------------------------------------------------------------------------
  const unitDefs = [
    { name: "millilitre", abbreviation: "mL" },
    { name: "centilitre", abbreviation: "cL" },
    { name: "litre", abbreviation: "L" },
    { name: "gramme", abbreviation: "g" },
    { name: "milligramme", abbreviation: "mg" },
    { name: "kilogramme", abbreviation: "kg" },
    { name: "cuillère à café", abbreviation: "cac" },
    { name: "cuillère à soupe", abbreviation: "cas" },
    { name: "cup", abbreviation: "cup" },
    { name: "pincée", abbreviation: "pincée" },
    { name: "pièce", abbreviation: "(empty)" },
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
  console.log("  ✓ Units");

  // ---------------------------------------------------------------------------
  // Categories
  // ---------------------------------------------------------------------------
  const desserts = await db.category.upsert({
    where: { slug: "desserts" },
    update: {},
    create: {
      name: "Desserts",
      slug: "desserts",
      description: "Gâteaux, tartes et douceurs sucrées.",
    },
  });

  const salades = await db.category.upsert({
    where: { slug: "salades" },
    update: {},
    create: {
      name: "Salades",
      slug: "salades",
      description: "Salades fraîches et nutritives.",
    },
  });

  const plats = await db.category.upsert({
    where: { slug: "plats" },
    update: {},
    create: {
      name: "Plats",
      slug: "plats",
      description: "Plats principaux chauds et réconfortants.",
    },
  });

  console.log("  ✓ Categories");

  // ---------------------------------------------------------------------------
  // Ingredients
  // ---------------------------------------------------------------------------
  const ingredientNames = [
    "sucre glace",
    "gousse d'ail",
    "tensioactif sodium coco sulfate",
    "praline",
    "lait",
    "acide citrique",
    "lait entier",
    "lait végétal",
    "amandes amère achée",
    "amandes douces",
    "cacao en poudre",
    "baileys",
    "bananes",
    "beurre",
    "bicarbonate",
    "blanc oeuf",
    "pois chiches",
    "café",
    "sel",
    "rhum",
    "bouillon de légumes",
    "laurier",
    "thym",
    "levure chimique",
    "cannelle",
    "carotte",
    "chocolat blanc",
    "chocolat noir",
    "chocolat au lait",
    "chou chinois",
    "citron jaune",
    "citron combava",
    "citron vert",
    "gingembre",
    "compotte de pomme",
    "concentré de fleur de sureau",
    "confiture",
    "comté",
    "coriandre moulue",
    "courge",
    "crème de coco",
    "creme de marron",
    "crème entière liquide",
    "crème fraiche",
    "creme liquide",
    "cristaux de soude",
    "poulet",
    "cumin",
    "curcuma",
    "eau",
    "farine",
    "miel",
    "pépites de chocolat",
    "sucre",
    "épices",
    "épinards",
    "extrait de vanille",
    "sucre vanillé",
    "féta",
    "flocon d'avoine",
    "fraise",
    "framboise",
    "framboise congelé",
    "fromage frais (philadelphia)",
    "fruits",
    "graines de moutarde",
    "graines de sésame",
    "gros sel de mer",
    "haca",
    "huile",
    "huile d'olive",
    "huile de sésame",
    "huile végétale",
    "limonade",
    "jaune d'oeuf",
    "jus de citron",
    "jus de rôti",
    "glaçons",
    "lait de coco",
    "levure de boulanger fraiche",
    "limoncelo",
    "maïzena",
    "mascarpone",
    "menthe",
    "lentilles corail",
    "lentilles vertes",
    "moutarde",
    "noisette émondées",
    "oeuf",
    "oignon",
    "olive verte",
    "orange",
    "gousse de vanille",
    "gingembre conservateur cosgard",
    "huile essentielle",
    "huile essentielle de citron",
    "huile essentielle d'orange douce",
    "huile essentielle de lavande",
    "huile essentielle de mandarine jaune",
    "biscuits à la cuillère",
    "biscuit thé lu",
    "pastis",
    "pâte brisée",
    "pâte de spéculos",
    "piment vert",
    "poireau",
    "poivre",
    "noix de muscade",
    "piment",
    "pomme de terre",
    "pomme",
    "poudre d'amande",
    "poudre de noisette",
    "rhum / fleur d'oranger",
    "rhum blanc",
    "riz",
    "riz rond",
    "endive",
    "gruyère",
    "parmesan",
    "sauce soja",
    "saucisse fumée",
    "saucisses de toulouse",
    "savon de marseille",
    "sirop de vanille",
    "sirop de chocolat blanc",
    "sirop de sucre de canne",
    "sonade",
    "sucre roux",
    "tensioactif base consistance sans palme",
    "thon en boite",
    "tomates concassées",
    "vinaigre",
    "vinaigre blanc",
    "vinaigre d'alcool 12°",
    "vinaigre de cidre",
    "vinaigre de riz",
    "vinaigre framboise",
    "vodka",
    "yaourt nature",
    "zeste citron",
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

  console.log("  ✓ Ingredients");

  // ---------------------------------------------------------------------------
  // Tags
  // ---------------------------------------------------------------------------
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
    create: { name: "Végétarien", slug: "vegetarien" },
  });

  console.log("  ✓ Tags");

  // ---------------------------------------------------------------------------
  // Recipes
  // ---------------------------------------------------------------------------

  // Recipe 1: Gâteau au Chocolat
  const gateau = await db.recipe.upsert({
    where: { slug: "gateau-au-chocolat" },
    update: {},
    create: {
      title: "Gâteau au Chocolat",
      slug: "gateau-au-chocolat",
      description: "Un délicieux gâteau au chocolat moelleux",
      instructions: [
        "Préchauffer le four à 180°C",
        "Faire fondre le chocolat et le beurre au bain-marie",
        "Battre les œufs avec le sucre jusqu'à ce que le mélange blanchisse",
        "Incorporer le mélange chocolat-beurre refroidi",
        "Ajouter la farine tamisée et mélanger délicatement",
        "Verser dans un moule beurré et cuire 45 minutes",
      ]
        .map((s, i) => `${i + 1}. ${s}`)
        .join("\n\n"),
      prepTime: 20,
      cookTime: 45,
      servings: 8,
      difficulty: Difficulty.MEDIUM,
      published: true,
      categoryId: desserts.id,
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
    data: [
      { recipeId: gateau.id, tagId: classicTag.id },
      { recipeId: gateau.id, tagId: dessertTag.id },
    ],
  });

  // Recipe 2: Salade de Lentilles
  const salade = await db.recipe.upsert({
    where: { slug: "salade-de-lentilles" },
    update: {},
    create: {
      title: "Salade de Lentilles",
      slug: "salade-de-lentilles",
      description: "Une salade nutritive et savoureuse",
      instructions: [
        "Rincer les lentilles et les cuire dans de l'eau bouillante salée pendant 25 minutes",
        "Éplucher et couper les carottes en dés",
        "Émincer finement l'oignon",
        "Égoutter les lentilles et les laisser tiédir",
        "Mélanger les lentilles avec les légumes",
        "Préparer la vinaigrette avec l'huile, le vinaigre, sel et poivre",
        "Assaisonner la salade et laisser reposer 30 minutes avant de servir",
      ]
        .map((s, i) => `${i + 1}. ${s}`)
        .join("\n\n"),
      prepTime: 15,
      cookTime: 25,
      servings: 4,
      difficulty: Difficulty.EASY,
      published: true,
      categoryId: salades.id,
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

  // Recipe 3: Risotto aux Champignons
  const risotto = await db.recipe.upsert({
    where: { slug: "risotto-aux-champignons" },
    update: {},
    create: {
      title: "Risotto aux Champignons",
      slug: "risotto-aux-champignons",
      description: "Un risotto crémeux aux champignons",
      instructions: [
        "Faire chauffer le bouillon de légumes",
        "Émincer l'oignon et le faire revenir dans l'huile d'olive",
        "Ajouter le riz et le nacrer 2 minutes",
        "Verser une louche de bouillon chaud et mélanger",
        "Continuer à ajouter le bouillon louche par louche en remuant constamment",
        "Cuire environ 18-20 minutes jusqu'à ce que le riz soit crémeux",
        "Incorporer le parmesan râpé et le beurre",
        "Servir immédiatement",
      ]
        .map((s, i) => `${i + 1}. ${s}`)
        .join("\n\n"),
      prepTime: 10,
      cookTime: 30,
      servings: 4,
      difficulty: Difficulty.MEDIUM,
      published: true,
      categoryId: plats.id,
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
    data: [
      { recipeId: risotto.id, tagId: classicTag.id },
      { recipeId: risotto.id, tagId: vegetarienTag.id },
    ],
  });

  console.log("  ✓ Recipes");

  // ---------------------------------------------------------------------------
  // Admin user
  // ---------------------------------------------------------------------------
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
  }
  const hashedPassword = await bcrypt.hash(adminPassword, 12);
  await db.user.upsert({
    where: { email: adminEmail },
    update: { password: hashedPassword },
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: "Admin",
      role: Role.ADMIN,
    },
  });
  console.log(`  ✓ Admin user (email: ${adminEmail})`);

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
