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
  tags: Array<{ tag: { name: string; slug: string } }>;
};

const PER_PAGE = 24;

interface RecipesClientProps {
  allRecipes: Recipe[];
  initialTag?: string;
}

export function RecipesClient({ allRecipes, initialTag = "" }: RecipesClientProps) {
  const [query, setQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState(initialTag);
  const [page, setPage] = useState(1);

  const uniqueTags = [
    ...new Set(allRecipes.flatMap((r) => r.tags.map((rt) => rt.tag.name))),
  ].sort();

  const filtered = allRecipes.filter((r) => {
    if (
      query.trim() &&
      !normalizeStr(r.title).includes(normalizeStr(query)) &&
      !normalizeStr(r.description ?? "").includes(normalizeStr(query))
    )
      return false;
    if (selectedTag && !r.tags.some((rt) => rt.tag.name === selectedTag)) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  function handleTagChange(tag: string) {
    setSelectedTag(tag);
    setPage(1);
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap gap-3 items-center">
        <SearchBar
          placeholder="Search recipes…"
          onSearch={(q) => {
            setQuery(q);
            setPage(1);
          }}
          className="max-w-sm"
        />

        {uniqueTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleTagChange("")}
              className={cn(
                "text-sm px-3 py-1 rounded-full border transition-colors",
                selectedTag === ""
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-700"
              )}
            >
              All
            </button>
            {uniqueTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagChange(tag === selectedTag ? "" : tag)}
                className={cn(
                  "text-sm px-3 py-1 rounded-full border transition-colors",
                  selectedTag === tag
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-700"
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      <RecipeGrid
        recipes={paged}
        emptyMessage={
          query || selectedTag
            ? `No recipes match${selectedTag ? ` the tag "${selectedTag}"` : ""}${query ? ` "${query}"` : ""}.`
            : "No recipes published yet."
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
