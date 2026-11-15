"use client";

import { useCallback, useEffect, useState } from "react";

import { getInstallMode, type InstallMode } from "@/lib/install-prompt";

const DISMISS_KEY = "foodyz:install-dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
}

function readDismissed(): boolean {
  try {
    return window.localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function useInstallPrompt(): { mode: InstallMode; install: () => Promise<void>; dismiss: () => void } {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [state, setState] = useState({ standalone: true, dismissed: true, userAgent: "" });

  useEffect(() => {
    // Read browser-only values after mount (SSR renders mode "none").
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ standalone: isStandalone(), dismissed: readDismissed(), userAgent: navigator.userAgent });
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvent(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setEvent(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!event) return;
    await event.prompt();
    setEvent(null);
  }, [event]);

  const dismiss = useCallback(() => {
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore
    }
    setState((s) => ({ ...s, dismissed: true }));
  }, []);

  return { mode: getInstallMode({ ...state, hasPrompt: event !== null }), install, dismiss };
}
