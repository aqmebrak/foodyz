"use client";

import { Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { deleteRecipe } from "@/actions/recipe";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { cn, formatDuration } from "@/lib/utils";

import type { Recipe } from "./types";

const difficultyLabel: Record<string, string> = { EASY: "Easy", MEDIUM: "Medium", HARD: "Hard" };

interface RecipeThumbProps {
  title: string;
  src: string | null;
  className?: string;
}

export function RecipeThumb({ title, src, className }: RecipeThumbProps) {
  return (
    <div className={cn("relative size-[72px] shrink-0 overflow-hidden rounded-xl bg-basil/10", className)}>
      {src ? (
        <Image src={src} alt="" fill sizes="72px" className="object-cover" />
      ) : (
        <span className="flex size-full items-center justify-center font-display text-2xl font-semibold text-basil">
          {title.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}

function meta(recipe: Recipe): string {
  const total = recipe.prepTime + recipe.cookTime;
  const parts = [total > 0 ? formatDuration(total) : null, difficultyLabel[recipe.difficulty]];
  return parts.filter(Boolean).join(" · ");
}

interface RecipeRowProps {
  recipe: Recipe;
  selected: boolean;
  /** md+ only: open the drawer instead of navigating. */
  onOpenDrawer: (id: string) => void;
}

export function RecipeRow({ recipe, selected, onOpenDrawer }: RecipeRowProps) {
  return (
    <li className="group relative">
      <Link
        href={`/recipes/${recipe.slug}`}
        onClick={(e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey) return;
          if (window.matchMedia("(min-width: 768px)").matches) {
            e.preventDefault();
            onOpenDrawer(recipe.id);
          }
        }}
        className={cn(
          "flex min-h-[88px] items-center gap-3 rounded-2xl px-2 py-2 transition-colors active:bg-steam/60",
          "md:border md:border-steam md:bg-card md:hover:border-basil/40",
          selected && "md:border-basil md:bg-basil/5",
        )}
      >
        <RecipeThumb title={recipe.title} src={recipe.featuredImage} />
        <div className="min-w-0 flex-1 md:pr-10">
          <p className="line-clamp-2 text-base font-semibold leading-snug text-ink">{recipe.title}</p>
          <p className="mt-0.5 flex items-center gap-2 text-sm text-ink/60">
            <span>{meta(recipe)}</span>
            {!recipe.published && (
              <span className="rounded-full bg-yolk/25 px-2 py-0.5 text-xs font-medium text-ink">Draft</span>
            )}
          </p>
        </div>
      </Link>
      <div className="absolute right-2 top-2 hidden md:block">
        <ConfirmDialog
          title="Delete recipe?"
          description={`"${recipe.title}" will be permanently deleted.`}
          action={deleteRecipe.bind(null, recipe.id)}
          trigger={
            <button
              type="button"
              aria-label={`Delete ${recipe.title}`}
              className="flex size-9 items-center justify-center rounded-full text-ink/50 hover:bg-paprika/10 hover:text-paprika"
            >
              <Trash2 className="size-4" />
            </button>
          }
        />
      </div>
    </li>
  );
}
