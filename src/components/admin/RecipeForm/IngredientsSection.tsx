import { ArrowDown, ArrowUp, ClipboardList, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Control, UseFieldArrayReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { unitLabel } from "@/lib/utils";
import type { RecipeFormValues } from "@/lib/validations/recipe";

import { IngredientCombobox } from "./IngredientCombobox";
import { PasteIngredientsSheet } from "./PasteIngredientsSheet";
import { QuantityInput } from "./QuantityInput";
import type { Ingredient, Unit } from "./types";

type FieldArray = UseFieldArrayReturn<RecipeFormValues, "ingredients">;

interface IngredientsSectionProps {
  control: Control<RecipeFormValues>;
  fields: FieldArray["fields"];
  append: FieldArray["append"];
  remove: FieldArray["remove"];
  move: FieldArray["move"];
  ingredients: Ingredient[];
  units: Unit[];
  onIngredientCreated: (ingredient: Ingredient) => void;
}

const iconButton =
  "flex size-11 shrink-0 items-center justify-center rounded-lg text-ink/60 transition-colors hover:bg-enamel hover:text-ink active:bg-steam disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-basil";

function NotesField({
  control,
  index,
}: {
  control: Control<RecipeFormValues>;
  index: number;
}) {
  const [revealed, setRevealed] = useState(false);
  return (
    <FormField
      control={control}
      name={`ingredients.${index}.notes`}
      render={({ field }) =>
        revealed || field.value ? (
          <FormItem>
            <FormControl>
              <Input
                placeholder="Note, e.g. grated"
                aria-label="Note"
                {...field}
                value={field.value ?? ""}
                className="h-11 rounded-lg border-steam bg-card text-base"
              />
            </FormControl>
          </FormItem>
        ) : (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="flex h-11 items-center rounded-lg px-2 text-sm font-medium text-basil hover:bg-enamel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-basil"
          >
            Add note
          </button>
        )
      }
    />
  );
}

export function IngredientsSection({
  control,
  fields,
  append,
  remove,
  move,
  ingredients,
  units,
  onIngredientCreated,
}: IngredientsSectionProps) {
  const [autoOpenIndex, setAutoOpenIndex] = useState<number | null>(null);
  const [pasteOpen, setPasteOpen] = useState(false);

  function handleAppend() {
    append({ ingredientId: "", quantity: 0, unitId: "", notes: "" });
    setAutoOpenIndex(fields.length);
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="border-b border-steam pb-2 text-base font-semibold text-ink">
        Ingredients
      </h2>

      {fields.length === 0 && (
        <p className="py-2 text-sm text-ink/60">No ingredients added.</p>
      )}

      <div className="flex flex-col gap-3">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="flex flex-col gap-2 rounded-xl border border-steam bg-card p-3"
          >
            <FormField
              control={control}
              name={`ingredients.${index}.ingredientId`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <IngredientCombobox
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      ingredients={ingredients}
                      onIngredientCreated={onIngredientCreated}
                      autoOpen={autoOpenIndex === index}
                      onOpen={() => setAutoOpenIndex(null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-start gap-2">
              <div className="w-24 shrink-0">
                <FormField
                  control={control}
                  name={`ingredients.${index}.quantity`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <QuantityInput
                          name={field.name}
                          ref={field.ref}
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="min-w-0 flex-1">
                <FormField
                  control={control}
                  name={`ingredients.${index}.unitId`}
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        onValueChange={(v) =>
                          field.onChange(v === "_none" ? "" : v)
                        }
                        value={field.value || "_none"}
                      >
                        <FormControl>
                          <SelectTrigger
                            aria-label="Unit"
                            className="w-full rounded-lg border-steam bg-card text-base data-[size=default]:h-11"
                          >
                            <SelectValue placeholder="Unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="_none" className="min-h-11 text-base">
                            No unit
                          </SelectItem>
                          {units.map((u) => (
                            <SelectItem
                              key={u.id}
                              value={u.id}
                              className="min-h-11 text-base"
                            >
                              {unitLabel(u) || u.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <button
                type="button"
                aria-label="Remove ingredient"
                onClick={() => remove(index)}
                className={`${iconButton} hover:text-paprika`}
              >
                <Trash2 className="size-5" />
              </button>
            </div>

            <div className="flex items-center gap-1">
              <div className="min-w-0 flex-1">
                <NotesField control={control} index={index} />
              </div>
              <button
                type="button"
                aria-label="Move up"
                disabled={index === 0}
                onClick={() => move(index, index - 1)}
                className={iconButton}
              >
                <ArrowUp className="size-5" />
              </button>
              <button
                type="button"
                aria-label="Move down"
                disabled={index === fields.length - 1}
                onClick={() => move(index, index + 1)}
                className={iconButton}
              >
                <ArrowDown className="size-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleAppend}
          className="h-11 flex-1 rounded-lg border-steam bg-card text-base"
        >
          <Plus className="mr-1.5 size-4" />
          Add ingredient
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setPasteOpen(true)}
          className="h-11 flex-1 rounded-lg border-steam bg-card text-base"
        >
          <ClipboardList className="mr-1.5 size-4" />
          Paste a list
        </Button>
      </div>

      <PasteIngredientsSheet
        open={pasteOpen}
        onOpenChange={setPasteOpen}
        ingredients={ingredients}
        units={units}
        onIngredientCreated={onIngredientCreated}
        onAdd={(rows) => append(rows)}
      />
    </section>
  );
}
