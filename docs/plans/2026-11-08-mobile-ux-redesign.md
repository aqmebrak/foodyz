# Mobile UX redesign — implementation plan

Target device: iPhone 13 Pro, 390×844 CSS px. App is used mostly on mobile while cooking
(one hand free, phone propped ~50cm away) or while eating a flan at a pâtisserie.

## Global Constraints

These bind every task.

### Safety (production database)
- `.env` points at the **production** database. Never run `pnpm db:*`, `prisma migrate`, `prisma db push`,
  seed scripts, or any Playwright e2e spec that creates/edits/deletes data (`recipe-create.spec.ts`,
  `recipe-edit.spec.ts`, `flan.spec.ts`). No schema changes in this plan.
- Visual checks are allowed: `pnpm dev` + Playwright screenshots at 390×844, read-only navigation only.
  Never submit a form, click a save/delete/create button, or upload a file against the dev server.
  The saved session in `e2e/.auth/user.json` (cookies) can be injected via `context.addCookies(...)`.
  Never commit screenshots, never write the session token into a committed file; delete temp files.
- Verification per task: `pnpm type-check`, `pnpm lint`, `pnpm test` (vitest, mocks Prisma), `pnpm build`.
  Known pre-existing failures on main may exist — compare against `main` before attributing.

### Project conventions (from AGENTS.md)
- Next.js 16 — read `node_modules/next/dist/docs/` for any API you're unsure of (viewport, manifest, fonts).
- `@/` imports only; `interface` for props; `cn()` for class merging; PascalCase component files,
  kebab-case util/hook files. Server Components by default, `"use client"` only when needed.
- Never edit `src/components/ui/*` — wrap instead. Add shadcn primitives with `pnpm dlx shadcn@latest add <x>`.
- Mutations only via existing Server Actions in `src/actions/`. Don't add new actions unless a task says so.
- Leaflet only inside client components via `next/dynamic(..., { ssr: false })`.
- pnpm only. Semantic commit messages (`feat:`, `fix:`, `refactor:`, `chore:`). End each commit message with
  `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.

### Design tokens ("Kitchen counter")
| Token | Hex | Role |
|---|---|---|
| basil | `#2F6B47` | primary actions, active nav, focus ring |
| yolk | `#F2B630` | flan, ratings, current step highlight |
| enamel | `#F5F7F4` | app background |
| ink | `#1C2420` | body text |
| steam | `#E3E8E4` | borders, dividers |
| paprika | `#C2452D` | destructive + errors only |

- Fonts: **Atkinson Hyperlegible Next** (body, quantities, steps — `next/font/google` name
  `Atkinson_Hyperlegible_Next`), **Bricolage Grotesque** (recipe titles / page h1 only).
  Quantities use `tabular-nums`.
- Mobile rules: 16px side gutter; every tap target ≥ 44×44px; primary actions in the bottom third
  (sticky bottom bars); respect `env(safe-area-inset-*)`; no horizontal page scroll at 390px;
  inputs ≥ 16px font (prevents iOS zoom); `prefers-reduced-motion` respected.
- Copy: sentence case, plain verbs, no ALL-CAPS labels, a button says what happens ("Save recipe").
- Desktop (md+) must keep working — it's mobile-first, not mobile-only.

## Decisions already made
- On mobile, recipes open as real pages (`/recipes/[slug]`), not the drawer. Desktop keeps the drawer.
- Editing moves to a dedicated route `/recipes/[slug]/edit`.
- Recipe instructions stay stored as one string with steps separated by `\n\n` (no schema change).

---

### Task 1: Design tokens, fonts, viewport, PWA manifest

**Files:** `src/app/globals.css`, `src/app/layout.tsx`, new `src/app/manifest.ts`, new `src/app/icon.svg`
(and `src/app/apple-icon.png` or `apple-icon.tsx` via `ImageResponse` if needed for iOS).

- Replace Geist with Atkinson Hyperlegible Next (`--font-sans`) and Bricolage Grotesque (`--font-display`,
  exposed as a Tailwind `font-display` utility via `@theme inline`). Keep a mono only if something uses `font-mono`
  (instructions textarea does today — it will be removed in Task 7, so you may drop Geist Mono if nothing else needs it).
