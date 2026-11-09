"use client";

import { ChevronDown, LogOut, Settings, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { logoutAction } from "@/actions/auth";
import { adminNav, isNavActive, type NavItem, publicNav } from "@/components/layout/nav-items";
import { cn } from "@/lib/utils";

const linkClass =
  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-basil";

function NavLink({ item, pathname, indent }: { item: NavItem; pathname: string; indent?: boolean }) {
  const active = isNavActive(pathname, item);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        linkClass,
        indent && "pl-4",
        active ? "bg-basil text-on-basil" : "text-ink/70 hover:bg-basil/10 hover:text-ink",
      )}
    >
      <Icon className="w-4 h-4 shrink-0" />
      {item.label}
    </Link>
  );
}

function SidebarNav() {
  const pathname = usePathname();
  const adminActive = adminNav.some((item) => isNavActive(pathname, item));
  // Follows the current route until the user toggles it by hand.
  const [userOpen, setUserOpen] = useState<boolean | null>(null);
  const adminOpen = userOpen ?? adminActive;

  return (
    <>
      <div className="px-5 py-5 border-b border-steam">
        <Link href="/recipes" className="flex items-center gap-2.5">
          <UtensilsCrossed className="w-5 h-5 text-basil" />
          <span className="font-bold text-ink text-base tracking-tight">Foodyz</span>
        </Link>
      </div>

      <nav aria-label="Main" className="flex flex-col px-3 py-4 gap-0.5">
        {publicNav.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} />
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-0.5 px-3 py-4 border-t border-steam">
        <button
          type="button"
          aria-expanded={adminOpen}
          aria-controls="sidebar-admin-menu"
          onClick={() => setUserOpen(!adminOpen)}
          className={cn(
            linkClass,
            "w-full cursor-pointer text-ink/70 hover:bg-basil/10 hover:text-ink",
            adminActive && !adminOpen && "text-ink",
          )}
        >
          <Settings className="w-4 h-4 shrink-0" />
          <span className="flex-1 text-left">Admin</span>
          <ChevronDown
            className={cn("w-4 h-4 shrink-0 transition-transform", adminOpen && "rotate-180")}
          />
        </button>
        {adminOpen && (
          <nav id="sidebar-admin-menu" aria-label="Admin" className="flex flex-col gap-0.5">
            {adminNav.map((item) => (
              <NavLink key={item.href} item={item} pathname={pathname} indent />
            ))}
          </nav>
        )}
        <form action={logoutAction}>
          <button
            type="submit"
            className={cn(
              linkClass,
              "w-full cursor-pointer text-ink/70 hover:bg-basil/10 hover:text-ink",
            )}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sign out
          </button>
        </form>
      </div>
    </>
  );
}

export function AdminSidebar() {
  return (
    <aside className="hidden md:flex w-56 h-screen sticky top-0 self-start overflow-y-auto bg-panel flex-col shrink-0">
      <SidebarNav />
    </aside>
  );
}
