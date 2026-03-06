import { getUnits } from "@/actions/unit";
import { UnitsClient } from "@/components/admin/UnitsClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Units — Admin" };

export default async function AdminUnitsPage() {
  const units = await getUnits();
  return <UnitsClient units={units} />;
}
