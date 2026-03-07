import { Clock, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Difficulty } from "@prisma/client";

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

interface RecipeCardProps {
  recipe: {
    slug: string;
    title: string;
    description: string | null;
    featuredImage: string | null;
    prepTime: number;
    cookTime: number;
    servings: number;
    difficulty: Difficulty;
    category: { name: string; slug: string };
  };
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const totalTime = recipe.prepTime + recipe.cookTime;

  return (
    <Link
      href={`/recipes/${recipe.slug}`}
      className="group flex flex-col rounded-xl overflow-hidden border border-gray-100 bg-white hover:shadow-md transition-shadow"
    >
      <div className="relative aspect-[4/3] bg-emerald-50">
        {recipe.featuredImage ? (
          <Image
            src={recipe.featuredImage}
            alt={recipe.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center">
            <span className="text-4xl select-none">🍽️</span>
          </div>
        )}
        <span
          className={`absolute top-3 left-3 text-xs font-semibold px-2 py-1 rounded-full ${difficultyStyles[recipe.difficulty]}`}
        >
          {difficultyLabels[recipe.difficulty]}
        </span>
      </div>

      <div className="flex flex-col gap-2 p-4 flex-1">
        <span className="text-xs font-medium text-emerald-600 uppercase tracking-wide">
          {recipe.category.name}
        </span>
        <h3 className="font-semibold text-gray-900 text-base leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2">
          {recipe.title}
        </h3>
        {recipe.description && (
          <p className="text-sm text-gray-500 line-clamp-2">
            {recipe.description}
          </p>
        )}
        <div className="flex items-center gap-4 mt-auto pt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{formatDuration(totalTime)}</span>
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{recipe.servings} servings</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
