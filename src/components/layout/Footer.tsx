import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-emerald-950 text-emerald-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="w-4 h-4 text-emerald-500" />
          <span className="font-semibold text-white text-sm tracking-tight">
            Foodyz
          </span>
        </div>

        <p className="text-xs text-emerald-500">
          © {new Date().getFullYear()} Foodyz. All rights reserved.
        </p>

        <nav className="flex gap-5 text-xs">
          <Link
            href="/recipes"
            className="hover:text-white transition-colors"
          >
            Recipes
          </Link>
          <Link
            href="/categories"
            className="hover:text-white transition-colors"
          >
            Categories
          </Link>
        </nav>
      </div>
    </footer>
  );
}
