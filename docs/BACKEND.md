# StayEasy Backend — implementation notes

Build the service described by [`api/openapi.yaml`](api/openapi.yaml). This doc
adds the detail the contract can't express. See [`/AGENTS.md`](../AGENTS.md) for
collaboration rules.

## Suggested stack (flexible)

Any stack is fine as long as it honors the contract. A lightweight default:
Node + Hono/Express (or Cloudflare Workers), Postgres (or SQLite for dev),
JWT sessions. Provide a `docker-compose` or `npm run dev` for the FE dev to run
it locally on `http://localhost:8787`.

## Data model

```
User(id, provider, email, name, picture, createdAt)
SavedMembership(userId, membershipId, createdAt)           # wallet
Reservation(id, userId, membershipId, templateId, title,
            date, adults, children, childAges[], hotel, note,
            status, createdAt)
Transfer(id, userId, membershipId, templateId, title,
         recipientName, recipientContact, message, createdAt)
Order(id, userId, membershipId, buyer{name,email,phone}, city,
      listPrice, salePrice, paidAmount, currency,
      commissionRate, commissionAmount, status, createdAt)
VoucherUsage(userId, membershipId, templateId, used)        # or derive from reservations
```

Catalog (`Membership`, `VoucherTemplate`) can be **seeded from the frontend
mock** in `src/data/memberships.js` and `src/data/voucherPacks.js` so both
sides share identical ids (e.g. `club-marriott-vietnam`, template `cm-stay2`).
Pricing/commission seed lives in the `sales` map of `memberships.js`.

## Auth flow

1. Client gets a Google ID token (GIS) and calls `POST /auth/google`.
2. Server **verifies** the token against Google's certs, upserts the user,
   issues a Bearer session token (JWT), returns `{ token, user }`.
3. Client sends `Authorization: Bearer <token>` on all `/me/*` and `/partner/*`.

(The frontend stores the token next to the auth profile under
`localStorage["stayeasy.auth"].token`.)

## Status machines (enforce server-side)

```
Reservation: requested → confirmed → completed
                       ↘ cancelled        (completed: used += 1)
Order:       requested → invoiced → paid → activated   (activated: grant membership)
                       ↘ cancelled
```

Reject illegal transitions with `409`.

## Availability (authoritative)

```
held        = count(reservations where status in [requested, confirmed])
used        = count(completed reservations)         # or VoucherUsage
transferred = count(transfers)
available   = max(0, template.quantity − used − held − transferred)
```

Reject `POST /me/reservations` and `POST /me/transfers` with `409` when
`available < 1`. Transfers also require `template.transferable === true`.

## Commission / settlement

For orders in `paid` or `activated`:
`commissionAmount = round(paidAmount × commissionRate)`.
`GET /partner/settlement` aggregates these by currency, plus order counts by
status and per-membership commission (see the schema in the contract).

## CORS

Allow the frontend origins: `http://localhost:5173` (dev) and the deployed
site (`https://bstars00-rgb.github.io`). Allow `Authorization` + `Content-Type`
headers and `GET/POST/PATCH/DELETE`.

## Parity checklist

- [ ] All paths in `openapi.yaml` implemented, response shapes match exactly.
- [ ] Google token verified; Bearer sessions; `/me/*` scoped to the user.
- [ ] Availability + status-machine rules enforced (return `409` on violation).
- [ ] CORS for the FE origins.
- [ ] Catalog seeded with the same ids as `src/data/*`.
- [ ] Local run documented (`http://localhost:8787`).
