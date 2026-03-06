import { Skeleton } from "@/components/ui/skeleton";

export default function IngredientsLoading() {
  return (
    <div className="p-6 sm:p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-9 w-40" />
      </div>
      <div className="rounded-lg border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 flex gap-8">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16 hidden sm:block" />
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="px-4 py-4 flex items-center gap-8 border-t border-gray-50">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-24 hidden sm:block" />
            <div className="ml-auto flex gap-1">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
