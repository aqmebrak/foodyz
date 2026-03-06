import { notFound } from "next/navigation";
import { getCategoryBySlug, getRecipesByCategory } from "@/actions/recipe";
import { RecipeGrid } from "@/components/recipes/RecipeGrid";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: category.name,
    description: category.description ?? `Browse ${category.name} recipes.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const [category, recipes] = await Promise.all([
    getCategoryBySlug(slug),
    getRecipesByCategory(slug),
  ]);

  if (!category) notFound();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <Breadcrumbs
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Categories" },
          { label: category.name },
        ]}
      />

      <div className="mt-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
        {category.description && (
          <p className="mt-2 text-gray-500">{category.description}</p>
        )}
        <p className="mt-1 text-sm text-gray-400">
          {recipes.length} recipe{recipes.length !== 1 ? "s" : ""}
        </p>
      </div>

      <RecipeGrid
        recipes={recipes}
        emptyMessage={`No ${category.name} recipes published yet.`}
      />
    </div>
  );
}
