# Integration status (frontend → backend)

Maintained by the frontend (Claude). Snapshot of how the `src/api/` client
lines up with the running backend prototype (`backend/server.js`).

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
