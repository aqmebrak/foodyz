import { getFlans, getPastryLocations } from "@/actions/flan";
import { FlanPageClient } from "@/components/flan/FlanPageClient";

export const metadata = {
  title: "Flan Tour — Lyon",
  description: "My personal flan tasting map around Lyon",
};

export default async function FlanPage() {
  const [flans, locations] = await Promise.all([getFlans(), getPastryLocations()]);

  // Always render the map: with zero flans the "Log a flan" button is how you add the first one.
  return <FlanPageClient flans={flans} locations={locations} />;
}
