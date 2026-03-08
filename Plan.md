# Foodyz — Build Plan

Each phase is a small, self-contained unit of work. Complete and review each step before moving to the next.

---

## Phase 1 — Project Scaffolding

> Goal: an empty but fully configured Next.js project that builds with zero errors.

- [ ] **1.1** Scaffold with `pnpm create next-app@latest` — App Router, TypeScript, Tailwind, `src/`, no Turbopack
- [ ] **1.2** Clean up boilerplate — remove default content from `page.tsx`, `globals.css`, `layout.tsx`
- [ ] **1.3** Configure `tsconfig.json` — enable `strict: true`, set `@/` path alias to `./src`
- [ ] **1.4** Configure `next.config.ts` — enable `images.remotePatterns` for localhost (future CDN entries go here)
- [ ] **1.5** Install and initialise shadcn/ui — `pnpm dlx shadcn@latest init` (choose New York style, CSS variables)
- [ ] **1.6** Install core utilities — `zod`, `clsx`, `tailwind-merge`, `lucide-react`
- [ ] **1.7** Create `src/lib/utils.ts` — export `cn()`, `slugify()`, `formatDuration()`
- [ ] **1.8** Create `src/types/index.ts` — empty file, ready for shared types
- [ ] **1.9** Add `.env.example` and `.gitignore` entries for `.env`
- [ ] **1.10** Verify: `pnpm build` passes with zero errors

---

## Phase 2 — Database: Schema & Migrations

> Goal: Prisma connected to a local PostgreSQL database with a complete schema.

- [ ] **2.1** Install Prisma — `pnpm add -D prisma` and `pnpm add @prisma/client`
- [ ] **2.2** Initialise Prisma — `pnpm dlx prisma init` — creates `prisma/schema.prisma` and `.env`
- [ ] **2.3** Add `DATABASE_URL` and `DIRECT_URL` to `.env` (local Postgres) and `.env.example`
- [ ] **2.4** Configure `datasource db` in `schema.prisma` with both `url` and `directUrl`
- [ ] **2.5** Add `pnpm db:*` scripts to `package.json`
  ```json
  "db:migrate": "prisma migrate dev",
  "db:generate": "prisma generate",
  "db:studio": "prisma studio",
  "db:seed": "tsx prisma/seed.ts",
  "db:reset": "prisma migrate reset",
  "postinstall": "prisma generate"
  ```
- [ ] **2.6** Write the full Prisma schema — models: `User`, `Recipe`, `Category`, `Ingredient`, `RecipeIngredient`, `IngredientUnit`, `Unit`, `Tag`, `RecipeTag`, `RecipeImage`
- [ ] **2.7** Run first migration — `pnpm db:migrate --name init`
- [ ] **2.8** Create `src/lib/db.ts` — Prisma singleton (`globalThis` pattern for dev hot reload)
- [ ] **2.9** Write `prisma/seed.ts` — seed 3 categories, 5 ingredients, 2 sample recipes (published + draft)
- [ ] **2.10** Run `pnpm db:seed` and verify with `pnpm db:studio`

---

## Phase 3 — Authentication (Auth.js v5)

> Goal: `/admin/*` routes are protected; login/logout works.

- [ ] **3.1** Install Auth.js — `pnpm add next-auth@beta`
- [ ] **3.2** Add `AUTH_SECRET` to `.env` and `.env.example` (generate with `openssl rand -base64 32`)
- [ ] **3.3** Create `src/lib/auth.ts` — configure `Credentials` provider using the `User` table (bcrypt password check)
- [ ] **3.4** Create `src/app/api/auth/[...nextauth]/route.ts` — Auth.js handler
- [ ] **3.5** Create `middleware.ts` at the root — protect all `/admin/*` routes, redirect unauthenticated users to `/login`
- [ ] **3.6** Create `src/app/login/page.tsx` — simple login form (email + password), Server Action for sign-in
- [ ] **3.7** Add a seed admin user to `prisma/seed.ts` (hashed password with `bcryptjs`)
- [ ] **3.8** Test: unauthenticated `/admin` → redirected to `/login`; login with seed credentials → access granted

