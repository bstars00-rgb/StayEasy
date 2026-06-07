# AGENTS.md — StayEasy (Claude × Codex)

A **monorepo** built by two agents in parallel. Roles and shared docs are
defined in [`docs/COLLABORATION_PLAN.md`](docs/COLLABORATION_PLAN.md).

| Agent | Owns |
|---|---|
| **Claude** (frontend) | React app (`src/`, `index.html`), UI/UX, i18n, theme, the API **client layer** (`src/api/`), tests |
| **Codex** (backend) | `backend/`, API + DB, Google token verification, status/inventory rules, settlement, QA |

## Source of truth

- **API contract:** [`docs/BACKEND_API_SPEC.md`](docs/BACKEND_API_SPEC.md) — neither
  side changes shapes/paths unilaterally; propose in a PR touching that file.
- DB: [`docs/DATABASE_SCHEMA.md`](docs/DATABASE_SCHEMA.md) · FE integration:
  [`docs/CLAUDE_FRONTEND_INTEGRATION_GUIDE.md`](docs/CLAUDE_FRONTEND_INTEGRATION_GUIDE.md) ·
  backend order: [`docs/BACKEND_TASKS.md`](docs/BACKEND_TASKS.md) · QA:
  [`docs/QA_CHECKLIST.md`](docs/QA_CHECKLIST.md)

## How the two halves connect

- Backend serves the contract under **`/api/v1`** with a `{ data, meta, error }`
  envelope and `Authorization: Bearer <accessToken>`.
- Frontend client mirrors it in **`src/api/`** (`client.js` + per-resource
  modules `auth/catalog/wallet/reservations/orders/transfers/assistance/recommendations`).
  Keep these in sync with `BACKEND_API_SPEC.md`.
- **Switch:** when `VITE_API_BASE_URL` is set, `USE_API` is true and the app
  should call `api.*` instead of `src/utils/storage.js`. With it empty the app
  stays fully on `localStorage` (offline demo must keep working).
- The backend **reuses shared modules** from the frontend: `src/data/*`
  (catalog seed) and `src/utils/vouchers.js` (`voucherStats`,
  `OPEN_RESERVATION_STATUSES`). Do not break those exports.

## Run

```
npm install
npm run dev       # frontend  → http://localhost:5173
npm run backend   # backend   → http://localhost:8787  (in-memory)
npm run test      # frontend unit (Vitest)
npm run e2e       # Playwright
```

To run against the backend locally: `VITE_API_BASE_URL=http://localhost:8787 npm run dev`.

## Rules (server is authoritative)

- Voucher availability = `quantity − used − held − transferred`; reject at 0.
- Reservation: `requested → confirmed → completed | cancelled` (completed → `used += 1`).
- Order: `requested → invoiced → paid → activated | cancelled` (activated → grant membership). Status changes are operator/partner-scoped.
- Commission = `paidAmount × commissionRate` (paid/activated only); payment is at the hotel brand.
- All account data is scoped to the bearer user. Prices/commission computed server-side.

## Definition of done

- `npm run build` + `npm run test` pass; offline demo still works without the API.
- Contract changes edit `BACKEND_API_SPEC.md` **and** `src/api/*` together.
- Small, green PRs; imperative commit subjects.
