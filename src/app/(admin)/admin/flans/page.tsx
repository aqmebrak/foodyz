import { getFlans, getPastryLocations } from "@/actions/flan";

import { FlansClient } from "@/components/admin/FlansClient";

export default async function FlansPage() {
  const [flans, locations] = await Promise.all([getFlans(), getPastryLocations()]);
  return <FlansClient flans={flans} locations={locations} />;
}