---

## Phase 4 — App Shell & Layouts

> Goal: two distinct visual shells — public site layout and admin backoffice layout.

- [ ] **4.1** Create `src/components/layout/Header.tsx` — site logo, nav links (Home, Recipes, Categories)
- [ ] **4.2** Create `src/components/layout/Footer.tsx` — minimal footer
- [ ] **4.3** Update root `src/app/layout.tsx` — add `Header` and `Footer`, import global styles, set font
- [ ] **4.4** Create the `(public)` route group — move homepage logic inside; confirm URLs unchanged
- [ ] **4.5** Create `src/components/admin/AdminSidebar.tsx` — nav links: Dashboard, Recipes, Categories, Ingredients + Sign Out button
- [ ] **4.6** Create `src/app/(admin)/layout.tsx` — wraps all `/admin/*` pages with `AdminSidebar`
- [ ] **4.7** Create placeholder `src/app/(admin)/admin/page.tsx` — static "Dashboard" heading
- [ ] **4.8** Verify: public pages show Header/Footer; admin pages show sidebar only; no layout bleed

---

## Phase 5 — Public Frontend: Recipe Browsing

> Goal: visitors can browse and read recipes; pages are server-rendered.

- [ ] **5.1** Create `src/actions/recipe.ts` — read-only queries: `getPublishedRecipes()`, `getRecipeBySlug()`, `getRecipesByCategory()`
- [ ] **5.2** Create `src/components/recipes/RecipeCard.tsx` — card with image, title, category, prep time, difficulty badge
- [ ] **5.3** Create `src/components/recipes/RecipeGrid.tsx` — responsive grid wrapper for `RecipeCard`
- [ ] **5.4** Create `src/app/page.tsx` (homepage) — featured recipes grid, link to `/recipes`
- [ ] **5.5** Create `src/app/(public)/recipes/page.tsx` — list all published recipes with `RecipeGrid`
- [ ] **5.6** Create `src/app/(public)/recipes/[slug]/page.tsx` — full recipe detail: image, description, ingredients list, instructions, metadata
- [ ] **5.7** Add `generateStaticParams` to the `[slug]` page for static generation
- [ ] **5.8** Add `generateMetadata` to the `[slug]` page for SEO (title, description, OG image)
- [ ] **5.9** Create `src/app/(public)/categories/[slug]/page.tsx` — recipes filtered by category
- [ ] **5.10** Create `src/components/shared/Breadcrumbs.tsx` — used on recipe detail and category pages

---

## Phase 6 — Admin: Recipes CRUD

> Goal: admins can list, create, edit, and delete recipes from the backoffice.

- [ ] **6.1** Add mutation Server Actions to `src/actions/recipe.ts` — `createRecipe()`, `updateRecipe()`, `deleteRecipe()` with Zod validation + `revalidatePath()`
- [ ] **6.2** Create `src/lib/validations/recipe.ts` — Zod schema for recipe form fields
- [ ] **6.3** Add shadcn form components — `pnpm dlx shadcn@latest add form input textarea select button badge`
- [ ] **6.4** Create `src/app/(admin)/admin/recipes/page.tsx` — data table: title, category, status (draft/published), actions (edit / delete)
- [ ] **6.5** Create `src/components/admin/RecipeForm.tsx` — full form: title, slug (auto-computed), description, category select, difficulty, prep/cook time, servings, published toggle, instructions textarea
- [ ] **6.6** Create `src/app/(admin)/admin/recipes/new/page.tsx` — renders `RecipeForm` in create mode
- [ ] **6.7** Create `src/app/(admin)/admin/recipes/[id]/page.tsx` — renders `RecipeForm` pre-filled for editing
- [ ] **6.8** Add inline ingredient management to `RecipeForm` — add/remove/reorder ingredients with quantity, unit, notes fields
- [ ] **6.9** Add image upload field — stores file to `public/images/recipes/` and saves relative path via Server Action
- [ ] **6.10** Create `src/components/admin/ConfirmDialog.tsx` — confirmation modal for delete actions
- [ ] **6.11** Wire delete button in the recipes table → `ConfirmDialog` → `deleteRecipe()` Server Action
- [ ] **6.12** Test full CRUD cycle: create → edit → publish → delete; verify public pages reflect changes

