import Image from "next/image";
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
import { Textarea } from "@/components/ui/textarea";
import type { RecipeFormValues } from "@/lib/validations/recipe";

interface BasicInfoSectionProps {
  control: Control<RecipeFormValues>;
  featuredImage: string | undefined;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

export function BasicInfoSection({
  control,
  featuredImage,
  onImageUpload,
}: BasicInfoSectionProps) {
  return (
    <section className="space-y-5">
      <h2 className="text-base font-semibold text-foreground border-b pb-2">
        Basic info
      </h2>

      <FormField
        control={control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input placeholder="e.g. Pasta Carbonara" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="slug"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Slug</FormLabel>
            <FormControl>
              <Input placeholder="pasta-carbonara" {...field} />
            </FormControl>
            <FormDescription>URL: /recipes/{field.value}</FormDescription>
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
                placeholder="Short description shown on recipe cards…"
                rows={3}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="featuredImage"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Featured image</FormLabel>
            <div className="space-y-3">
              {featuredImage && (
                <div className="relative w-full aspect-video max-w-xs rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={featuredImage}
                    alt="Featured"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={onImageUpload}
                className="max-w-xs"
              />
              <Input
                placeholder="/images/recipes/my-photo.jpg"
                {...field}
                value={field.value ?? ""}
                className="max-w-xs text-xs text-muted-foreground"
              />
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </section>
  );
}
