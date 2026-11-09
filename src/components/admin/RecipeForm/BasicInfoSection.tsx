import type { Control } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { RecipeFormValues } from "@/lib/validations/recipe";

interface BasicInfoSectionProps {
  control: Control<RecipeFormValues>;
}

export function BasicInfoSection({ control }: BasicInfoSectionProps) {
  return (
    <section className="flex flex-col gap-4">
      <FormField
        control={control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input
                placeholder="e.g. Pasta carbonara"
                autoComplete="off"
                enterKeyHint="next"
                className="h-11"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="A short note about this recipe"
                rows={3}
                autoComplete="off"
                enterKeyHint="enter"
                className="min-h-[88px]"
                {...field}
                value={field.value ?? ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </section>
  );
}
