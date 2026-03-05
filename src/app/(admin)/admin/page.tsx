import { auth } from "@/lib/auth";
import { logoutAction } from "@/actions/auth";

export default async function AdminDashboardPage() {
  const session = await auth();

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
      <p className="text-muted-foreground mb-6">
        Signed in as {session?.user?.email}
      </p>
      <form action={logoutAction}>
        <button
          type="submit"
          className="text-sm underline text-muted-foreground hover:text-foreground"
        >
          Sign out
        </button>
      </form>
    </main>
  );
}
