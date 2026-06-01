import { test, expect } from '@playwright/test'

// Free membership join + voucher booking flow: join a free program, request a
// booking for one of its vouchers, then complete it.
test('join a free membership and book a voucher', async ({ page }) => {
  await page.goto('/membership/hilton-honors-vietnam')

  // Free programs are joined instantly (no purchase).
  await page.getByRole('button', { name: 'Join for free' }).click()

  // Wallet now holds the membership's vouchers.
  await page.goto('/my-benefits')
  await expect(page.getByText('Hilton Honors Vietnam').first()).toBeVisible()

  // Request a booking on the first available voucher.
  await page.getByRole('button', { name: 'Request booking' }).first().click()
  await expect(page.getByText('New reservation request')).toBeVisible()
  await page.getByRole('button', { name: 'Create request' }).click()

  // It appears under Reservations; complete it.
  await page.getByRole('button', { name: /Reservations/ }).click()
  await page.getByRole('button', { name: 'Mark completed' }).click()
  await expect(page.getByText('Completed').first()).toBeVisible()
})
