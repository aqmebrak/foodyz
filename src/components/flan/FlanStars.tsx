import { cn } from "@/lib/utils";

interface FlanStarsProps {
  rating: number;
  className?: string;
}

export function FlanStars({ rating, className }: FlanStarsProps) {
  return (
    <span
      className={cn("inline-flex gap-0.5 leading-none", className)}
      role="img"
      aria-label={`${rating} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} aria-hidden="true" className={s <= rating ? "text-yolk" : "text-steam"}>
          ★
        </span>
      ))}
    </span>
  );
}
