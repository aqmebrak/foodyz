import { Skeleton } from "@/components/ui/skeleton";

export default function RecipeLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-6 md:py-8" aria-busy="true">
      <span className="sr-only">Loading recipe</span>
      <Skeleton className="-mx-4 aspect-[4/3] max-h-[40vh] w-[calc(100%+2rem)] rounded-none md:mx-0 md:w-full md:rounded-2xl" />
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="mt-3 h-9 w-3/4" />
      <Skeleton className="mt-4 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-2/3" />
      <Skeleton className="mt-4 h-5 w-40" />
      <Skeleton className="mt-5 h-11 w-full md:hidden" />
      <div className="mt-4 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-11 w-full" />
        ))}
      </div>
    </div>
  );
}
