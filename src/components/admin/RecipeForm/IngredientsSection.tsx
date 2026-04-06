import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
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
import type { RecipeFormValues } from "@/lib/validations/recipe";

import { IngredientCombobox } from "./IngredientCombobox";
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

  function handleAppend() {
    append({ ingredientId: "", quantity: 0, unitId: "", notes: "" });
    setAutoOpenIndex(fields.length);
  }

  return (
    <section className="space-y-4">
      <h2 className="text-base font-semibold text-foreground border-b pb-2">
        Ingredients
      </h2>

      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground py-2">No ingredients added.</p>
      )}

      <div className="space-y-3">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-12 gap-2 items-start p-3 bg-muted/50 rounded-lg"
          >
            {/* Ingredient — col 1-4 (sm) */}
            <div className="col-span-12 sm:col-span-4">
              <FormField
                control={control}
                name={`ingredients.${index}.ingredientId`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <IngredientCombobox
                        value={field.value}
                        onChange={field.onChange}
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
            </div>

            {/* Quantity — col 5-6 */}
            <div className="col-span-3 sm:col-span-2">
              <FormField
                control={control}
                name={`ingredients.${index}.quantity`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Qty"
                        {...field}
                        onFocus={(e) => {
                          if (Number(e.target.value) === 0) e.target.select();
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Unit — col 7-8 */}
            <div className="col-span-3 sm:col-span-2">
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
                        <SelectTrigger>
                          <SelectValue placeholder="Unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="_none">—</SelectItem>
                        {units.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.abbreviation}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Notes — col 9-10 */}
            <div className="col-span-4 sm:col-span-2">
              <FormField
                control={control}
                name={`ingredients.${index}.notes`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Notes"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Reorder + Remove — col 11-12 */}
            <div className="col-span-2 sm:col-span-2 flex items-center justify-end gap-0.5">
              <div className="flex flex-col">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Move up"
                  disabled={index === 0}
                  onClick={() => move(index, index - 1)}
                  className="h-5 w-7 text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  <ArrowUp className="w-3 h-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Move down"
                  disabled={index === fields.length - 1}
                  onClick={() => move(index, index + 1)}
                  className="h-5 w-7 text-muted-foreground hover:text-foreground disabled:opacity-30"
                >
                  <ArrowDown className="w-3 h-3" />
                </Button>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Remove ingredient"
                onClick={() => remove(index)}
                className="h-9 w-9 text-muted-foreground hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAppend}
      >
        <Plus className="w-4 h-4 mr-1.5" />
        Add ingredient
      </Button>
    </section>
  );
}
