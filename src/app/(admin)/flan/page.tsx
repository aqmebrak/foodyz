import { getFlans } from "@/actions/flan";
import { FlanPageClient } from "@/components/flan/FlanPageClient";

export const metadata = {
  title: "Flan Tour — Lyon",
  description: "My personal flan tasting map around Lyon",
};

export default async function FlanPage() {
  const flans = await getFlans();

  if (flans.length === 0) {
    return (
      <div className="flex min-h-[60dvh] flex-col items-center justify-center px-4 text-center text-ink/60">
        <p className="mb-3 text-4xl">🍮</p>
        <p className="text-base font-medium">No flans yet.</p>
        <p className="mt-1 text-sm">Go eat some flan and come back!</p>
      </div>
    );
  }

  return <FlanPageClient flans={flans} />;
}
