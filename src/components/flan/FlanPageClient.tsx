"use client";

import dynamic from "next/dynamic";
import { useMemo, useState, useSyncExternalStore } from "react";

import { FlanDetail } from "@/components/flan/FlanDetail";
import { FlanFilters } from "@/components/flan/FlanFilters";
import { FlanList } from "@/components/flan/FlanList";
import { FlanSheet, getSnapHeights, useSheetMetrics } from "@/components/flan/FlanSheet";
import {
  countTried,
  filterFlans,
  type FlanFilterState,
  type FlanItem,
} from "@/lib/flan-filters";

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

export function FlanPageClient({ flans }: FlanPageClientProps) {
  const [filters, setFilters] = useState<FlanFilterState>({ query: "", minRating: 0, status: "all" });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [snapIndex, setSnapIndex] = useState(0);
  const isMobile = useIsMobile();
  const metrics = useSheetMetrics();

  const filtered = useMemo(() => filterFlans(flans, filters), [flans, filters]);
  const selected = filtered.find((f) => f.id === selectedId) ?? null;
  const { tried, toTry } = countTried(flans);
  const summary = `${tried} tried · ${toTry} to try`;

  const select = (id: string) => {
    setSelectedId(id);
    // Show the detail at least at half height.
    setSnapIndex((i) => Math.max(i, 1));
  };
  const back = () => setSelectedId(null);

  const mobileSheet = isMobile && metrics !== null;
  const bottomInset = mobileSheet ? getSnapHeights(metrics)[1] - metrics.tabbar : 0;

  const body = selected ? (
    <FlanDetail flan={selected} onBack={back} />
  ) : (
    <FlanList flans={filtered} selectedId={selectedId} onSelect={select} />
  );

  return (
    <div className="relative h-[calc(100dvh-var(--tabbar-h))] overflow-hidden md:flex md:h-screen">
      {/* Map. Isolated so Leaflet's high z-indexes stay below overlays, sheet and tab bar. */}
      <div className="relative z-0 h-full min-w-0 flex-1 isolate">
        <FlanMap
          flans={filtered}
          selectedId={selected?.id ?? null}
          onSelect={select}
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

      {/* Slot for Task 10: floating "Log a flan" button (bottom-right, above the sheet peek). */}
      <div id="flan-fab-slot" className="pointer-events-none absolute bottom-0 right-4 z-20" />

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
