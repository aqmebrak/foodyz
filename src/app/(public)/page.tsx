export const dynamic = "force-dynamic";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { getPublishedRecipes } from "@/actions/recipe";
import { RecipeGrid } from "@/components/recipes/RecipeGrid";

export default async function HomePage() {
  const recipes = await getPublishedRecipes();
  const featured = recipes.slice(0, 6);

  return (
    <>
      {/* Hero */}
      <section className="bg-linear-to-b from-emerald-50 to-white px-4 sm:px-6 py-16 sm:py-24 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold text-emerald-900 leading-tight mb-4">
            Recipes you&apos;ll actually make
          </h1>
          <p className="text-lg text-gray-500 mb-8">
            A curated collection of real recipes — built for the kitchen, not
            just the feed.
          </p>
          <Link
            href="/recipes"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3.5 rounded-xl transition-colors"
          >
            Browse all recipes
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* Featured recipes */}
      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Latest recipes</h2>
            <Link
              href="/recipes"
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>
          <RecipeGrid recipes={featured} />
        </section>
      )}
    </>
  );
}