---

## Phase 7 — Admin: Categories & Ingredients

> Goal: admins can manage the lookup tables used by recipes.

- [ ] **7.1** Create `src/actions/category.ts` — `getCategories()`, `createCategory()`, `updateCategory()`, `deleteCategory()` with Zod + `revalidatePath()`
- [ ] **7.2** Create `src/lib/validations/category.ts` — Zod schema for category fields
- [ ] **7.3** Create `src/app/(admin)/admin/categories/page.tsx` — table of categories with edit/delete; inline create form
- [ ] **7.4** Create `src/actions/ingredient.ts` — `getIngredients()`, `createIngredient()`, `updateIngredient()`, `deleteIngredient()`
- [ ] **7.5** Create `src/app/(admin)/admin/ingredients/page.tsx` — table of ingredients with edit/delete; inline create form
- [ ] **7.6** Update `RecipeForm` category select to pull from live DB data

---

## Phase 8 — UX Polish

> Goal: loading states, error handling, empty states, and responsive design.

- [ ] **8.1** Add `loading.tsx` files for admin routes — skeleton UI using shadcn `Skeleton`
- [ ] **8.2** Add `error.tsx` files for admin routes — error boundary with retry button
- [ ] **8.3** Add `not-found.tsx` for the `[slug]` recipe page — styled 404
- [ ] **8.4** Add empty states to recipe and ingredient tables ("No recipes yet — create one")
- [ ] **8.5** Create `src/components/shared/Pagination.tsx` — paginate the recipes list page (12 per page)
- [ ] **8.6** Create `src/components/shared/SearchBar.tsx` — client-side search input with `use-debounce`
- [ ] **8.7** Wire `SearchBar` into the admin recipes list — filter by title in real time
- [ ] **8.8** Audit mobile layout — admin sidebar collapses to hamburger menu on small screens

---

## Phase 9 — Deployment to Vercel

> Goal: the app runs in production on Vercel with a cloud Postgres database.

- [ ] **9.1** Create a Postgres database on Vercel (or Neon/Supabase) — copy `DATABASE_URL` and `DIRECT_URL`
- [ ] **9.2** Add all environment variables to Vercel project settings
- [ ] **9.3** Push project to GitHub; connect repo to Vercel
- [ ] **9.4** Run `pnpm db:migrate` against the production database via `DIRECT_URL`
- [ ] **9.5** Run `pnpm db:seed` to populate production database with initial data
- [ ] **9.6** Trigger first Vercel deploy; resolve any build errors
- [ ] **9.7** Verify: public recipe pages load; admin login works; CRUD operations persist

---

## Phase 10 — Hardening & Nice-to-Haves

> Goal: production-quality finishing touches.

- [ ] **10.1** Add `robots.txt` and `sitemap.xml` (use Next.js Metadata API)
- [ ] **10.2** Add Open Graph image generation for recipe pages (`opengraph-image.tsx`)
- [ ] **10.3** Rate-limit the login Server Action (prevent brute force)
- [ ] **10.5** Write Prisma query tests for critical Server Actions
- [ ] **10.6** Lighthouse audit — fix CLS, LCP, accessibility issues


## Phase 11 - UX enhancements

- [] **11.1** Improve mobile recipe page interactions: do not make the menubar sticky on mobile
- [] **11.2** Keep the buttons "jump to ingredients" "steps" sticky at the bottom of the screen on mobile when scrolling through a recipe. make them a little bit smaller and add icons to them.
- [] **11.4** Admin recipes list: Add filter fields: categories, difficulty, prep time, cook time, servings, published status


