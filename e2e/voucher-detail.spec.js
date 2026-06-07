import { test, expect } from '@playwright/test'

// Clicking a "What's included" voucher opens its detailed description + terms.
test('voucher pack item opens a detail view', async ({ page }) => {
  await page.goto('/membership/club-marriott-vietnam')

  await expect(page.getByText("What's included")).toBeVisible()
  // Open the first voucher (Free 2-Night Stay) in the pack.
  await page.getByRole('button', { name: /Free 2-Night Stay/ }).click()

  // The detail modal shows the description and standard terms.
  await expect(page.getByText('About this benefit')).toBeVisible()
  await expect(page.getByText(/complimentary nights/i)).toBeVisible()
  await expect(page.getByText('Terms & conditions')).toBeVisible()

  // a11y: pressing Escape closes the dialog.
  await page.keyboard.press('Escape')
  await expect(page.getByText('About this benefit')).toBeHidden()
})
