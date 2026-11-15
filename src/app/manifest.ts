import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Foodyz",
    short_name: "Foodyz",
    description: "Your recipes and flan map.",
    start_url: "/recipes",
    scope: "/",
    lang: "en",
    orientation: "portrait",
    categories: ["food", "lifestyle"],
    display: "standalone",
    background_color: "#EDF1E8",
    theme_color: "#EDF1E8",
    shortcuts: [
      {
        name: "New recipe",
        url: "/recipes/new",
        icons: [{ src: "/pwa-icon/192", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Flans",
        url: "/flan",
        icons: [{ src: "/pwa-icon/192", sizes: "192x192", type: "image/png" }],
      },
    ],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/pwa-icon/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/pwa-icon/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/pwa-icon/maskable", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
