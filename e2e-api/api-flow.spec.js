import { test, expect } from '@playwright/test'

// These run with VITE_API_BASE_URL set, so the app talks to backend/server.js.
// Each test signs in fresh (clean browser context) → a backend session.

test('API mode: sign in + free join persists via the backend', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()

  // Gated free-join → demo sign-in (exchanged for a backend token) → resume.
  await page.goto('/membership/hilton-honors-vietnam')
  await page.getByRole('button', { name: 'Join for free' }).click()
  await page.getByRole('button', { name: 'Continue with Google' }).click()
  await expect(page.getByRole('button', { name: 'Account' })).toBeVisible()

  await page.goto('/my-benefits')
  await expect(page.getByText('Hilton Honors Vietnam').first()).toBeVisible()

  // Reload: wallet is re-fetched from GET /wallet (server-backed, not local).
  await page.reload()
  await expect(page.getByRole('button', { name: 'Account' })).toBeVisible()
  await page.goto('/my-benefits')
  await expect(page.getByText('Hilton Honors Vietnam').first()).toBeVisible()
})

test('API mode: purchase → activate grants the membership', async ({ page }) => {
  await page.goto('/membership/club-marriott-vietnam')
  await page.getByRole('button', { name: /Purchase ·/ }).click()
  await page.getByRole('button', { name: 'Continue with Google' }).click() // gated sign-in
  await page.getByRole('button', { name: 'Request purchase' }).click()

  await page.goto('/my-benefits')
  await page.getByRole('button', { name: /Orders/ }).click()
  await page.getByRole('button', { name: 'Invoice issued' }).click()
  await page.getByRole('button', { name: 'Mark paid' }).click()
  await page.getByRole('button', { name: 'Issue vouchers' }).click()

  // Activation grants the membership server-side → appears in the wallet.
  await page.getByRole('button', { name: 'Voucher wallet' }).click()
  await expect(page.getByText('Club Marriott Vietnam').first()).toBeVisible()
})

test('API mode: book a voucher → complete the reservation (server-backed)', async ({ page }) => {
  // Join a free program (IHG, distinct from the Hilton test to avoid shared
  // in-memory backend state colliding). Gated sign-in → backend token.
  await page.goto('/membership/ihg-one-rewards-vietnam')
  await page.getByRole('button', { name: 'Join for free' }).click()
  await page.getByRole('button', { name: 'Continue with Google' }).click()
  await expect(page.getByRole('button', { name: 'Account' })).toBeVisible()

  // Request a booking — POST /reservations on the real backend.
  await page.goto('/my-benefits')
  await page.getByRole('button', { name: 'Request booking' }).first().click()
  await expect(page.getByText('New reservation request')).toBeVisible()
  await page.locator('[data-cal-state="available"]').first().click() // pick an available date
  await page.getByRole('button', { name: 'Create request' }).click()

  // Complete it — PATCH /reservations/:id/status → completed.
  await page.getByRole('button', { name: /Reservations/ }).click()
  await page.getByRole('button', { name: 'Mark completed' }).click()
  await expect(page.getByText('Completed').first()).toBeVisible()

  // Reload: the completed reservation is re-fetched from the backend, not local.
  await page.reload()
  await page.goto('/my-benefits')
  await page.getByRole('button', { name: /Reservations/ }).click()
  await expect(page.getByText('Completed').first()).toBeVisible()
})


