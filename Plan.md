# Foodyz — Plan

Status as of 2026-11-09, verified against the code on `main`. Finished phases are kept as one-liners;
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
| 17–18 Mobile / dark mode | Mobile layouts, share URL. Dark mode later removed in Phase 21. |
| 19 FlanFan | `/flan` Leaflet map + filters, `/flans` CRUD for flans and pastry locations. |
| 20 DB isolation | Docker dev DB `:5433` + disposable test DB `:5434`; `.env` points at dev, prod URL only in Vercel and gitignored `.env.production.local`; `.env.test` force-loaded by Playwright outside CI; `prisma/guard.ts` makes seed and Playwright refuse non-local hosts; seed adds 9 flans / 7 Lyon locations and tags every recipe. Scripts: `db:up/down/setup/test:setup/test:reset`. |
| 22 Map pins + e2e | `parseGoogleMapsUrl` prefers the `!3d!4d` place pin over the `@` camera centre (fixes shops drawn in the river); short Maps links expanded on save (`lib/maps-url.ts`, allowlisted hosts); `slugify` strips accents properly; `/flan` revalidated on location create/delete; id validation on deletes; lookup forms now show server errors; e2e grew from 20 to 63 tests (auth, recipe delete, cook mode, lookups, full create/edit, flan quick-log + marker position); flan delete test race fixed. |
| 21 Sage design | Sage-mist page `#EDF1E8`, paper cards `#F7F9F3` (no pure white), sage-basil primary `#3D6B50`, light leaf sidebar, sage-tinted gray overrides, contrast ≥ AA. **Dark mode removed — single light theme** (`dark:` variant neutralised). PR #15. |

**Manual follow-up for Phase 20:** open Prisma Studio against production and delete orphan `E2E Recipe …` rows left by past e2e runs.

---

## Current test coverage

- **Unit (Vitest):** 195 tests, 16 files — Server Actions (mocked `db`), pure libs (utils incl. Maps URL parsing + slugify, maps-url short-link expansion, rate-limit, steps, timers, parse-ingredients, filters, recipe-progress, form-draft).
- **E2E (Playwright, test DB):** 63 tests — `public`, `auth`, `recipe-create` / `recipe-edit` / `recipe-delete`, `cook-mode`, `lookups`, `flan` (admin CRUD), `flan-map` (quick-log, marker position). Skipped: photo upload (needs Vercel Blob).

---

## Remaining work (ordered by value)

1. **Verify map fix on real data** (owner, 10 min): open `/flan` against production and check no pin sits in water. Locations saved from a short link *before* this change still have no coordinates — re-save them with the full URL. Optional: read-only script listing locations whose parsed pin moved.
2. **Pre-existing lint error** — `IngredientCombobox.tsx:123` setState synchronously in an effect (React compiler rule). Fix or refactor.
3. **Recipe delete from the list** gives no toast / redirect feedback (only delete from the edit page goes to `/recipes?deleted=1`). Consistency call.
4. **Location update path** doesn't exist (`flan.ts` has create/delete only), so editing a Maps URL means delete + recreate. Add `updatePastryLocation` (reusing short-link expansion) if that gets annoying.
5. **Tag click-through** (optional): link tags on the recipe detail page to `/recipes` pre-filtered.
6. **Mobile Safari e2e logs** an uncaught `TypeError at measure` from the dev server on `/flan`; tests pass. Investigate if it shows up in real use.

**Dropped as not worth it:** OG image generation (app is private); Lighthouse audit.
