"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { Difficulty } from "@prisma/client";

import { RecipeGrid } from "@/components/recipes/RecipeGrid";
import { SearchBar } from "@/components/shared/SearchBar";
import { cn, normalizeStr } from "@/lib/utils";

type Recipe = {
  id: string;
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

const PER_PAGE = 24;

export function RecipesClient({ allRecipes }: { allRecipes: Recipe[] }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filtered = query.trim()
    ? allRecipes.filter(
        (r) =>
          normalizeStr(r.title).includes(normalizeStr(query)) ||
          normalizeStr(r.description ?? "").includes(normalizeStr(query))
      )
    : allRecipes;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  return (
    <>
      <div className="mb-6">
        <SearchBar
          placeholder="Search recipes…"
          onSearch={(q) => {
            setQuery(q);
            setPage(1);
          }}
          className="max-w-sm"
        />
      </div>

      <RecipeGrid
        recipes={paged}
        emptyMessage={
          query ? `No recipes match "${query}".` : "No recipes published yet."
        }
      />

      {totalPages > 1 && (
        <nav
          aria-label="Pagination"
          className="flex items-center justify-center gap-2 mt-10"
        >
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className={cn(
              "inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-700 transition-colors",
              safePage === 1 && "pointer-events-none opacity-40"
            )}
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 text-sm text-gray-600">
            {safePage} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className={cn(
              "inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-700 transition-colors",
              safePage === totalPages && "pointer-events-none opacity-40"
            )}
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </nav>
      )}
    </>
  );
}
