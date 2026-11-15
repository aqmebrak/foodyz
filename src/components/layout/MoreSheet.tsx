"use client";

import { Download, LogOut, MoreHorizontal, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { logoutAction } from "@/actions/auth";
import { adminNav } from "@/components/layout/nav-items";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useInstallPrompt } from "@/hooks/use-install-prompt";
import { clearOfflineCaches } from "@/lib/sw-client";
import { cn } from "@/lib/utils";

async function signOutAndClearCaches() {
  await clearOfflineCaches();
  await logoutAction();
}

const rowClass =
  "flex min-h-12 w-full items-center gap-3 rounded-md px-3 text-base text-ink hover:bg-enamel focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-basil";

interface MoreSheetProps {
  itemClass: string;
}

export function MoreSheet({ itemClass }: MoreSheetProps) {
  const [open, setOpen] = useState(false);
  const { mode, install, dismiss } = useInstallPrompt();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(itemClass, "text-ink/60")}
      >
        <MoreHorizontal className="size-6" />
        More
      </button>
      <Drawer open={open} onOpenChange={setOpen} direction="bottom">
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>More</DrawerTitle>
            <DrawerDescription className="sr-only">
              Manage data and sign out
            </DrawerDescription>
          </DrawerHeader>
          <nav className="flex flex-col px-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {adminNav.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={rowClass}
              >
                <Icon className="size-5 text-ink/60" />
                {label}
              </Link>
            ))}
            {mode === "prompt" && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  void install();
                }}
                className={rowClass}
              >
                <Download className="size-5 text-ink/60" />
                Install app
              </button>
            )}
            {mode === "ios-hint" && (
              <div className="flex min-h-12 items-center gap-3 px-3 text-sm text-ink/70">
                <Download className="size-5 shrink-0 text-ink/60" />
                <p className="flex-1">Install: tap Share, then Add to Home Screen.</p>
                <button type="button" onClick={dismiss} aria-label="Dismiss install hint" className="rounded-md p-2 hover:bg-enamel">
                  <X className="size-4" />
                </button>
              </div>
            )}
            <form action={signOutAndClearCaches}>
              <button type="submit" className={rowClass}>
                <LogOut className="size-5 text-ink/60" />
                Sign out
              </button>
            </form>
          </nav>
        </DrawerContent>
      </Drawer>
    </>
  );
}
