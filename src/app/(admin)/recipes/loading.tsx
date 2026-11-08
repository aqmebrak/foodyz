import { Skeleton } from "@/components/ui/skeleton";

export default function RecipesLoading() {
  return (
    <div className="w-full px-4 pb-6 md:p-8" aria-busy="true">
      <span className="sr-only">Loading recipes</span>
      <div className="flex items-end justify-between pt-5 md:mb-2 md:pt-0">
        <div>
          <Skeleton className="h-9 w-36" />
          <Skeleton className="mt-2 h-4 w-20" />
        </div>
        <Skeleton className="hidden h-10 w-32 md:block" />
      </div>
      <Skeleton className="mt-4 h-12 w-full rounded-full" />
      <div className="mt-3 flex gap-2 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-11 w-24 shrink-0 rounded-full" />
        ))}
      </div>
      <div className="-mx-2 mt-4 grid gap-y-0.5 md:mx-0 md:grid-cols-2 md:gap-3 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex min-h-[88px] items-center gap-3 px-2 py-2">
            <Skeleton className="size-[72px] shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-4/5" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
