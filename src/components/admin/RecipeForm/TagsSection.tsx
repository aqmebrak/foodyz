"use client";

import { X } from "lucide-react";
import { useRef, useState } from "react";
import type { Control } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { RecipeFormValues } from "@/lib/validations/recipe";

import type { Tag } from "./types";

interface TagsSectionProps {
  control: Control<RecipeFormValues>;
  availableTags: Tag[];
}

export function TagsSection({ control, availableTags }: TagsSectionProps) {
  const [inputValue, setInputValue] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <section className="flex flex-col gap-5">
      <h2 className="border-b pb-2 text-base font-semibold text-foreground">
        Tags
      </h2>

      <FormField
        control={control}
        name="tags"
        render={({ field }) => {
          const selectedTags: string[] = field.value ?? [];

          const filteredTags = availableTags.filter(
            (t) =>
              t.name.toLowerCase().includes(inputValue.toLowerCase()) &&
              !selectedTags.includes(t.name)
          );

          const canCreate =
            inputValue.trim().length > 0 &&
            !availableTags.some(
              (t) => t.name.toLowerCase() === inputValue.trim().toLowerCase()
            ) &&
            !selectedTags.includes(inputValue.trim());

          function addTag(name: string) {
            if (!selectedTags.includes(name)) {
              field.onChange([...selectedTags, name]);
            }
            setInputValue("");
            setOpen(false);
            inputRef.current?.focus();
          }

          function removeTag(name: string) {
            field.onChange(selectedTags.filter((t) => t !== name));
          }

          return (
            <FormItem>
              <FormLabel className="sr-only">Tags</FormLabel>
              <FormControl>
                <div className="flex flex-col gap-2">
                  {selectedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedTags.map((name) => (
                        <Badge
                          key={name}
                          variant="secondary"
                          className="h-11 gap-1 pl-3 pr-0 text-sm"
                        >
                          {name}
                          <button
                            type="button"
                            onClick={() => removeTag(name)}
                            className="flex size-11 items-center justify-center transition-colors hover:text-paprika"
                            aria-label={`Remove tag ${name}`}
                          >
                            <X className="size-4" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="relative">
                    <input
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => {
                        setInputValue(e.target.value);
                        setOpen(true);
                      }}
                      onFocus={() => setOpen(true)}
                      onBlur={() => setTimeout(() => setOpen(false), 150)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (canCreate) addTag(inputValue.trim());
                          else if (filteredTags[0]) addTag(filteredTags[0].name);
                        }
                      }}
                      placeholder="Add or create tags…"
                      autoComplete="off"
                      enterKeyHint="done"
                      className="h-11 w-full rounded-lg border border-input bg-background px-3 py-1 text-base shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-basil md:text-sm"
                    />

                    {open && (filteredTags.length > 0 || canCreate) && (
                      <div className="absolute z-50 mt-1 w-full bg-card border border-border rounded-md shadow-md max-h-48 overflow-y-auto">
                        {filteredTags.map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              addTag(t.name);
                            }}
                            className="min-h-11 w-full px-3 py-2 text-left text-base hover:bg-basil/10 hover:text-basil md:text-sm"
                          >
                            {t.name}
                          </button>
                        ))}
                        {canCreate && (
                          <button
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              addTag(inputValue.trim());
                            }}
                            className="min-h-11 w-full border-t border-border px-3 py-2 text-left text-base text-basil hover:bg-basil/10 md:text-sm"
                          >
                            + Create &quot;{inputValue.trim()}&quot;
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
      />
    </section>
  );
}
