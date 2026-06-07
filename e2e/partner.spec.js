import { test, expect } from '@playwright/test'

// Partner dashboard aggregates orders and shows commission after a sale.
test('partner dashboard shows sales after an activated order', async ({ page }) => {
  // Purchase Club Marriott and drive the order to activated (signs in along the way).
  await page.goto('/membership/club-marriott-vietnam')
  await page.getByRole('button', { name: /Purchase ·/ }).click()
  await page.getByRole('button', { name: 'Continue with Google' }).click()
  await page.getByRole('button', { name: 'Request purchase' }).click()
  await page.goto('/my-benefits')
  await page.getByRole('button', { name: /Orders/ }).click()
  await page.getByRole('button', { name: 'Invoice issued' }).click()
  await page.getByRole('button', { name: 'Mark paid' }).click()
  await page.getByRole('button', { name: 'Issue vouchers' }).click()

  // Open the partner dashboard from the account menu.
  await page.getByRole('button', { name: 'Account' }).click()
  await page.getByRole('button', { name: 'Partner dashboard' }).click()

  await expect(page.getByText('Partner Dashboard')).toBeVisible()
  // Commission earned (₫4,200,000 × 12% = 504,000) appears.
  await expect(page.getByText(/504,000/).first()).toBeVisible()
})
