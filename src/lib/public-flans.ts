import { db } from "@/lib/db";
import type { FlanItem } from "@/lib/flan-filters";

/**
 * Read-only flan query for the unauthenticated /lyon-flans page.
 * Plain function (not a server action) with an explicit select so no
 * other column can leak to the public.
 */
export async function getPublicFlans(): Promise<FlanItem[]> {
  return db.flan.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      photoUrl: true,
      rating: true,
      tried: true,
      triedAt: true,
      comment: true,
      location: { select: { name: true, mapsUrl: true } },
    },
  });
}
