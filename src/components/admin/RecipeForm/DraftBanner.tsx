"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/form-draft";

interface DraftBannerProps {
  savedAt: number;
  onRestore: () => void;
  onDiscard: () => void;
}

export function DraftBanner({ savedAt, onRestore, onDiscard }: DraftBannerProps) {
  const [now] = useState(() => Date.now());
  return (
    <div
      role="status"
      className="flex flex-col gap-3 rounded-xl border border-yolk/50 bg-yolk/15 px-4 py-3 text-ink sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-base">
        You have an unsaved draft from {formatRelativeTime(savedAt, now)}
      </p>
      <div className="flex gap-2">
        <Button type="button" onClick={onRestore} className="h-11 bg-basil px-5 text-on-basil hover:bg-basil/90">
          Restore
        </Button>
        <Button type="button" variant="ghost" onClick={onDiscard} className="h-11 px-5">
          Discard
        </Button>
      </div>
    </div>
  );
}
