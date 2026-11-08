import { Skeleton } from "@/components/ui/skeleton";

export function RecipeFormSkeleton({ title }: { title: string }) {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-3 md:px-8 md:py-8">
      <div className="mb-4 flex items-center gap-2">
        <Skeleton className="size-11 rounded-full" />
        <span className="sr-only">{title}</span>
        <Skeleton className="h-7 w-36" />
      </div>
      <div className="flex flex-col gap-6">
        <Skeleton className="aspect-[4/3] w-full rounded-xl" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-22 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  );
}
