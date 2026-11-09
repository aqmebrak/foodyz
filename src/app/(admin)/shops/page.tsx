import { getPastryLocationsWithFlans } from "@/actions/flan";
import { ShopsClient } from "@/components/admin/ShopsClient";

export const metadata = { title: "Flan shops" };

export default async function ShopsPage() {
  const shops = await getPastryLocationsWithFlans();
  return <ShopsClient shops={shops} />;
}
