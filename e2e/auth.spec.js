import { test, expect } from '@playwright/test'

// Guest gating + demo Google sign-in + persistence + resumed action.
test('guest is prompted to sign in, then the action resumes', async ({ page }) => {
  await page.goto('/')

  // Guests see a Sign in entry in the header.
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()

  // A gated action (joining a free membership) opens the sign-in modal.
  await page.goto('/membership/hilton-honors-vietnam')
  await page.getByRole('button', { name: 'Join for free' }).click()
  await expect(page.getByText('Sign in to StayEasy')).toBeVisible()

  // Demo Google sign-in completes and resumes the queued join.
  await page.getByRole('button', { name: 'Continue with Google' }).click()
  await expect(page.getByRole('button', { name: 'Account' })).toBeVisible()

  // The membership was added to the wallet by the resumed action.
  await page.goto('/my-benefits')
  await expect(page.getByText('Hilton Honors Vietnam').first()).toBeVisible()

  // Session persists across reloads.
  await page.reload()
  await expect(page.getByRole('button', { name: 'Account' })).toBeVisible()
})