- Map the palette onto the shadcn CSS variables in `:root`: `--background` enamel, `--foreground` ink,
  `--primary` basil (+ white foreground), `--border`/`--input` steam, `--ring` basil, `--destructive` paprika,
  `--card`/`--popover` white, `--muted` a light tint of steam. Also add named tokens `--basil`, `--yolk`,
  `--enamel`, `--ink`, `--steam`, `--paprika` exposed as Tailwind colors (`bg-basil`, `text-yolk`, …).
  The existing `--emerald-*` scale is used widely (`emerald-600` etc.); remap its key steps toward basil hues
  so existing classes stay coherent until later tasks replace them. Keep the `.dark` block working
  (adjust values to a dark version of the palette).
- `body` gets explicit `bg-background text-foreground`.
- Export `viewport` from root layout: `width=device-width`, `initialScale: 1`, `viewportFit: "cover"`,
  `themeColor` basil. Set `<html lang="fr">`? No — keep `lang="en"` (UI copy is English).
- Metadata: `description` → "Your recipes and flan map.", `appleWebApp: { capable: true, title: "Foodyz",
  statusBarStyle: "default" }`.
- `manifest.ts`: name "Foodyz", short_name "Foodyz", start_url "/recipes", display "standalone",
  background_color enamel, theme_color basil, icons pointing at the generated icon routes.
- Icon: simple SVG — basil rounded square with a white whisk/fork glyph or "F" in Bricolage-like weight.
- Check `/login` still renders correctly with the new tokens (screenshot).

**Done when:** build passes, screenshots at 390px of `/login`, `/recipes`, `/recipes/<slug>` show new fonts/colors,
`/manifest.webmanifest` serves JSON.

### Task 2: Unified app shell with mobile bottom tab bar

**Files:** `src/app/(admin)/layout.tsx`, `src/components/admin/AdminSidebar.tsx` (or new
`src/components/layout/AppShell` pieces: `BottomTabBar.tsx`, `MoreSheet.tsx`), `src/app/(public)/**`,
`src/components/layout/Header.tsx`, `src/components/layout/Footer.tsx`, `e2e/public.spec.ts` (selectors only).

- Move the recipe detail route out of `(public)` into `(admin)`: `src/app/(admin)/recipes/[slug]/page.tsx`
  (move, don't copy; keep its `auth()` call). Move `(public)/not-found.tsx` to `(admin)/not-found.tsx` (or
  root `src/app/not-found.tsx`). Delete the `(public)` group, `Header.tsx`, `Footer.tsx` if nothing else imports them.
  Update AGENTS.md "Project Structure" + architecture notes that mention `(public)` to match.
- Mobile (< md): remove the top hamburger bar and slide-in drawer. Add a fixed bottom tab bar
  (height 56px + `env(safe-area-inset-bottom)` padding, white bg, top border steam) with 4 items, each ≥ 44px:
  **Recipes** (`/recipes`, active on `/recipes` and `/recipes/*` except `/recipes/new`),
  **Flans** (`/flan`, active on `/flan`), **New** (`/recipes/new`, rendered as a prominent basil circle button),
  **More** (opens a bottom sheet using the existing `Drawer` (vaul) with `direction="bottom"`: Categories,
  Ingredients, Units, Manage flans (`/flans`), Sign out via `logoutAction`). Active item: basil icon + label;
  inactive: muted. Icons from lucide; labels 11–12px under icons.
- `main` on mobile gets bottom padding = tab bar height + safe area so content never hides behind it.
  Remove `pt-14` top padding. Pages that will later add their own sticky bottom bars (recipe detail, form)
  must sit above the tab bar — expose the tab bar height as a CSS variable `--tabbar-h` on `:root`
  (e.g. `calc(56px + env(safe-area-inset-bottom))`) for later tasks.
- Desktop (md+): keep the existing left sidebar (restyle to tokens: ink/basil instead of emerald-950 is fine,
  keep it dark). Add "Recipe" detail page now lives in this shell on desktop too.
