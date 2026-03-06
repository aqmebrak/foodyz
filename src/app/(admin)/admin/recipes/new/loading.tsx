import { Skeleton } from "@/components/ui/skeleton";

export default function NewRecipeLoading() {
  return (
    <div className="p-6 sm:p-8 max-w-3xl">
      <div className="mb-6">
        <Skeleton className="h-8 w-8 rounded mb-3" />
        <Skeleton className="h-7 w-36" />
      </div>
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><Skeleton className="h-4 w-12" /><Skeleton className="h-9 w-full" /></div>
          <div className="space-y-2"><Skeleton className="h-4 w-10" /><Skeleton className="h-9 w-full" /></div>
        </div>
        <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-9 w-full" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-9 w-full" /></div>
          <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-9 w-full" /></div>
        </div>
        <div className="space-y-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-36 w-full" /></div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-48 w-full" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>
    </div>
  );
}
