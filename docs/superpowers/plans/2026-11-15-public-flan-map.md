# Public Flan Map Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Public, read-only, noindex copy of the flan tasting map at `/lyon-flans`, no login.

**Architecture:** New `(public)` route group with bare layout; page calls a dedicated non-action `getPublicFlans()` (explicit `select`) and renders existing `FlanPageClient` with `readOnly`. Proxy matcher exempts only `lyon-flans`.

**Tech Stack:** Next.js 16 (read `node_modules/next/dist/docs/` before touching proxy/metadata), Prisma 6, Vitest, Playwright, pnpm.

**Spec:** `docs/superpowers/specs/2026-11-15-public-flan-map-design.md`

## Global Constraints

- pnpm only; `@/` imports; `interface` for props.
- No token/auth gate; plain URL `/lyon-flans`; `robots: { index: false, follow: false }`.
- Private `/flan` behavior unchanged. No new server actions; no mutation reachable from the public page.
- `src/app/robots.ts` already `disallow: "/"` and sitemap is empty — leave both unchanged.
- Run `pnpm build` + `pnpm lint` + `pnpm test` before done. Commits: `feat:` prefix, end with `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.

## Review Focus

- Logged-out request to `/lyon-flans` must not redirect to `/login`.
- Logged-out request to `/flan` and `/recipes` must still redirect (matcher not over-broad, e.g. `lyon-flans-x`).
- Empty DB (zero flans) renders without crash and without "Log a flan".
- Public page exposes no edit/delete/log controls (FlanDetail, FlanList).
- Mobile sheet must not leave a gap for the absent tab bar.

---

### Task 1: Read-only data function

**Files:**
- Create: `src/lib/public-flans.ts`
- Test: `src/__tests__/lib/public-flans.test.ts`

**Interfaces:**
- Produces: `getPublicFlans(): Promise<FlanItem[]>` (`FlanItem` from `@/lib/flan-filters`). Plain async fn, NOT `"use server"`.

- [ ] **Step 1: Test** (mock `@/lib/db` like `actions/flan.test.ts`): `it("queries flans with explicit select, newest first")` asserts `db.flan.findMany` called once with `orderBy: { createdAt: "desc" }` and `select` containing exactly keys `id,name,photoUrl,rating,tried,triedAt,comment,location` where `location` is `{ select: { name: true, mapsUrl: true } }`; `it("returns rows unchanged")`; `it("returns [] when none")`.
- [ ] **Step 2:** `pnpm vitest run src/__tests__/lib/public-flans.test.ts` → FAIL (module missing).
- [ ] **Step 3:** Implement `getPublicFlans` in `src/lib/public-flans.ts` using `db` from `@/lib/db`.
- [ ] **Step 4:** rerun → PASS.
- [ ] **Step 5:** commit `feat: add read-only public flans query`.

### Task 2: `readOnly` mode on FlanPageClient

**Files:**
- Modify: `src/components/flan/FlanPageClient.tsx`

**Interfaces:**
- Produces: prop `readOnly?: boolean` (default false) on `FlanPageClientProps`; `locations` becomes optional (`locations?: PastryLocation[]`, default `[]`).

- [ ] **Step 1:** When `readOnly`, don't render the `#flan-fab-slot` block nor `QuickLogSheet`; skip `fabBottom`. Everything else unchanged. Private `/flan` call site untouched.
- [ ] **Step 2:** Confirm `FlanDetail`/`FlanList` have no edit/delete controls or action imports (already grepped: none); if any appear, hide under readOnly.
- [ ] **Step 3:** `pnpm type-check` → clean.
- [ ] **Step 4:** commit `feat: read-only mode for flan page client`.

### Task 3: Public route, layout, proxy exemption

**Files:**
- Create: `src/app/(public)/layout.tsx`, `src/app/(public)/lyon-flans/page.tsx`
- Modify: `src/proxy.ts` (matcher)
- Test: `e2e/flan-public.spec.ts`

**Interfaces:**
- Consumes: `getPublicFlans()`, `FlanPageClient readOnly`.

- [ ] **Step 1: e2e test** (no storageState: `test.use({ storageState: { cookies: [], origins: [] } })`; follow `e2e/flan-map.spec.ts` for seeding/helpers):
  - `loads logged out`: goto `/lyon-flans` → URL stays `/lyon-flans`, heading `Flan tour` visible.
  - `has no log button`: `getByRole("button", { name: "Log a flan" })` count 0.
  - `is noindex`: `meta[name="robots"]` content contains `noindex`.
  - `private routes still gated`: goto `/flan` and `/recipes` → URL matches `/login`.
- [ ] **Step 2:** run `pnpm test:e2e e2e/flan-public.spec.ts` → FAIL.
- [ ] **Step 3:** `(public)/layout.tsx`: bare wrapper (`bg-background`), plus `<style>{":root{--tabbar-h:0px}"}</style>` (sheet probe reads var from `document.body`/root, so it must be set on `:root`; removes tab-bar gap). `lyon-flans/page.tsx`: `export const dynamic = "force-dynamic"`; `metadata = { title: "Flan Tour — Lyon", robots: { index: false, follow: false } }`; server component awaits `getPublicFlans()` → `<FlanPageClient flans={flans} readOnly />`.
- [ ] **Step 4:** `src/proxy.ts`: add `lyon-flans` to the negative-lookahead as `lyon-flans$|lyon-flans/` style boundary so only that exact path is exempt (not `lyon-flans-x`); verify against Next 16 docs matcher syntax.
- [ ] **Step 5:** e2e → PASS; manually check mobile width (375px) shows sheet flush at bottom.
- [ ] **Step 6:** `pnpm lint && pnpm test && pnpm build`; update AGENTS.md (Project Structure + proxy exemptions line: add `(public)/lyon-flans`); commit `feat: public read-only flan map at /lyon-flans`.
