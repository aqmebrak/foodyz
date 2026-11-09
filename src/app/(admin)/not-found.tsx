import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <h1 className="text-3xl font-bold text-gray-900 mb-3">Recipe not found</h1>
      <p className="text-gray-600 mb-8">
        This recipe doesn&apos;t exist or may have been removed.
      </p>
      <Link href="/recipes" className="text-emerald-600 font-medium hover:underline">
        Back to recipes
      </Link>
    </div>
  );
}
