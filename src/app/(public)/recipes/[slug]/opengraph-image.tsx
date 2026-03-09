import { ImageResponse } from "next/og";

import { getRecipeBySlug } from "@/actions/recipe";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const recipe = await getRecipeBySlug(slug);

  const title = recipe?.title ?? "Recipe";
  const description = recipe?.description
    ? recipe.description.slice(0, 120) +
      (recipe.description.length > 120 ? "…" : "")
    : null;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          backgroundColor: "#064e3b",
          padding: 64,
        }}
      >
        {/* Logo area */}
        <div
          style={{
            position: "absolute",
            top: 48,
            left: 64,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              fontSize: 32,
              color: "#a7f3d0",
              fontWeight: 700,
              letterSpacing: "-0.5px",
            }}
          >
            Foodyz
          </div>
        </div>

        {/* Tags bar */}
        {recipe?.tags && recipe.tags.length > 0 && (
          <div
            style={{
              display: "flex",
              marginBottom: 20,
              color: "#6ee7b7",
              fontSize: 22,
              textTransform: "uppercase",
              letterSpacing: "2px",
              fontWeight: 600,
            }}
          >
            {recipe.tags[0].tag.name}
          </div>
        )}

        {/* Title */}
        <div
          style={{
            color: "white",
            fontSize: title.length > 40 ? 56 : 72,
            fontWeight: 800,
            lineHeight: 1.05,
            maxWidth: 900,
            marginBottom: description ? 24 : 0,
          }}
        >
          {title}
        </div>

        {/* Description */}
        {description && (
          <div
            style={{
              color: "#d1fae5",
              fontSize: 26,
              lineHeight: 1.4,
              maxWidth: 860,
            }}
          >
            {description}
          </div>
        )}

        {/* Bottom accent bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 8,
            backgroundColor: "#10b981",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
