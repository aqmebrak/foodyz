"use client";

import { Check, ChevronDown, Loader2, MapPin, Plus, Search } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";

import { createPastryLocation } from "@/actions/flan";
import { Button } from "@/components/ui/button";
import { cn, normalizeStr } from "@/lib/utils";

export interface PastryLocation {
  id: string;
  name: string;
  mapsUrl: string;
}

interface LocationComboboxProps {
  value: string; // locationId
  onChange: (id: string) => void;
  locations: PastryLocation[];
  onLocationCreated: (location: PastryLocation) => void;
}

export function LocationCombobox({
  value,
  onChange,
  locations,
  onLocationCreated,
}: LocationComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newMapsUrl, setNewMapsUrl] = useState("");
  const [isPending, startTransition] = useTransition();
  const [createError, setCreateError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = locations.find((l) => l.id === value);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setCreating(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = query
    ? locations.filter((l) => normalizeStr(l.name).includes(normalizeStr(query)))
    : locations;

  const exactMatch = locations.some(
    (l) => normalizeStr(l.name) === normalizeStr(query)
  );

  function handleSelect(id: string) {
    onChange(id);
    setOpen(false);
    setQuery("");
    setCreating(false);
  }

  function startCreating(prefill?: string) {
    setCreating(true);
    setNewName(prefill ?? query);
    setNewMapsUrl("");
    setCreateError(null);
  }

  function handleCreate() {
    const name = newName.trim();
    const mapsUrl = newMapsUrl.trim();
    if (!name || !mapsUrl) {
      setCreateError("Both name and Maps URL are required");
      return;
    }
    setCreateError(null);
    startTransition(async () => {
      const result = await createPastryLocation({ name, mapsUrl });
      if (!result) return;
      if ("error" in result) {
        setCreateError(result.error ?? "Unknown error");
        return;
      }
      onLocationCreated(result.location);
      onChange(result.location.id);
      setOpen(false);
      setCreating(false);
      setQuery("");
      setNewName("");
      setNewMapsUrl("");
    });
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          setCreating(false);
        }}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring",
          !selected && "text-muted-foreground"
        )}
      >
        <span className="flex items-center gap-1.5 truncate">
          {selected ? (
            <>
              <MapPin className="w-3.5 h-3.5 shrink-0 text-gray-400" />
              {selected.name}
            </>
          ) : (
            "Select location…"
          )}
        </span>
        <ChevronDown className="ml-2 w-4 h-4 shrink-0 text-gray-400" />
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              <input
                autoFocus
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setCreating(false);
                }}
                placeholder="Search locations…"
                className="w-full pl-8 pr-2 py-1.5 text-sm outline-none bg-transparent"
              />
            </div>
          </div>

          {/* List */}
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 && !query && (
              <p className="px-3 py-2 text-sm text-gray-400">No locations yet.</p>
            )}
            {filtered.length === 0 && query && !creating && (
              <p className="px-3 py-2 text-sm text-gray-400">No results for &ldquo;{query}&rdquo;.</p>
            )}
            {filtered.map((loc) => (
              <button
                key={loc.id}
                type="button"
                onClick={() => handleSelect(loc.id)}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <Check
                  className={cn(
                    "w-3.5 h-3.5 text-emerald-600 shrink-0",
                    value === loc.id ? "opacity-100" : "opacity-0"
                  )}
                />
                <MapPin className="w-3 h-3 text-gray-300 shrink-0" />
                {loc.name}
              </button>
            ))}

            {!creating && query && !exactMatch && (
              <button
                type="button"
                onClick={() => startCreating(query)}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-emerald-700 cursor-pointer hover:bg-emerald-50 transition-colors border-t border-gray-100"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                Add &ldquo;{query}&rdquo;
              </button>
            )}
            {!creating && !query && (
              <button
                type="button"
                onClick={() => startCreating()}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-emerald-700 cursor-pointer hover:bg-emerald-50 transition-colors border-t border-gray-100"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                New location
              </button>
            )}
          </div>

          {/* Inline create form */}
          {creating && (
            <div className="p-2 border-t border-gray-100 space-y-2">
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Pastry shop name"
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <input
                value={newMapsUrl}
                onChange={(e) => setNewMapsUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                placeholder="https://www.google.com/maps/place/…"
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              {createError && <p className="text-xs text-red-500">{createError}</p>}
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleCreate}
                  disabled={isPending || !newName.trim() || !newMapsUrl.trim()}
                  className="flex-1 h-7 text-xs"
                >
                  {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Create"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setCreating(false)}
                  className="h-7 text-xs"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
