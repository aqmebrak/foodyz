"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

interface BackButtonProps {
  className?: string;
}

export function BackButton({ className }: BackButtonProps) {
  const router = useRouter();

  function goBack() {
    let sameOrigin = false;
    try {
      sameOrigin =
        !!document.referrer && new URL(document.referrer).origin === window.location.origin;
    } catch {
      // malformed referrer
    }
    if (window.history.length > 1 && sameOrigin) router.back();
    else router.push("/recipes");
  }

  return (
    <button
      type="button"
      onClick={goBack}
      aria-label="Back to recipes"
      className={cn(
        "flex size-11 items-center justify-center rounded-full bg-white/85 text-ink shadow-sm backdrop-blur transition-colors hover:bg-white md:border md:border-steam",
        className,
      )}
    >
      <ChevronLeft className="size-6" />
    </button>
  );
}
