import { test, expect } from '@playwright/test'

// Free membership join + voucher booking flow: join a free program, request a
// booking for one of its vouchers, then complete it.
test('join a free membership and book a voucher', async ({ page }) => {
  await page.goto('/membership/hilton-honors-vietnam')

  // Joining is gated: sign in (demo) first, which resumes the free join.
  await page.getByRole('button', { name: 'Join for free' }).click()
  await page.getByRole('button', { name: 'Continue with Google' }).click()

  // Wallet now holds the membership's vouchers.
  await page.goto('/my-benefits')
  await expect(page.getByText('Hilton Honors Vietnam').first()).toBeVisible()

  // Request a booking on the first available voucher.
  await page.getByRole('button', { name: 'Request booking' }).first().click()
  await expect(page.getByText('New reservation request')).toBeVisible()

  // Party: 2 adults + 1 child with an age dropdown.
  await page.getByLabel('Children').fill('1')
  await expect(page.getByLabel('Child 1 age')).toBeVisible()
  await page.getByLabel('Child 1 age').selectOption('5')

  await page.getByRole('button', { name: 'Create request' }).click()

  // It appears under Reservations; complete it.
  await page.getByRole('button', { name: /Reservations/ }).click()
  await page.getByRole('button', { name: 'Mark completed' }).click()
  await expect(page.getByText('Completed').first()).toBeVisible()
})
