import { Trash2 } from "lucide-react";
import Image from "next/image";

import { deleteRecipe } from "@/actions/recipe";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
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
import { cn } from "@/lib/utils";

import { difficultyBadge, type Recipe } from "./types";

interface RecipeTableProps {
  allCount: number;
  filtered: Recipe[];
  selectedId: string | null;
  hasFilters: boolean;
  onRowClick: (id: string) => void;
}

export function RecipeTable({ allCount, filtered, selectedId, hasFilters, onRowClick }: RecipeTableProps) {
  if (allCount === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-lg">No recipes yet.</p>
        <p className="text-sm mt-1">Create your first recipe to get started.</p>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-base">
          No recipes match {hasFilters ? "the active filters" : "your search"}.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-100 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="w-14"></TableHead>
            <TableHead>Title</TableHead>
            <TableHead className={cn("hidden", !selectedId && "sm:table-cell")}>Tags</TableHead>
            <TableHead className={cn("hidden", !selectedId && "md:table-cell")}>Difficulty</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-16 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((recipe) => (
            <TableRow
              key={recipe.id}
              onClick={() => onRowClick(recipe.id)}
              className={cn("cursor-pointer", selectedId === recipe.id && "bg-emerald-50 hover:bg-emerald-50")}
            >
              <TableCell className="p-2 pl-3">
                {recipe.featuredImage ? (
                  <div className="relative w-14 h-14 flex-none rounded-md overflow-hidden bg-gray-100">
                    <Image
                      src={recipe.featuredImage}
                      alt=""
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-md bg-gray-100 flex items-center justify-center text-xl">
                    🍽️
                  </div>
                )}
              </TableCell>
              <TableCell className="font-medium">{recipe.title}</TableCell>
              <TableCell className={cn("text-gray-500 text-sm hidden", !selectedId && "sm:table-cell")}>
                <div className="flex flex-wrap gap-1">
                  {recipe.tags.slice(0, 3).map(({ tag }) => (
                    <span key={tag.slug} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                      {tag.name}
                    </span>
                  ))}
                  {recipe.tags.length > 3 && (
                    <span className="text-xs text-gray-400">+{recipe.tags.length - 3}</span>
                  )}
                </div>
              </TableCell>
              <TableCell className={cn("hidden", !selectedId && "md:table-cell")}>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${difficultyBadge[recipe.difficulty]}`}>
                  {recipe.difficulty.charAt(0) + recipe.difficulty.slice(1).toLowerCase()}
                </span>
              </TableCell>
              <TableCell>
                <Badge
                  variant={recipe.published ? "default" : "secondary"}
                  className={recipe.published ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" : ""}
                >
                  {recipe.published ? "Published" : "Draft"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                  <ConfirmDialog
                    title="Delete recipe?"
                    description={`"${recipe.title}" will be permanently deleted.`}
                    action={deleteRecipe.bind(null, recipe.id)}
                    trigger={
                      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-500">
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
  );
}
