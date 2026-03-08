"use client";

import {
  BookOpen,
  Cake,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Scale,
  Tag,
  UtensilsCrossed,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { logoutAction } from "@/actions/auth";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/recipes", label: "Recipes", icon: BookOpen, exact: false },
  { href: "/admin/categories", label: "Categories", icon: Tag, exact: false },
  { href: "/admin/ingredients", label: "Ingredients", icon: Package, exact: false },
  { href: "/admin/units", label: "Units", icon: Scale, exact: false },
  { href: "/admin/flans", label: "Flans 🍮", icon: Cake, exact: false },
];

function SidebarNav({ onNavClick }: { onNavClick?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <div className="px-5 py-5 border-b border-emerald-800/60">
        <Link href="/admin" className="flex items-center gap-2.5" onClick={onNavClick}>
          <UtensilsCrossed className="w-5 h-5 text-emerald-400" />
          <span className="font-bold text-white text-base tracking-tight">Foodyz</span>
          <span className="text-[10px] font-semibold text-emerald-500 uppercase tracking-widest mt-0.5">
            admin
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact
            ? pathname === href
            : pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavClick}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-emerald-600 text-white"
                  : "text-emerald-300 hover:bg-emerald-900 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-emerald-800/60">
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-emerald-300 hover:bg-emerald-900 hover:text-white transition-colors w-full"
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
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center gap-3 px-4 py-3 bg-emerald-950 border-b border-emerald-800/60">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="text-emerald-300 hover:text-white transition-colors"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Link href="/admin" className="flex items-center gap-2">
          <UtensilsCrossed className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-white text-sm tracking-tight">Foodyz</span>
          <span className="text-[10px] font-semibold text-emerald-500 uppercase tracking-widest">
            admin
          </span>
        </Link>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "md:hidden fixed top-0 left-0 bottom-0 z-50 w-56 bg-emerald-950 flex flex-col transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="absolute top-3 right-3 text-emerald-400 hover:text-white transition-colors"
          aria-label="Close navigation"
        >
          <X className="w-5 h-5" />
        </button>
        <SidebarNav onNavClick={() => setMobileOpen(false)} />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 min-h-screen bg-emerald-950 flex-col shrink-0">
        <SidebarNav />
      </aside>
    </>
  );
}