- Hide the tab bar while the on-screen keyboard is likely open? No — out of scope.
- Fix: no horizontal scroll at 390px on any page.
- `e2e/public.spec.ts`: adjust only selectors broken by layout changes (don't run it against prod in a way
  that writes; it's read-only so running it is allowed).

**Done when:** at 390px every page shows the bottom bar, no hamburger, no horizontal scroll; desktop shows sidebar.

### Task 3: Recipe detail page — mobile reading layout

**Files:** `src/app/(admin)/recipes/[slug]/page.tsx`, `src/components/recipes/RecipeClientContent.tsx`,
`src/components/recipes/IngredientChecklist.tsx`, optionally new `src/components/recipes/ServingsStepper.tsx`,
new `src/hooks/use-recipe-progress.ts`.

- Header: image `aspect-[4/3]` on mobile edge-to-edge (no side margin, no rounding at top on mobile;
  rounded on md+), max height ~40vh. Title in `font-display`, ~28px mobile / 36px desktop, tight leading.
  Difficulty + tags as small chips (no uppercase). Description, then a compact stat row:
  total time (prominent), prep, cook. "Edit recipe" becomes a 44px icon button (pencil) top-right of the title
  for ADMIN, linking to `/recipes/${slug}/edit` (route created in Task 5 — link it now).
- Servings stepper: 44px round buttons, number between, label "servings". Moves into the Ingredients header.
- Mobile (< md): sticky segmented control under the page header ("Ingredients · N" | "Steps · N") that scrolls
  to / reveals the section; sticks at top: 0 while scrolling. Implementation choice: two tabs that switch
  visible panel (preferred on mobile) — desktop (md+) shows both side-by-side: ingredients column (sticky) left,
  steps right.
- Ingredients: rows ≥ 48px tall, checkbox 24px, quantity right-aligned in a fixed-width tabular column then name,
  notes muted below name. Checked state persists in localStorage like steps.
- `use-recipe-progress.ts`: one hook owning both checked ingredients and checked steps for a slug,
  localStorage key `recipe-progress-${slug}` storing `{ ingredients: string[], steps: number[], updatedAt }`;
  migrate/read the old `recipe-steps-${slug}` key once. Progress older than 12h is ignored (stale cook).
  All storage access wrapped in try/catch. Unit-test the pure parts (serialize/expire/migrate) in
  `src/__tests__/lib/` or `src/__tests__/hooks/`.
- "Reset progress" text button visible when anything is checked.
- Steps: large readable text (17–18px, line-height 1.6), number badge; the first unchecked step gets a yolk
  left accent ("you are here"). Tapping toggles done.
- Sticky bottom bar (above the tab bar, using `--tabbar-h`) with a full-width basil "Start cooking" button
  (resumes at first unchecked step). In this task the button may be wired to a no-op/placeholder prop
  `onStartCooking`; Task 4 implements cook mode. Prefer: render the button and leave a clear TODO-free
  extension point (e.g. `RecipeClientContent` holds `cookModeOpen` state; Task 4 adds the overlay).

**Done when:** 390px screenshots show no overflow, 44px controls, tabs work, progress survives reload.

### Task 4: Cook mode

**Files:** new `src/components/recipes/CookMode.tsx`, new `src/lib/timers.ts`, new
`src/hooks/use-wake-lock.ts`, `src/components/recipes/RecipeClientContent.tsx`, tests in `src/__tests__/lib/timers.test.ts`.

- Full-screen overlay (fixed inset-0, z above tab bar, ink text on enamel, safe-area padding), opened by
  "Start cooking". Shows: top bar "Step X of N", close (✕, 44px), ingredients button (opens a bottom sheet
  listing scaled ingredients with the same checkboxes/progress). Center: the step text at 24px (clamp
  22–28px), max ~60ch. Bottom: progress dots/bar, "Previous" and "Next" 56px-tall buttons; last step's next
  button reads "Finish" and closes + marks all done.
- Navigation: swipe left/right (pointer events, threshold ~50px, ignore vertical scrolls), tap left third /
  right third of the text area, keyboard ← → Esc. Advancing marks the current step done (shared progress hook
  from Task 3). Opening resumes at first unchecked step.
- Wake lock: `navigator.wakeLock.request("screen")` while open; re-acquire on `visibilitychange`; release on
  close; silently no-op if unsupported.
- Timers: `parseTimers(step: string): { label: string; seconds: number; index: number }[]` in
  `src/lib/timers.ts`. Detect French and English: "12 minutes", "12 min", "12mn", "1 h 30", "1h30",
  "1 heure", "2 heures", "30 secondes", "45 s", "10-12 minutes" (use upper bound), "1 hour", "90 seconds".
  Don't match things like "180°C" or "2 œufs". Write the tests first (≥ 12 cases incl. negatives).
- Each detected duration renders as a chip "⏲ 12 min" under the step; tapping starts a countdown
  (multiple timers allowed, shown in a small stack at the top of cook mode, persist while navigating steps,
  each cancellable). On finish: `navigator.vibrate?.([200,100,200])`, a short WebAudio beep, and the chip pulses
  (no pulse if reduced motion). Timers only live in memory (fine to lose on reload).
- Motion: one slide transition between steps (150ms), disabled under reduced motion.
- Body scroll locked while open; focus trapped; `role="dialog"` `aria-modal`.

**Done when:** tests pass; screenshot of cook mode at 390px; timers parse correctly on real recipe text.

### Task 5: Edit route + form layout restructure

**Files:** new `src/app/(admin)/recipes/[slug]/edit/page.tsx` (+ `loading.tsx`), `src/app/(admin)/recipes/new/page.tsx`,
`src/components/admin/RecipeForm/*` (index, BasicInfoSection, DetailsSection, SaveBar, TagsSection),
`src/components/admin/AdminRecipesClient/RecipeViewDrawer.tsx`, `src/actions/recipe.ts` (redirect targets only).

- Edit page loads the recipe by slug (reuse `getRecipeBySlug` or `getRecipeForAdmin` — whichever returns
  what `RecipeForm`'s `defaultValues` needs; see how `RecipeEditContent.tsx` maps it today and reuse that
  mapping, extracting it into a shared util if needed). Unpublished recipes must also be editable. 404 if missing.
  Header: back link (to `/recipes/${slug}`), title "Edit recipe".
- The drawer's Edit button: on desktop keeps in-drawer editing OR links to the edit route — choose the
  edit route for both (simpler; remove `RecipeEditContent` if it becomes unused). Fix the drawer header overflow
  (title must remain readable: put actions in a second row or overflow menu).
- `updateRecipe` / `createRecipe` redirect: update → `/recipes/${slug}`; create → `/recipes/${slug}`.
  Keep revalidate calls valid (no `/admin` paths). Update any vitest test asserting the old redirect target.
- Form layout (applies to new + edit):
  - Single column; page gutter 16px on mobile (remove the double `p-6` + `p-8` padding), max-w-2xl on desktop.
  - Section order: **Photo → Title & description → Ingredients → Steps → Details → Tags → Advanced**.
  - Photo: big tap target (full width, aspect-[4/3], dashed steam border, camera icon + "Add a photo"),
    hidden `<input type="file" accept="image/*">`; shows preview after selection immediately (object URL)
    with an uploading overlay/spinner while `uploadRecipeImage` runs, "Change photo" / "Remove" buttons after.
    The raw path text input moves into Advanced.
  - Slug moves into a collapsed "Advanced" section (`<details>` or a disclosure) with the image path field.
  - Details: difficulty as 3 segmented chips (44px); prep, cook, servings as stepper inputs
    (− / number / +, 44px buttons, `inputMode="numeric"`, step 5 for minutes, 1 for servings);
    Published as a 44px switch row with label "Published" and helper "Show in your recipe list" (wording: it's private app).
  - Sticky bottom save bar: above the tab bar (`bottom: var(--tabbar-h)` on mobile, bottom 0 on desktop),
    full-width basil button "Save recipe" / "Create recipe", spinner while pending; remove the top SaveBar.
    Server error appears just above the bar and scrolls into view.
  - Every input: ≥ 44px height on mobile, 16px font, sensible `autoComplete="off"`, `enterKeyHint`.
  - Delete recipe: a destructive text button at the very bottom of the edit page (uses existing
    `ConfirmDialog` + `deleteRecipe`), redirect to `/recipes` after.
- Do NOT change Ingredients rows or Steps editor internals here (Tasks 6–7), only their position.

**Done when:** `/recipes/new` and `/recipes/<slug>/edit` render at 390px with no overflow (screenshots — do NOT submit).

### Task 6: Ingredient rows + "Paste a list"

**Files:** `src/components/admin/RecipeForm/IngredientsSection.tsx`, `IngredientCombobox.tsx`,
new `src/components/admin/RecipeForm/PasteIngredientsSheet.tsx`, new `src/lib/parse-ingredients.ts`,
tests `src/__tests__/lib/parse-ingredients.test.ts`.

- Row as a card (white, steam border, radius 12px, padding 12px):
  line 1: ingredient combobox full width;
  line 2: quantity (`inputMode="decimal"`, accepts comma decimal "1,5" → 1.5) | unit select | remove (44px);
  line 3: "Add note" text button that reveals the notes input (shown directly if a note exists).
  Reorder: 44px up/down buttons in a row footer, or a drag handle (pointer-events based; keep buttons as
  accessible fallback). No overlapping controls at 390px.
- Combobox: closes on Escape and outside tap; its list doesn't cover the "Add ingredient" button after close;
  list items ≥ 44px; search is accent-insensitive (`normalizeStr`); on mobile open it as a bottom sheet or a
  full-width popover with the input auto-focused.
- "Paste a list" button next to "Add ingredient": opens a sheet with a textarea; parses lines like
  `200 g spaghetti`, `2 oeufs`, `1,5 l de lait`, `1 c. à soupe d'huile d'olive`, `sel` (qty 0, no unit),
  `40g pecorino (râpé)` → notes "râpé", `- 3 tomates` (bullets stripped), `½ citron` (unicode fractions),
  `1/2 cup sugar`. `parseIngredientLine(line, units, ingredients)` returns
  `{ quantity, unitId | "", ingredientId | null, ingredientName, notes, raw }` matching units by abbreviation
  or name (case/accents-insensitive, incl. plural and "de/d'" stripping) and ingredients by `normalizeStr`
  equality, then simple singular/plural tolerance. Tests first (≥ 15 cases).
- Preview list in the sheet: each parsed row shows qty/unit/name with an "unknown ingredient" badge for
  unmatched ones. "Add N ingredients" appends rows; unmatched ingredients are created through the same
  path the combobox uses today for "create new ingredient" (find it in `IngredientCombobox.tsx` and reuse;
  do not add a new server action). Note: creating ingredients writes to the DB — never trigger it during
  your own verification.

**Done when:** parser tests pass; 390px screenshot of a row and of the paste sheet with preview (typing into
the textarea is fine; do not press "Add").

### Task 7: Steps editor, draft autosave, unsaved-changes guard

**Files:** `src/components/admin/RecipeForm/InstructionsSection.tsx` (rename section heading to "Steps"),
`src/components/admin/RecipeForm/index.tsx`, new `src/hooks/use-form-draft.ts`, new `src/lib/steps.ts`,
tests `src/__tests__/lib/steps.test.ts`.

- `src/lib/steps.ts`: `splitSteps(instructions: string): string[]` (same split as the detail page:
  `/\n\n+/`, trim, drop empty) and `joinSteps(steps: string[]): string` (trim each, drop empty, join `\n\n`).
  Replace the duplicated split logic in the detail page and `RecipeViewDrawer` with `splitSteps`. Tests.
- Steps editor: list of numbered auto-growing textareas (one per step, 17px text, min 3 rows on mobile),
  "Add step" button (44px, focuses the new textarea), per-step remove and move up/down (44px, in a small
  footer row). Pasting text containing blank lines into a step splits it into multiple steps.
  Form value stays the joined string (`instructions`) so validation/actions are untouched.
- Draft autosave (create mode only): `use-form-draft.ts` saves form values to localStorage key
  `recipe-draft-new` debounced 800ms; on mount, if a draft exists, show a dismissible banner
  "You have an unsaved draft from <relative time>" with "Restore" / "Discard". Clear the draft on successful
  create (before redirect) — careful: `createRecipe` redirects, so clear it right before calling the action
  and restore nothing on error (keep values in the form). try/catch all storage.
- Unsaved-changes guard: when the form is dirty, `beforeunload` prompt, and intercept in-app navigation from
  the back link (confirm dialog via `ConfirmDialog` or `window.confirm`). Not on successful submit.

**Done when:** tests pass; 390px screenshot of the steps editor with 3 steps (typed locally, not saved).

### Task 8: Recipe list — find fast

**Files:** `src/components/admin/AdminRecipesClient/*`, `src/actions/recipe.ts` (`getAllRecipesAdmin` select only),
`src/components/shared/SearchBar.tsx` (if needed), new `src/hooks/use-recent-recipes.ts`, `e2e/public.spec.ts` (selectors).

- Mobile (< md) list replaces the table: rows with a 72px rounded thumbnail (or a basil-tinted placeholder
  with the recipe's first letter in `font-display`, not an emoji), title (2-line clamp, 16px semibold),
  meta line "22 min · Easy" (total time = prep + cook via `formatDuration`), draft rows get a small "Draft" chip.
  Each row is a `<Link href="/recipes/${slug}">` (real anchors). No delete button in rows (delete lives on the
  edit page since Task 5).
- Desktop (md+): keep table + drawer, but remove row delete too for consistency? Keep desktop delete (it's
  fine with a mouse). Remove the oversized `sm:h-36` rows — use the same row component as mobile in a grid
  or a compact table; your call, keep it clean.
- Sticky search at top (below nothing — the page has no top bar on mobile): 48px input, placeholder
  "Search recipes or ingredients", matches title OR any ingredient name (accent-insensitive). Extend
  `getAllRecipesAdmin` to also select ingredient names (select only what's needed).
- Tag chips: one horizontally scrolling row (`overflow-x-auto`, snap, hidden scrollbar), "All" first, 36–40px
  tall chips with 44px hit area. A "Filters" chip at the end opens a bottom sheet (vaul Drawer bottom) with
  difficulty chips, max total time chips (≤ 20 / 30 / 45 / 60 min), servings, and a "Show drafts" switch
  (default off), plus "Clear" and "Show N recipes" buttons. Active filter count shown on the Filters chip.
  Replace the six native selects.
- Recently opened: `use-recent-recipes.ts` stores last 5 slugs opened (written by the detail page on mount),
  shown as a horizontal row of small cards "Recent" above the list when search/filters are empty.
- Header: page title "Recipes" in `font-display` + count; the "New recipe" button is removed on mobile (tab bar
  has New) but kept on desktop.
- Empty states: no recipes → "No recipes yet" + "Create a recipe" button; no matches → "No recipes match
  “query”" + "Clear filters" button.
- Persist search/filters in the URL query (`?q=&tag=`) via `router.replace` so back navigation from a recipe
  restores them. Keep `?recipe=slug` drawer deep-link working on desktop.

**Done when:** 390px screenshots: list top, filters sheet open, search with an ingredient term.

### Task 9: Flan map — map-first with bottom sheet

**Files:** `src/components/flan/FlanPageClient.tsx`, `FlanMap.tsx`, `FlanMapWrapper.tsx`, `src/app/(admin)/flan/page.tsx`.

- Mobile: map fills the viewport height minus the tab bar (`h-[calc(100dvh-var(--tabbar-h))]`); title and
  count float as a small overlay card top-left (safe-area aware). Filters: one horizontally scrolling chip row
  overlaid at the top under the title (search icon chip expands to an input).
- A bottom sheet (vaul `Drawer` with `snapPoints`, non-modal, `dismissible={false}`) with three snaps:
  peek (~120px: "18 tried · 15 to try" + drag handle), half, full. Content: the flan list (rows: 56px photo,
  name, location, stars in yolk). Tapping a row flies the map to that marker and opens the detail.
- Flan detail: replaces the centered modal with the same sheet showing details (photo 4/3, name, location,
  stars, date, comment, "Open in Google Maps" 44px button). Back/close returns to list.
- Tapping a marker opens its detail in the sheet. Map marker colors: tried = yolk, to-try = steam/ink outline.
- Desktop: keep a side-by-side layout (map + list panel) — sheet only below md.
- Check vaul's snapPoints API in `node_modules/vaul` (v1.1.x) before using it.

**Done when:** 390px screenshots: peek, half with list, detail.

### Task 10: Flan quick log

**Files:** new `src/components/flan/QuickLogSheet.tsx`, `src/components/flan/FlanPageClient.tsx`,
`src/app/(admin)/flan/page.tsx` (fetch pastry locations), `src/lib/utils.ts` (distance helper) + tests.

- A floating basil "Log a flan" button (56px, bottom-right above the sheet peek / tab bar) on `/flan`.
- Opens a full-height sheet with, in order: photo (big tap target, `accept="image/*"` — iOS offers camera),
  rating as five 48px stars (tap to set, yolk fill), location picker (reuse `LocationCombobox`), flan name
  (text, optional default "Flan nature"? no — required per schema; check `FlanFormValues`), comment textarea,
  tried = true and triedAt = today by default (editable date). Sticky "Save flan" button.
- Location suggestion: on open, if the user grants geolocation, compute distance to each PastryLocation
  using coords from `parseGoogleMapsUrl(mapsUrl)` (check what it returns), preselect the nearest within
  300m and show "Nearest: <name> · 120 m" with a "Change" option. Put `haversineMeters(a, b)` in
  `src/lib/utils.ts` with tests. Never block the form on geolocation.
- Save via existing `uploadFlanPhoto` + `createFlan` actions (same as `FlansClient.tsx` does — reuse its
  compression/upload approach). Never trigger a save during your own verification.
- After save: close sheet, toast/inline confirmation "Flan logged", map refreshes (revalidatePath already exists).

**Done when:** haversine tests pass; 390px screenshot of the quick-log sheet (filled locally, not saved).

### Task 11: Polish — feedback, loading, dark mode, motion

**Files:** loading.tsx files under `src/app/(admin)/**`, new toast setup (`pnpm dlx shadcn@latest add sonner`)
mounted in root layout, form/sheet components that save, `src/app/globals.css`, `playwright.config.ts`.

- Toasts: "Recipe saved", "Recipe created", "Recipe deleted", "Flan logged" (same verb as the button).
  Since recipe actions redirect, show the toast on the destination via a short-lived query flag
  (e.g. `?saved=1`, removed with `router.replace` after showing) or sonner + `useEffect` on the form before
  redirect — pick the one that works with `redirect()` in server actions.
- Skeletons: update `loading.tsx` for `/recipes`, `/recipes/new`, add for `/recipes/[slug]` and
  `/recipes/[slug]/edit`, `/flan` — shapes matching the new layouts.
- Dark mode via `prefers-color-scheme` (dark versions of the palette: ink-ish background `#141A17`, text
  `#E8EDE9`, basil lighter `#5FA77C`, yolk stays). Ensure the `dark:` variant follows the media query (check
  how `shadcn/tailwind.css` / globals define the dark variant). Leaflet tiles stay as-is.
- Reduced motion: global `@media (prefers-reduced-motion: reduce)` that disables non-essential transitions/animations.
- Focus-visible rings (basil) on all custom buttons/chips added in earlier tasks.
- `playwright.config.ts`: add a `mobile-safari`-like project using `devices["iPhone 13 Pro"]` restricted to
  `public.spec.ts` only (read-only spec). Don't run the write specs.
- Final 390px screenshot pass on every route; fix any overflow or < 44px targets found.

**Done when:** build/lint/type-check/test pass; screenshot pass in light and dark at 390px shows no regressions.
