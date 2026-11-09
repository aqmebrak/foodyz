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
| 17–18 Mobile / dark mode | Mobile layouts, share URL. Dark mode later removed in Phase 21. |
| 19 FlanFan | `/flan` Leaflet map + filters, `/flans` CRUD for flans and pastry locations. |
| 20 DB isolation | Docker dev DB `:5433` + disposable test DB `:5434`; `.env` points at dev, prod URL only in Vercel and gitignored `.env.production.local`; `.env.test` force-loaded by Playwright outside CI; `prisma/guard.ts` makes seed and Playwright refuse non-local hosts; seed adds 9 flans / 7 Lyon locations and tags every recipe. Scripts: `db:up/down/setup/test:setup/test:reset`. |
| 21 Sage design | Sage-mist page `#EDF1E8`, paper cards `#F7F9F3` (no pure white), sage-basil primary `#3D6B50`, light leaf sidebar, sage-tinted gray overrides. **Dark mode removed — single light theme.** Details below. |

**Manual follow-up for Phase 20:** open Prisma Studio against production and delete orphan `E2E Recipe …` rows left by past e2e runs.

---

## Current test coverage

- **Unit (Vitest):** 175 tests, 16 files — recipe / category / ingredient / unit / flan / auth Server Actions (mocked `db`), plus pure libs (utils, rate-limit, steps, timers, parse-ingredients, recipe + flan filters, recipe-progress, form-draft).
- **E2E (Playwright, test DB):** `public.spec.ts` (detail page, 404, homepage, mobile), `recipe-create`, `recipe-edit`, `flan` (map + filters, admin CRUD).

---

## Phase 21 — Sage design refresh (done, branch `feat/sage-design-system`, not yet merged)

**Goal:** lighter, easier-on-the-eyes UI. Sage-tinted backgrounds, a sage/basil primary, **no pure `#fff` surface anywhere**. **Single light theme** — dark mode removed entirely.
The UI is already token-driven (`text-ink`, `bg-basil`, `border-steam`, `bg-card`…), so most of the work is in `globals.css`.

**Direction — "herb garden":** leaves on linen. Surfaces get lighter as they come forward (page → panel → card),
all with the same green-grey tint so nothing glares. Basil does the work (buttons, links, active state). Yolk
(egg / flan) stays as the one warm accent and is the only bold colour. Fonts unchanged (Atkinson Hyperlegible + Bricolage).

### Light tokens

| Token | Old | New | Role |
|---|---|---|---|
| `--enamel` / `--background` | `#f5f7f4` | `#EDF1E8` sage mist | page background |
| `--card`, `--popover` | `#ffffff` | `#F7F9F3` paper | cards, inputs, sheets, tab bar |
| `--panel` | `#1c2420` (dark) | `#E1E9DB` leaf | desktop sidebar, now light |
| `--steam` / `--border` / `--input` | `#e3e8e4` | `#D8E0D2` | hairlines |
| `--basil` / `--primary` / `--ring` | `#2f6b47` | `#3D6B50` sage-basil | primary |
| `--on-basil` / `--primary-foreground` | `#ffffff` | `#F7F9F3` | text on basil |
| `--ink` / `--foreground` | `#1c2420` | `#1F2A24` | body text |
| `--muted-foreground` | `#5b6760` | `#5A675F` | secondary text |
| `--secondary`, `--muted` | `#eef1ee` | `#E4EADF` | quiet fills |
| `--accent` / `--accent-foreground` | emerald-50 / 700 | `#E1E9DB` / `#2F5640` | hover fills |
| `--paprika` / `--destructive` | `#c2452d` | `#B23F29` | errors, delete |
| `--yolk` | `#f2b630` | unchanged | accent |
| new `--sage` | — | `#A9C2A6` | soft tint (chips, selected rows, decor; never text on light) |

Contrast checked (WCAG AA ≥ 4.5): basil on bg 5.4 / card 5.8 / panel 4.9; paper on basil 5.8; ink on bg 13.0;
muted on bg 5.2 / panel 4.8; paprika on bg 5.1.

### Steps

1. **Tokens (`globals.css`)** — apply the table; re-derive `--emerald-50…950` from the new basil hue; add `--sage`
   (+ `--color-sage` in `@theme`); add light-mode overrides for `--color-gray-50…900` (sage-tinted greys, so the
   hardcoded `gray-*` in admin CRUD screens stop looking cool-blue); re-point `--sidebar-*` tokens to panel/basil;
   delete the `prefers-color-scheme: dark` block; `color-scheme: light`; redefine `dark:` as a `.dark`-class
   variant that never matches (neutralises library dark styles).
   Keep `bg-white` out: nothing resolves to `#fff`. Strip `dark:` utilities from components (incl. `components/ui/*`).
2. **Light sidebar (`AdminSidebar.tsx`)** — `text-white*` / `hover:bg-white/10` / `border-white/10` → `text-ink/70`,
   `hover:bg-basil/10`, `border-steam`; logo text `text-ink`; logo icon `text-basil` (yolk on light fails contrast);
   active item stays `bg-basil text-on-basil`. Check `MoreSheet` for the same pattern.
3. **Hex literals** — `layout.tsx` single `themeColor` `#EDF1E8` + `colorScheme: "light"` (status bar blends with the page instead of a green bar),
   `manifest.ts` `background_color` → `#EDF1E8`, `theme_color` → `#3D6B50`, `app-icon.tsx` fill → `#3D6B50`,
   `FlanMap.tsx` untried marker `#FFFFFF` → `#F7F9F3`, border/ring → new ink/basil.
4. **Shadows** — tint the hand-written shadow in `FlanSheet` (`rgba(28,36,32,…)` → ink `rgba(31,42,36,…)`); leave
   shadcn primitives in `components/ui/` alone.
5. **Verify** — `pnpm build`, `pnpm lint`, `pnpm test`; screenshots of `/recipes`, a recipe detail,
   recipe form, `/flan`, `/flans`, login (mobile 390px + desktop); grep that no light-mode surface is `#fff` / `bg-white`.

Out of scope: font changes, layout changes. `components/ui/*` touched only to strip `dark:` classes.

---

## Remaining work (ordered by value)

1. **E2E: cooking flow + recipe delete** (~1–2 h). Delete a recipe (confirm dialog → `/recipes?deleted=1` toast), servings +/- scaling, step tick-off surviving a reload. Tags in the recipe form are lower priority. Safe to run now that e2e uses the disposable DB.
2. **Flan delete/edit shows stale UI after one reload** (time-box 1 h). Unexplained; `flan.spec.ts` papers over it with `toPass`. Look at whether the client refreshes after the action and which paths `revalidatePath` targets. Remove the workaround once fixed.
3. **`slugify()` accent handling** (15 min, product call). `"Crème brûlée"` → `crme-brle`. Fix with NFD normalisation before stripping; only affects newly generated slugs.
4. **Tag click-through** on the recipe detail page (optional feature): link tags to `/recipes` pre-filtered.
5. **Optional cleanup:** simplify `e2e/flan.spec.ts` defensive cleanup (no longer load-bearing).

**Dropped as not worth it:** OG image generation (app is private, nothing is shared or indexed); Lighthouse audit.
