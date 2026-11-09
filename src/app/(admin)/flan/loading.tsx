import { Skeleton } from "@/components/ui/skeleton";

export default function FlanLoading() {
  return (
    <div className="relative h-[calc(100dvh-var(--tabbar-h))] w-full overflow-hidden bg-steam md:h-screen" aria-busy="true">
      <span className="sr-only">Loading flan map</span>
      <div className="absolute inset-x-0 top-0 flex flex-col gap-2 pt-[calc(env(safe-area-inset-top)+12px)]">
        <Skeleton className="mx-4 h-14 w-48 rounded-xl" />
        <div className="flex gap-2 overflow-hidden px-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-11 w-24 shrink-0 rounded-full" />
          ))}
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 rounded-t-2xl border-t border-steam bg-card p-4 md:hidden">
        <Skeleton className="mx-auto h-1.5 w-10 rounded-full" />
        <Skeleton className="mt-4 h-5 w-32" />
        <Skeleton className="mt-3 h-16 w-full" />
      </div>
    </div>
  );
}
