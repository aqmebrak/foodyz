<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

- In all interactions, be extremely concise and sacrifice grammar for the sake of concision.
- if available use Serena MCP as your semantic code retrieval and editing tools. 


## Project Overview

Foodyz is a personal recipe manager. The entire app sits behind login (Auth.js) — there is no anonymous public browsing. One route group, `(admin)`, provides the app shell (not access control): desktop left sidebar + mobile bottom tab bar (Recipes, Flans, New, More sheet). It hosts the recipe detail page (`/recipes/[slug]`), CRUD screens for recipes, categories, ingredients, units, and flans, plus the personal `/flan` tasting-map page

Also includes `/flan`, a personal flan (custard tart) tasting map around Lyon with rated locations on a Leaflet map.

---

## Tech Stack

- **Next.js 16** — App Router, Turbopack in dev
- **React 19**
- **TypeScript** — strict mode enabled
- **shadcn/ui** — component library (primitives owned by the project)
- **TailwindCSS v4**
- **Prisma 6** — database access layer
- **PostgreSQL** — primary database, hosted on Prisma Postgres (`db.prisma.io`); plain direct connection,
  not actually going through Prisma Accelerate despite the hostname. "Vercel Postgres" is also the wrong
  name for it — that product was discontinued; Vercel now brokers databases via its Marketplace instead.
- **Auth.js v5** (next-auth beta) — protects the whole app; only `/login` and `/api/auth/*` are unauthenticated
- **Vercel Blob** — photo/image storage
- **pnpm** — package manager (always use pnpm, never npm or yarn)
- **Vercel** — deployment target

---

## Project Structure

```
foodyz/
├── AGENTS.md
├── CLAUDE.md                    # thin pointer: @AGENTS.md
├── README.md
├── .env                         # gitignored — never commit
├── .env.example                 # committed env template
├── next.config.ts
├── tsconfig.json
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/              # never edit manually
├── e2e/                         # Playwright specs (auth.setup.ts writes e2e/.auth/user.json)
├── public/
│   └── images/                  # recipe and category images stored in repo
│       ├── recipes/
│       └── categories/
└── src/
    ├── proxy.ts                  # Next.js 16 proxy (replaces middleware.ts) — requires auth on every route except /login and /api/auth/*
    ├── app/
    │   ├── layout.tsx            # Root layout (html, body, fonts)
    │   ├── globals.css
    │   ├── page.tsx               # "/" — redirects to /recipes
    │   ├── login/page.tsx
    │   ├── robots.ts
    │   ├── sitemap.ts
    │   ├── api/auth/[...nextauth]/route.ts
    │   └── (admin)/              # App shell (sidebar md+, bottom tab bar < md) — all screens
    │       ├── layout.tsx
    │       ├── not-found.tsx
    │       ├── recipes/
    │       │   ├── page.tsx      # /recipes — admin CRUD table
    │       │   ├── [slug]/page.tsx   # recipe detail view
    │       │   └── new/page.tsx
    │       ├── categories/page.tsx
    │       ├── ingredients/page.tsx
    │       ├── units/page.tsx
    │       ├── flans/page.tsx    # /flans — admin CRUD for flans + pastry locations
    │       └── flan/page.tsx     # /flan — personal flan tasting map (admin layout, non-CRUD content)
    ├── components/
    │   ├── ui/                   # shadcn/ui primitives — do not edit directly
    │   ├── layout/               # BottomTabBar, MoreSheet
    │   ├── recipes/              # RecipeClientContent, IngredientChecklist
    │   ├── admin/                # AdminSidebar, FlansClient, CategoriesClient, IngredientsClient,
    │   │                         # UnitsClient, AdminRecipesClient/, ConfirmDialog
    │   │                         # RecipeForm/ (sub-components + IngredientCombobox)
    │   ├── flan/                 # FlanMap, FlanPageClient, FlanMapWrapper, LocationCombobox
    │   └── shared/               # Breadcrumbs, SearchBar
    ├── lib/
    │   ├── db.ts                 # Prisma singleton — only DB entry point
    │   ├── auth.ts               # Full Auth.js config (Node.js, Credentials + Prisma)
    │   ├── auth.config.ts        # Edge-safe auth config (no DB) — used by proxy.ts
    │   ├── rate-limit.ts
    │   ├── utils.ts              # cn(), slugify(), formatDuration(), parseGoogleMapsUrl(), normalizeStr()
    │   └── validations/
    │       ├── recipe.ts
    │       └── category.ts        # also exports ingredientSchema and unitSchema — name undersells it
    ├── actions/                  # Server Actions (all mutations live here)
    │   ├── recipe.ts
    │   ├── category.ts
    │   ├── ingredient.ts
    │   ├── unit.ts
    │   ├── flan.ts               # Flan + PastryLocation CRUD, photo upload via Vercel Blob
    │   └── auth.ts
    ├── hooks/
    │   └── use-debounce.ts
    ├── __tests__/                # Vitest unit tests (actions/*.test.ts, lib/*.test.ts, setup.ts)
    └── types/
        └── index.ts
```

