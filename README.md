# Foodyz

A personal recipe manager built with Next.js. The whole app sits behind login — you sign in once and get both the recipe library and the CRUD screens to manage it (recipes, categories, ingredients, units), plus a personal flan (custard tart) tasting map around Lyon.

## Tech Stack

- [Next.js 16](https://nextjs.org/) (App Router, Turbopack) + React 19 + TypeScript
- [shadcn/ui](https://ui.shadcn.com/) + TailwindCSS v4
- [Prisma 6](https://www.prisma.io/) + PostgreSQL (Vercel Postgres / Prisma Accelerate)
- [Auth.js v5](https://authjs.dev/) (Credentials provider)
- [Vercel Blob](https://vercel.com/storage/blob) for photo uploads
- [pnpm](https://pnpm.io/) as the package manager

## Prerequisites

- Node.js 20+
- pnpm (`corepack enable` or `npm i -g pnpm`)
- A PostgreSQL database (pooled + direct connection strings — e.g. Vercel Postgres, Neon, Supabase)
- A Vercel Blob store, for photo uploads (recipe images, flan photos)

## Getting Started

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Copy the env template and fill in the values:

   ```bash
   cp .env.example .env
   ```

   | Variable | Description |
   |---|---|
   | `DATABASE_URL` | Postgres connection string — **local Docker dev DB** (`localhost:5433`), never production |
   | `DIRECT_URL` | Same as `DATABASE_URL` locally (used by Prisma migrations) |
   | `AUTH_SECRET` | Session signing secret — generate with `openssl rand -base64 32` |
   | `AUTH_URL` | Base URL of the app — `http://localhost:3000` locally |
   | `BLOB_READ_WRITE_TOKEN` | Vercel Blob read/write token |
   | `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Credentials for the seeded admin account |

3. Start the local databases (Docker) and seed them:

   ```bash
   pnpm db:up          # dev DB :5433 (persistent) + test DB :5434 (disposable, used by e2e)
   pnpm db:setup       # migrate + seed dev DB: ~60 recipes, tags, 9 flans / 7 Lyon locations, admin user
   pnpm db:test:setup  # same for the test DB (uses .env.test; Playwright does this DB's reads/writes)
   ```

   Local dev and e2e never use the production database. Production connection strings live only in
   Vercel (and `.env.production.local`, loaded by `next build`/`next start` only — `vercel env pull` to refresh).
   `prisma/seed.ts` and Playwright refuse to run against a non-local host (`prisma/guard.ts`).

4. Start the dev server:

   ```bash
   pnpm dev
   ```

   Visit [http://localhost:3000](http://localhost:3000) and log in with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` you set above.

## Available Scripts

```bash
pnpm dev              # start dev server (Turbopack)
pnpm build            # production build — verifies no TypeScript errors
pnpm start            # run the production build
pnpm lint             # run ESLint
pnpm type-check       # tsc --noEmit

pnpm db:migrate       # prisma migrate dev
pnpm db:generate      # prisma generate (run after every schema change)
pnpm db:studio        # open Prisma Studio
pnpm db:seed          # run prisma/seed.ts
pnpm db:reset         # prisma migrate reset
pnpm db:up / db:down  # start / stop local Docker Postgres (dev + test)
pnpm db:setup         # migrate deploy + seed the dev DB
pnpm db:test:setup    # migrate deploy + seed the test DB
pnpm db:test:reset    # wipe + re-seed the test DB

pnpm test             # run unit tests (Vitest)
pnpm test:watch       # unit tests in watch mode
pnpm test:e2e         # run e2e tests (Playwright)
pnpm test:e2e:ui      # e2e tests in UI mode
```

## Project Structure

See [CLAUDE.md](./CLAUDE.md) for a full breakdown of the folder structure, database schema, and architecture conventions used in this project.

## Deployment

Deployed on Vercel. Set the same environment variables from `.env.example` in the Vercel project settings, and make sure `DIRECT_URL` points to a non-pooled connection (required for Prisma migrations to run against a pooler like PgBouncer/Prisma Accelerate).
