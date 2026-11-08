"use client";

import { Loader2 } from "lucide-react";
import { useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Textarea } from "@/components/ui/textarea";
import { parseIngredientList } from "@/lib/parse-ingredients";
import { normalizeStr, unitLabel } from "@/lib/utils";
import type { RecipeFormValues } from "@/lib/validations/recipe";

import { createIngredientByName } from "./IngredientCombobox";
import type { Ingredient, Unit } from "./types";

type IngredientRow = RecipeFormValues["ingredients"][number];

interface PasteIngredientsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ingredients: Ingredient[];
  units: Unit[];
  onIngredientCreated: (ingredient: Ingredient) => void;
  onAdd: (rows: IngredientRow[]) => void;
}

function formatQty(n: number): string {
  return n === 0 ? "" : String(Math.round(n * 100) / 100);
}

export function PasteIngredientsSheet({
  open,
  onOpenChange,
  ingredients,
  units,
  onIngredientCreated,
  onAdd,
}: PasteIngredientsSheetProps) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const parsed = useMemo(
    () => parseIngredientList(text, units, ingredients),
    [text, units, ingredients],
  );

  function reset() {
    setText("");
    setError(null);
  }

  function handleOpenChange(next: boolean) {
    if (isPending) return;
    onOpenChange(next);
    if (!next) reset();
  }

  function handleAdd() {
    setError(null);
    startTransition(async () => {
      // Resolve unknown names through the combobox's create path, once per name.
      const created = new Map<string, string>();
      for (const row of parsed) {
        if (row.ingredientId || !row.ingredientName) continue;
        const key = normalizeStr(row.ingredientName);
        if (created.has(key)) continue;
        const result = await createIngredientByName(row.ingredientName);
        if ("error" in result) {
          setError(`Could not create "${row.ingredientName}": ${result.error}`);
          return;
        }
        onIngredientCreated(result.ingredient);
        created.set(key, result.ingredient.id);
      }
      const rows: IngredientRow[] = parsed
        .filter((r) => r.ingredientName)
        .map((r) => ({
          ingredientId:
            r.ingredientId ?? created.get(normalizeStr(r.ingredientName)) ?? "",
          quantity: r.quantity,
          unitId: r.unitId,
          notes: r.notes,
        }));
      onAdd(rows);
      onOpenChange(false);
      reset();
    });
  }

  const count = parsed.filter((r) => r.ingredientName).length;

  return (
    <Drawer direction="bottom" open={open} onOpenChange={handleOpenChange}>
      <DrawerContent className="md:mx-auto md:max-w-lg">
        <DrawerHeader className="pb-2 text-left">
          <DrawerTitle>Paste a list</DrawerTitle>
          <DrawerDescription>
            One ingredient per line, like &ldquo;200 g spaghetti&rdquo;.
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex min-h-0 flex-col gap-3 overflow-y-auto px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={"200 g spaghetti\n2 oeufs\n1 c. à soupe d'huile d'olive"}
            aria-label="Ingredient list"
            rows={5}
            autoCapitalize="none"
            className="min-h-32 rounded-lg border-steam bg-white text-base text-ink"
          />

          {parsed.length > 0 && (
            <ul
              aria-label="Preview"
              className="divide-y divide-steam rounded-xl border border-steam bg-white"
            >
              {parsed.map((row, i) => {
                const unit = units.find((u) => u.id === row.unitId);
                const label = unit ? unitLabel(unit) || unit.name : "";
                return (
                  <li
                    key={`${i}-${row.raw}`}
                    className="flex flex-wrap items-center gap-x-2 gap-y-1 px-3 py-2 text-base"
                  >
                    <span className="min-w-[3.5rem] tabular-nums text-ink/70">
                      {[formatQty(row.quantity), label].filter(Boolean).join(" ")}
                    </span>
                    <span className="min-w-0 flex-1 break-words font-medium text-ink">
                      {row.ingredientName || "—"}
                      {row.notes && (
                        <span className="font-normal text-ink/60">
                          {" "}
                          ({row.notes})
                        </span>
                      )}
                    </span>
                    {!row.ingredientId && row.ingredientName && (
                      <span className="rounded-full bg-yolk/25 px-2 py-0.5 text-xs font-medium text-ink">
                        Unknown ingredient
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {error && (
            <p role="alert" className="text-sm text-paprika">
              {error}
            </p>
          )}

          <Button
            type="button"
            onClick={handleAdd}
            disabled={count === 0 || isPending}
            className="h-12 w-full bg-basil text-base text-white hover:bg-basil/90"
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            {count === 1 ? "Add 1 ingredient" : `Add ${count} ingredients`}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
