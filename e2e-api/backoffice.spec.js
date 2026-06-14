import { test, expect } from '@playwright/test'

// Back-office backend contract guard (Codex's /admin/* APIs). Runs against the
// DB-backed backend booted by playwright.api.config.js (ADMIN_EMAILS set there).
// Admin = demo-google-user; stranger = frontdesk-user (no role → 403).
const api = 'http://localhost:8787/api/v1'
const unwrap = (j) => (j && typeof j === 'object' && 'data' in j && 'error' in j ? j.data : j)
const arr = (x) => (Array.isArray(x) ? x : x?.items || x?.data || [])

async function signIn(request, credential) {
  const res = await request.post(`${api}/auth/google`, { data: { credential } })
  return unwrap(await res.json())
}

test('back-office: auth/role guards + dashboard/catalog/availability/holidays/settlement/CSV', async ({ request }) => {
  const admin = await signIn(request, 'demo-google-user')
  const stranger = await signIn(request, 'frontdesk-user')
  const AH = { Authorization: `Bearer ${admin.accessToken}` }
  const SH = { Authorization: `Bearer ${stranger.accessToken}` }

  // Guards
  expect((await request.get(`${api}/admin/orders`)).status()).toBe(401) // no token
  expect((await request.get(`${api}/admin/orders`, { headers: SH })).status()).toBe(403) // no role

  // Dashboard / KPI
  const dash = await request.get(`${api}/admin/dashboard`, { headers: AH })
  expect(dash.status()).toBe(200)
  const d = unwrap(await dash.json())
  expect(d).toHaveProperty('gmv')
  expect(d.orders).toHaveProperty('byStatus')

  // Catalog (seeded from src/data with identical ids)
  const mem = await request.get(`${api}/admin/memberships`, { headers: AH })
  expect(mem.status()).toBe(200)
  expect(arr(unwrap(await mem.json())).map((m) => m.id)).toContain('club-marriott-vietnam')
  // catalog mutation is admin-only → stranger blocked
  expect((await request.post(`${api}/admin/memberships`, { headers: SH, data: { id: 'x', name: 'X' } })).status()).toBe(403)

  // Members
  expect((await request.get(`${api}/admin/users`, { headers: AH })).status()).toBe(200)

  // Availability: public read + admin read/write
  const pub = await request.get(`${api}/vouchers/cm-dinner/availability`)
  expect(pub.status()).toBe(200)
  expect(unwrap(await pub.json())).toHaveProperty('daysOfWeek')
  expect((await request.get(`${api}/admin/vouchers/cm-fnb50/availability`, { headers: AH })).status()).toBe(200)
  expect((await request.put(`${api}/admin/vouchers/cm-fnb50/availability`, { headers: AH, data: { daysOfWeek: [1, 2, 3, 4, 5], minLeadDays: 0, maxAdvanceDays: 120, blackouts: [] } })).status()).toBe(200)
  expect((await request.put(`${api}/admin/vouchers/cm-fnb50/availability`, { headers: SH, data: {} })).status()).toBe(403)

  // Holidays + audit + settlement
  expect((await request.get(`${api}/admin/holidays`, { headers: AH })).status()).toBe(200)
  expect((await request.get(`${api}/admin/audit-logs`, { headers: AH })).status()).toBe(200)
  expect((await request.get(`${api}/admin/settlements/summary`, { headers: AH })).status()).toBe(200)

  // CSV report
  const csv = await request.get(`${api}/admin/reports/orders.csv`, { headers: AH })
  expect(csv.status()).toBe(200)
  expect(csv.headers()['content-type'] || '').toContain('csv')
})

test('back-office: server-side booking availability enforcement (DATE_NOT_AVAILABLE)', async ({ request }) => {
  const admin = await signIn(request, 'demo-google-user')
  const AH = { Authorization: `Bearer ${admin.accessToken}` }
  // Own a weekday-only voucher (ihg-dining20).
  await request.post(`${api}/wallet/memberships`, { headers: AH, data: { membershipId: 'ihg-one-rewards-vietnam' } })

  // Next Saturday ~2 weeks out (deterministic future weekend).
  const d = new Date()
  d.setDate(d.getDate() + 14)
  while (d.getDay() !== 6) d.setDate(d.getDate() + 1)
  const saturday = d.toISOString().slice(0, 10)

  const res = await request.post(`${api}/reservations`, {
    headers: AH,
    data: { membershipId: 'ihg-one-rewards-vietnam', templateId: 'ihg-dining20', date: saturday, adults: 2, children: 0, childAges: [], hotel: 'x' },
  })
  expect(res.status(), 'weekday-only voucher on a Saturday must be rejected').toBe(409)
  expect(unwrap(await res.json()).code).toBe('DATE_NOT_AVAILABLE')
})

test('back-office: create a voucher (auto-gets availability) then delete it', async ({ request }) => {
  const admin = await signIn(request, 'demo-google-user')
  const AH = { Authorization: `Bearer ${admin.accessToken}` }
  const tpl = 'qa-new-voucher'
  const mId = 'hilton-honors-vietnam'

  const created = await request.post(`${api}/admin/memberships/${mId}/vouchers`, {
    headers: AH,
    data: { templateId: tpl, title: 'QA Test Voucher', category: 'dining', quantity: 5, validUntil: '2026-12-31', description: 'QA description', note: 'QA note' },
  })
  expect(created.status(), 'create voucher → 201').toBe(201)

  // It appears in the membership's vouchers, with the description we sent...
  const list = arr(unwrap(await (await request.get(`${api}/admin/memberships/${mId}/vouchers`, { headers: AH })).json()))
  const mine = list.find((v) => v.templateId === tpl)
  expect(mine, 'created voucher is listed').toBeTruthy()
  expect(mine.description).toBe('QA description')
  // ...and an availability rule was auto-created (so it shows in the Availability tab).
  const av = await request.get(`${api}/admin/vouchers/${tpl}/availability`, { headers: AH })
  expect(av.status(), 'new voucher has an availability rule').toBe(200)
  expect(unwrap(await av.json())).toHaveProperty('daysOfWeek')

  // Edit it (PATCH) — title + quantity change persists.
  const patched = await request.patch(`${api}/admin/vouchers/${tpl}`, { headers: AH, data: { title: 'QA Edited', quantity: 9 } })
  expect(patched.status(), 'update voucher → 200').toBe(200)
  const after = unwrap(await patched.json())
  expect(after.title).toBe('QA Edited')
  expect(after.quantity).toBe(9)

  // Clean up.
  expect((await request.delete(`${api}/admin/vouchers/${tpl}`, { headers: AH })).ok()).toBeTruthy()
})

test('catalog sync: an admin-created voucher appears in the consumer app', async ({ page, request }) => {
  const admin = await signIn(request, 'demo-google-user')
  const AH = { Authorization: `Bearer ${admin.accessToken}` }
  const tpl = 'qa-consumer-voucher'
  const title = 'QA Consumer Voucher 7788'
  await request.post(`${api}/admin/memberships/hilton-honors-vietnam/vouchers`, {
    headers: AH,
    data: { templateId: tpl, title, category: 'dining', quantity: 3, validUntil: '2026-12-31', description: 'Shown to users' },
  })
  try {
    // Consumer app (API mode) hydrates the catalog from the backend → the new
    // voucher shows on the membership detail page (admin → consumer is connected).
    await page.goto('/membership/hilton-honors-vietnam')
    await expect(page.getByText(title)).toBeVisible({ timeout: 15000 })
  } finally {
    await request.delete(`${api}/admin/vouchers/${tpl}`, { headers: AH })
  }
})
