"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { deleteRecipe } from "@/actions/recipe";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
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

const difficultyBadge: Record<string, string> = {
  EASY: "bg-emerald-100 text-emerald-800",
  MEDIUM: "bg-amber-100 text-amber-800",
  HARD: "bg-red-100 text-red-800",
};

const selectClass =
  "h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring text-gray-700";

export function AdminRecipesClient({ recipes }: { recipes: Recipe[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [status, setStatus] = useState("");
  const [maxPrepTime, setMaxPrepTime] = useState("");
  const [maxCookTime, setMaxCookTime] = useState("");
  const [maxServings, setMaxServings] = useState("");

  const categories = [...new Map(recipes.map((r) => [r.category.name, r.category.name])).values()].sort();

  const filtered = recipes.filter((r) => {
    if (query.trim() && !r.title.toLowerCase().includes(query.toLowerCase())) return false;
    if (category && r.category.name !== category) return false;
    if (difficulty && r.difficulty !== difficulty) return false;
    if (status === "published" && !r.published) return false;
    if (status === "draft" && r.published) return false;
    if (maxPrepTime && r.prepTime > Number(maxPrepTime)) return false;
    if (maxCookTime && r.cookTime > Number(maxCookTime)) return false;
    if (maxServings && r.servings > Number(maxServings)) return false;
    return true;
  });

  const hasFilters = query || category || difficulty || status || maxPrepTime || maxCookTime || maxServings;

  return (
    <div className="p-6 sm:p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recipes</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {recipes.length} total
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/recipes/new">
            <Plus className="w-4 h-4 mr-1.5" />
            New recipe
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <SearchBar
          placeholder="Filter by title…"
          onSearch={setQuery}
          className="max-w-xs"
        />
        <select className={selectClass} value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className={selectClass} value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option value="">All levels</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>
        <select className={selectClass} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Any status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <select className={selectClass} value={maxPrepTime} onChange={(e) => setMaxPrepTime(e.target.value)}>
          <option value="">Prep: any</option>
          <option value="15">Prep ≤ 15 min</option>
          <option value="30">Prep ≤ 30 min</option>
          <option value="60">Prep ≤ 60 min</option>
        </select>
        <select className={selectClass} value={maxCookTime} onChange={(e) => setMaxCookTime(e.target.value)}>
          <option value="">Cook: any</option>
          <option value="15">Cook ≤ 15 min</option>
          <option value="30">Cook ≤ 30 min</option>
          <option value="60">Cook ≤ 60 min</option>
          <option value="120">Cook ≤ 120 min</option>
        </select>
        <select className={selectClass} value={maxServings} onChange={(e) => setMaxServings(e.target.value)}>
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
          <p className="text-base">No recipes match {hasFilters ? "the active filters" : "your search"}.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-100 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Title</TableHead>
                <TableHead className="hidden sm:table-cell">Category</TableHead>
                <TableHead className="hidden md:table-cell">Difficulty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((recipe) => (
                <TableRow key={recipe.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/admin/recipes/${recipe.id}`}
                      className="hover:text-emerald-700 transition-colors"
                    >
                      {recipe.title}
                    </Link>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-gray-500 text-sm">
                    {recipe.category.name}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
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
                    <div className="flex items-center justify-end gap-1">
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
  );
}
