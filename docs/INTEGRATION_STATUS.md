# Integration status (frontend → backend)

Maintained by the frontend (Claude). Snapshot of how the `src/api/` client
lines up with the running backend prototype (`backend/server.js`).

> **2026-06-14 — Backend ownership moved to Claude; normalized backend ported to
> the deploy repo.** The `StayEasy/backend/` implementation (the one this repo's
> `e2e:api` suite validates) was ported into `bstars00-rgb/StayEasy-BackEnd`
> (`server.js` + `db.js` + `src/` seed; commit `886de1c`). It replaces the old
> `app_state` prototype with the normalized schema, voucher `i18n` persistence,
> server-side reservation availability (`409 DATE_NOT_AVAILABLE`), and
> admin/operator roles. CI smoke is green. **Pending (owner action):** trigger a
> Render redeploy (Manual Deploy, or set `RENDER_DEPLOY_HOOK_URL`) and add the
> `OPERATOR_EMAILS` env var. `DATABASE_URL` (Supabase pooler) + `ADMIN_EMAILS`
> are already live (old backend reports `persistence:postgres`). After redeploy,
> live `/api/v1/health` should report `service:"ohmyselect-backend"`.

_Last checked: 2026-06-07 — **frontend wired to the API and verified.**_

## ✅ Connected & verified (backend prototype, port 8787)

The frontend now routes through the API when `VITE_API_BASE_URL` is set
(`AppContext`/`AuthContext` call `src/api/*` instead of localStorage). The full
flow was verified over HTTP via `/api/v1` (12/12 checks):

- `POST /auth/google` → session token
- `GET /memberships?city=` filter
- `POST /wallet/memberships` + `GET /wallet` (membership + vouchers)
- `POST /reservations` → held=1, available−1
- `PATCH /reservations/:id/status` → completed → used+1
- `POST /orders` → commissionAmount 504,000 ; status → activated grants membership
- `GET /settlements/summary` ; `POST /transfers`

The prototype **accepts both `/api/v1` and root** (it strips the prefix) and
returns **bare JSON**; the client's adaptive layer handles both, so the default
`VITE_API_PREFIX=/api/v1` works as-is.

### Run in API mode (local)
```
npm run backend                                   # http://localhost:8787
# new shell (PowerShell):
$env:VITE_API_BASE_URL="http://localhost:8787"; npm run dev
# bash:
VITE_API_BASE_URL=http://localhost:8787 npm run dev
```
Offline demo is unchanged when `VITE_API_BASE_URL` is empty.

## ⚠️ Mismatches to reconcile (spec ↔ prototype)

`docs/BACKEND_API_SPEC.md` is the source of truth; the prototype currently
diverges on two points. Pick one side and align both:

| Topic | Spec (`BACKEND_API_SPEC.md`) | Prototype (`backend/server.js`) |
|---|---|---|
| Path prefix | `/api/v1/...` | root, e.g. `/memberships` |
| Response shape | `{ data, meta, error }` envelope | bare JSON (array/object); errors `{ code, message, details }` |

**Frontend bridge (already in place, no backend change required to test):**
- `VITE_API_PREFIX` (default `/api/v1`) — set to empty to target the prototype:
  `VITE_API_BASE_URL=http://localhost:8787 VITE_API_PREFIX= npm run dev`
- The client unwraps the `{data,error}` envelope when present and accepts bare
  responses otherwise, and reads errors from either `{error:{...}}` or bare
  `{code,message}`.

**Suggested resolution:** decide envelope vs bare and prefix vs root in
`BACKEND_API_SPEC.md`, then the backend conforms and the frontend can drop the
compatibility shims. Frontend has no preference — it follows the spec.

## Endpoints the frontend client expects (per spec)

auth: `POST /auth/google` · `GET /me` · `POST /auth/logout`
catalog: `GET /cities` · `GET /memberships` · `GET /memberships/:id` · `GET /memberships/compare?ids=`
wallet: `GET /wallet` · `POST /wallet/memberships` · `DELETE /wallet/memberships/:id` · `GET /wallet/vouchers`
reservations: `GET/POST /reservations` · `PATCH /reservations/:id/status` · `DELETE /reservations/:id`
orders: `GET/POST /orders` · `PATCH /orders/:id/status` · `GET /settlements/summary`
transfers: `GET/POST /transfers` · assistance: `POST /assistance-requests` · quiz: `POST /recommendations/quiz`

## Back-office API added by Codex (2026-06-09)

Backend-only expansion for the standalone `/admin/` UI. Existing consumer read
shapes and existing admin endpoints remain compatible.

New/expanded endpoints:

- `GET /admin/me`
- `GET /admin/dashboard?from=&to=`
- `GET /admin/audit-logs?from=&to=&actor=&page=&pageSize=`
- `GET/POST /admin/memberships`
- `GET/PATCH/DELETE /admin/memberships/:id`
- `GET/POST /admin/memberships/:id/vouchers`
- `PATCH/DELETE /admin/vouchers/:templateId`
- `GET /admin/vouchers/:templateId/usage`
- `GET/PUT /admin/vouchers/:templateId/availability`
- `GET /vouchers/:templateId/availability`
- `GET/POST /admin/holidays`
- `PATCH/DELETE /admin/holidays/:id`
- `GET /admin/users`
- `GET /admin/users/:id`
- `GET /admin/reports/orders.csv`
- `GET /admin/reports/settlements.csv`
- `GET /admin/assistance-requests?status=&q=&page=&pageSize=` now supports filters/pagination; no-query response stays an array for current UI compatibility.
- `GET /admin/settlements/summary?from=&to=&brand=` now includes `byBrand` and `byPeriod` while preserving existing summary fields.

Permissions:

- `ADMIN_EMAILS`: full admin, including catalog, holidays, availability, order status, and CSV/report access.
- `OPERATOR_EMAILS`: read plus order/reservation/CS status actions. Catalog, voucher, availability, and holiday writes return 403. `ADMIN_EMAILS` wins when an email is in both lists.

Voucher i18n persistence (2026-06-14):

- `POST /admin/memberships/:id/vouchers` and `PATCH /admin/vouchers/:templateId`
  persist optional inline `i18n` translations for `ko`, `vi`, `zh`, and `ja`.
- `GET /admin/memberships/:id/vouchers` echoes `i18n`.
- Public `GET /memberships/:id` includes the same `i18n` on `vouchers[]`, so the
  consumer app can hydrate admin-authored translations without a frontend shape change.

Reservation date authority now lives on the backend. `POST /reservations` rejects unavailable dates with
409 `DATE_NOT_AVAILABLE` and details such as `{ reason: "blackout", holidayKey: "tet" }`.
CORS preflight remains enabled for `Authorization, Content-Type`.

## Live persistence status (2026-06-09)

Render live backend is connected to Supabase Postgres when `/api/v1/health`
returns:

```json
{ "ok": true, "service": "stayeasy-backend", "persistence": "postgres" }
```

Working Render `DATABASE_URL` format:

```text
postgresql://postgres.ijqvaslluqpkndxflifq:<DB_PASSWORD>@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres
```

Use the Supabase Transaction pooler on Render. The direct host
`db.ijqvaslluqpkndxflifq.supabase.co:5432` can resolve to IPv6 and fail from
Render with `ENETUNREACH`.

Current deploy repo persistence is intentionally prototype-level: it stores the
running app snapshot in Postgres so admin/demo data survives deploys. The next
backend step is migrating that state into the normalized tables described in
`DATABASE_SCHEMA.md` while keeping all existing frontend/admin API shapes
unchanged.
