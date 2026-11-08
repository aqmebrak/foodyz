import { notFound } from "next/navigation";

import { renderAppIcon } from "@/lib/app-icon";

export function generateStaticParams() {
  return [{ variant: "192" }, { variant: "512" }, { variant: "maskable" }];
}

export async function GET(_req: Request, { params }: { params: Promise<{ variant: string }> }) {
  const { variant } = await params;
  if (variant === "192") return renderAppIcon(192, { rounded: true });
  if (variant === "512") return renderAppIcon(512, { rounded: true });
  // Maskable: full-bleed tile, artwork shrunk into the 80% safe zone.
  if (variant === "maskable") return renderAppIcon(512, { scale: 0.72 });
  notFound();
}