test('Admin API: guard + manage orders, reservations, assistance, settlements', async ({ request }) => {
  const api = 'http://localhost:8787/api/v1'
  const signIn = async (credential) => {
    const res = await request.post(`${api}/auth/google`, { data: { credential } })
    expect(res.ok()).toBeTruthy()
    return res.json()
  }
  const auth = (token) => ({ Authorization: `Bearer ${token}` })

  const member = await signIn('frontdesk-user')
  const admin = await signIn('demo-google-user')

  const forbidden = await request.get(`${api}/admin/orders`, { headers: auth(member.accessToken) })
  expect(forbidden.status()).toBe(403)
  expect((await forbidden.json()).code).toBe('ADMIN_REQUIRED')

  const orderRes = await request.post(`${api}/orders`, { headers: auth(member.accessToken), data: { membershipId: 'club-marriott-vietnam', buyerName: 'Front Desk', buyerEmail: 'frontdesk@example.com', city: 'ho-chi-minh' } })
  expect(orderRes.status()).toBe(201)
  const order = await orderRes.json()
  for (const status of ['invoiced', 'paid', 'activated']) {
    const res = await request.patch(`${api}/admin/orders/${order.id}/status`, { headers: auth(admin.accessToken), data: { status } })
    expect(res.ok()).toBeTruthy()
    expect((await res.json()).status).toBe(status)
  }
  const walletRes = await request.get(`${api}/wallet`, { headers: auth(member.accessToken) })
  expect((await walletRes.json()).memberships.some((item) => item.id === 'club-marriott-vietnam')).toBeTruthy()
  const reservationRes = await request.post(`${api}/reservations`, { headers: auth(member.accessToken), data: { membershipId: 'club-marriott-vietnam', templateId: 'cm-dinner', date: '2026-09-12', adults: 2, children: 0, childAges: [], hotel: 'Sheraton Saigon Grand Opera Hotel' } })
  expect(reservationRes.status()).toBe(201)
  const reservation = await reservationRes.json()
  for (const status of ['confirmed', 'completed']) {
    const res = await request.patch(`${api}/admin/reservations/${reservation.id}/status`, { headers: auth(admin.accessToken), data: { status } })
    expect(res.ok()).toBeTruthy()
    expect((await res.json()).status).toBe(status)
  }
  const assistanceRes = await request.post(`${api}/assistance-requests`, { headers: auth(member.accessToken), data: { name: 'Front Desk', contact: 'frontdesk@example.com', city: 'ho-chi-minh', requestType: 'booking', message: 'Need admin follow-up.' } })
  expect(assistanceRes.status()).toBe(201)
  const assistance = await assistanceRes.json()
  const handledRes = await request.patch(`${api}/admin/assistance-requests/${assistance.id}`, { headers: auth(admin.accessToken), data: { status: 'handled', adminNote: 'Contacted by operations.' } })
  expect(handledRes.ok()).toBeTruthy()
  expect((await handledRes.json()).adminNote).toBe('Contacted by operations.')
  const settlementRes = await request.get(`${api}/admin/settlements/summary`, { headers: auth(admin.accessToken) })
  expect((await settlementRes.json()).gmv).toBeGreaterThan(0)
})

test('Admin website: admin advances an order + sees settlement', async ({ page }) => {
  // Create an order via the consumer app (this also signs in the demo user,
  // who is the admin in this env; the token is stored in localStorage).
  await page.goto('/membership/club-marriott-vietnam')
  await page.getByRole('button', { name: /Purchase ·/ }).click()
  await page.getByRole('button', { name: 'Continue with Google' }).click() // gated sign-in
  await page.getByRole('button', { name: 'Request purchase' }).click()

  // The admin is a SEPARATE website (/admin/). Same-origin localStorage carries
  // the session, so it auto-authenticates as the admin (no 403 ADMIN_REQUIRED).
  await page.goto('/admin/')
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible() // default tab loads

  // Orders tab: the just-created order is listed; advance it via the admin API.
  await page.getByRole('button', { name: 'Orders' }).first().click()
  await expect(page.getByText('Club Marriott Vietnam').first()).toBeVisible()
  await page.getByRole('button', { name: 'Invoice issued' }).first().click()
  await expect(page.getByText('Invoice issued').first()).toBeVisible() // status badge after refetch

  // Settlement tab loads from /admin/settlements/summary.
  await page.getByRole('button', { name: 'Settlement' }).first().click()
  await expect(page.getByText('Total paid (GMV)').first()).toBeVisible()

  // Audit log tab mounts and the /admin/audit-logs call resolves (table or
  // empty state — never the error block).
  await page.getByRole('button', { name: 'Audit log' }).first().click()
  await expect(page.getByRole('heading', { name: 'Audit log' })).toBeVisible()
})
