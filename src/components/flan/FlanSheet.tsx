"use client";

import { useEffect, useState } from "react";
import { Drawer } from "vaul";

import { cn } from "@/lib/utils";

export interface SheetMetrics {
  /** Visible viewport height in px. */
  vh: number;
  /** Bottom tab bar height (incl. safe area) in px. */
  tabbar: number;
}

const PEEK = 120;
const TOP_GAP = 96;

/** Reads viewport + tab bar height. Null until mounted (needs the DOM). */
export function useSheetMetrics(): SheetMetrics | null {
  const [metrics, setMetrics] = useState<SheetMetrics | null>(null);

  useEffect(() => {
    const probe = document.createElement("div");
    probe.style.cssText =
      "position:fixed;left:0;bottom:0;width:0;height:var(--tabbar-h);visibility:hidden;pointer-events:none";
    document.body.appendChild(probe);
    const measure = () =>
      setMetrics((prev) => {
        const next = { vh: window.innerHeight, tabbar: probe.offsetHeight };
        return prev && prev.vh === next.vh && prev.tabbar === next.tabbar ? prev : next;
      });
    measure();
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("resize", measure);
      probe.remove();
    };
  }, []);

  return metrics;
}

/** Visible heights (px, measured from the viewport bottom) of peek / half / full. */
export function getSnapHeights({ vh, tabbar }: SheetMetrics): [number, number, number] {
  const full = vh - TOP_GAP;
  const half = tabbar + Math.round((vh - tabbar) * 0.45);
  return [tabbar + PEEK, half, full];
}

interface FlanSheetProps {
  metrics: SheetMetrics;
  snapIndex: number;
  onSnapIndexChange: (index: number) => void;
  /** Always-visible header (drag handle area), shown in the peek. */
  header: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Non-modal bottom sheet (vaul) that sits above the map and below the tab bar (z-30 vs z-40);
 * the tab bar hides the part of the sheet that extends under it.
 */
export function FlanSheet({ metrics, snapIndex, onSnapIndexChange, header, children }: FlanSheetProps) {
  const heights = getSnapHeights(metrics);
  const snapPoints = heights.map((h) => `${h}px`);
  const active = snapPoints[snapIndex] ?? snapPoints[0];

  return (
    <Drawer.Root
      open
      modal={false}
      dismissible={false}
      snapPoints={snapPoints}
      activeSnapPoint={active}
      setActiveSnapPoint={(p) => {
        const i = snapPoints.indexOf(String(p));
        if (i >= 0) onSnapIndexChange(i);
      }}
      snapToSequentialPoint
    >
      <Drawer.Portal>
        <Drawer.Content
          aria-describedby={undefined}
          style={{ height: metrics.vh }}
          className={cn(
            "fixed inset-x-0 bottom-0 z-30 flex flex-col rounded-t-2xl border-t border-steam bg-card shadow-[0_-4px_16px_rgba(28,36,32,0.12)] outline-none md:hidden",
            "motion-reduce:!transition-none",
          )}
        >
          <Drawer.Title className="sr-only">Flans</Drawer.Title>
          <div className="shrink-0">
            <div className="mx-auto mt-2 h-1.5 w-10 rounded-full bg-steam" />
            {header}
          </div>
          <div
            className={cn(
              "min-h-0 flex-1 overscroll-contain",
              "overflow-y-auto",
            )}
            // The sheet extends below the viewport at peek/half: pad by the hidden part so
            // the last rows can scroll into the visible area.
            style={{ paddingBottom: metrics.vh - heights[snapIndex] + metrics.tabbar }}
          >
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
