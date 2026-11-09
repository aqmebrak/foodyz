import type { Control } from "react-hook-form";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { RecipeFormValues } from "@/lib/validations/recipe";

interface AdvancedSectionProps {
  control: Control<RecipeFormValues>;
}

export function AdvancedSection({ control }: AdvancedSectionProps) {
  return (
    <details className="group rounded-xl border border-steam bg-card">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between px-4 text-base font-medium text-ink [&::-webkit-details-marker]:hidden">
        Advanced
        <span className="text-ink/50 transition-transform group-open:rotate-90" aria-hidden>
          ›
        </span>
      </summary>
      <div className="flex flex-col gap-4 border-t border-steam p-4">
        <FormField
          control={control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input
                  placeholder="pasta-carbonara"
                  autoComplete="off"
                  autoCapitalize="none"
                  enterKeyHint="next"
                  className="h-11"
                  {...field}
                />
              </FormControl>
              <FormDescription>URL: /recipes/{field.value}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="featuredImage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image path</FormLabel>
              <FormControl>
                <Input
                  placeholder="/images/recipes/my-photo.jpg"
                  autoComplete="off"
                  autoCapitalize="none"
                  enterKeyHint="done"
                  className="h-11"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </details>
  );
}
