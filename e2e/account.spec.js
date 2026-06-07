import { test, expect } from '@playwright/test'

// Per-account data isolation: a signed-in user's wallet is separate from the
// guest's, and persists across sign-out / sign-in for the same account.
test('account data is isolated from guest and persists', async ({ page }) => {
  // Sign in (demo) via the gated join, adding Hilton to the account wallet.
  await page.goto('/membership/hilton-honors-vietnam')
  await page.getByRole('button', { name: 'Join for free' }).click()
  await page.getByRole('button', { name: 'Continue with Google' }).click()
  await page.goto('/my-benefits')
  await expect(page.getByText('Hilton Honors Vietnam').first()).toBeVisible()

  // Sign out → the guest wallet is empty (isolated from the account).
  await page.getByRole('button', { name: 'Account' }).click()
  await page.getByRole('button', { name: 'Sign out' }).click()
  await page.goto('/my-benefits')
  await expect(page.getByText('Add a membership to fill your voucher wallet.')).toBeVisible()

  // Sign back in (same demo account) → the account's data is restored.
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.getByRole('button', { name: 'Continue with Google' }).click()
  await page.goto('/my-benefits')
  await expect(page.getByText('Hilton Honors Vietnam').first()).toBeVisible()
})
