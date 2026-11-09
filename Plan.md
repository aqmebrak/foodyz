# Foodyz — Plan

Status as of 2026-11-09, verified against the code on `main` (+ Phase 20 branch). Finished phases are kept as one-liners;
history lives in git. Open work is in **Remaining work** at the bottom.

---

## Done

| Phase | Summary |
|---|---|
| 1 Scaffolding | Next.js 16 App Router, TS strict, Tailwind v4, shadcn/ui, Zod. |
| 2 Database | Prisma 6 + Postgres. Models: Recipe, Ingredient, Unit, Tag (+ junctions), RecipeImage, Category (standalone), User, PastryLocation, Flan. |
| 3 Auth | Auth.js v5, split Edge/Node config, `src/proxy.ts` protects **every** route except `/login` and `/api/auth/*`, login rate limit (10 / 15 min / IP, in-memory). |
| 4 App shell | `(admin)` route group = shell only (sidebar md+, bottom tab bar on mobile). No `/admin` URL prefix. |
| 5–6 Recipes | Browse list, detail page `/recipes/[slug]` (+ cook mode), CRUD via Server Actions, dedicated `/recipes/[slug]/edit` route, Blob image upload, client-side image compression. |
| 7 Lookups | Categories, ingredients, units CRUD (Category is not linked to Recipe). |
| 8 UX polish | `loading` / `error` / `not-found` states, empty states. |
| 9 Deployment | Vercel (not verifiable from the repo). |
| 10 Hardening | `robots.ts` disallows all; `sitemap.ts` is intentionally empty (private app). |
| 11 UX | Sticky mobile Ingredients / Steps tab switcher; admin filters (tag, difficulty, status, times, servings). |
| 12 Features | Diacritic-insensitive search (`normalizeStr`), ingredient combobox with inline create. |
| 13 Cooking mode | Ingredient + step tick-off persisted in localStorage (`recipe-progress-<slug>`), servings scaling. |
| 14–15 Ergonomics | "Edit recipe" / "View on site" links, "Used in" links, ingredient reorder, hidden zero quantities, usage-sorted ingredient list. |
| 16 Tags | Recipes organised by tags; tag creation in the form; tag filter. |
| 17–18 Mobile / dark mode | Mobile layouts, `prefers-color-scheme` dark mode, share URL. |
| 19 FlanFan | `/flan` Leaflet map + filters, `/flans` CRUD for flans and pastry locations. |
| 20 DB isolation | Docker dev DB `:5433` + disposable test DB `:5434`; `.env` points at dev, prod URL only in Vercel and gitignored `.env.production.local`; `.env.test` force-loaded by Playwright outside CI; `prisma/guard.ts` makes seed and Playwright refuse non-local hosts; seed adds 9 flans / 7 Lyon locations and tags every recipe. Scripts: `db:up/down/setup/test:setup/test:reset`. |

**Manual follow-up for Phase 20:** open Prisma Studio against production and delete orphan `E2E Recipe …` rows left by past e2e runs.

---

## Current test coverage

- **Unit (Vitest):** 175 tests, 16 files — recipe / category / ingredient / unit / flan / auth Server Actions (mocked `db`), plus pure libs (utils, rate-limit, steps, timers, parse-ingredients, recipe + flan filters, recipe-progress, form-draft).
- **E2E (Playwright, test DB):** `public.spec.ts` (detail page, 404, homepage, mobile), `recipe-create`, `recipe-edit`, `flan` (map + filters, admin CRUD).

---

## Remaining work (ordered by value)

1. **E2E: cooking flow + recipe delete** (~1–2 h). Delete a recipe (confirm dialog → `/recipes?deleted=1` toast), servings +/- scaling, step tick-off surviving a reload. Tags in the recipe form are lower priority. Safe to run now that e2e uses the disposable DB.
2. **Flan delete/edit shows stale UI after one reload** (time-box 1 h). Unexplained; `flan.spec.ts` papers over it with `toPass`. Look at whether the client refreshes after the action and which paths `revalidatePath` targets. Remove the workaround once fixed.
3. **`slugify()` accent handling** (15 min, product call). `"Crème brûlée"` → `crme-brle`. Fix with NFD normalisation before stripping; only affects newly generated slugs.
4. **Tag click-through** on the recipe detail page (optional feature): link tags to `/recipes` pre-filtered.
5. **Optional cleanup:** simplify `e2e/flan.spec.ts` defensive cleanup (no longer load-bearing).

**Dropped as not worth it:** OG image generation (app is private, nothing is shared or indexed); Lighthouse audit.
