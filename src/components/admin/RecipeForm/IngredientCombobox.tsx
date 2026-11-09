"use client";

import { Check, ChevronDown, Loader2, Plus, Search } from "lucide-react";
import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
} from "react";

import { createIngredient } from "@/actions/ingredient";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { cn, normalizeStr, slugify } from "@/lib/utils";

import type { Ingredient } from "./types";

/**
 * The single code path for creating an ingredient from the recipe form.
 * Shared by the combobox "create new" flow and the paste-list sheet.
 */
export async function createIngredientByName(
  rawName: string,
): Promise<{ ingredient: Ingredient } | { error: string }> {
  const name = rawName.trim();
  const result = await createIngredient({ name, slug: slugify(name) });
  if (!result) return { error: "Unknown error" };
  if ("error" in result) return { error: result.error ?? "Unknown error" };
  return { ingredient: result.ingredient };
}

const MOBILE_QUERY = "(max-width: 767px)";

function subscribeMobile(cb: () => void) {
  const mq = window.matchMedia(MOBILE_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function useIsMobile() {
  return useSyncExternalStore(
    subscribeMobile,
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false,
  );
}

interface IngredientComboboxProps {
  value: string;
  onChange: (id: string) => void;
  ingredients: Ingredient[];
  onIngredientCreated: (ingredient: Ingredient) => void;
  autoOpen?: boolean;
  onOpen?: () => void;
  id?: string;
  onBlur?: () => void;
  "aria-invalid"?: boolean | "true" | "false";
  "aria-describedby"?: string;
}

export const IngredientCombobox = forwardRef<
  HTMLButtonElement,
  IngredientComboboxProps
>(function IngredientCombobox(
  {
    value,
    onChange,
    ingredients,
    onIngredientCreated,
    autoOpen,
    onOpen,
    id,
    onBlur,
    "aria-invalid": ariaInvalid,
    "aria-describedby": ariaDescribedBy,
  },
  ref,
) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [isPending, startTransition] = useTransition();
  const [createError, setCreateError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const selected = ingredients.find((i) => i.id === value);

  function close() {
    setOpen(false);
    setCreating(false);
    setQuery("");
  }

  // Desktop popover: close on outside tap/click and on Escape.
  useEffect(() => {
    if (!open || isMobile) return;
    function handlePointer(e: PointerEvent) {
      if (!containerRef.current?.contains(e.target as Node)) close();
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("pointerdown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, isMobile]);

  useEffect(() => {
    if (autoOpen) {
      setOpen(true);
      onOpen?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpen]);

  const filtered = query
    ? ingredients.filter((i) =>
        normalizeStr(i.name).includes(normalizeStr(query)),
      )
    : ingredients;

  const exactMatch = ingredients.some(
    (i) => normalizeStr(i.name) === normalizeStr(query),
  );

  function handleSelect(ingredientId: string) {
    onChange(ingredientId);
    close();
  }

  function startCreating(prefill?: string) {
    setCreating(true);
    setNewName(prefill ?? query);
    setCreateError(null);
  }

  function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    setCreateError(null);
    startTransition(async () => {
      const result = await createIngredientByName(name);
      if ("error" in result) {
        setCreateError(result.error);
        return;
      }
      onIngredientCreated(result.ingredient);
      onChange(result.ingredient.id);
      close();
      setNewName("");
    });
  }

  const optionClass =
    "flex min-h-11 w-full items-center gap-2 px-3 py-2 text-base text-left text-ink cursor-pointer transition-colors hover:bg-enamel active:bg-steam";

  const panel = (
    <>
      <div className="border-b border-steam p-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink/40" />
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCreating(false);
            }}
            placeholder="Search ingredients"
            aria-label="Search ingredients"
            autoComplete="off"
            className="h-11 w-full rounded-lg border border-steam bg-card pl-9 pr-3 text-base text-ink outline-none focus-visible:ring-2 focus-visible:ring-basil"
          />
        </div>
      </div>

      <div
        role="listbox"
        aria-label="Ingredients"
        className={cn(
          "overflow-y-auto overscroll-contain",
          isMobile ? "max-h-[50dvh]" : "max-h-64",
        )}
      >
        {filtered.length === 0 && !query && (
          <p className="px-3 py-3 text-sm text-ink/60">No ingredients.</p>
        )}
        {filtered.length === 0 && query && !creating && (
          <p className="px-3 py-3 text-sm text-ink/60">
            No results for &ldquo;{query}&rdquo;.
          </p>
        )}
        {filtered.map((ing) => (
          <button
            key={ing.id}
            type="button"
            role="option"
            aria-selected={value === ing.id}
            onClick={() => handleSelect(ing.id)}
            className={optionClass}
          >
            <Check
              className={cn(
                "size-4 shrink-0 text-basil",
                value === ing.id ? "opacity-100" : "opacity-0",
              )}
            />
            {ing.name}
          </button>
        ))}

        {!creating && query && !exactMatch && (
          <button
            type="button"
            onClick={() => startCreating(query)}
            className={cn(optionClass, "border-t border-steam text-basil")}
          >
            <Plus className="size-4 shrink-0" />
            Add &ldquo;{query}&rdquo;
          </button>
        )}
        {!creating && !query && (
          <button
            type="button"
            onClick={() => startCreating()}
            className={cn(optionClass, "border-t border-steam text-basil")}
          >
            <Plus className="size-4 shrink-0" />
            New ingredient
          </button>
        )}
      </div>

      {creating && (
        <div className="flex flex-col gap-2 border-t border-steam p-2">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="Ingredient name"
            aria-label="New ingredient name"
            autoCapitalize="none"
            autoCorrect="off"
            className="h-11 w-full rounded-lg border border-steam bg-card px-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-basil"
          />
          {createError && <p className="text-sm text-paprika">{createError}</p>}
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleCreate}
              disabled={isPending || !newName.trim()}
              className="h-11 flex-1"
            >
              {isPending ? <Loader2 className="size-4 animate-spin" /> : "Create"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setCreating(false)}
              className="h-11"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={ref}
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        data-invalid={ariaInvalid === true || ariaInvalid === "true" ? "" : undefined}
        aria-describedby={ariaDescribedBy}
        onBlur={onBlur}
        onClick={() => {
          setOpen((o) => !o);
          setCreating(false);
        }}
        className={cn(
          "flex h-11 w-full cursor-pointer items-center justify-between rounded-lg border border-steam bg-card px-3 text-base text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-basil data-[invalid]:border-paprika",
          !selected && "text-ink/50",
        )}
      >
        <span className="truncate">
          {selected ? selected.name : "Choose ingredient"}
        </span>
        <ChevronDown className="ml-2 size-4 shrink-0 text-ink/40" />
      </button>

      {isMobile ? (
        <Drawer
          direction="bottom"
          open={open}
          onOpenChange={(o) => (o ? setOpen(true) : close())}
        >
          <DrawerContent>
            <DrawerHeader className="pb-2">
              <DrawerTitle>Choose ingredient</DrawerTitle>
              <DrawerDescription className="sr-only">
                Search the ingredient list or add a new one
              </DrawerDescription>
            </DrawerHeader>
            <div className="pb-[max(1rem,env(safe-area-inset-bottom))]">
              {panel}
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        open && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-steam bg-card shadow-lg">
            {panel}
          </div>
        )
      )}
    </div>
  );
});
