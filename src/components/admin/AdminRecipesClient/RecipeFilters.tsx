"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Switch } from "@/components/ui/switch";
import {
  countActiveFilters,
  DIFFICULTIES,
  type RecipeFilterState,
  SERVINGS_OPTIONS,
  TIME_OPTIONS,
} from "@/lib/recipe-filters";
import { cn } from "@/lib/utils";

const difficultyLabel: Record<string, string> = { EASY: "Easy", MEDIUM: "Medium", HARD: "Hard" };

interface ChipProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

/** 44px hit area wrapping a 38px visual chip. */
function Chip({ active, onClick, children, className }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn("group flex h-11 shrink-0 snap-start items-center", className)}
    >
      <span
        className={cn(
          "flex h-[38px] items-center rounded-full border px-4 text-sm font-medium whitespace-nowrap transition-colors",
          active
            ? "border-basil bg-basil text-white"
            : "border-steam bg-white text-ink group-active:bg-steam/60",
        )}
      >
        {children}
      </span>
    </button>
  );
}

interface RecipeFiltersProps {
  filters: RecipeFilterState;
  tags: string[];
  resultCount: number;
  onChange: (patch: Partial<RecipeFilterState>) => void;
  onClear: () => void;
}

export function RecipeFilters({ filters, tags, resultCount, onChange, onClear }: RecipeFiltersProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const active = countActiveFilters(filters);

  function toggle<K extends "diff" | "serv" | "time">(key: K, value: RecipeFilterState[K]) {
    onChange({ [key]: filters[key] === value ? (key === "time" ? 0 : "") : value } as Partial<RecipeFilterState>);
  }

  return (
    <div className="sticky top-0 z-30 -mx-4 bg-enamel px-4 pb-1 pt-3 md:mx-0 md:px-0">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-ink/50" />
        <input
          type="search"
          inputMode="search"
          enterKeyHint="search"
          value={filters.q}
          onChange={(e) => onChange({ q: e.target.value })}
          placeholder="Search recipes or ingredients"
          aria-label="Search recipes or ingredients"
          className="h-12 w-full rounded-full border border-steam bg-white pl-12 pr-12 text-base text-ink outline-none placeholder:text-ink/50 focus-visible:border-basil focus-visible:ring-[3px] focus-visible:ring-basil/30 [&::-webkit-search-cancel-button]:hidden"
        />
        {filters.q && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => onChange({ q: "" })}
            className="absolute right-1 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center text-ink/60"
          >
            <X className="size-5" />
          </button>
        )}
      </div>

      <div className="-mx-4 flex snap-x scroll-px-4 gap-2 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:px-0">
        <Chip active={!filters.tag} onClick={() => onChange({ tag: "" })}>
          All
        </Chip>
        {tags.map((t) => (
          <Chip key={t} active={filters.tag === t} onClick={() => onChange({ tag: filters.tag === t ? "" : t })}>
            {t}
          </Chip>
        ))}
        <Chip active={active > 0} onClick={() => setSheetOpen(true)}>
          <SlidersHorizontal className="mr-1.5 size-4" />
          Filters{active > 0 ? ` (${active})` : ""}
        </Chip>
      </div>

      <Drawer open={sheetOpen} onOpenChange={setSheetOpen} direction="bottom">
        <DrawerContent className="max-h-[85dvh]">
          <DrawerTitle className="px-4 pt-3 font-display text-xl font-semibold text-ink">Filters</DrawerTitle>
          <DrawerDescription className="sr-only">Narrow the recipe list</DrawerDescription>
          <div className="overflow-y-auto px-4 pb-2">
            <fieldset className="mt-2">
              <legend className="text-sm font-semibold text-ink/70">Difficulty</legend>
              <div className="flex flex-wrap gap-x-2">
                {DIFFICULTIES.map((d) => (
                  <Chip key={d} active={filters.diff === d} onClick={() => toggle("diff", d)}>
                    {difficultyLabel[d]}
                  </Chip>
                ))}
              </div>
            </fieldset>
            <fieldset className="mt-2">
              <legend className="text-sm font-semibold text-ink/70">Total time</legend>
              <div className="flex flex-wrap gap-x-2">
                {TIME_OPTIONS.map((m) => (
                  <Chip key={m} active={filters.time === m} onClick={() => toggle("time", m)}>
                    {`≤ ${m} min`}
                  </Chip>
                ))}
              </div>
            </fieldset>
            <fieldset className="mt-2">
              <legend className="text-sm font-semibold text-ink/70">Servings</legend>
              <div className="flex flex-wrap gap-x-2">
                {SERVINGS_OPTIONS.map((s) => (
                  <Chip key={s} active={filters.serv === s} onClick={() => toggle("serv", s)}>
                    {s.replace("-", "–")}
                  </Chip>
                ))}
              </div>
            </fieldset>
            <label className="mt-2 flex min-h-12 items-center justify-between gap-3">
              <span className="text-base text-ink">Show drafts</span>
              <Switch
                checked={filters.drafts}
                onCheckedChange={(v) => onChange({ drafts: v })}
                className="data-[state=checked]:bg-basil data-[size=default]:h-7 data-[size=default]:w-12 [&_[data-slot=switch-thumb]]:size-6! [&_[data-slot=switch-thumb]]:data-[state=checked]:translate-x-[calc(100%-2px)]"
              />
            </label>
          </div>
          <div
            className="flex gap-3 border-t border-steam px-4 pt-3"
            style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
          >
            <Button type="button" variant="outline" className="h-12 flex-1 rounded-full text-base" onClick={onClear}>
              Clear
            </Button>
            <Button
              type="button"
              className="h-12 flex-[2] rounded-full bg-basil text-base text-white hover:bg-basil/90"
              onClick={() => setSheetOpen(false)}
            >
              {`Show ${resultCount} ${resultCount === 1 ? "recipe" : "recipes"}`}
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
