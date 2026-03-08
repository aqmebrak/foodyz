"use client";

import dynamic from "next/dynamic";

import type { FlanMapProps } from "./FlanMap";

const FlanMap = dynamic(
  () => import("./FlanMap").then((m) => m.FlanMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full rounded-xl bg-amber-100 animate-pulse flex items-center justify-center">
        <p className="text-amber-500 text-sm">Loading map…</p>
      </div>
    ),
  }
);

export function FlanMapWrapper(props: FlanMapProps) {
  return <FlanMap {...props} />;
}
