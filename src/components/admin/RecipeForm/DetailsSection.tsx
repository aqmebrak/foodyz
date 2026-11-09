import type { Control } from "react-hook-form";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { RecipeFormValues } from "@/lib/validations/recipe";

import { NumberStepper } from "./NumberStepper";
import { difficultyOptions } from "./utils";

interface DetailsSectionProps {
  control: Control<RecipeFormValues>;
}

export function DetailsSection({ control }: DetailsSectionProps) {
  return (
    <section className="flex flex-col gap-5">
      <h2 className="border-b pb-2 text-base font-semibold text-foreground">
        Details
      </h2>

      <FormField
        control={control}
        name="difficulty"
        render={({ field }) => (
          <FormItem>
            <FormLabel id="difficulty-label">Difficulty</FormLabel>
            <div
              role="radiogroup"
              aria-labelledby="difficulty-label"
              className="grid grid-cols-3 gap-2"
            >
              {difficultyOptions.map((o) => {
                const active = field.value === o.value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => field.onChange(o.value)}
                    className={cn(
                      "h-11 rounded-lg border text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-basil",
                      active
                        ? "border-basil bg-basil text-on-basil"
                        : "border-steam bg-card text-ink hover:bg-enamel",
                    )}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="prepTime"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Prep time</FormLabel>
            <FormControl>
              <NumberStepper
                {...field}
                value={field.value}
                label="prep time"
                min={1}
                step={5}
                suffix="min"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="cookTime"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cook time</FormLabel>
            <FormControl>
              <NumberStepper
                {...field}
                value={field.value}
                label="cook time"
                min={0}
                step={5}
                suffix="min"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="servings"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Servings</FormLabel>
            <FormControl>
              <NumberStepper
                {...field}
                value={field.value}
                label="servings"
                min={1}
                step={1}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="published"
        render={({ field }) => (
          <FormItem className="flex min-h-11 flex-row items-center justify-between gap-3 rounded-xl border border-steam bg-card px-4 py-2">
            <div className="flex flex-col gap-0.5">
              <FormLabel className="text-base">Published</FormLabel>
              <FormDescription className="text-xs">
                Show in your recipe list
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
                className="relative data-[size=default]:h-7 data-[size=default]:w-12 data-[state=checked]:bg-basil before:absolute before:-inset-2 before:content-[''] [&>span]:size-6!"
              />
            </FormControl>
          </FormItem>
        )}
      />
    </section>
  );
}
