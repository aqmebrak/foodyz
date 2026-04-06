"use client";

import { Check, Clock, Link2, Pencil, Timer, Users, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { Difficulty } from "@prisma/client";

import type { Ingredient, Tag, Unit } from "@/components/admin/RecipeForm/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
} from "@/components/ui/drawer";
import { formatDuration } from "@/lib/utils";

import { RecipeEditContent } from "./RecipeEditContent";
import { difficultyBadge, type SelectedRecipe } from "./types";

interface RecipeViewDrawerProps {
  open: boolean;
  recipe: SelectedRecipe | null;
  recipeId: string | null;
  loading: boolean;
  tags: Tag[];
  ingredients: Ingredient[];
  units: Unit[];
  onClose: () => void;
}

const difficultyLabel: Record<Difficulty, string> = {
  EASY: "Easy",
  MEDIUM: "Medium",
  HARD: "Hard",
};

export function RecipeViewDrawer({
  open,
  recipe,
  recipeId,
  loading,
  tags,
  ingredients,
  units,
  onClose,
}: RecipeViewDrawerProps) {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [copied, setCopied] = useState(false);

  function copyShareLink() {
    if (!recipe) return;
    navigator.clipboard.writeText(`${window.location.origin}/recipes/${recipe.slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Reset to view mode when a different recipe is selected
  useEffect(() => {
    setMode("view");
  }, [recipeId]);

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()} direction="right">
      <DrawerContent className="w-screen md:w-[55vw] max-w-none flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-2 pb-3 border-b shrink-0">
          <DrawerTitle className="text-base font-semibold truncate pr-4">
            {recipe?.title ?? "Recipe"}
          </DrawerTitle>
          <div className="flex items-center gap-2 shrink-0">
            {recipe?.published && (
              <Button
                size="sm"
                variant="outline"
                onClick={copyShareLink}
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                ) : (
                  <Link2 className="w-3.5 h-3.5 mr-1.5" />
                )}
                {copied ? "Copied!" : "Share"}
              </Button>
            )}
            {mode === "view" ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setMode("edit")}
                disabled={loading || !recipe}
              >
                <Pencil className="w-3.5 h-3.5 mr-1.5" />
                Edit
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setMode("view")}
                disabled={loading || !recipe}
              >
                View
              </Button>
            )}
            <DrawerClose asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8">
                <X className="w-4 h-4" />
              </Button>
            </DrawerClose>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {mode === "edit" ? (
            <RecipeEditContent
              loading={loading}
              recipe={recipe}
              recipeId={recipeId}
              tags={tags}
              ingredients={ingredients}
              units={units}
            />
          ) : (
            <RecipeDetailView recipe={recipe} loading={loading} />
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function RecipeDetailView({
  recipe,
  loading,
}: {
  recipe: SelectedRecipe | null;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
        Loading…
      </div>
    );
  }

  if (!recipe) return null;

  const steps = recipe.instructions
    .split(/\n\n+/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <article className="max-w-2xl mx-auto px-4 py-5 pb-10">
      {/* Featured image */}
      {recipe.featuredImage && (
        <div className="relative aspect-video rounded-xl overflow-hidden bg-muted mb-5">
          <Image
            src={recipe.featuredImage}
            alt={recipe.title}
            fill
            sizes="(max-width: 672px) 100vw, 672px"
            className="object-cover"
          />
        </div>
      )}

      {/* Tags + difficulty + status */}
      <div className="flex flex-wrap gap-2 mb-4">
        {recipe.tags.map(({ tag }) => (
          <span
            key={tag.slug}
            className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full"
          >
            {tag.name}
          </span>
        ))}
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${difficultyBadge[recipe.difficulty]}`}
        >
          {difficultyLabel[recipe.difficulty as Difficulty]}
        </span>
        <Badge
          variant={recipe.published ? "default" : "secondary"}
          className={recipe.published ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 text-xs" : "text-xs"}
        >
          {recipe.published ? "Published" : "Draft"}
        </Badge>
      </div>

      {/* Description */}
      {recipe.description && (
        <p className="text-muted-foreground text-sm mb-5">{recipe.description}</p>
      )}

      {/* Stats */}
      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
        {recipe.prepTime > 0 && (
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>Prep {formatDuration(recipe.prepTime)}</span>
          </div>
        )}
        {recipe.cookTime > 0 && (
          <div className="flex items-center gap-1.5">
            <Timer className="w-4 h-4" />
            <span>Cook {formatDuration(recipe.cookTime)}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Users className="w-4 h-4" />
          <span>{recipe.servings} servings</span>
        </div>
      </div>

      {/* Ingredients */}
      {recipe.ingredients.length > 0 && (
        <section className="mb-6">
          <h2 className="font-semibold text-foreground mb-3">Ingredients</h2>
          <ul className="space-y-1.5">
            {recipe.ingredients.map((ri) => (
              <li key={ri.ingredientId} className="text-sm text-foreground flex gap-2">
                <span className="font-medium text-foreground shrink-0">
                  {ri.quantity}
                  {ri.unit ? ` ${ri.unit.abbreviation}` : ""}
                </span>
                <span>
                  {ri.ingredient.name}
                  {ri.notes ? <span className="text-muted-foreground"> — {ri.notes}</span> : null}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Instructions */}
      {steps.length > 0 && (
        <section>
          <h2 className="font-semibold text-foreground mb-3">Instructions</h2>
          <ol className="space-y-4">
            {steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-foreground">
                <span className="flex-none font-semibold text-emerald-600 w-5 text-right">
                  {i + 1}.
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </article>
  );
}
