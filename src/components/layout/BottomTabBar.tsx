"use client";

import { BookOpen, Cake, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { MoreSheet } from "@/components/layout/MoreSheet";
import { cn } from "@/lib/utils";

const itemClass =
  "flex min-h-11 min-w-11 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-basil";

export function BottomTabBar() {
  const pathname = usePathname();
  const recipesActive =
    pathname !== "/recipes/new" &&
    (pathname === "/recipes" || pathname.startsWith("/recipes/"));
  const flansActive = pathname === "/flan";

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 flex h-[var(--tabbar-h)] items-center border-t border-steam bg-card pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <Link
        href="/recipes"
        aria-current={recipesActive ? "page" : undefined}
        className={cn(itemClass, recipesActive ? "text-basil" : "text-ink/60")}
      >
        <BookOpen className="size-6" />
        Recipes
      </Link>
      <Link
        href="/flan"
        aria-current={flansActive ? "page" : undefined}
        className={cn(itemClass, flansActive ? "text-basil" : "text-ink/60")}
      >
        <Cake className="size-6" />
        Flans
      </Link>
      <Link
        href="/recipes/new"
        aria-label="New recipe"
        aria-current={pathname === "/recipes/new" ? "page" : undefined}
        className={itemClass}
      >
        <span className="flex size-11 items-center justify-center rounded-full bg-basil text-on-basil shadow-md">
          <Plus className="size-6" />
        </span>
      </Link>
      <MoreSheet itemClass={itemClass} />
    </nav>
  );
}
