import type { Control } from "react-hook-form";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import type { RecipeFormValues } from "@/lib/validations/recipe";

interface InstructionsSectionProps {
  control: Control<RecipeFormValues>;
}

export function InstructionsSection({ control }: InstructionsSectionProps) {
  return (
    <section className="space-y-5">
      <h2 className="text-base font-semibold text-gray-900 border-b pb-2">
        Instructions
      </h2>
      <FormField
        control={control}
        name="instructions"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Textarea
                placeholder="Describe each step. Separate steps with a blank line for numbered display."
                rows={12}
                className="font-mono text-sm"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Separate steps with a blank line — they&apos;ll be numbered on
              the recipe page.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </section>
  );
}
