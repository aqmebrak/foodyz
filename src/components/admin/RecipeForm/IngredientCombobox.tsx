"use client";

import { Check, ChevronDown, Loader2, Plus, Search } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";

import { createIngredient } from "@/actions/ingredient";
import { Button } from "@/components/ui/button";
import { cn, normalizeStr, slugify } from "@/lib/utils";

import type { Ingredient } from "./types";

interface IngredientComboboxProps {
  value: string;
  onChange: (id: string) => void;
  ingredients: Ingredient[];
  onIngredientCreated: (ingredient: Ingredient) => void;
}

export function IngredientCombobox({
  value,
  onChange,
  ingredients,
  onIngredientCreated,
}: IngredientComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [isPending, startTransition] = useTransition();
  const [createError, setCreateError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = ingredients.find((i) => i.id === value);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setCreating(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = query
    ? ingredients.filter((i) => normalizeStr(i.name).includes(normalizeStr(query)))
    : ingredients;

  const exactMatch = ingredients.some(
    (i) => normalizeStr(i.name) === normalizeStr(query)
  );

  function handleSelect(id: string) {
    onChange(id);
    setOpen(false);
    setQuery("");
    setCreating(false);
  }

  function startCreating(prefill?: string) {
    setCreating(true);
    setNewName(prefill ?? query);
    setCreateError(null);
  }

  function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    setCreateError(null);
    startTransition(async () => {
      const result = await createIngredient({ name, slug: slugify(name) });
      if (!result) return;
      if ("error" in result) {
        setCreateError(result.error ?? "Unknown error");
        return;
      }
      onIngredientCreated(result.ingredient);
      onChange(result.ingredient.id);
      setOpen(false);
      setCreating(false);
      setQuery("");
      setNewName("");
    });
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          setCreating(false);
        }}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring",
          !selected && "text-muted-foreground"
        )}
      >
        <span className="truncate">{selected ? selected.name : "Ingredient"}</span>
        <ChevronDown className="ml-2 w-4 h-4 shrink-0 text-gray-400" />
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              <input
                autoFocus
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setCreating(false);
                }}
                placeholder="Search…"
                className="w-full pl-8 pr-2 py-1.5 text-sm outline-none bg-transparent"
              />
            </div>
          </div>

          {/* List */}
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 && !query && (
              <p className="px-3 py-2 text-sm text-gray-400">No ingredients.</p>
            )}
            {filtered.length === 0 && query && !creating && (
              <p className="px-3 py-2 text-sm text-gray-400">No results for &ldquo;{query}&rdquo;.</p>
            )}
            {filtered.map((ing) => (
              <button
                key={ing.id}
                type="button"
                onClick={() => handleSelect(ing.id)}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors"
              >
                <Check
                  className={cn(
                    "w-3.5 h-3.5 text-emerald-600 shrink-0",
                    value === ing.id ? "opacity-100" : "opacity-0"
                  )}
                />
                {ing.name}
              </button>
            ))}

            {/* Add new option */}
            {!creating && query && !exactMatch && (
              <button
                type="button"
                onClick={() => startCreating(query)}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-emerald-700 hover:bg-emerald-50 transition-colors border-t border-gray-100"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                Add &ldquo;{query}&rdquo;
              </button>
            )}
            {!creating && !query && (
              <button
                type="button"
                onClick={() => startCreating()}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-emerald-700 hover:bg-emerald-50 transition-colors border-t border-gray-100"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                New ingredient
              </button>
            )}
          </div>

          {/* Inline create form */}
          {creating && (
            <div className="p-2 border-t border-gray-100 space-y-2">
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                placeholder="Ingredient name"
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              {createError && <p className="text-xs text-red-500">{createError}</p>}
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleCreate}
                  disabled={isPending || !newName.trim()}
                  className="flex-1 h-7 text-xs"
                >
                  {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Create"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setCreating(false)}
                  className="h-7 text-xs"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
