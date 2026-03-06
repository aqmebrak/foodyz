"use client";

import { Fragment, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type { Resolver } from "react-hook-form";
import { categorySchema, type CategoryFormValues } from "@/lib/validations/category";
import { createCategory, updateCategory, deleteCategory } from "@/actions/category";
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

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface CategoriesClientProps {
  categories: Category[];
}

function CategoryForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  defaultValues?: Partial<CategoryFormValues>;
  onSubmit: (data: CategoryFormValues) => Promise<void>;
  onCancel?: () => void;
  submitLabel: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<CategoryFormValues>({
    resolver: standardSchemaResolver(categorySchema) as Resolver<CategoryFormValues>,
    defaultValues: { name: "", slug: "", description: "", ...defaultValues },
  });

  function handleNameChange(value: string) {
    form.setValue("name", value);
    if (!defaultValues?.slug) {
      form.setValue("slug", slugify(value));
    }
  }

  function handleSubmit(data: CategoryFormValues) {
    setServerError(null);
    startTransition(async () => {
      await onSubmit(data);
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
                    placeholder="Italian"
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
                  <Input {...field} placeholder="italian" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ""} placeholder="Optional description…" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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

export function CategoriesClient({ categories }: CategoriesClientProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  async function handleCreate(data: CategoryFormValues) {
    const result = await createCategory(data);
    if (!result?.error) setShowCreate(false);
  }

  async function handleUpdate(id: string, data: CategoryFormValues) {
    const result = await updateCategory(id, data);
    if (!result?.error) setEditingId(null);
  }

  return (
    <div className="p-6 sm:p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500 mt-0.5">{categories.length} total</p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)} disabled={showCreate}>
          <Plus className="w-4 h-4 mr-1.5" />
          New category
        </Button>
      </div>

      {showCreate && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">New category</h2>
          <CategoryForm
            submitLabel="Create category"
            onSubmit={handleCreate}
            onCancel={() => setShowCreate(false)}
          />
        </div>
      )}

      {categories.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">No categories yet.</p>
          <p className="text-sm mt-1">Create your first category to get started.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-100 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">Slug</TableHead>
                <TableHead className="hidden md:table-cell">Description</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <Fragment key={category.id}>
                  <TableRow>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="hidden sm:table-cell text-gray-500 text-sm font-mono">
                      {category.slug}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-gray-500 text-sm truncate max-w-xs">
                      {category.description ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setEditingId(editingId === category.id ? null : category.id)
                          }
                        >
                          {editingId === category.id ? (
                            <X className="w-4 h-4" />
                          ) : (
                            <Pencil className="w-4 h-4" />
                          )}
                        </Button>
                        <ConfirmDialog
                          title="Delete category?"
                          description={`"${category.name}" will be permanently deleted. Recipes using this category will lose their category.`}
                          action={deleteCategory.bind(null, category.id)}
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
                  {editingId === category.id && (
                    <TableRow key={`${category.id}-edit`}>
                      <TableCell colSpan={4} className="bg-gray-50 p-4">
                        <CategoryForm
                          defaultValues={{
                            name: category.name,
                            slug: category.slug,
                            description: category.description ?? "",
                          }}
                          submitLabel="Save changes"
                          onSubmit={(data) => handleUpdate(category.id, data)}
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
