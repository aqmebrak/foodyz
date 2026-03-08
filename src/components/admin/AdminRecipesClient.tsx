"use client";

import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
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

import type { Category, Ingredient, Unit } from "./RecipeForm/types";

interface Recipe {
  id: string;
  title: string;
  published: boolean;
  difficulty: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  category: { name: string };
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
    categoryId: recipe.categoryId,
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
  };
}

interface AdminRecipesClientProps {
  recipes: Recipe[];
  categories: Category[];
  ingredients: Ingredient[];
  units: Unit[];
}

export function AdminRecipesClient({
  recipes,
  categories,
  ingredients,
  units,
}: AdminRecipesClientProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [status, setStatus] = useState("");
  const [maxPrepTime, setMaxPrepTime] = useState("");
  const [maxCookTime, setMaxCookTime] = useState("");
  const [maxServings, setMaxServings] = useState("");

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<SelectedRecipe | null>(null);
  const [loadingPanel, setLoadingPanel] = useState(false);

  const uniqueCategories = [
    ...new Map(recipes.map((r) => [r.category.name, r.category.name])).values(),
  ].sort();

  const filtered = recipes.filter((r) => {
    if (query.trim() && !normalizeStr(r.title).includes(normalizeStr(query))) return false;
    if (category && r.category.name !== category) return false;
    if (difficulty && r.difficulty !== difficulty) return false;
    if (status === "published" && !r.published) return false;
    if (status === "draft" && r.published) return false;
    if (maxPrepTime && r.prepTime > Number(maxPrepTime)) return false;
    if (maxCookTime && r.cookTime > Number(maxCookTime)) return false;
    if (maxServings && r.servings > Number(maxServings)) return false;
    return true;
  });

  const hasFilters =
    query || category || difficulty || status || maxPrepTime || maxCookTime || maxServings;

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
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All categories</option>
            {uniqueCategories.map((c) => (
              <option key={c} value={c}>
                {c}
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
                    Category
                  </TableHead>
                  <TableHead className={cn("hidden", !selectedId && "md:table-cell")}>
                    Difficulty
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-20 text-right">Actions</TableHead>
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
                      {recipe.category.name}
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
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/recipes/${recipe.id}`}>
                            <Pencil className="w-4 h-4" />
                          </Link>
                        </Button>
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
            <Button variant="ghost" size="icon" onClick={closePanel}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {loadingPanel ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          ) : selectedRecipe ? (
            <RecipeForm
              key={selectedId}
              categories={categories}
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
