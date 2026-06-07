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
