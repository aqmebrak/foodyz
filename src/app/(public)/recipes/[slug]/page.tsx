import { Clock, Timer, Users } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Difficulty } from "@prisma/client";

import { getAllPublishedSlugs, getRecipeBySlug } from "@/actions/recipe";
import { RecipeClientContent } from "@/components/recipes/RecipeClientContent";
import { formatDuration } from "@/lib/utils";

const difficultyStyles: Record<Difficulty, string> = {
  EASY: "bg-emerald-50 text-emerald-700",
  MEDIUM: "bg-amber-50 text-amber-700",
  HARD: "bg-red-50 text-red-700",
};

const difficultyLabels: Record<Difficulty, string> = {
  EASY: "Easy",
  MEDIUM: "Medium",
  HARD: "Hard",
};

export async function generateStaticParams() {
  const slugs = await getAllPublishedSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const recipe = await getRecipeBySlug(slug);
  if (!recipe) return { title: "Recipe not found" };
  return {
    title: recipe.title,
    description: recipe.description ?? undefined,
  };
}

export default async function RecipePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const recipe = await getRecipeBySlug(slug);
  if (!recipe) notFound();

  const steps = recipe.instructions
    .split(/\n\n+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const totalTime = recipe.prepTime + recipe.cookTime;

  return (
    <article className="max-w-3xl mx-auto px-4 py-10">
      {/* Featured image */}
      {recipe.featuredImage && (
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-100 mb-8">
          <Image
            src={recipe.featuredImage}
            alt={recipe.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        </div>
      )}

      {/* Tags + difficulty */}
      <div className="flex flex-wrap gap-2 mb-3">
        {recipe.tags.map(({ tag }) => (
          <span
            key={tag.slug}
            className="text-xs font-medium text-emerald-600 uppercase tracking-wide"
          >
            {tag.name}
          </span>
        ))}
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${difficultyStyles[recipe.difficulty]}`}
        >
          {difficultyLabels[recipe.difficulty]}
        </span>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{recipe.title}</h1>

      {/* Description */}
      {recipe.description && (
        <p className="text-gray-600 text-base mb-6 leading-relaxed">{recipe.description}</p>
      )}

      {/* Stats */}
      <div className="flex flex-wrap gap-5 text-sm text-gray-500 mb-10 pb-10 border-b border-gray-100">
        {recipe.prepTime > 0 && (
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>Prep {formatDuration(recipe.prepTime)}</span>
          </div>
        )}
        {recipe.cookTime > 0 && (
          <div className="flex items-center gap-1.5">
            <Timer className="w-4 h-4" />
            <span>Cook {formatDuration(recipe.cookTime)}</span>
          </div>
        )}
        {totalTime > 0 && (
          <div className="flex items-center gap-1.5 font-medium text-gray-700">
            <span>Total {formatDuration(totalTime)}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Users className="w-4 h-4" />
          <span>{recipe.servings} servings</span>
        </div>
      </div>

      {/* Interactive ingredients + instructions */}
      <RecipeClientContent
        ingredients={recipe.ingredients}
        steps={steps}
        originalServings={recipe.servings}
        recipeSlug={recipe.slug}
      />
    </article>
  );
}
