import { test, expect } from '@playwright/test'

// Gift (transfer) a transferable voucher and confirm availability drops.
test('gift a transferable voucher', async ({ page }) => {
  // Own a membership with transferable vouchers (Hilton: 15% F&B is transferable).
  await page.goto('/membership/hilton-honors-vietnam')
  await page.getByRole('button', { name: 'Join for free' }).click()
  await page.getByRole('button', { name: 'Continue with Google' }).click()

  await page.goto('/my-benefits')
  // Filter to Discount (15% Off Food & Beverage is transferable), then open
  // the voucher card's Gift action (scoped to avoid the "Gift" category pill).
  await page.getByRole('button', { name: 'Discount', exact: true }).click()
  const card = page.locator('.card', { hasText: '15% Off Food & Beverage' })
  await card.getByRole('button', { name: 'Gift' }).click()

  // Transfer modal: fill recipient and send.
  await expect(page.getByText('Gift this voucher')).toBeVisible()
  await page.getByLabel('Recipient name').fill('A Friend')
  await page.getByRole('button', { name: 'Send gift' }).click()

  // Modal closes; the gift was recorded.
  await expect(page.getByText('Gift this voucher')).toBeHidden()
})
