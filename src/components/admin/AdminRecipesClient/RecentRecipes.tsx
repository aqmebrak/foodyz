"use client";

import Link from "next/link";

import { RecipeThumb } from "./RecipeRow";
import type { Recipe } from "./types";

interface RecentRecipesProps {
  recipes: Recipe[];
}

export function RecentRecipes({ recipes }: RecentRecipesProps) {
  if (recipes.length === 0) return null;
  return (
    <section aria-label="Recent" className="mb-4">
      <h2 className="mb-2 text-sm font-semibold text-ink/70">Recent</h2>
      <ul className="-mx-4 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:px-0">
        {recipes.map((r) => (
          <li key={r.id} className="w-24 shrink-0 snap-start">
            <Link href={`/recipes/${r.slug}`} className="block rounded-xl active:opacity-70">
              <RecipeThumb title={r.title} src={r.featuredImage} className="size-24" />
              <p className="mt-1 line-clamp-2 text-sm font-medium leading-tight text-ink">{r.title}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
