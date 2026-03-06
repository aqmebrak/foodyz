"use client";

import { Fragment, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type { Resolver } from "react-hook-form";
import { unitSchema, type UnitFormValues } from "@/lib/validations/category";
import { createUnit, updateUnit, deleteUnit } from "@/actions/unit";
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

interface Unit {
  id: string;
  name: string;
  abbreviation: string;
}

interface UnitsClientProps {
  units: Unit[];
}

function UnitForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  defaultValues?: Partial<UnitFormValues>;
  onSubmit: (data: UnitFormValues) => Promise<void>;
  onCancel?: () => void;
  submitLabel: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<UnitFormValues>({
    resolver: standardSchemaResolver(unitSchema) as Resolver<UnitFormValues>,
    defaultValues: { name: "", abbreviation: "", ...defaultValues },
  });

  function handleSubmit(data: UnitFormValues) {
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
                  <Input {...field} placeholder="gram" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="abbreviation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Abbreviation</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="g" />
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

export function UnitsClient({ units }: UnitsClientProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  async function handleCreate(data: UnitFormValues) {
    const result = await createUnit(data);
    if (!result?.error) setShowCreate(false);
  }

  async function handleUpdate(id: string, data: UnitFormValues) {
    const result = await updateUnit(id, data);
    if (!result?.error) setEditingId(null);
  }

  return (
    <div className="p-6 sm:p-8 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Units</h1>
          <p className="text-sm text-gray-500 mt-0.5">{units.length} total</p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)} disabled={showCreate}>
          <Plus className="w-4 h-4 mr-1.5" />
          New unit
        </Button>
      </div>

      {showCreate && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">New unit</h2>
          <UnitForm
            submitLabel="Create unit"
            onSubmit={handleCreate}
            onCancel={() => setShowCreate(false)}
          />
        </div>
      )}

      {units.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">No units yet.</p>
          <p className="text-sm mt-1">Create your first unit to get started.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-100 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>Name</TableHead>
                <TableHead>Abbreviation</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {units.map((unit) => (
                <Fragment key={unit.id}>
                  <TableRow>
                    <TableCell className="font-medium">{unit.name}</TableCell>
                    <TableCell className="text-gray-500 text-sm font-mono">
                      {unit.abbreviation}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setEditingId(editingId === unit.id ? null : unit.id)
                          }
                        >
                          {editingId === unit.id ? (
                            <X className="w-4 h-4" />
                          ) : (
                            <Pencil className="w-4 h-4" />
                          )}
                        </Button>
                        <ConfirmDialog
                          title="Delete unit?"
                          description={`"${unit.name} (${unit.abbreviation})" will be permanently deleted.`}
                          action={deleteUnit.bind(null, unit.id)}
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
                  {editingId === unit.id && (
                    <TableRow key={`${unit.id}-edit`}>
                      <TableCell colSpan={3} className="bg-gray-50 p-4">
                        <UnitForm
                          defaultValues={{
                            name: unit.name,
                            abbreviation: unit.abbreviation,
                          }}
                          submitLabel="Save changes"
                          onSubmit={(data) => handleUpdate(unit.id, data)}
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
