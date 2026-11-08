import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Foodyz",
    short_name: "Foodyz",
    description: "Your recipes and flan map.",
    start_url: "/recipes",
    display: "standalone",
    background_color: "#F5F7F4",
    theme_color: "#2F6B47",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
