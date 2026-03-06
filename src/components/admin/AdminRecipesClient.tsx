"use client";

import { useState } from "react";
import Link from "next/link";
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
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { SearchBar } from "@/components/shared/SearchBar";
import { deleteRecipe } from "@/actions/recipe";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Recipe {
  id: string;
  title: string;
  published: boolean;
  difficulty: string;
  category: { name: string };
}

const difficultyBadge: Record<string, string> = {
  EASY: "bg-emerald-100 text-emerald-800",
  MEDIUM: "bg-amber-100 text-amber-800",
  HARD: "bg-red-100 text-red-800",
};

export function AdminRecipesClient({ recipes }: { recipes: Recipe[] }) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? recipes.filter((r) =>
        r.title.toLowerCase().includes(query.toLowerCase())
      )
    : recipes;

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

      <div className="mb-4">
        <SearchBar
          placeholder="Filter by title…"
          onSearch={setQuery}
          className="max-w-xs"
        />
      </div>

      {recipes.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">No recipes yet.</p>
          <p className="text-sm mt-1">Create your first recipe to get started.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-base">No recipes match &ldquo;{query}&rdquo;.</p>
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
