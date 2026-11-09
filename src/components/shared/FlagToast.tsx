"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

const MESSAGES: Record<string, string> = {
  saved: "Recipe saved",
  created: "Recipe created",
  deleted: "Recipe deleted",
};

/** Shows a toast for a short-lived `?saved=1` style flag, then strips it from the URL. */
export function FlagToast() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const flag = Object.keys(MESSAGES).find((k) => params.get(k) === "1");
    if (!flag) return;
    for (const k of Object.keys(MESSAGES)) params.delete(k);
    const qs = params.toString();
    window.history.replaceState(
      window.history.state,
      "",
      `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`,
    );
    toast.success(MESSAGES[flag]);
  }, [pathname, searchParams]);

  return null;
}
