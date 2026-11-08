"use client";

import { Plus } from "lucide-react";
import dynamic from "next/dynamic";
import { useMemo, useState, useSyncExternalStore } from "react";

import { FlanDetail } from "@/components/flan/FlanDetail";
import { FlanFilters } from "@/components/flan/FlanFilters";
import { FlanList } from "@/components/flan/FlanList";
import { FlanSheet, getSnapHeights, useSheetMetrics } from "@/components/flan/FlanSheet";
import type { PastryLocation } from "@/components/flan/LocationCombobox";
import { QuickLogSheet } from "@/components/flan/QuickLogSheet";
import {
  countTried,
  filterFlans,
  type FlanFilterState,
  type FlanItem,
} from "@/lib/flan-filters";
import { cn } from "@/lib/utils";

const FlanMap = dynamic(() => import("@/components/flan/FlanMap").then((m) => m.FlanMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full animate-pulse items-center justify-center bg-steam">
      <p className="text-sm text-ink/60">Loading map…</p>
    </div>
  ),
});

interface FlanPageClientProps {
  flans: FlanItem[];
  locations: PastryLocation[];
}

const MOBILE_QUERY = "(max-width: 767px)";

function useIsMobile(): boolean {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(MOBILE_QUERY);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false,
  );
}

export function FlanPageClient({ flans, locations }: FlanPageClientProps) {
  const [filters, setFilters] = useState<FlanFilterState>({ query: "", minRating: 0, status: "all" });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [snapIndex, setSnapIndex] = useState(0);
  const [logOpen, setLogOpen] = useState(false);
  const isMobile = useIsMobile();
  const metrics = useSheetMetrics();

  const filtered = useMemo(() => filterFlans(flans, filters), [flans, filters]);
  const selected = filtered.find((f) => f.id === selectedId) ?? null;
  const { tried, toTry } = countTried(flans);
  const summary = `${tried} tried · ${toTry} to try`;

  // Marker tap: show the detail at least at half height.
  const selectFromMap = (id: string) => {
    setSelectedId(id);
    setSnapIndex((i) => Math.max(i, 1));
  };
  // List row tap: always half, so the flown-to marker is visible above the sheet.
  const selectFromList = (id: string) => {
    setSelectedId(id);
    setSnapIndex(1);
  };
  const back = () => setSelectedId(null);

  const mobileSheet = isMobile && metrics !== null;
  const bottomInset = mobileSheet ? getSnapHeights(metrics)[1] - metrics.tabbar : 0;

  // Sits 16px above the sheet's current peek/half height (measured from the container bottom).
  const fabBottom = mobileSheet
    ? getSnapHeights(metrics)[Math.min(snapIndex, 1)] - metrics.tabbar + 16
    : null;

  const body = selected ? (
    <FlanDetail flan={selected} onBack={back} />
  ) : (
    <FlanList flans={filtered} selectedId={selectedId} onSelect={selectFromList} />
  );

  return (
    <div className="relative h-[calc(100dvh-var(--tabbar-h))] overflow-hidden md:flex md:h-screen">
      {/* Map. Isolated so Leaflet's high z-indexes stay below overlays, sheet and tab bar. */}
      <div className="relative z-0 h-full min-w-0 flex-1 isolate">
        <FlanMap
          flans={filtered}
          selectedId={selected?.id ?? null}
          onSelect={selectFromMap}
          bottomInset={bottomInset}
        />
      </div>

      {/* Overlays: title card + filters */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col gap-2 pt-[calc(env(safe-area-inset-top)+12px)] md:right-[360px]">
        <div className="pointer-events-auto mx-4 w-fit rounded-xl bg-white/95 px-3 py-2 shadow-md backdrop-blur">
          <h1 className="font-display text-base font-semibold leading-tight text-ink">
            🍮 Flan tour · Lyon
          </h1>
          <p className="text-xs text-ink/60">{summary}</p>
        </div>
        <div className="pointer-events-auto">
          <FlanFilters value={filters} onChange={setFilters} />
        </div>
      </div>

      {/* Floating "Log a flan" button: rides above the sheet (peek/half), hidden when it is full. */}
      <div
        id="flan-fab-slot"
        className={cn(
          "pointer-events-none absolute right-4 z-20 transition-[bottom] duration-200 motion-reduce:transition-none md:bottom-4 md:right-[376px]",
          mobileSheet && snapIndex >= 2 && "hidden",
        )}
        style={fabBottom !== null ? { bottom: fabBottom } : undefined}
      >
        <button
          type="button"
          onClick={() => setLogOpen(true)}
          aria-label="Log a flan"
          className="pointer-events-auto flex size-14 cursor-pointer items-center justify-center rounded-full bg-basil text-white shadow-lg transition-colors hover:bg-basil/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-basil focus-visible:ring-offset-2 md:h-12 md:w-auto md:gap-2 md:px-5"
        >
          <Plus className="size-6 md:size-5" />
          <span className="hidden text-base font-medium md:inline">Log a flan</span>
        </button>
      </div>

      <QuickLogSheet open={logOpen} onOpenChange={setLogOpen} locations={locations} isMobile={isMobile} />

      {/* Desktop: side panel */}
      <aside className="hidden w-[360px] shrink-0 flex-col border-l border-steam bg-white md:flex">
        <div className="shrink-0 border-b border-steam px-4 py-3">
          <p className="text-sm font-medium text-ink">{summary}</p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{body}</div>
      </aside>

      {/* Mobile: bottom sheet */}
      {mobileSheet && (
        <FlanSheet
          metrics={metrics}
          snapIndex={snapIndex}
          onSnapIndexChange={setSnapIndex}
          header={
            selected ? (
              <div className="px-4 pb-2 pt-2">
                <p className="truncate font-display text-lg font-semibold text-ink">{selected.name}</p>
                <p className="truncate text-sm text-ink/60">{selected.location.name}</p>
              </div>
            ) : (
              <p className="px-4 pb-3 pt-2 text-base font-medium text-ink">{summary}</p>
            )
          }
        >
          {body}
        </FlanSheet>
      )}
    </div>
  );
}
