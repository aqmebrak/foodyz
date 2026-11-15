import { FlanPageClient } from "@/components/flan/FlanPageClient";
import { getPublicFlans } from "@/lib/public-flans";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Flan Tour — Lyon",
  description: "A flan tasting map around Lyon",
  robots: { index: false, follow: false },
};

export default async function PublicFlanPage() {
  const flans = await getPublicFlans();
  return <FlanPageClient flans={flans} readOnly />;
}
