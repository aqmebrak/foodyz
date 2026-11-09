import type { LucideIcon } from "lucide-react";
import { BookOpen, Cake, MapPin, Package, Plus, Scale, Store, Tag } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Match the exact path only (no sub-routes). */
  exact?: boolean;
}

/** Everyday screens: shown directly in the desktop sidebar. */
export const publicNav: NavItem[] = [
  { href: "/recipes", label: "Recipes", icon: BookOpen },
  { href: "/recipes/new", label: "New recipe", icon: Plus, exact: true },
  { href: "/flan", label: "Flan map", icon: MapPin, exact: true },
];

/** Data management: desktop "Admin" submenu, mobile "More" sheet. */
export const adminNav: NavItem[] = [
  { href: "/categories", label: "Categories", icon: Tag },
  { href: "/ingredients", label: "Ingredients", icon: Package },
  { href: "/units", label: "Units", icon: Scale },
  { href: "/flans", label: "Manage flans", icon: Cake },
  { href: "/shops", label: "Flan shops", icon: Store },
];

export function isNavActive(pathname: string, { href, exact }: NavItem): boolean {
  // "/recipes" must not stay highlighted on "/recipes/new" (its own entry).
  if (href === "/recipes" && pathname === "/recipes/new") return false;
  return exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
}
