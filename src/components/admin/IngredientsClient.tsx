"use client";

import { Fragment, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type { Resolver } from "react-hook-form";
import { ingredientSchema, type IngredientFormValues } from "@/lib/validations/category";
import { createIngredient, updateIngredient, deleteIngredient } from "@/actions/ingredient";
import { slugify } from "@/lib/utils";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

interface Ingredient {
  id: string;
  name: string;
  slug: string;
}

interface IngredientsClientProps {
  ingredients: Ingredient[];
}

function IngredientForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  defaultValues?: Partial<IngredientFormValues>;
  onSubmit: (data: IngredientFormValues) => Promise<void>;
  onCancel?: () => void;
  submitLabel: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<IngredientFormValues>({
    resolver: standardSchemaResolver(ingredientSchema) as Resolver<IngredientFormValues>,
    defaultValues: { name: "", slug: "", ...defaultValues },
  });

  function handleNameChange(value: string) {
    form.setValue("name", value);
    if (!defaultValues?.slug) {
      form.setValue("slug", slugify(value));
    }
  }

  function handleSubmit(data: IngredientFormValues) {
    setServerError(null);
    startTransition(async () => {
      const result = await onSubmit(data);
      void result;
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
        {serverError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {serverError}
          </p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Olive oil"
                  />
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
                  <Input {...field} placeholder="olive-oil" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex gap-2 pt-1">
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? "Saving…" : submitLabel}
          </Button>
          {onCancel && (
            <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}

export function IngredientsClient({ ingredients }: IngredientsClientProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  async function handleCreate(data: IngredientFormValues) {
    const result = await createIngredient(data);
    if (!result?.error) setShowCreate(false);
  }

  async function handleUpdate(id: string, data: IngredientFormValues) {
    const result = await updateIngredient(id, data);
    if (!result?.error) setEditingId(null);
  }

  return (
    <div className="p-6 sm:p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ingredients</h1>
          <p className="text-sm text-gray-500 mt-0.5">{ingredients.length} total</p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)} disabled={showCreate}>
          <Plus className="w-4 h-4 mr-1.5" />
          New ingredient
        </Button>
      </div>

      {showCreate && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">New ingredient</h2>
          <IngredientForm
            submitLabel="Create ingredient"
            onSubmit={handleCreate}
            onCancel={() => setShowCreate(false)}
          />
        </div>
      )}

      {ingredients.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">No ingredients yet.</p>
          <p className="text-sm mt-1">Create your first ingredient to get started.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-100 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">Slug</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ingredients.map((ingredient) => (
                <Fragment key={ingredient.id}>
                  <TableRow>
                    <TableCell className="font-medium">{ingredient.name}</TableCell>
                    <TableCell className="hidden sm:table-cell text-gray-500 text-sm font-mono">
                      {ingredient.slug}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setEditingId(editingId === ingredient.id ? null : ingredient.id)
                          }
                        >
                          {editingId === ingredient.id ? (
                            <X className="w-4 h-4" />
                          ) : (
                            <Pencil className="w-4 h-4" />
                          )}
                        </Button>
                        <ConfirmDialog
                          title="Delete ingredient?"
                          description={`"${ingredient.name}" will be permanently deleted.`}
                          action={deleteIngredient.bind(null, ingredient.id)}
                          trigger={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-gray-400 hover:text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          }
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                  {editingId === ingredient.id && (
                    <TableRow key={`${ingredient.id}-edit`}>
                      <TableCell colSpan={3} className="bg-gray-50 p-4">
                        <IngredientForm
                          defaultValues={{
                            name: ingredient.name,
                            slug: ingredient.slug,
                          }}
                          submitLabel="Save changes"
                          onSubmit={(data) => handleUpdate(ingredient.id, data)}
                          onCancel={() => setEditingId(null)}
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
