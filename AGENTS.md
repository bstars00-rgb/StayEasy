# AGENTS.md — StayEasy collaboration guide

This repo is built by **two agents in parallel**:

- **Frontend (Claude Code)** — the React app in this repo (already built).
- **Backend (Codex)** — a separate service that implements the API in
  [`docs/api/openapi.yaml`](docs/api/openapi.yaml).

The **OpenAPI file is the single source of truth.** Neither side changes the
contract unilaterally — propose a change in a PR that touches `openapi.yaml`
first, then both sides adapt.

---

## What StayEasy is

A premium hotel-membership app: discover memberships by city, buy them
(payment is settled **at the hotel brand**, StayEasy earns a commission),
hold the resulting vouchers in a wallet, request bookings, gift vouchers, and
view a partner settlement dashboard. Frontend is mobile-first React + Vite +
Tailwind, 5 languages, currently fully on `localStorage`.

## Repo layout (frontend)

| Path | Purpose |
|---|---|
| `src/data/` | Mock catalog (memberships, voucher packs, cities) — becomes API responses |
| `src/utils/storage.js` | **Local data adapter** (localStorage) — the seam to replace |
| `src/api/` | **Remote data adapter**: `httpClient.js` + `stayeasyApi.js` (mirrors OpenAPI) |
| `src/context/AppContext.jsx` | Single source of app state; all pages read/write here |
| `src/context/AuthContext.jsx` | Sign-in/out + `requireAuth` gating + per-account scope |
| `docs/api/openapi.yaml` | **API contract (shared)** |
| `docs/BACKEND.md` | Backend implementation notes (data model, rules, status machines) |

## The integration seam

Today the app calls `src/utils/storage.js`. The backend equivalent lives in
`src/api/stayeasyApi.js` (already written against the contract). The switch is
gated by env:

```
VITE_API_BASE_URL=https://localhost:8787   # backend origin
VITE_USE_API=true                          # route through the API
VITE_GOOGLE_CLIENT_ID=...                   # real Google sign-in
```

Frontend's job when the backend is ready: make `AppContext` call `api.*`
(from `stayeasyApi.js`) instead of `storage.*` when `USE_API` is true. The
function names already line up 1:1, so this is a thin adapter swap.

## Division of labor

**Backend (Codex) owns**
- Implement every path in `docs/api/openapi.yaml`.
- Auth: verify the Google ID token server-side, issue a Bearer session token.
- Persistence (DB) for: users, saved memberships, reservations, transfers,
  orders, voucher usage. Catalog (memberships + voucher packs) may be seeded
  from `src/data/*` initially.
- Enforce the **business rules** below server-side (don't trust the client).
- Provide CORS for the frontend origin and the dev server (`http://localhost:5173`).
- Keep responses matching the OpenAPI schemas exactly (field names/shapes).

**Frontend (Claude) owns**
- Keep `src/api/stayeasyApi.js` in sync with the contract.
- Wire `AppContext`/`AuthContext` to the API behind `VITE_USE_API`.
- UI, i18n, theme, tests.

## Business rules (must hold on the server)

- **Voucher availability** = `quantity − used − held − transferred`
  (`held` = reservations in `requested`/`confirmed`). Reject create when 0.
- **Reservation status**: `requested → confirmed → completed | cancelled`.
  Reaching `completed` consumes one voucher (`used += 1`).
- **Transfer**: only `transferable` vouchers; consumes one unit.
- **Order status**: `requested → invoiced → paid → activated | cancelled`.
  `activated` grants the membership to the wallet.
- **Commission** = `paidAmount × commissionRate` (paid/activated orders only).
  Payment is collected by the brand; StayEasy records the commission.
- **Per-account isolation**: all `/me/*` data is scoped to the bearer user.

## Commands

```
npm install
npm run dev      # http://localhost:5173
npm run build
npm run test     # Vitest unit
npm run e2e      # Playwright (npx playwright install chromium once)
```

CI runs `npm run test` before deploying to GitHub Pages.

## Conventions / Definition of Done

- Don't break the offline demo: with `VITE_USE_API` unset, the app must still
  run on localStorage.
- Any contract change = edit `openapi.yaml` + `src/api/stayeasyApi.js` together.
- Keep PRs small and green (`npm run build` + `npm run test` pass).
- Commit style: imperative subject; end with the Co-Authored-By trailer.
- Backend repo: keep its own README with run/seed/test instructions and point
  back to this contract.
