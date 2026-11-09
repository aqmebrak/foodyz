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
| 21 Sage design | Sage-mist page `#EDF1E8`, paper cards `#F7F9F3` (no pure white), sage-basil primary `#3D6B50`, light leaf sidebar, sage-tinted gray overrides, contrast ≥ AA. **Dark mode removed — single light theme** (`dark:` variant neutralised). PR #15. |

**Manual follow-up for Phase 20:** open Prisma Studio against production and delete orphan `E2E Recipe …` rows left by past e2e runs.

---

## Current test coverage

- **Unit (Vitest):** 175 tests, 16 files — recipe / category / ingredient / unit / flan / auth Server Actions (mocked `db`), plus pure libs (utils, rate-limit, steps, timers, parse-ingredients, recipe + flan filters, recipe-progress, form-draft).
- **E2E (Playwright, test DB):** `public.spec.ts` (detail page, 404, homepage, mobile), `recipe-create`, `recipe-edit`, `flan` (map + filters, admin CRUD).

---

## Remaining work (analysed 2026-11-09, ordered by value)

### 1. Flan map pins in the wrong place (bug, ~1–2 h) — NEW

**Symptom:** some pastry shops render in the Saône / Rhône.

**Root cause (high confidence):** `parseGoogleMapsUrl()` (`src/lib/utils.ts`) reads `@lat,lng` first. In a real shared
place URL (`…/place/Name/@45.76,4.83,17z/data=…!3d45.7612!4d4.8345…`) the `@` pair is the **camera centre**, not the
place. Desktop Google Maps also shifts that centre sideways to make room for its left panel, so pins land hundreds of
metres off — in Lyon, often in a river. The real pin is the `!3d<lat>!4d<lng>` pair. Dev doesn't reproduce: the seed
builds URLs with only `@lat,lng`.

**Fix:**
- Parser priority: `!3d…!4d…` (last pair if several) → `?q=` / `query=` / `ll=` → `/place/…/lat,lng` → `@` (fallback only).
- Unit tests with real-format URLs (camera `@` offset from `!3d!4d` → expect `!3d!4d`).
- Seed: make 2–3 location URLs realistic (`@` offset + `!3d!4d`) so dev reproduces the old bug.
- Short links (`maps.app.goo.gl/…`, `goo.gl/maps/…`) carry no coordinates → parse returns null → no pin. In
  `createPastryLocation`/update, resolve the redirect server-side (`fetch(url, { redirect: "manual" })`, follow
  `Location`, max 3 hops, Google hosts only) and store the expanded URL. Unit-test with mocked `fetch`.
- Check: list prod locations whose parsed point changes (read-only script, owner runs it) to confirm the fix.
- Optional later: store `lat`/`lng` columns computed on save instead of parsing on every render. Not needed for the fix.

### 2. E2E on critical flows and forms (~3–4 h)

Current e2e covers the detail page, the create/edit form basics and flan CRUD. Missing, by risk:

| Spec | Flow |
|---|---|
| `recipe-delete.spec.ts` | delete from list + from detail → confirm → `/recipes?deleted=1` toast → gone after reload |
| `cook-mode.spec.ts` | servings +/- scales quantities (incl. fractions), ingredient + step tick-off survive reload, reset |
| `recipe-create.spec.ts` (extend) | full create with 2 ingredients (one created inline via combobox), tags, times → detail shows all of it; paste-ingredients sheet; draft autosave restores after reload (`recipe-draft-new`) + discard |
| `recipe-edit.spec.ts` (extend) | reorder ingredients, remove one, save → `?saved=1` toast → detail order matches; unsaved-changes guard on back |
| `lookups.spec.ts` | categories / ingredients / units: create, rename, delete (one test each); duplicate-name error |
| `auth.spec.ts` | wrong password → error; logout → `/login`; unauthenticated `/recipes` → `/login` (fresh context, no storage state) |
| `flan-map.spec.ts` | quick-log a flan from `/flan` (QuickLogSheet) → appears in list + map; new location with a real-format Maps URL → marker at the `!3d!4d` point (ties to item 1) |

Skip photo upload (needs Vercel Blob). All specs must clean up what they create; test DB is disposable anyway.

### 3. Flan "stale UI after one reload" — likely a test race, not an app bug (~15 min)

`ConfirmDialog` relabels the confirm button "Delete" → "Deleting…" as soon as it's clicked, so
`expect(getByRole("button", { name: "Delete" })).not.toBeVisible()` in `flan.spec.ts` passes **immediately** and the
test reloads while the server action is still in flight. Fix: wait for the dialog itself to close
(`getByRole("dialog")` hidden), then assert once after a single reload; drop the `toPass` loop. If it still flakes,
it's a real bug — investigate then. Also simplifies the defensive cleanup (old item 5).

### 4. `slugify()` accent handling (15 min)

`"Crème brûlée"` → `crme-brle`. NFD-normalise + strip combining marks before the ASCII filter → `creme-brulee`.
Existing slugs untouched (slug is only generated on create; edit mode doesn't regenerate). Update the AGENTS.md note.

### 5. Small correctness gaps found while analysing (~20 min)

- `createPastryLocation` / `deletePastryLocation` revalidate `/flans` but not `/flan` (map page).
- `deleteFlan(id)` / `deletePastryLocation(id)` skip Zod validation of `id` (AGENTS.md: every action validates first).

### 6. Tag click-through (optional feature)

Link tags on the recipe detail page to `/recipes?tag=<slug>` pre-filtered (check the list page's query param name).

**Dropped as not worth it:** OG image generation (app is private, nothing is shared or indexed); Lighthouse audit.
