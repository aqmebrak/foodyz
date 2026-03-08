import { UtensilsCrossed } from "lucide-react";
import Link from "next/link";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/recipes", label: "Recipes" },
  { href: "/categories", label: "Categories" },
];

export function Header() {
  return (
    <header className="sm:sticky sm:top-0 sm:z-50 bg-white/95 backdrop-blur-sm border-b border-emerald-100">
      <div className="max-w-6xl mx-auto 2xl:max-w-full 2xl:px-12 px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <UtensilsCrossed className="w-5 h-5 text-emerald-600 group-hover:text-emerald-700 transition-colors" aria-hidden="true" />
          <span className="font-bold text-xl text-emerald-900 tracking-tight">
            Foodyz
          </span>
        </Link>

        <nav aria-label="Main navigation" className="flex items-center gap-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
