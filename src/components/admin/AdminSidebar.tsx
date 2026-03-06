"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Tag,
  Package,
  LogOut,
  UtensilsCrossed,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/actions/auth";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/recipes", label: "Recipes", icon: BookOpen, exact: false },
  {
    href: "/admin/categories",
    label: "Categories",
    icon: Tag,
    exact: false,
  },
  {
    href: "/admin/ingredients",
    label: "Ingredients",
    icon: Package,
    exact: false,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 min-h-screen bg-emerald-950 flex flex-col shrink-0">
      <div className="px-5 py-5 border-b border-emerald-800/60">
        <Link href="/admin" className="flex items-center gap-2.5">
          <UtensilsCrossed className="w-5 h-5 text-emerald-400" />
          <span className="font-bold text-white text-base tracking-tight">
            Foodyz
          </span>
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
    </aside>
  );
}
