import { PrismaClient, Difficulty, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("Seeding database…");

  // ---------------------------------------------------------------------------
  // Units
  // ---------------------------------------------------------------------------
  const units = await Promise.all([
    db.unit.upsert({
      where: { abbreviation: "g" },
      update: {},
      create: { name: "gram", abbreviation: "g" },
    }),
    db.unit.upsert({
      where: { abbreviation: "kg" },
      update: {},
      create: { name: "kilogram", abbreviation: "kg" },
    }),
    db.unit.upsert({
      where: { abbreviation: "ml" },
      update: {},
      create: { name: "milliliter", abbreviation: "ml" },
    }),
    db.unit.upsert({
      where: { abbreviation: "l" },
      update: {},
      create: { name: "liter", abbreviation: "l" },
    }),
    db.unit.upsert({
      where: { abbreviation: "tsp" },
      update: {},
      create: { name: "teaspoon", abbreviation: "tsp" },
    }),
    db.unit.upsert({
      where: { abbreviation: "tbsp" },
      update: {},
      create: { name: "tablespoon", abbreviation: "tbsp" },
    }),
    db.unit.upsert({
      where: { abbreviation: "cup" },
      update: {},
      create: { name: "cup", abbreviation: "cup" },
    }),
    db.unit.upsert({
      where: { abbreviation: "pcs" },
      update: {},
      create: { name: "pieces", abbreviation: "pcs" },
    }),
    db.unit.upsert({
      where: { abbreviation: "clove" },
      update: {},
      create: { name: "clove", abbreviation: "clove" },
    }),
  ]);

  const unitMap = Object.fromEntries(units.map((u) => [u.abbreviation, u]));
  console.log("  ✓ Units");

  // ---------------------------------------------------------------------------
  // Categories
  // ---------------------------------------------------------------------------
  const italian = await db.category.upsert({
    where: { slug: "italian" },
    update: {},
    create: {
      name: "Italian",
      slug: "italian",
      description: "Classic Italian recipes from pasta to pizza.",
    },
  });

  const asian = await db.category.upsert({
    where: { slug: "asian" },
    update: {},
    create: {
      name: "Asian",
      slug: "asian",
      description: "Flavours from across Asia — stir-fries, noodles, and more.",
    },
  });

  const mexican = await db.category.upsert({
    where: { slug: "mexican" },
    update: {},
    create: {
      name: "Mexican",
      slug: "mexican",
      description: "Bold and vibrant Mexican dishes.",
    },
  });

  console.log("  ✓ Categories");

  // ---------------------------------------------------------------------------
  // Ingredients
  // ---------------------------------------------------------------------------
  const flour = await db.ingredient.upsert({
    where: { slug: "flour" },
    update: {},
    create: { name: "All-purpose flour", slug: "flour" },
  });

  const oliveOil = await db.ingredient.upsert({
    where: { slug: "olive-oil" },
    update: {},
    create: { name: "Olive oil", slug: "olive-oil" },
  });

  const garlic = await db.ingredient.upsert({
    where: { slug: "garlic" },
    update: {},
    create: { name: "Garlic", slug: "garlic" },
  });

  const tomato = await db.ingredient.upsert({
    where: { slug: "tomato" },
    update: {},
    create: { name: "Tomato", slug: "tomato" },
  });

  const chicken = await db.ingredient.upsert({
    where: { slug: "chicken-breast" },
    update: {},
    create: { name: "Chicken breast", slug: "chicken-breast" },
  });

  const spaghetti = await db.ingredient.upsert({
    where: { slug: "spaghetti" },
    update: {},
    create: { name: "Spaghetti", slug: "spaghetti" },
  });

  const guanciale = await db.ingredient.upsert({
    where: { slug: "guanciale" },
    update: {},
    create: { name: "Guanciale (or pancetta)", slug: "guanciale" },
  });

  const egg = await db.ingredient.upsert({
    where: { slug: "egg" },
    update: {},
    create: { name: "Egg", slug: "egg" },
  });

  const parmigiano = await db.ingredient.upsert({
    where: { slug: "parmigiano-reggiano" },
    update: {},
    create: { name: "Parmigiano Reggiano", slug: "parmigiano-reggiano" },
  });

  const blackPepper = await db.ingredient.upsert({
    where: { slug: "black-pepper" },
    update: {},
    create: { name: "Black pepper", slug: "black-pepper" },
  });

  console.log("  ✓ Ingredients");

  // ---------------------------------------------------------------------------
  // Tags
  // ---------------------------------------------------------------------------
  const quickTag = await db.tag.upsert({
    where: { slug: "quick" },
    update: {},
    create: { name: "Quick", slug: "quick" },
  });

  const classicTag = await db.tag.upsert({
    where: { slug: "classic" },
    update: {},
    create: { name: "Classic", slug: "classic" },
  });

  const pastaTag = await db.tag.upsert({
    where: { slug: "pasta" },
    update: {},
    create: { name: "Pasta", slug: "pasta" },
  });

  console.log("  ✓ Tags");

  // ---------------------------------------------------------------------------
  // Recipes
  // ---------------------------------------------------------------------------

  // Recipe 1: Pasta Carbonara (published)
  const carbonara = await db.recipe.upsert({
    where: { slug: "pasta-carbonara" },
    update: {},
    create: {
      title: "Pasta Carbonara",
      slug: "pasta-carbonara",
      description:
        "A creamy Roman pasta dish made with eggs, Parmigiano Reggiano, guanciale, and black pepper. No cream needed.",
      instructions: `1. Cook spaghetti in a large pot of salted boiling water until al dente (about 8-10 minutes). Reserve 1 cup of pasta water before draining.

2. While the pasta cooks, cut the guanciale into small cubes or strips. Cook in a large pan over medium heat until crispy. Remove from heat and set aside.

3. In a bowl, whisk together the eggs and grated Parmigiano Reggiano until smooth. Season generously with freshly cracked black pepper.

4. Add the drained pasta directly to the pan with the guanciale (off the heat). Add a splash of the reserved pasta water.

5. Pour the egg and cheese mixture over the pasta, tossing quickly to coat. Add more pasta water a little at a time until you achieve a creamy, glossy sauce. The residual heat will cook the eggs without scrambling them.

6. Serve immediately with extra Parmigiano and black pepper.`,
      prepTime: 10,
      cookTime: 20,
      servings: 4,
      difficulty: Difficulty.MEDIUM,
      published: true,
      categoryId: italian.id,
    },
  });

  // Add ingredients to Carbonara
  await db.recipeIngredient.createMany({
    skipDuplicates: true,
    data: [
      {
        recipeId: carbonara.id,
        ingredientId: spaghetti.id,
        unitId: unitMap["g"].id,
        quantity: 400,
        order: 0,
      },
      {
        recipeId: carbonara.id,
        ingredientId: guanciale.id,
        unitId: unitMap["g"].id,
        quantity: 150,
        order: 1,
      },
      {
        recipeId: carbonara.id,
        ingredientId: egg.id,
        unitId: unitMap["pcs"].id,
        quantity: 4,
        notes: "2 whole eggs + 2 yolks",
        order: 2,
      },
      {
        recipeId: carbonara.id,
        ingredientId: parmigiano.id,
        unitId: unitMap["g"].id,
        quantity: 80,
        notes: "finely grated",
        order: 3,
      },
      {
        recipeId: carbonara.id,
        ingredientId: blackPepper.id,
        unitId: unitMap["tsp"].id,
        quantity: 1,
        notes: "freshly cracked",
        order: 4,
      },
    ],
  });

  // Add tags to Carbonara
  await db.recipeTag.createMany({
    skipDuplicates: true,
    data: [
      { recipeId: carbonara.id, tagId: classicTag.id },
      { recipeId: carbonara.id, tagId: pastaTag.id },
    ],
  });

  // Recipe 2: Garlic Chicken (draft)
  const garlicChicken = await db.recipe.upsert({
    where: { slug: "garlic-chicken" },
    update: {},
    create: {
      title: "Garlic Chicken",
      slug: "garlic-chicken",
      description:
        "A simple, flavourful chicken dish with golden garlic and olive oil. Ready in under 30 minutes.",
      instructions: `1. Season chicken breasts with salt and black pepper on both sides.

2. Heat olive oil in a large skillet over medium-high heat. Add the chicken and cook for 6-7 minutes per side until golden brown and cooked through. Remove and set aside.

3. In the same pan, reduce heat to medium. Add minced garlic and cook for 1-2 minutes until fragrant.

4. Slice the chicken and serve with the garlic oil drizzled on top.`,
      prepTime: 5,
      cookTime: 20,
      servings: 2,
      difficulty: Difficulty.EASY,
      published: false, // draft
      categoryId: asian.id,
    },
  });

  // Add ingredients to Garlic Chicken
  await db.recipeIngredient.createMany({
    skipDuplicates: true,
    data: [
      {
        recipeId: garlicChicken.id,
        ingredientId: chicken.id,
        unitId: unitMap["g"].id,
        quantity: 500,
        order: 0,
      },
      {
        recipeId: garlicChicken.id,
        ingredientId: garlic.id,
        unitId: unitMap["clove"].id,
        quantity: 4,
        notes: "minced",
        order: 1,
      },
      {
        recipeId: garlicChicken.id,
        ingredientId: oliveOil.id,
        unitId: unitMap["tbsp"].id,
        quantity: 2,
        order: 2,
      },
      {
        recipeId: garlicChicken.id,
        ingredientId: blackPepper.id,
        unitId: unitMap["tsp"].id,
        quantity: 0.5,
        order: 3,
      },
    ],
  });

  await db.recipeTag.createMany({
    skipDuplicates: true,
    data: [{ recipeId: garlicChicken.id, tagId: quickTag.id }],
  });

  console.log("  ✓ Recipes");

  // ---------------------------------------------------------------------------
  // Admin user
  // ---------------------------------------------------------------------------
  const hashedPassword = await bcrypt.hash("admin1234", 12);
  await db.user.upsert({
    where: { email: "admin@foodyz.app" },
    update: {},
    create: {
      email: "admin@foodyz.app",
      password: hashedPassword,
      name: "Admin",
      role: Role.ADMIN,
    },
  });
  console.log("  ✓ Admin user (email: admin@foodyz.app, password: admin1234)");

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
