import { test, expect } from '@playwright/test'

// Full purchase BM flow: buy a paid membership through StayEasy, advance the
// order to activation (payment is settled at the brand), and confirm the
// wallet is granted and the commission is recorded.
test('purchase a paid membership and earn commission', async ({ page }) => {
  await page.goto('/membership/club-marriott-vietnam')

  // The voucher pack preview and discounted purchase CTA are shown.
  await expect(page.getByText("What's included")).toBeVisible()
  await page.getByRole('button', { name: /Purchase ·/ }).click()

  // Purchase modal: brand-invoice notice + buyer details.
  await expect(page.getByText(/hotel brand via their invoice/)).toBeVisible()
  await page.getByPlaceholder('Name', { exact: true }).fill('Test Buyer')
  await page.getByRole('button', { name: 'Request purchase' }).click()

  // Drive the order: requested -> invoiced -> paid -> activated.
  await page.goto('/my-benefits')
  await page.getByRole('button', { name: /Orders/ }).click()
  await page.getByRole('button', { name: 'Invoice issued' }).click()
  await page.getByRole('button', { name: 'Mark paid' }).click()
  await page.getByRole('button', { name: 'Issue vouchers' }).click()

  // Internal settlement reflects the commission (₫4,200,000 × 12% = 504,000).
  await expect(page.getByText(/Commission earned/)).toBeVisible()
  await expect(page.getByText(/504,000/)).toBeVisible()

  // Activation granted the membership to the wallet.
  await page.getByRole('button', { name: 'Voucher wallet' }).click()
  await expect(page.getByText('Club Marriott Vietnam').first()).toBeVisible()
})
