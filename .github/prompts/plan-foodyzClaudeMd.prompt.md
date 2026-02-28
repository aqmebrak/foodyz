# Plan: Create CLAUDE.md for Foodyz Recipe Website

The goal is to write a single `CLAUDE.md` file at the workspace root that serves as the persistent AI briefing document for this project. It will be loaded automatically by Claude Code at every session, giving it full context about the stack, architecture, conventions, and constraints — so the AI can assist accurately without re-explaining the project each time.

**Stack decisions captured in the file:**
- pnpm · Next.js 15 App Router · TypeScript (strict) · shadcn/ui · TailwindCSS
- Prisma + PostgreSQL · Auth.js v5 (admin auth) · images in `/public/images/` · Vercel deploy

---

## Steps

### 1. Create `CLAUDE.md` at the workspace root with these sections, in order:

#### Project Overview
Foodyz is a recipe website with a public-facing browsing experience and a protected `/admin` backoffice for full CRUD management of recipes, categories, and ingredients.

#### Tech Stack
Itemized list:
- `Next.js 15` (App Router)
- `React 19`
- `TypeScript` (strict mode)
- `shadcn/ui`
- `TailwindCSS v4`
- `Prisma ORM`
- `PostgreSQL`
- `Auth.js v5` (admin protection)
- `pnpm`
- Deployed on `Vercel`

#### Project Structure
Full annotated folder tree:
```
foodyz/
├── CLAUDE.md
├── README.md
├── .env                         # gitignored
├── .env.example                 # committed template
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── middleware.ts                 # protects /admin/* routes
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── public/
│   └── images/                  # recipe and category images stored in repo
│       ├── recipes/
│       └── categories/
└── src/
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
    │       ├── layout.tsx        # Admin shell (sidebar, nav)
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
    │   ├── ui/                   # shadcn/ui primitives (auto-generated, do not edit)
    │   ├── layout/               # Header, Footer, Sidebar, Nav
    │   ├── recipes/              # RecipeCard, RecipeGrid, RecipeForm, etc.
    │   ├── admin/                # DataTable, ConfirmDialog, AdminNav
    │   └── shared/               # Breadcrumbs, Pagination, SearchBar
    ├── lib/
    │   ├── db.ts                 # Prisma singleton client
    │   ├── auth.ts               # Auth.js v5 config
    │   ├── utils.ts              # cn(), slugify(), formatDuration()
    │   └── validations/
    │       ├── recipe.ts         # Zod schemas for recipes
    │       └── category.ts
    ├── actions/                  # Server Actions
    │   ├── recipe.ts             # createRecipe, updateRecipe, deleteRecipe
    │   ├── category.ts
    │   └── ingredient.ts
    ├── hooks/                    # Client-side custom hooks
    │   └── use-debounce.ts
    └── types/
        └── index.ts              # Shared TypeScript types
```

#### Development Commands
All pnpm scripts:
- `pnpm dev` — start dev server
- `pnpm build` — production build (run to verify no TypeScript errors)
- `pnpm lint` — run ESLint
- `pnpm type-check` — run `tsc --noEmit`
- `pnpm db:migrate` — `prisma migrate dev`
- `pnpm db:generate` — `prisma generate`
- `pnpm db:studio` — open Prisma Studio
- `pnpm db:seed` — run `prisma/seed.ts`
- `pnpm db:reset` — `prisma migrate reset`

#### Database Schema Summary
Models and relationships:
- `Recipe` → belongs to `Category`, has many `RecipeIngredient`, `RecipeTag`, `RecipeImage`
- `Category` → has many `Recipe`
- `Ingredient` → linked via `RecipeIngredient` junction (stores `quantity`, `unit`, `notes`, `order`),and unit linked to `Unit` table via `IngredientUnit` junction
- `Tag` → linked via `RecipeTag` junction
- `User` with `Role` enum (`USER` / `ADMIN`) for Auth.js
- `Unit` → standard units for ingredient quantities, with conversion factors for scaling recipes

Key fields:
- `slug` — unique, URL-safe, computed via `slugify()` on title
- `published Boolean @default(false)` — draft/publish toggle
- `difficulty` — enum: `EASY | MEDIUM | HARD`
- `featuredImage String?` — relative path under `/public/images/recipes/`
- IDs use `cuid()` — non-sequential, URL-safe

#### Architecture Patterns
Rules Claude must follow:
- Default to **Server Components**; only add `"use client"` when using hooks or event handlers
- All database access goes through `lib/db.ts` — never import `PrismaClient` directly in components or pages
- Use **Server Actions** in `src/actions/` for all mutations (create/update/delete); never use Route Handlers for internal CRUD
- Validate all Server Action inputs with **Zod** before calling Prisma
- Call `revalidatePath()` or `revalidateTag()` after every mutation to bust the Next.js cache
- Use `useFormState` + `useFormStatus` for form loading and error states in Client Components
- Auth.js middleware in `middleware.ts` protects all `/admin/*` routes — never put auth checks inside individual admin pages

#### Coding Conventions
- Use `@/` absolute imports (never relative `../../`)
- `interface` for component props; `type` for unions, utilities, and Prisma-derived types
- Component filenames: `PascalCase.tsx`; utility files: `kebab-case.ts`
- Merge Tailwind classes with `cn()` from `lib/utils.ts` — never string concatenation
- Slugs generated via `slugify()` in `lib/utils.ts` — never computed inline
- Images: store in `public/images/<category>/` and reference with `next/image`

#### Prisma Conventions
- Always run `pnpm db:generate` after schema changes
- Use `prisma migrate dev --name <description>` for local development migrations
- Never manually edit files in `prisma/migrations/`
- Use `DIRECT_URL` alongside `DATABASE_URL` for Vercel (required for connection pooling via PgBouncer/Supabase/Neon)

#### shadcn/ui Conventions
- Add components with `pnpm dlx shadcn@latest add <component>`
- Never modify files in `components/ui/` directly — extend by wrapping in a new component
- Use shadcn `Form` + `react-hook-form` + Zod for all admin forms

#### Environment Variables
Required variables (document in `.env.example`):
- `DATABASE_URL` — PostgreSQL connection string (pooled on Vercel)
- `DIRECT_URL` — direct (non-pooled) connection string for Prisma migrations
- `NEXTAUTH_SECRET` — random secret for Auth.js session signing
- `NEXTAUTH_URL` — full base URL (e.g., `http://localhost:3000` locally)

#### Constraints
Hard rules:
- Never commit `.env` — only `.env.example` is committed
- Always run `pnpm build` to verify no TypeScript errors before finishing a task
- Use semantic commit messages: `feat:`, `fix:`, `chore:`, `refactor:`
- Never guess or hardcode environment-specific values — always use `process.env.*`

---

## Verification

After the file is created, open a Claude Code session in this workspace and confirm it reads the file automatically at startup (Claude will print "Reading CLAUDE.md…" in its context loading step). The file should be immediately useful for the next implementation phase: running `pnpm create next-app`.

---

## Decisions Log

| Decision | Choice | Rationale |
|---|---|---|
| Package manager | pnpm | Faster, disk-efficient, preferred for Next.js/Vercel projects |
| Admin auth | Auth.js v5 | Production-grade, extensible, supports multiple providers |
| Image storage | `/public/images/` (in-repo) | No external CDN needed initially; simple relative paths |
| AI instruction files | CLAUDE.md only | Only Claude Code/Copilot is being used |
| AGENTS.md | Skipped | Not using OpenAI Codex |
