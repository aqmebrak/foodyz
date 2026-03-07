import type { MetadataRoute } from "next";
import { getAllPublishedSlugs, getAllCategorySlugs } from "@/actions/recipe";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.AUTH_URL ?? "http://localhost:3000";

  const [recipeSlugs, categorySlugs] = await Promise.all([
    getAllPublishedSlugs(),
    getAllCategorySlugs(),
  ]);

  const recipes: MetadataRoute.Sitemap = recipeSlugs.map(({ slug }) => ({
    url: `${base}/recipes/${slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const categories: MetadataRoute.Sitemap = categorySlugs.map(({ slug }) => ({
    url: `${base}/categories/${slug}`,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/recipes`, changeFrequency: "daily", priority: 0.9 },
    ...recipes,
    ...categories,
  ];
}
