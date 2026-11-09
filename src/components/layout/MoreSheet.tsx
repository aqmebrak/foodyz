"use client";

import { LogOut, MoreHorizontal } from "lucide-react";
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
import { cn } from "@/lib/utils";

const rowClass =
  "flex min-h-12 w-full items-center gap-3 rounded-md px-3 text-base text-ink hover:bg-enamel focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-basil";

interface MoreSheetProps {
  itemClass: string;
}

export function MoreSheet({ itemClass }: MoreSheetProps) {
  const [open, setOpen] = useState(false);

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
            <form action={logoutAction}>
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
