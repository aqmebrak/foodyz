"use client";

import { Search, X } from "lucide-react";
import { useState } from "react";

import { type FlanFilterState, type FlanStatus,RATING_OPTIONS } from "@/lib/flan-filters";
import { cn } from "@/lib/utils";

interface FlanFiltersProps {
  value: FlanFilterState;
  onChange: (next: FlanFilterState) => void;
}

const chipClass =
  "inline-flex h-11 shrink-0 cursor-pointer items-center justify-center rounded-full border px-4 text-sm font-medium shadow-sm transition-colors";
const chipOff = "border-steam bg-card text-ink hover:border-ink/30";
const chipOn = "border-basil bg-basil text-on-basil";

export function FlanFilters({ value, onChange }: FlanFiltersProps) {
  const [expanded, setExpanded] = useState(false);
  const showInput = expanded || value.query !== "";

  const toggleStatus = (status: Exclude<FlanStatus, "all">) =>
    onChange({ ...value, status: value.status === status ? "all" : status });

  return (
    <div
      role="group"
      aria-label="Filters"
      className="flex items-center gap-2 overflow-x-auto px-4 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {!showInput && (
        <button
          type="button"
          aria-label="Search flans"
          onClick={() => setExpanded(true)}
          className={cn(chipClass, chipOff, "w-11 px-0 md:hidden")}
        >
          <Search className="size-4" />
        </button>
      )}
      <div className={cn("relative shrink-0", !showInput && "hidden md:block")}>
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink/50" />
        <input
          type="text"
          value={value.query}
          onChange={(e) => onChange({ ...value, query: e.target.value })}
          placeholder="Search by name or location…"
          aria-label="Search flans"
          autoFocus={expanded}
          className="h-11 w-64 rounded-full border border-steam bg-card pl-10 pr-10 text-base text-ink shadow-sm focus:outline-none focus:ring-2 focus:ring-basil"
        />
        {showInput && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              onChange({ ...value, query: "" });
              setExpanded(false);
            }}
            className="absolute right-0 top-0 flex size-11 cursor-pointer items-center justify-center text-ink/60 md:hidden"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <button
        type="button"
        aria-pressed={value.status === "tried"}
        onClick={() => toggleStatus("tried")}
        className={cn(chipClass, value.status === "tried" ? chipOn : chipOff)}
      >
        Tried
      </button>
      <button
        type="button"
        aria-pressed={value.status === "to-try"}
        onClick={() => toggleStatus("to-try")}
        className={cn(chipClass, value.status === "to-try" ? chipOn : chipOff)}
      >
        To try
      </button>
      {RATING_OPTIONS.map((r) => (
        <button
          key={r}
          type="button"
          aria-pressed={value.minRating === r}
          onClick={() => onChange({ ...value, minRating: value.minRating === r ? 0 : r })}
          className={cn(chipClass, value.minRating === r ? chipOn : chipOff)}
        >
          {r === 5 ? "★ 5" : `★ ${r}+`}
        </button>
      ))}
    </div>
  );
}
