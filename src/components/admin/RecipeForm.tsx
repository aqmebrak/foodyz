"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type { Resolver } from "react-hook-form";
import { recipeSchema, type RecipeFormValues } from "@/lib/validations/recipe";
import { createRecipe, updateRecipe, uploadRecipeImage } from "@/actions/recipe";
import { slugify } from "@/lib/utils";
import Image from "next/image";
import { Plus, Trash2, Loader2 } from "lucide-react";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Category {
  id: string;
  name: string;
}
interface Ingredient {
  id: string;
  name: string;
}
interface Unit {
  id: string;
  name: string;
  abbreviation: string;
}

interface RecipeFormProps {
  categories: Category[];
  ingredients: Ingredient[];
  units: Unit[];
  defaultValues?: Partial<RecipeFormValues>;
  recipeId?: string;
}

const difficultyOptions = [
  { value: "EASY", label: "Easy" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HARD", label: "Hard" },
] as const;

export function RecipeForm({
  categories,
  ingredients,
  units,
  defaultValues,
  recipeId,
}: RecipeFormProps) {
  const isEdit = !!recipeId;
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<RecipeFormValues>({
    resolver: standardSchemaResolver(recipeSchema) as unknown as Resolver<RecipeFormValues>,
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      featuredImage: "",
      categoryId: "",
      difficulty: "EASY",
      prepTime: 15,
      cookTime: 30,
      servings: 4,
      published: false,
      instructions: "",
      ingredients: [],
      ...defaultValues,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "ingredients",
  });

  // Auto-generate slug from title (create mode only)
  const titleValue = form.watch("title");
  useEffect(() => {
    if (!isEdit) {
      form.setValue("slug", slugify(titleValue ?? ""), {
        shouldValidate: false,
      });
    }
  }, [titleValue, isEdit, form]);

  function onSubmit(data: RecipeFormValues) {
    setServerError(null);
    startTransition(async () => {
      const result = isEdit
        ? await updateRecipe(recipeId, data)
        : await createRecipe(data);
      if (result?.error) setServerError(result.error);
    });
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadRecipeImage(fd);
    if (result.path) form.setValue("featuredImage", result.path);
  }

  const featuredImage = form.watch("featuredImage");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {serverError && (
          <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
            {serverError}
          </div>
        )}

        <SaveBar isPending={isPending} isEdit={isEdit} />

        {/* Basic info */}
        <section className="space-y-5">
          <h2 className="text-base font-semibold text-gray-900 border-b pb-2">
            Basic info
          </h2>

          <FormField
            control={form.control}
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
            control={form.control}
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
            control={form.control}
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

          {/* Image upload */}
          <FormField
            control={form.control}
            name="featuredImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Featured image</FormLabel>
                <div className="space-y-3">
                  {featuredImage && (
                    <div className="relative w-full aspect-video max-w-xs rounded-lg overflow-hidden bg-gray-100">
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
                    onChange={handleImageUpload}
                    className="max-w-xs"
                  />
                  <Input
                    placeholder="/images/recipes/my-photo.jpg"
                    {...field}
                    value={field.value ?? ""}
                    className="max-w-xs text-xs text-gray-400"
                  />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        {/* Details */}
        <section className="space-y-5">
          <h2 className="text-base font-semibold text-gray-900 border-b pb-2">
            Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Difficulty</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {difficultyOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="prepTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prep time (min)</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cookTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cook time (min)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="servings"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Servings</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="published"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div>
                    <FormLabel>Published</FormLabel>
                    <FormDescription className="text-xs">
                      Visible on the public site
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </section>

        {/* Instructions */}
        <section className="space-y-5">
          <h2 className="text-base font-semibold text-gray-900 border-b pb-2">
            Instructions
          </h2>
          <FormField
            control={form.control}
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
                  Separate steps with a blank line — they'll be numbered on the
                  recipe page.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        {/* Ingredients */}
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
                {/* Ingredient select — col 1-5 */}
                <div className="col-span-12 sm:col-span-5">
                  <FormField
                    control={form.control}
                    name={`ingredients.${index}.ingredientId`}
                    render={({ field }) => (
                      <FormItem>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Ingredient" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ingredients.map((ing) => (
                              <SelectItem key={ing.id} value={ing.id}>
                                {ing.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Quantity — col 6-7 */}
                <div className="col-span-4 sm:col-span-2">
                  <FormField
                    control={form.control}
                    name={`ingredients.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="Qty"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Unit select — col 8-9 */}
                <div className="col-span-4 sm:col-span-2">
                  <FormField
                    control={form.control}
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

                {/* Notes — col 10-11 + remove col 12 */}
                <div className="col-span-3 sm:col-span-2">
                  <FormField
                    control={form.control}
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
              append({ ingredientId: "", quantity: 1, unitId: "", notes: "" })
            }
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add ingredient
          </Button>
        </section>

        <SaveBar isPending={isPending} isEdit={isEdit} />
      </form>
    </Form>
  );
}

function SaveBar({
  isPending,
  isEdit,
}: {
  isPending: boolean;
  isEdit: boolean;
}) {
  return (
    <div className="flex items-center gap-3 justify-end pt-2">
      <Button type="submit" disabled={isPending} className="min-w-28">
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving…
          </>
        ) : isEdit ? (
          "Save changes"
        ) : (
          "Create recipe"
        )}
      </Button>
    </div>
  );
}
