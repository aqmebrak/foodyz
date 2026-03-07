import { BookOpen, ChefHat, Clock, ShoppingBasket, Timer, Users } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Difficulty } from "@prisma/client";

import { getRecipeBySlug } from "@/actions/recipe";
import { IngredientChecklist } from "@/components/recipes/IngredientChecklist";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { formatDuration } from "@/lib/utils";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const recipe = await getRecipeBySlug(slug);
  if (!recipe) return {};
  return {
    title: recipe.title,
    description: recipe.description ?? `Learn how to make ${recipe.title}.`,
    openGraph: recipe.featuredImage
      ? { images: [{ url: recipe.featuredImage }] }
      : undefined,
  };
}

const difficultyStyles: Record<Difficulty, string> = {
  EASY: "bg-emerald-100 text-emerald-800",
  MEDIUM: "bg-amber-100 text-amber-800",
  HARD: "bg-red-100 text-red-800",
};
const difficultyLabels: Record<Difficulty, string> = {
  EASY: "Easy",
  MEDIUM: "Medium",
  HARD: "Hard",
};

export default async function RecipeDetailPage({ params }: Props) {
  const { slug } = await params;
  const recipe = await getRecipeBySlug(slug);

  if (!recipe) notFound();

  const steps = recipe.instructions
    .split(/\n\n+/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <>
    <article className="max-w-2xl mx-auto px-4 sm:px-6 pb-28 sm:pb-16">
      {/* Breadcrumb */}
      <div className="py-5">
        <Breadcrumbs
          crumbs={[
            { label: "Home", href: "/" },
            { label: "Recipes", href: "/recipes" },
            { label: recipe.title },
          ]}
        />
      </div>

      {/* Hero image */}
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-emerald-50 mb-6">
        {recipe.featuredImage ? (
          <Image
            src={recipe.featuredImage}
            alt={recipe.title}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 672px) 100vw, 672px"
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-emerald-100 to-emerald-200 flex items-center justify-center">
            <span className="text-7xl select-none">🍽️</span>
          </div>
        )}
      </div>

      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Link
            href={`/categories/${recipe.category.slug}`}
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            {recipe.category.name}
          </Link>
          {recipe.tags.map(({ tag }) => (
            <span
              key={tag.slug}
              className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
            >
              {tag.name}
            </span>
          ))}
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-4">
          {recipe.title}
        </h1>

        {recipe.description && (
          <p className="text-gray-600 text-base leading-relaxed">
            {recipe.description}
          </p>
        )}
      </header>

      {/* Metadata grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10 p-4 bg-gray-50 rounded-xl">
        <div className="flex flex-col items-center gap-1 py-2">
          <Clock className="w-5 h-5 text-emerald-600" aria-hidden="true" />
          <span className="text-xs text-gray-500 uppercase tracking-wide">Prep</span>
          <span className="font-semibold text-gray-900 text-sm">
            {formatDuration(recipe.prepTime)}
          </span>
        </div>
        <div className="flex flex-col items-center gap-1 py-2">
          <Timer className="w-5 h-5 text-emerald-600" aria-hidden="true" />
          <span className="text-xs text-gray-500 uppercase tracking-wide">Cook</span>
          <span className="font-semibold text-gray-900 text-sm">
            {formatDuration(recipe.cookTime)}
          </span>
        </div>
        <div className="flex flex-col items-center gap-1 py-2">
          <Users className="w-5 h-5 text-emerald-600" aria-hidden="true" />
          <span className="text-xs text-gray-500 uppercase tracking-wide">Serves</span>
          <span className="font-semibold text-gray-900 text-sm">
            {recipe.servings}
          </span>
        </div>
        <div className="flex flex-col items-center gap-1 py-2">
          <ChefHat className="w-5 h-5 text-emerald-600" aria-hidden="true" />
          <span className="text-xs text-gray-500 uppercase tracking-wide">Level</span>
          <span
            className={`font-semibold text-xs px-2 py-0.5 rounded-full ${difficultyStyles[recipe.difficulty]}`}
          >
            {difficultyLabels[recipe.difficulty]}
          </span>
        </div>
      </div>

      {/* Ingredients */}
      <section id="ingredients" className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Ingredients
          <span className="ml-2 text-sm font-normal text-gray-400">
            for {recipe.servings} serving{recipe.servings !== 1 ? "s" : ""}
          </span>
        </h2>
        <IngredientChecklist ingredients={recipe.ingredients} />
      </section>

      <hr className="border-gray-100 mb-10" />

      {/* Instructions */}
      <section id="instructions">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Instructions</h2>
        <ol className="space-y-5">
          {steps.map((step, i) => (
            <li key={i} className="flex gap-4">
              <span className="shrink-0 w-8 h-8 rounded-full bg-emerald-600 text-white text-sm font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <p className="text-gray-800 text-base leading-relaxed pt-1">
                {step}
              </p>
            </li>
          ))}
        </ol>
      </section>
    </article>

    {/* Sticky bottom jump bar — mobile only */}
    <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-white/95 backdrop-blur-sm border-t border-emerald-100 px-4 py-2">
      <div className="max-w-2xl mx-auto flex gap-3">
        <a
          href="#instructions"
          className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-xl text-xs transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
          Steps
        </a>
        <a
          href="#ingredients"
          className="flex-1 flex items-center justify-center gap-1.5 border border-emerald-200 text-emerald-700 font-medium py-2 rounded-xl text-xs hover:bg-emerald-50 transition-colors"
        >
          <ShoppingBasket className="w-3.5 h-3.5" aria-hidden="true" />
          Ingredients
        </a>
      </div>
    </div>
    </>
  );
}
