import { Plus, Trash2 } from "lucide-react";
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
  ingredients: Ingredient[];
  units: Unit[];
  onIngredientCreated: (ingredient: Ingredient) => void;
}

export function IngredientsSection({
  control,
  fields,
  append,
  remove,
  ingredients,
  units,
  onIngredientCreated,
}: IngredientsSectionProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-base font-semibold text-gray-900 border-b pb-2">
        Ingredients
      </h2>

      {fields.length === 0 && (
        <p className="text-sm text-gray-400 py-2">No ingredients added.</p>
      )}

      <div className="space-y-3">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-12 gap-2 items-start p-3 bg-gray-50 rounded-lg"
          >
            {/* Ingredient — col 1-5 */}
            <div className="col-span-12 sm:col-span-5">
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
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Quantity — col 6-7 */}
            <div className="col-span-4 sm:col-span-2">
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
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Unit — col 8-9 */}
            <div className="col-span-4 sm:col-span-2">
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

            {/* Notes — col 10-11 */}
            <div className="col-span-3 sm:col-span-2">
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

            {/* Remove — col 12 */}
            <div className="col-span-1 flex items-center justify-end pt-0.5">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Remove ingredient"
                onClick={() => remove(index)}
                className="h-9 w-9 text-gray-400 hover:text-red-500"
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
        onClick={() =>
          append({ ingredientId: "", quantity: 0, unitId: "", notes: "" })
        }
      >
        <Plus className="w-4 h-4 mr-1.5" />
        Add ingredient
      </Button>
    </section>
  );
}
