import { Clock, Pencil } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Difficulty } from "@prisma/client";

import { getRecipeBySlug } from "@/actions/recipe";
import { BackButton } from "@/components/recipes/BackButton";
import { RecipeClientContent } from "@/components/recipes/RecipeClientContent";
import { auth } from "@/lib/auth";
import { splitSteps } from "@/lib/steps";
import { formatDuration } from "@/lib/utils";

const difficultyStyles: Record<Difficulty, string> = {
  EASY: "bg-basil/10 text-basil",
  MEDIUM: "bg-yolk/25 text-ink",
  HARD: "bg-paprika/10 text-paprika",
};

const difficultyLabels: Record<Difficulty, string> = {
  EASY: "Easy",
  MEDIUM: "Medium",
  HARD: "Hard",
};

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
  const [recipe, session] = await Promise.all([getRecipeBySlug(slug), auth()]);
  if (!recipe) notFound();

  const steps = splitSteps(recipe.instructions);

  const totalTime = recipe.prepTime + recipe.cookTime;

  return (
    <article className="mx-auto max-w-5xl px-4 pb-6 md:py-8">
      {/* Header */}
      <header className="relative -mx-4 md:mx-0">
        <BackButton className="absolute left-4 top-[calc(env(safe-area-inset-top)+0.75rem)] z-10 md:static md:mb-4 md:ml-0" />
        {recipe.featuredImage ? (
          <div className="relative aspect-[4/3] max-h-[40vh] w-full overflow-hidden bg-steam md:mb-0 md:rounded-2xl">
            <Image
              src={recipe.featuredImage}
              alt={recipe.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="h-16 md:hidden" />
        )}
      </header>

      <div className="mt-4">
        {/* Difficulty + tags */}
        <div className="mb-3 flex flex-wrap gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${difficultyStyles[recipe.difficulty]}`}
          >
            {difficultyLabels[recipe.difficulty]}
          </span>
          {recipe.tags.map(({ tag }) => (
            <span
              key={tag.slug}
              className="rounded-full bg-steam px-2.5 py-1 text-xs font-medium text-ink/70"
            >
              {tag.name}
            </span>
          ))}
        </div>

        {/* Title */}
        <div className="mb-3 flex items-start justify-between gap-3">
          <h1 className="font-display text-[28px] font-bold leading-tight tracking-tight text-ink md:text-4xl md:leading-tight">
            {recipe.title}
          </h1>
          {session?.user.role === "ADMIN" && (
            <Link
              href={`/recipes/${recipe.slug}/edit`}
              aria-label="Edit recipe"
              className="flex size-11 shrink-0 items-center justify-center rounded-full border border-steam bg-white text-ink transition-colors hover:bg-enamel"
            >
              <Pencil className="size-5" />
            </Link>
          )}
        </div>

        {recipe.description && (
          <p className="mb-4 text-base leading-relaxed text-ink/80">{recipe.description}</p>
        )}

        {/* Stats */}
        {totalTime > 0 && (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-ink/70">
            <div className="flex items-center gap-1.5 text-base font-semibold text-ink">
              <Clock className="size-5 text-basil" />
              <span>{formatDuration(totalTime)} total</span>
            </div>
            {recipe.prepTime > 0 && <span>Prep {formatDuration(recipe.prepTime)}</span>}
            {recipe.cookTime > 0 && <span>Cook {formatDuration(recipe.cookTime)}</span>}
          </div>
        )}
      </div>

      <RecipeClientContent
        ingredients={recipe.ingredients}
        steps={steps}
        originalServings={recipe.servings}
        recipeSlug={recipe.slug}
      />
    </article>
  );
}
