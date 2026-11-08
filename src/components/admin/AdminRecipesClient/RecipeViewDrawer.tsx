"use client";

import { Check, Clock, ExternalLink, Link2, Pencil, Timer, Users, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Difficulty } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
} from "@/components/ui/drawer";
import { splitSteps } from "@/lib/steps";
import { formatDuration } from "@/lib/utils";

import { difficultyBadge, type SelectedRecipe } from "./types";

interface RecipeViewDrawerProps {
  open: boolean;
  recipe: SelectedRecipe | null;
  loading: boolean;
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
  loading,
  onClose,
}: RecipeViewDrawerProps) {
  const [copied, setCopied] = useState(false);

  function copyShareLink() {
    if (!recipe) return;
    navigator.clipboard.writeText(`${window.location.origin}/recipes/${recipe.slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()} direction="right">
      <DrawerContent className="w-screen md:w-[55vw] max-w-none flex flex-col h-full">
        {/* Header: title row + actions row so long titles stay readable */}
        <div className="shrink-0 border-b px-4 pb-3 pt-2">
          <div className="flex items-start justify-between gap-2">
            <DrawerTitle className="text-lg font-semibold leading-snug">
              {recipe?.title ?? "Recipe"}
            </DrawerTitle>
            <DrawerClose asChild>
              <Button size="icon" variant="ghost" className="-mr-2 size-9 shrink-0" aria-label="Close">
                <X className="w-4 h-4" />
              </Button>
            </DrawerClose>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {recipe ? (
              <Button size="sm" variant="outline" asChild>
                <Link href={`/recipes/${recipe.slug}/edit`}>
                  <Pencil className="w-3.5 h-3.5 mr-1.5" />
                  Edit
                </Link>
              </Button>
            ) : (
              <Button size="sm" variant="outline" disabled>
                <Pencil className="w-3.5 h-3.5 mr-1.5" />
                Edit
              </Button>
            )}
            {recipe?.published && (
              <>
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/recipes/${recipe.slug}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                    View on site
                  </Link>
                </Button>
                <Button size="sm" variant="outline" onClick={copyShareLink}>
                  {copied ? (
                    <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                  ) : (
                    <Link2 className="w-3.5 h-3.5 mr-1.5" />
                  )}
                  {copied ? "Copied!" : "Share"}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <RecipeDetailView recipe={recipe} loading={loading} />
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

  const steps = splitSteps(recipe.instructions);

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
          <ul className="flex flex-col gap-1.5">
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
          <ol className="flex flex-col gap-4">
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
