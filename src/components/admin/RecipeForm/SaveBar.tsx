"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";

interface SaveBarProps {
  isPending: boolean;
  isEdit: boolean;
  disabled?: boolean;
  error?: string | null;
}

export function SaveBar({ isPending, isEdit, disabled, error }: SaveBarProps) {
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (error) errorRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [error]);

  return (
    <div className="sticky bottom-[var(--tabbar-h)] z-30 -mx-4 border-t border-steam bg-enamel/95 px-4 py-3 backdrop-blur md:bottom-0 md:mx-0 md:rounded-xl md:border">
      {error && (
        <div
          role="alert"
          ref={errorRef}
          className="mb-3 rounded-lg border border-paprika/30 bg-paprika/10 px-4 py-3 text-sm text-paprika"
        >
          {error}
        </div>
      )}
      <Button
        type="submit"
        disabled={isPending || disabled}
        className="h-12 w-full bg-basil text-base font-semibold text-white hover:bg-basil/90"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Saving…
          </>
        ) : isEdit ? (
          "Save recipe"
        ) : (
          "Create recipe"
        )}
      </Button>
    </div>
  );
}