## Phase 12 - Additional features
- [] **12.1** Search functionality on the public recipes page. don't forget to skip diacritics (same for the admin search). This can be implemented using a simple text input that filters the displayed recipes in real time as the user types. The filtering should be case-insensitive and ignore diacritics to ensure a smooth user experience. For example, searching for "cafe" should match recipes with "café" in the title or description.
- [] **12.2** Admin: on desktop, list recipes and when selecting a recipe displays the edit form on the right side of the screen (split view) 
- [] **12.3** Admin: enhanced ingredient Select input: add a search value inside the Select component. Also add the ability to create a new ingredient directly from the Select dropdown (without leaving the recipe form). This could be implemented as an "Add new ingredient" option at the bottom of the dropdown, which opens a small modal or inline form to enter the new ingredient details. Once created, the new ingredient should be automatically selected in the original dropdown.

## Phase 13 - 
- [] **13.1** Like for the ingredients, add a tick step action to the recipe steps, so that when you are cooking you can tick off each step as you go. This state should be kept in local storage so that it persists across page reloads but is not shared between users (not stored in the database).
- [] **13.2** add a mechanism that allow the user to divide or muliply the ingredient quantities based on the number of servings they want to make. This could be a Plus and Minus button next to the servings field in the recipe details page. When the user clicks on the Plus button, it multiplies the ingredient quantities by +1 one serving and updates the displayed quantities accordingly. When they click on the Minus button, it reduces the quantities by -1 serving and updates the displayed quantities accordingly. The original quantities should be stored as a reference so that the user can always go back to the default values.

## Phase 14
- [] **14.1** Add a button linking to the public recipe page from the admin recipe edit page
- [] **14.2** If we are connected as admin and we visit a public recipe page, show an "Edit Recipe" button that links to the admin edit page for that recipe
- [] **14.3** Under ingredients admin page: show the list of recipes that use each ingredient, with links to edit those recipes. This will help admins understand the impact of editing or deleting an ingredient.
- [] **14.4** Admin edit recipe: when we create a new ingredient, the first click in the quantity input must clear the default value of 0
- [] **14.5** Admin edit recipe: when we add a new ingredient to a recipe, the ingredient select input should be focused automatically to speed up data entry.
- [] **14.6** Admin edit recipe: sort ingredient select list alphabetically and show the most used ingredients at the top of the list for easier access.
- [] **14.6** Admin: avoid capitalizin the ingredient name when creating a new ingredient (for example "olive oil" instead of "Olive Oil") to avoid duplicates like "Olive Oil" and "olive oil" which are the same ingredient but will be treated as different ones by the system.


## Phase 15 - 
- [] **15.1** Admin reciped edit: add ingredients reordering functionality. This can be implemented using drag-and-drop or up/down buttons to allow admins to change the order of ingredients in a recipe. The new order should be saved in the database and reflected on the public recipe page.
- [] **15.2** If we entered a quantity of 0 for an ingredient in the recipe form, we should hide the quantity on the public recipe page to avoid confusion (for example "Olive Oil" instead of "0 Olive Oil") since some ingredients may not require a specific quantity.


---

## Quick Reference

| Phase | Focus | Key files touched |
|---|---|---|
| 1 | Scaffolding | `package.json`, `tsconfig.json`, `next.config.ts`, `lib/utils.ts` |
| 2 | Database | `prisma/schema.prisma`, `lib/db.ts`, `prisma/seed.ts` |
| 3 | Auth | `lib/auth.ts`, `middleware.ts`, `app/login/page.tsx` |
| 4 | Layouts | `app/layout.tsx`, `(admin)/layout.tsx`, layout components |
| 5 | Public site | `(public)/` pages, `RecipeCard`, `RecipeGrid` |
| 6 | Admin recipes | `actions/recipe.ts`, `RecipeForm`, admin recipe pages |
| 7 | Admin lookups | `actions/category.ts`, `actions/ingredient.ts`, admin pages |
| 8 | UX polish | `loading.tsx`, `error.tsx`, `Pagination`, `SearchBar` |
| 9 | Deployment | Vercel project, env vars, production DB migration |
| 10 | Hardening | sitemap, OG images, rate limiting, tests |
