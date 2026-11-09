"use client";

import {
  BookOpen,
  Cake,
  LogOut,
  MapPin,
  Package,
  Scale,
  Tag,
  UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { logoutAction } from "@/actions/auth";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/recipes", label: "Recipes", icon: BookOpen, exact: false },
  { href: "/categories", label: "Categories", icon: Tag, exact: false },
  { href: "/ingredients", label: "Ingredients", icon: Package, exact: false },
  { href: "/units", label: "Units", icon: Scale, exact: false },
  { href: "/flans", label: "Flans 🍮", icon: Cake, exact: false },
  { href: "/flan", label: "Flan Map", icon: MapPin, exact: true },
];

function SidebarNav() {
  const pathname = usePathname();

  return (
    <>
      <div className="px-5 py-5 border-b border-white/10">
        <Link href="/recipes" className="flex items-center gap-2.5">
          <UtensilsCrossed className="w-5 h-5 text-yolk" />
          <span className="font-bold text-white text-base tracking-tight">Foodyz</span>
        </Link>
      </div>

      <nav className="flex-1 flex flex-col px-3 py-4 gap-0.5">
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
                  ? "bg-basil text-on-basil"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors w-full"
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
    <aside className="hidden md:flex w-56 min-h-screen bg-panel flex-col shrink-0">
      <SidebarNav />
    </aside>
  );
}
