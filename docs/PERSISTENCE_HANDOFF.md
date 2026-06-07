# Persistence handoff — in-memory → DB (Codex)

Coordination note from the frontend (Claude) for the backend persistence step.
DB design lives in [`DATABASE_SCHEMA.md`](DATABASE_SCHEMA.md); the API contract is
[`BACKEND_API_SPEC.md`](BACKEND_API_SPEC.md). **Goal: swap storage to a DB with
zero frontend changes.**

## Frontend status: ready, no change required

The frontend already routes through the API when `VITE_API_BASE_URL` is set and
re-fetches `GET /wallet` after every mutation. It depends only on the API
**contract**, not on how the backend stores data. So the DB swap is invisible to
the frontend **as long as the JSON shapes stay identical**.

## Contract invariants to keep (so the FE stays unchanged)

- **Responses stay camelCase JSON** even though DB columns are snake_case
  (`paidAmount`, `commissionAmount`, `membershipId`, `templateId`, `childAges`,
  `createdAt`, …). Map columns → camelCase in the API layer.
- **Catalog ids unchanged**: membership ids (`club-marriott-vietnam`) and voucher
  `template_id`s (`cm-dinner`) must match `src/data/*` exactly. Seed from there.
- **`GET /wallet`** keeps returning `{ summary, memberships[], vouchers[],
  reservations[], orders[], transfers[] }`; vouchers keep
  `{ quantity, used, held, transferred, available }`.
- **Availability** = `quantity − used − held − transferred`
  (`held` = reservations in `requested`/`confirmed`). Enforce in a transaction
  with row locks (see schema §3).
- **Status machines** unchanged (orders / reservations) → `409 INVALID_STATUS_TRANSITION`.
- **Booking date availability** (NEW): the frontend now enforces per-voucher
  date rules (allowed weekdays, min lead time, booking window, and holiday
  blackouts — Vietnam Tết / Korea Seollal·Chuseok / Thailand Songkran) via
  `src/data/availability.js`. These are mock rules today. When persisted, the
  server should own them and **reject reservations on disallowed dates**
  (e.g. `409 DATE_NOT_AVAILABLE` with the reason), seeding from the same rule
  shape so the calendar and server agree.
- **Auth**: `POST /auth/google` returns `{ accessToken, user }`; `/me` and all
  `/wallet|reservations|orders|transfers` are scoped to the bearer user.

## ⚠️ CI / test compatibility (important)

`/.github/workflows/e2e.yml` runs **`npm run e2e:api`**, which boots
`npm run backend` in CI and exercises the real API in a browser. After the DB
swap this must keep working **without external services**. Pick one:

1. **Preferred — zero-config dev/test DB.** `npm run backend` works out of the
   box on **SQLite** (file or `:memory:`) when `DATABASE_URL` is unset, and uses
   Postgres when it is set. Then CI needs no changes.
2. **Postgres service in CI.** Keep Postgres-only; then we add a service +
   `DATABASE_URL` to the workflow (ready-to-paste):
   ```yaml
   services:
     postgres:
       image: postgres:16
       env: { POSTGRES_PASSWORD: postgres, POSTGRES_DB: stayeasy_test }
       ports: ['5432:5432']
       options: >-
         --health-cmd "pg_isready" --health-interval 10s
         --health-timeout 5s --health-retries 5
   # step env: DATABASE_URL: postgres://postgres:postgres@localhost:5432/stayeasy_test
   ```
   Tell me which you choose and I'll wire the workflow.

### Test isolation
- The demo sign-in sends a **stable** id (`demo-google-user`) → a stable user.
  With a persistent DB, state will **carry across runs**. Current `e2e:api`
  assertions are existence-based (idempotent), but please support a **clean
  test DB** (ephemeral DB, migration on boot, or a reset/seed step) so future
  data-count assertions stay reliable.
- Keep a **dev/test auth shortcut**: `POST /auth/google` should accept a
  non-verified token in dev/test (as today) so `e2e:api` runs without real
  Google. Gate real Google `sub` verification to production.

## Suggested deliverables (Codex)

- Migrations for all tables in `DATABASE_SCHEMA.md` + a **seed** from
  `src/data/{memberships,voucherPacks,cities}.js` (same ids).
- `npm run backend` reads `DATABASE_URL` (with a SQLite default per option 1).
- Local guide: `docker-compose` or SQLite; document in `docs/BACKEND_PROTOTYPE.md`.
- Transactions + row locks for reservation/transfer/complete (availability).
- Keep all responses matching `BACKEND_API_SPEC.md`.

## Definition of done

- [ ] `npm run backend` runs against the DB locally (documented).
- [ ] `npm run e2e:api` passes against the DB-backed server (locally **and** in CI).
- [ ] API JSON shapes unchanged (frontend untouched; spot-check with the
      smoke flow in `INTEGRATION_STATUS.md`).
- [ ] Catalog ids identical to `src/data/*`.
- [ ] Availability + status-machine rules enforced atomically.

When the DB backend is ready, ping me — I'll re-run `e2e:api` against it and,
if you choose Postgres-only, add the CI service block above.
