- In all interactions, be extremely concise and sacrifice grammar for the sake of concision.
- if available use Serena MCP as your semantic code retrieval and editing tools. 


## Project Overview

Foodyz is a recipe website with a public-facing browsing experience and a protected `/admin` backoffice for full CRUD management of recipes, categories, and ingredients.

---

## Tech Stack

- **Next.js 16** — App Router, Turbopack in dev
- **React 19**
- **TypeScript** — strict mode enabled
- **shadcn/ui** — component library (primitives owned by the project)
- **TailwindCSS v4**
- **Prisma 6** — database access layer
- **PostgreSQL** — primary database (Vercel Postgres via Prisma Accelerate)
- **Auth.js v5** (next-auth beta) — admin route protection
- **Vercel Blob** — photo/image storage
- **pnpm** — package manager (always use pnpm, never npm or yarn)
- **Vercel** — deployment target

---

## Project Structure

```
foodyz/
├── CLAUDE.md
├── README.md
├── .env                         # gitignored — never commit
├── .env.example                 # committed env template
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/              # never edit manually
├── public/
│   └── images/                  # recipe and category images stored in repo
│       ├── recipes/
│       └── categories/
└── src/
    ├── proxy.ts                  # Next.js 16 proxy (replaces middleware.ts) — protects /admin/*
    ├── app/
    │   ├── layout.tsx            # Root layout (html, body, fonts)
    │   ├── globals.css
    │   ├── login/page.tsx
    │   ├── robots.ts
    │   ├── sitemap.ts
    │   ├── api/auth/[...nextauth]/route.ts
    │   ├── (public)/             # Public-facing route group
    │   │   ├── page.tsx          # Homepage
    │   │   ├── layout.tsx
    │   │   ├── recipes/
    │   │   │   ├── page.tsx      # /recipes — browse all
    │   │   │   └── [slug]/
    │   │   │       └── page.tsx  # /recipes/[slug]
    │   │   ├── categories/
    │   │   │   └── [slug]/
    │   │   │       └── page.tsx
    │   │   └── flan/
    │   │       └── page.tsx      # /flan — personal flan tasting map
    │   └── (admin)/              # Backoffice route group
    │       ├── layout.tsx        # Admin shell layout (sidebar)
    │       └── admin/
    │           ├── page.tsx      # Dashboard
    │           ├── recipes/
    │           │   ├── page.tsx
    │           │   ├── new/page.tsx
    │           │   └── [id]/page.tsx
    │           ├── categories/page.tsx
    │           ├── ingredients/page.tsx
    │           ├── units/page.tsx
    │           └── flans/page.tsx
    ├── components/
    │   ├── ui/                   # shadcn/ui primitives — do not edit directly
    │   ├── layout/               # Header, Footer
    │   ├── recipes/              # RecipeCard, RecipeGrid, RecipeClientContent, IngredientChecklist
    │   ├── admin/                # AdminSidebar, FlansClient, CategoriesClient, IngredientsClient,
    │   │                         # UnitsClient, AdminRecipesClient, ConfirmDialog
    │   │                         # RecipeForm/ (sub-components + IngredientCombobox)
    │   ├── flan/                 # FlanMap, FlanPageClient, FlanMapWrapper, LocationCombobox
    │   └── shared/               # Breadcrumbs, Pagination, SearchBar
    ├── lib/
    │   ├── db.ts                 # Prisma singleton — only DB entry point
    │   ├── auth.ts               # Full Auth.js config (Node.js, Credentials + Prisma)
    │   ├── auth.config.ts        # Edge-safe auth config (no DB) — used by proxy.ts
    │   ├── rate-limit.ts
    │   ├── utils.ts              # cn(), slugify(), formatDuration(), parseGoogleMapsUrl()
    │   └── validations/
    │       ├── recipe.ts
    │       └── category.ts
    ├── actions/                  # Server Actions (all mutations live here)
    │   ├── recipe.ts
    │   ├── category.ts
    │   ├── ingredient.ts
    │   ├── unit.ts
    │   ├── flan.ts               # Flan + PastryLocation CRUD, photo upload via Vercel Blob
    │   └── auth.ts
    ├── hooks/
    │   ├── use-debounce.ts
    │   └── use-wake-lock.ts      # Screen Wake Lock API for recipe pages
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

- **`Recipe`** → belongs to `Category`, has many `RecipeIngredient`, `RecipeTag`, `RecipeImage`
- **`Category`** → has many `Recipe`
- **`Ingredient`** → linked via `RecipeIngredient` junction (stores `quantity`, `unit`, `notes`, `order`); unit linked to `Unit` table via `IngredientUnit` junction
- **`Unit`** → standard units for ingredient quantities, with conversion factors for scaling recipes
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
- **Revalidate after mutations.** Call `revalidatePath()` or `revalidateTag()` after every create/update/delete.
- **Form state with hooks.** Use `useFormState` + `useFormStatus` for loading and error states in Client Components.
- **Auth at the proxy level.** `src/proxy.ts` (Next.js 16 rename of `middleware.ts`) protects all `/admin/*` routes. Auth config is split: `auth.config.ts` (Edge-safe, no DB) used by proxy; `auth.ts` (Node.js, Credentials + Prisma) used by server components. Never put auth checks inside individual admin pages.
- **Leaflet maps in client components only.** Use `next/dynamic(..., { ssr: false })` inside a `"use client"` file — not in Server Components.

---

## Coding Conventions

- Use `@/` absolute imports — never relative paths like `../../`
- Use `interface` for component props; use `type` for unions, utilities, and Prisma-derived types
- Component filenames: `PascalCase.tsx`; utility/hook filenames: `kebab-case.ts`
- Merge Tailwind classes with `cn()` from `lib/utils.ts` — never string concatenation
- Never compute slugs inline — always use `slugify()` from `lib/utils.ts`
- Images: store files in `public/images/<category>/` and render with `next/image`

---

## Prisma Conventions

- Run `pnpm db:generate` after every schema change
- Create migrations with `prisma migrate dev --name <short-description>`
- Never manually edit files inside `prisma/migrations/`
- Always set both `DATABASE_URL` (pooled) and `DIRECT_URL` (non-pooled) — required for Vercel + connection poolers (PgBouncer / Supabase / Neon)

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
NEXTAUTH_SECRET=   # Random secret for Auth.js session signing
NEXTAUTH_URL=      # Full base URL — http://localhost:3000 locally
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
