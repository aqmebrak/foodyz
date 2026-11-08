"use client";

import imageCompression from "browser-image-compression";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { Resolver } from "react-hook-form";
import { useFieldArray,useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";

import { createRecipe, deleteRecipe, updateRecipe, uploadRecipeImage } from "@/actions/recipe";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { slugify } from "@/lib/utils";
import { type RecipeFormValues,recipeSchema } from "@/lib/validations/recipe";

import { AdvancedSection } from "./AdvancedSection";
import { BasicInfoSection } from "./BasicInfoSection";
import { DetailsSection } from "./DetailsSection";
import { IngredientsSection } from "./IngredientsSection";
import { InstructionsSection } from "./InstructionsSection";
import { PhotoSection } from "./PhotoSection";
import { SaveBar } from "./SaveBar";
import { TagsSection } from "./TagsSection";
import type { RecipeFormProps } from "./types";
import { DEFAULT_FORM_VALUES } from "./utils";

export function RecipeForm({
  tags,
  ingredients: initialIngredients,
  units,
  defaultValues,
  recipeId,
}: RecipeFormProps) {
  const isEdit = !!recipeId;
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [ingredientsList, setIngredientsList] = useState(initialIngredients);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<RecipeFormValues>({
    resolver: standardSchemaResolver(recipeSchema) as unknown as Resolver<RecipeFormValues>,
    defaultValues: { ...DEFAULT_FORM_VALUES, ...defaultValues },
  });

  const { fields, append, remove, move } = useFieldArray({
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

  async function handleImagePick(file: File) {
    setUploadError(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 1.5,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      });
      const fd = new FormData();
      fd.append("file", new File([compressed], file.name, { type: compressed.type }));
      const result = await uploadRecipeImage(fd);
      if (result.path) {
        form.setValue("featuredImage", result.path, { shouldDirty: true });
      } else {
        setUploadError(result.error ?? "Upload failed. Try again.");
        clearPreview();
      }
    } catch {
      setUploadError("Upload failed. Try again.");
      clearPreview();
    } finally {
      setUploading(false);
    }
  }

  function clearPreview() {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }

  function handleImageRemove() {
    clearPreview();
    setUploadError(null);
    form.setValue("featuredImage", "", { shouldDirty: true });
  }

  const featuredImage = form.watch("featuredImage");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8">
        <PhotoSection
          featuredImage={featuredImage}
          previewUrl={previewUrl}
          uploading={uploading}
          error={uploadError}
          onPick={handleImagePick}
          onRemove={handleImageRemove}
        />

        <BasicInfoSection control={form.control} />

        <IngredientsSection
          control={form.control}
          fields={fields}
          append={append}
          remove={remove}
          move={move}
          ingredients={ingredientsList}
          units={units}
          onIngredientCreated={(ing) =>
            setIngredientsList((prev) =>
              [...prev, ing].sort((a, b) => a.name.localeCompare(b.name))
            )
          }
        />

        <InstructionsSection control={form.control} />

        <DetailsSection control={form.control} />

        <TagsSection control={form.control} availableTags={tags} />

        <AdvancedSection control={form.control} />

        {recipeId && (
          <ConfirmDialog
            title="Delete this recipe?"
            description="This permanently deletes the recipe. This action cannot be undone."
            action={async () => {
              const result = await deleteRecipe(recipeId);
              if (result?.error) setServerError(result.error);
              else router.push("/recipes");
            }}
            trigger={
              <Button
                type="button"
                variant="ghost"
                className="h-11 self-center text-paprika hover:bg-paprika/10 hover:text-paprika"
              >
                Delete recipe
              </Button>
            }
          />
        )}

        <SaveBar isPending={isPending} disabled={uploading} isEdit={isEdit} error={serverError} />
      </form>
    </Form>
  );
}
