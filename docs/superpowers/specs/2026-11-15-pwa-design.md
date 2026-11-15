# PWA completion — design

## Intent
Make Foodyz a proper installable PWA that still opens recipes in a bad-wifi kitchen.

## Goals / non-goals
- Goals: richer manifest, install affordance (Android prompt + iOS hint), small hand-written service worker: precached shell/icons, recently viewed recipe pages available offline, offline fallback page.
- Non-goals: offline editing/mutations, push notifications, background sync, manifest screenshots, new npm dependencies.
- Anti-goals: serving one user's cached private pages to another session after logout; caching auth/redirect responses; SW active in `next dev`.

## Approaches
1. `@serwist/next` — rejected: webpack-oriented, Next 16 uses Turbopack by default; extra dependency.
2. Next experimental `useOffline` — rejected: soft-nav only, no full-reload offline, experimental.
3. **Chosen:** hand-written `public/sw.js` + `public/offline.html`, registered client-side in production only.

## Design
- Manifest: add `id`, `scope`, `lang`, `orientation`, `categories`, `shortcuts` (New recipe, Flans); `theme_color` aligned with viewport `themeColor` (#EDF1E8).
- `public/sw.js`: cache-first `/_next/static/*` + icons; network-first for document navigations, cache only `ok && !redirected` GETs of `/recipes`, `/recipes/<slug>`, `/flan`; fallback cached page else `/offline.html`; never touch non-GET, `/api/*`, `/login`, RSC requests. Versioned caches, old ones deleted on activate; `message {type:"CLEAR_CACHES"}` wipes all.
- Proxy matcher exempts `sw.js` and `offline.html` (SW script and fallback must load without session).
- `SwRegister` client component (root layout, production only) registers `/sw.js`; logout sends CLEAR_CACHES before sign-out.
- Install: `use-install-prompt` hook (captures `beforeinstallprompt`, detects iOS Safari non-standalone, dismissal in localStorage `foodyz:install-dismissed`), surfaced as an "Install app" item in `MoreSheet`.
- Response headers for `/sw.js`: `Cache-Control: no-cache, no-store, must-revalidate`, JS content type.
