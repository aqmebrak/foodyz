# Public read-only flan map — design

## Intent
Friends can view the flan tasting map without logging in. Read-only, same view.

## Goals / non-goals
- Goal: same map/list/detail/filters UI at a public URL.
- Non-goal: any mutation, token/auth gate, indexing. Private `/flan` unchanged.
- Anti-goal: exposing any other app route or any server action unauthenticated.

## Approaches
1. Exempt `/flan` in proxy — rejected (exception on page behind security).
2. **Chosen:** new public route reusing components + dedicated read-only data fn; proxy exempts only that path.
3. Secret-token URL — rejected by owner; plain public URL.

## Design
- Route `src/app/(public)/lyon-flans/page.tsx` + bare `(public)/layout.tsx`; `robots: {index:false, follow:false}`.
- `src/proxy.ts` matcher: exempt `lyon-flans`.
- `src/lib/public-flans.ts`: `getPublicFlans()` (plain server fn, explicit Prisma `select`, `FlanItem` shape; all fields incl. comment/photo/Maps URL).
- `FlanPageClient` gets `readOnly` prop: hides Log button + QuickLogSheet, drops tab-bar height offset.
- Verify reused components call no server actions.
- Tests: Vitest for `getPublicFlans` select shape; e2e logged-out loads + no log button + noindex meta.
- Also: robots.ts disallow path; sitemap excludes it.
