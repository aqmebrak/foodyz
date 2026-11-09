import { Suspense } from "react";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { BottomTabBar } from "@/components/layout/BottomTabBar";
import { FlagToast } from "@/components/shared/FlagToast";

export const dynamic = "force-dynamic";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="min-w-0 flex-1 pb-[var(--tabbar-h)] md:pb-0">{children}</main>
      <BottomTabBar />
      <Suspense>
        <FlagToast />
      </Suspense>
    </div>
  );
}
