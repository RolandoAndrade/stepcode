import { expect, test } from '@playwright/test'

test('the editor boots with an editor and a run button', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Ejecutar' })).toBeVisible()
  await expect(page.locator('.cm-content')).toBeVisible()
})