---

## Development Commands

```bash
pnpm dev          # start dev server
pnpm build        # production build — run to verify no TypeScript errors
pnpm lint         # run ESLint
pnpm type-check   # tsc --noEmit

pnpm db:migrate   # prisma migrate dev
pnpm db:generate  # prisma generate (run after every schema change)
pnpm db:studio    # open Prisma Studio
pnpm db:seed      # run prisma/seed.ts
pnpm db:reset     # prisma migrate reset
pnpm test:e2e     # run e2e tests with Playwright
pnpm test:e2e:ui  # run e2e Playwright tests in UI mode
pnpm test         # run unit tests with vitest
pnpm test:watch   # run unit tests with vitest in watch mode
```

---

## Database Schema

### Models & Relationships

- **`Recipe`** → has many `RecipeIngredient`, `RecipeTag`, `RecipeImage` (organized by tags, not categories)
- **`Category`** → standalone entity with its own CRUD at `/categories`; not linked to `Recipe` (relation removed in migration `20260309000000_remove_category_from_recipe`)
- **`Ingredient`** → linked to `Recipe` via the `RecipeIngredient` junction (stores `quantity`, a direct
  `unitId` FK to `Unit`, `notes`, `order`).
- **`Unit`** → standard units for ingredient quantities. There's also an `IngredientUnit` junction model
  (valid units per ingredient + a `conversionFactor`) that looks like it was meant to drive unit conversion —
  but it's dead schema, not referenced anywhere in `src/`. The actual servings-scaling feature
  (`RecipeClientContent.tsx`'s +/- buttons) just multiplies quantities by a plain ratio, no conversion factors
  involved. Don't assume `IngredientUnit` is wired up to anything.
- **`Tag`** → linked via `RecipeTag` junction (many-to-many)
- **`User`** with `Role` enum (`USER` / `ADMIN`) for Auth.js
- **`PastryLocation`** → pastry shop with `name` + `mapsUrl` (full Google Maps URL); has many `Flan`
- **`Flan`** → belongs to `PastryLocation`; has `name`, `rating`, `tried`, `triedAt`, `photoUrl` (Vercel Blob), `comment`

### Key Fields

- `slug` — unique, URL-safe, always computed via `slugify()` in `lib/utils.ts`
- `published Boolean @default(false)` — draft/publish workflow
- `difficulty` — enum: `EASY | MEDIUM | HARD`
- `featuredImage String?` — relative path under `/public/images/recipes/`
- All IDs use `cuid()` — non-sequential and URL-safe

---

## Architecture Patterns

- **Default to Server Components.** Only add `"use client"` when the component uses hooks or event handlers.
- **All DB access through `lib/db.ts`.** Never import `PrismaClient` directly in components or pages.
- **Server Actions for all mutations.** Put them in `src/actions/`. Never use Route Handlers for internal CRUD.
- **Validate with Zod first.** Every Server Action must validate its inputs with a Zod schema before calling Prisma.
- **Revalidate after mutations.** Call `revalidatePath()` or `revalidateTag()` after every create/update/delete — and make sure the path matches an actual route (there is no `/admin` prefix on any route; a past regression had `category`/`ingredient`/`unit` actions revalidating stale `/admin/*` paths that revalidated nothing).
- **Form state with hooks.** Use `useFormState` + `useFormStatus` for loading and error states in Client Components.
- **Auth at the proxy level.** `src/proxy.ts` (Next.js 16 rename of `middleware.ts`) requires a session on every route except `/login` and `/api/auth/*` — the whole app is private, not just `/admin`. Auth config is split: `auth.config.ts` (Edge-safe, no DB) used by proxy; `auth.ts` (Node.js, Credentials + Prisma) used by server components. Never put auth checks inside individual pages — the one exception is `(admin)/recipes/[slug]/page.tsx`, which calls `auth()` itself to conditionally show an "Edit recipe" link to `ADMIN`-role sessions (this makes that route fully dynamic — no more static generation for recipe slugs, a deliberate trade-off).
- **Leaflet maps in client components only.** Use `next/dynamic(..., { ssr: false })` inside a `"use client"` file — not in Server Components.

---

## Coding Conventions

- Use `@/` absolute imports — never relative paths like `../../`
- Use `interface` for component props; use `type` for unions, utilities, and Prisma-derived types
- Component filenames: `PascalCase.tsx`; utility/hook filenames: `kebab-case.ts`
- Merge Tailwind classes with `cn()` from `lib/utils.ts` — never string concatenation
- Never compute slugs inline — always use `slugify()` from `lib/utils.ts` (note: it strips accented characters rather than transliterating them — `"Crème brûlée"` → `"crme-brle"`, not `"creme-brulee"` — use `normalizeStr()` instead when accent-insensitive *matching*, not slugging, is what's needed)
- Images: store files in `public/images/<category>/` and render with `next/image`

---

## Prisma Conventions

- Run `pnpm db:generate` after every schema change
- Create migrations with `prisma migrate dev --name <short-description>`
- Never manually edit files inside `prisma/migrations/`
- Always set both `DATABASE_URL` (pooled) and `DIRECT_URL` (non-pooled) — required for Vercel + connection poolers (PgBouncer / Supabase / Neon)
- **`DATABASE_URL`/`DIRECT_URL` in `.env` point at the same database Vercel production uses — confirmed
  with the project owner.** There is no separate dev/test database yet (see Plan.md Phase 20). Until that
  phase lands: never write a script, test, or seed command that assumes it's safe to mutate freely. E2E specs
  that create/edit/delete data must clean up after themselves (see `e2e/flan.spec.ts`'s `afterAll` Prisma
  cleanup for the pattern) — `recipe-create.spec.ts` currently does not and has been leaving orphan rows in
  production on every run; don't copy that pattern for new specs.

---

## shadcn/ui Conventions

- Add new components with `pnpm dlx shadcn@latest add <component>`
- Never modify files inside `components/ui/` directly — extend by wrapping in a new component
- Use shadcn `Form` + `react-hook-form` + Zod for all admin forms

---

## Environment Variables

Document all of these in `.env.example`:

```bash
DATABASE_URL=      # PostgreSQL connection string (pooled — used at runtime)
DIRECT_URL=        # Direct (non-pooled) connection string (used by Prisma migrations)
AUTH_SECRET=       # Random secret for Auth.js session signing — generate with `openssl rand -base64 32`
AUTH_URL=          # Full base URL — http://localhost:3000 locally
ADMIN_EMAIL=       # Seeded admin account email
ADMIN_PASSWORD=    # Seeded admin account password
BLOB_READ_WRITE_TOKEN=  # Vercel Blob token for photo uploads
```

---

## Constraints

- **Never commit `.env`** — only `.env.example` is committed to version control
- **Always run `pnpm build`** to verify no TypeScript errors before marking a task complete
- **Semantic commit messages** — prefix with `feat:`, `fix:`, `chore:`, or `refactor:`
- **Never hardcode environment-specific values** — always reference `process.env.*`
- **Never guess at Prisma migration state** — check `prisma migrate status` when uncertain
