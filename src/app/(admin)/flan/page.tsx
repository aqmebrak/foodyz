import { getFlans } from "@/actions/flan";
import { FlanPageClient } from "@/components/flan/FlanPageClient";

export const metadata = {
  title: "Flan Tour — Lyon",
  description: "My personal flan tasting map around Lyon",
};

export default async function FlanPage() {
  const flans = await getFlans();
  const triedCount = flans.filter((f) => f.tried).length;

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <div className="px-6 py-8 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900">🍮 Flan Tour — Lyon</h1>
        <p className="text-gray-500 mt-1">
          {triedCount} tried · {flans.length - triedCount} on the list
        </p>
      </div>

      {flans.length === 0 ? (
        <div className="px-6 py-16 text-center text-gray-400">
          <p className="text-4xl mb-3">🍮</p>
          <p className="text-base font-medium">No flans yet.</p>
          <p className="text-sm mt-1">Go eat some flan and come back!</p>
        </div>
      ) : (
        <FlanPageClient flans={flans} />
      )}
    </div>
  );
}
