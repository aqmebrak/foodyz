import { ArrowLeft, UtensilsCrossed } from "lucide-react";
import Link from "next/link";

export default function RecipeNotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="mb-8 relative">
        <div className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
          <UtensilsCrossed className="w-10 h-10 text-emerald-300" />
        </div>
        <span className="absolute -top-2 -right-2 text-4xl select-none" aria-hidden>
          404
        </span>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-3">Recipe not found</h1>
      <p className="text-gray-500 max-w-sm mb-8 leading-relaxed">
        This recipe may have been removed or the link is incorrect. Let&apos;s
        find you something delicious instead.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/recipes"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-3 rounded-xl transition-colors text-sm"
        >
          Browse all recipes
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 border border-gray-200 hover:border-gray-300 text-gray-700 font-medium px-5 py-3 rounded-xl transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
      </div>
    </div>
  );
}
