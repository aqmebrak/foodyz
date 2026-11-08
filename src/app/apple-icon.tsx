import { renderAppIcon } from "@/lib/app-icon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  // iOS applies its own corner mask, so the tile is full-bleed.
  return renderAppIcon(180);
}
