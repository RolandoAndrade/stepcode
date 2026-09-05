import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

test.skip(({ isMobile }) => isMobile !== true, 'the sheet only exists on narrow viewports')

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.cm-content')).toBeVisible()
})

const sheet = (page: Page) => page.locator('section[aria-label="Paneles"]')

/** The sheet's box once its height transition has stopped, so a tap aims at a still handle. */
async function settledBox(
  page: Page,
): Promise<{ x: number; y: number; width: number; height: number } | null> {
  let previous = Number.NaN
  await expect
    .poll(async () => {
      const height = (await sheet(page).boundingBox())?.height ?? 0
      const settled = height === previous
      previous = height
      return settled
    })
    .toBe(true)
  return await sheet(page).boundingBox()
}

/**
 * Taps the sheet's 36 px handle, which cycles the three positions (spec §9). The tabs and the
 * collapse button fill the handle from the left, so the tap lands in the padding past the last
 * one — everywhere else the press belongs to a control, which keeps its own gestures.
 */
async function tapHandle(page: Page): Promise<void> {
  const box = await settledBox(page)
  const x = (box?.x ?? 0) + (box?.width ?? 0) - 4
  const y = (box?.y ?? 0) + 18
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.up()
}

test('collapses, expands and taps the sheet through its three positions', async ({ page }) => {
  const output = page.getByTestId('console-output')
  // The sheet boots collapsed: a phone gives the editor the screen until something asks for it.
  await expect(output).toBeHidden()

  await page.getByRole('button', { name: 'Expandir' }).click()
  await expect(output).toBeVisible()
  const half = await settledBox(page)

  await tapHandle(page)
  await expect
    .poll(async () => (await sheet(page).boundingBox())?.height ?? 0)
    .toBeGreaterThan(half?.height ?? 0)

  await tapHandle(page)
  await expect(output).toBeHidden()

  await page.getByRole('button', { name: 'Expandir' }).click()
  await expect(output).toBeVisible()
  await page.getByRole('button', { name: 'Contraer' }).click()
  await expect(output).toBeHidden()
})

test('switches panels from the sheet tabs', async ({ page }) => {
  await page.getByRole('button', { name: 'Expandir' }).click()
  await page.getByRole('tab', { name: 'Variables' }).click()
  await expect(page.locator('section[aria-label="Variables"]')).toBeVisible()
  await page.getByRole('tab', { name: 'Consola' }).click()
  await expect(page.getByTestId('console-output')).toBeVisible()
})

// The symbol bar only mounts while the on-screen keyboard is up — the visual viewport more than
// 100 px shorter than the layout one (spec §9). Emulated Chromium has no on-screen keyboard, so
// the bar can never appear in this run; `keyboardVisible` is unit-tested instead.
test.fixme('inserts the arrow from the symbol bar', async ({ page }) => {
  await page.locator('.cm-line').first().click()
  await page.keyboard.press('End')
  await page.getByRole('toolbar', { name: 'Símbolos' }).getByRole('button', { name: '←' }).click()
  await expect(page.locator('.cm-content')).toContainText('←')
})

test('a run opens the sheet on the console by itself', async ({ page }) => {
  await page.getByRole('button', { name: 'Expandir' }).click()
  await expect(page.getByTestId('console-output')).toBeVisible()
  await page.getByRole('button', { name: 'Contraer' }).click()
  await expect(page.getByTestId('console-output')).toBeHidden()

  await page.getByRole('button', { name: 'Ejecutar' }).click()
  await expect(page.getByTestId('console-output')).toBeVisible()
  await expect(page.getByTestId('console-output')).toContainText('Hola, mundo')
})
