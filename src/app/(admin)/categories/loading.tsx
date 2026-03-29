import { Skeleton } from "@/components/ui/skeleton";

export default function CategoriesLoading() {
  return (
    <div className="p-6 sm:p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="rounded-lg border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 flex gap-8">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16 hidden sm:block" />
          <Skeleton className="h-4 w-32 hidden md:block" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="px-4 py-4 flex items-center gap-8 border-t border-gray-50">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-20 font-mono hidden sm:block" />
            <Skeleton className="h-4 w-56 hidden md:block" />
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
