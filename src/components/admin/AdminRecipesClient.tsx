"use client";

import { ExternalLink, Loader2, Plus, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { deleteRecipe, getRecipeForAdmin } from "@/actions/recipe";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { RecipeForm } from "@/components/admin/RecipeForm";
import { SearchBar } from "@/components/shared/SearchBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, normalizeStr } from "@/lib/utils";
import type { RecipeFormValues } from "@/lib/validations/recipe";

import type { Ingredient, Tag, Unit } from "./RecipeForm/types";

interface Recipe {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  difficulty: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  tags: Array<{ tag: { name: string; slug: string } }>;
}

type SelectedRecipe = NonNullable<Awaited<ReturnType<typeof getRecipeForAdmin>>>;

const difficultyBadge: Record<string, string> = {
  EASY: "bg-emerald-100 text-emerald-800",
  MEDIUM: "bg-amber-100 text-amber-800",
  HARD: "bg-red-100 text-red-800",
};

const selectClass =
  "h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring text-gray-700";

function buildDefaultValues(recipe: SelectedRecipe): Partial<RecipeFormValues> {
  return {
    title: recipe.title,
    slug: recipe.slug,
    description: recipe.description ?? "",
    featuredImage: recipe.featuredImage ?? "",
    difficulty: recipe.difficulty,
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    servings: recipe.servings,
    published: recipe.published,
    instructions: recipe.instructions,
    ingredients: recipe.ingredients.map((ri) => ({
      ingredientId: ri.ingredientId,
      unitId: ri.unitId ?? "",
      quantity: ri.quantity,
      notes: ri.notes ?? "",
    })),
    tags: recipe.tags.map((rt) => rt.tag.name),
  };
}

interface AdminRecipesClientProps {
  recipes: Recipe[];
  tags: Tag[];
  ingredients: Ingredient[];
  units: Unit[];
}

export function AdminRecipesClient({
  recipes,
  tags,
  ingredients,
  units,
}: AdminRecipesClientProps) {
  const [query, setQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [status, setStatus] = useState("");
  const [maxPrepTime, setMaxPrepTime] = useState("");
  const [maxCookTime, setMaxCookTime] = useState("");
  const [maxServings, setMaxServings] = useState("");

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<SelectedRecipe | null>(null);
  const [loadingPanel, setLoadingPanel] = useState(false);

  const uniqueTags = [
    ...new Set(recipes.flatMap((r) => r.tags.map((rt) => rt.tag.name))),
  ].sort();

  const filtered = recipes.filter((r) => {
    if (query.trim() && !normalizeStr(r.title).includes(normalizeStr(query))) return false;
    if (selectedTag && !r.tags.some((rt) => rt.tag.name === selectedTag)) return false;
    if (difficulty && r.difficulty !== difficulty) return false;
    if (status === "published" && !r.published) return false;
    if (status === "draft" && r.published) return false;
    if (maxPrepTime && r.prepTime > Number(maxPrepTime)) return false;
    if (maxCookTime && r.cookTime > Number(maxCookTime)) return false;
    if (maxServings && r.servings > Number(maxServings)) return false;
    return true;
  });

  const hasFilters =
    query || selectedTag || difficulty || status || maxPrepTime || maxCookTime || maxServings;

  async function handleRowClick(id: string) {
    if (selectedId === id) {
      setSelectedId(null);
      setSelectedRecipe(null);
      return;
    }
    setSelectedId(id);
    setLoadingPanel(true);
    const recipe = await getRecipeForAdmin(id);
    setSelectedRecipe(recipe);
    setLoadingPanel(false);
  }

  function closePanel() {
    setSelectedId(null);
    setSelectedRecipe(null);
  }

  return (
    <div className={cn("p-6 sm:p-8", selectedId ? "flex gap-6 max-w-full" : "max-w-6xl")}>
      {/* Left panel */}
      <div
        className={cn(
          "min-w-0",
          selectedId ? "lg:w-125 lg:flex-none lg:border-r lg:pr-6" : "w-full"
        )}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Recipes</h1>
            <p className="text-sm text-gray-500 mt-0.5">{recipes.length} total</p>
          </div>
          <Button asChild>
            <Link href="/admin/recipes/new">
              <Plus className="w-4 h-4 mr-1.5" />
              New recipe
            </Link>
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <SearchBar placeholder="Filter by title…" onSearch={setQuery} className="max-w-xs" />
          <select
            className={selectClass}
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
          >
            <option value="">All tags</option>
            {uniqueTags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            className={selectClass}
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="">All levels</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
          <select
            className={selectClass}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Any status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <select
            className={selectClass}
            value={maxPrepTime}
            onChange={(e) => setMaxPrepTime(e.target.value)}
          >
            <option value="">Prep: any</option>
            <option value="15">Prep ≤ 15 min</option>
            <option value="30">Prep ≤ 30 min</option>
            <option value="60">Prep ≤ 60 min</option>
          </select>
          <select
            className={selectClass}
            value={maxCookTime}
            onChange={(e) => setMaxCookTime(e.target.value)}
          >
            <option value="">Cook: any</option>
            <option value="15">Cook ≤ 15 min</option>
            <option value="30">Cook ≤ 30 min</option>
            <option value="60">Cook ≤ 60 min</option>
            <option value="120">Cook ≤ 120 min</option>
          </select>
          <select
            className={selectClass}
            value={maxServings}
            onChange={(e) => setMaxServings(e.target.value)}
          >
            <option value="">Servings: any</option>
            <option value="2">≤ 2</option>
            <option value="4">≤ 4</option>
            <option value="6">≤ 6</option>
            <option value="8">≤ 8</option>
          </select>
        </div>

        {recipes.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">No recipes yet.</p>
            <p className="text-sm mt-1">Create your first recipe to get started.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-base">
              No recipes match {hasFilters ? "the active filters" : "your search"}.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-gray-100 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Title</TableHead>
                  <TableHead className={cn("hidden", !selectedId && "sm:table-cell")}>
                    Tags
                  </TableHead>
                  <TableHead className={cn("hidden", !selectedId && "md:table-cell")}>
                    Difficulty
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-16 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((recipe) => (
                  <TableRow
                    key={recipe.id}
                    onClick={() => handleRowClick(recipe.id)}
                    className={cn(
                      "cursor-pointer",
                      selectedId === recipe.id && "bg-emerald-50 hover:bg-emerald-50"
                    )}
                  >
                    <TableCell className="font-medium">{recipe.title}</TableCell>
                    <TableCell
                      className={cn(
                        "text-gray-500 text-sm hidden",
                        !selectedId && "sm:table-cell"
                      )}
                    >
                      <div className="flex flex-wrap gap-1">
                        {recipe.tags.slice(0, 3).map(({ tag }) => (
                          <span
                            key={tag.slug}
                            className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full"
                          >
                            {tag.name}
                          </span>
                        ))}
                        {recipe.tags.length > 3 && (
                          <span className="text-xs text-gray-400">+{recipe.tags.length - 3}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className={cn("hidden", !selectedId && "md:table-cell")}>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${difficultyBadge[recipe.difficulty]}`}
                      >
                        {recipe.difficulty.charAt(0) +
                          recipe.difficulty.slice(1).toLowerCase()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={recipe.published ? "default" : "secondary"}
                        className={
                          recipe.published
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
                            : ""
                        }
                      >
                        {recipe.published ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div
                        className="flex items-center justify-end gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ConfirmDialog
                          title="Delete recipe?"
                          description={`"${recipe.title}" will be permanently deleted.`}
                          action={deleteRecipe.bind(null, recipe.id)}
                          trigger={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-gray-400 hover:text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          }
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Right panel — desktop only */}
      {selectedId && (
        <div className="hidden lg:flex flex-col flex-1 min-w-0">
          <div className="flex items-start justify-between mb-4 flex-none">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Edit recipe</h2>
              {selectedRecipe && (
                <p className="text-sm text-gray-500 mt-0.5">{selectedRecipe.title}</p>
              )}
            </div>
            <div className="flex items-center gap-1">
              {selectedRecipe?.published && (
                <Button variant="ghost" size="sm" asChild className="text-emerald-600 hover:text-emerald-700">
                  <Link href={`/recipes/${selectedRecipe.slug}`} target="_blank">
                    <ExternalLink className="w-4 h-4 mr-1" />
                    View on site
                  </Link>
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={closePanel}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {loadingPanel ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          ) : selectedRecipe ? (
            <RecipeForm
              key={selectedId}
              tags={tags}
              ingredients={ingredients}
              units={units}
              defaultValues={buildDefaultValues(selectedRecipe)}
              recipeId={selectedId}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}
