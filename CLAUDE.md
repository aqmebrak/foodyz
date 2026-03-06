- In all interactions, be extremely concise and sacrifice grammar for the sake of concision.


## Project Overview

Foodyz is a recipe website with a public-facing browsing experience and a protected `/admin` backoffice for full CRUD management of recipes, categories, and ingredients.

---

## Tech Stack

- **Next.js 15** — App Router
- **React 19**
- **TypeScript** — strict mode enabled
- **shadcn/ui** — component library (primitives owned by the project)
- **TailwindCSS v4**
- **Prisma ORM** — database access layer
- **PostgreSQL** — primary database
- **Auth.js v5** — admin route protection
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
├───| middleware.ts                 # protects /admin/* routes via Auth.js
    ├── app/
    │   ├── layout.tsx            # Root layout (html, body, fonts)
    │   ├── page.tsx              # Homepage
    │   ├── globals.css
    │   ├── (public)/             # Public-facing route group
    │   │   ├── recipes/
    │   │   │   ├── page.tsx      # /recipes — browse all
    │   │   │   └── [slug]/
    │   │   │       └── page.tsx  # /recipes/pasta-carbonara
    │   │   └── categories/
    │   │       └── [slug]/
    │   │           └── page.tsx
    │   └── (admin)/              # Backoffice route group
    │       ├── layout.tsx        # Admin shell layout (sidebar, nav)
    │       └── admin/
    │           ├── page.tsx      # Dashboard
    │           ├── recipes/
    │           │   ├── page.tsx           # List recipes
    │           │   ├── new/page.tsx       # Create recipe
    │           │   └── [id]/
    │           │       └── page.tsx       # Edit recipe
    │           ├── categories/
    │           │   └── page.tsx
    │           └── ingredients/
    │               └── page.tsx
    ├── components/
    │   ├── ui/                   # shadcn/ui primitives — do not edit directly
    │   ├── layout/               # Header, Footer, Sidebar, Nav
    │   ├── recipes/              # RecipeCard, RecipeGrid, RecipeForm, etc.
    │   ├── admin/                # DataTable, ConfirmDialog, AdminNav
    │   └── shared/               # Breadcrumbs, Pagination, SearchBar
    ├── lib/
    │   ├── db.ts                 # Prisma singleton — only DB entry point
    │   ├── auth.ts               # Auth.js v5 config
    │   ├── utils.ts              # cn(), slugify(), formatDuration()
    │   └── validations/
    │       ├── recipe.ts         # Zod schemas for recipes
    │       └── category.ts
    ├── actions/                  # Server Actions (all mutations live here)
    │   ├── recipe.ts             # createRecipe, updateRecipe, deleteRecipe
    │   ├── category.ts
    │   └── ingredient.ts
    ├── hooks/                    # Client-side custom hooks
    │   └── use-debounce.ts
    └── types/
        └── index.ts              # Shared TypeScript types
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
- **Auth at the middleware level.** `middleware.ts` protects all `/admin/*` routes. Never put auth checks inside individual admin pages.

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
```

---

## Constraints

- **Never commit `.env`** — only `.env.example` is committed to version control
- **Always run `pnpm build`** to verify no TypeScript errors before marking a task complete
- **Semantic commit messages** — prefix with `feat:`, `fix:`, `chore:`, or `refactor:`
- **Never hardcode environment-specific values** — always reference `process.env.*`
- **Never guess at Prisma migration state** — check `prisma migrate status` when uncertain
