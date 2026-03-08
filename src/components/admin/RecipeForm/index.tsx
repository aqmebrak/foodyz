"use client";

import { useEffect, useState, useTransition } from "react";
import type { Resolver } from "react-hook-form";
import { useFieldArray,useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";

import { createRecipe, updateRecipe, uploadRecipeImage } from "@/actions/recipe";
import { Form } from "@/components/ui/form";
import { slugify } from "@/lib/utils";
import { type RecipeFormValues,recipeSchema } from "@/lib/validations/recipe";

import { BasicInfoSection } from "./BasicInfoSection";
import { DetailsSection } from "./DetailsSection";
import { IngredientsSection } from "./IngredientsSection";
import { InstructionsSection } from "./InstructionsSection";
import { SaveBar } from "./SaveBar";
import type { RecipeFormProps } from "./types";
import { DEFAULT_FORM_VALUES } from "./utils";

export function RecipeForm({
  categories,
  ingredients: initialIngredients,
  units,
  defaultValues,
  recipeId,
}: RecipeFormProps) {
  const isEdit = !!recipeId;
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [ingredientsList, setIngredientsList] = useState(initialIngredients);

  const form = useForm<RecipeFormValues>({
    resolver: standardSchemaResolver(recipeSchema) as unknown as Resolver<RecipeFormValues>,
    defaultValues: { ...DEFAULT_FORM_VALUES, ...defaultValues },
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

        <BasicInfoSection
          control={form.control}
          featuredImage={featuredImage}
          onImageUpload={handleImageUpload}
        />

        <DetailsSection control={form.control} categories={categories} />

        <InstructionsSection control={form.control} />

        <IngredientsSection
          control={form.control}
          fields={fields}
          append={append}
          remove={remove}
          ingredients={ingredientsList}
          units={units}
          onIngredientCreated={(ing) =>
            setIngredientsList((prev) =>
              [...prev, ing].sort((a, b) => a.name.localeCompare(b.name))
            )
          }
        />

        <SaveBar isPending={isPending} isEdit={isEdit} />
      </form>
    </Form>
  );
}
