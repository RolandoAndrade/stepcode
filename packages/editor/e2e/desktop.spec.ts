import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

test.skip(({ isMobile }) => isMobile === true, 'the dock only exists on wide viewports')

/**
 * Drops a sidebar icon on the right strip's top cluster. The strip is only mounted while a drag
 * is in flight, so the drop waits for it to appear instead of aiming at a fixed x — and every
 * HTML5 drop needs a move onto the target before the button comes up.
 */
async function dragToRightTop(page: Page, label: string): Promise<void> {
  await page.locator(`[data-zone] button[aria-label="${label}"]`).first().hover()
  await page.mouse.down()
  await page.mouse.move(900, 300, { steps: 10 })
  const zone = page.locator('[data-zone="right-top"]')
  await expect(zone).toBeVisible()
  const box = await zone.boundingBox()
  const x = (box?.x ?? 0) + (box?.width ?? 0) / 2
  const y = (box?.y ?? 0) + 20
  await page.mouse.move(x, y, { steps: 10 })
  await page.mouse.move(x, y + 8, { steps: 5 })
  await page.mouse.up()
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.cm-content')).toBeVisible()
})

test('types a line, runs the program with F5 and reads the console', async ({ page }) => {
  await page.locator('.cm-line', { hasText: 'Escribir' }).first().click()
  await page.keyboard.press('End')
  await page.keyboard.press('Enter')
  await page.keyboard.type("Escribir 'listo';")
  await page.keyboard.press('F5')
  await expect(page.getByTestId('console-output')).toContainText('Hola, mundo')
  await expect(page.getByTestId('console-output')).toContainText('listo')
})

test('drags the Consola icon into the right strip', async ({ page }) => {
  await dragToRightTop(page, 'Consola')
  await expect(page.locator('[data-zone="right-top"] button[aria-label="Consola"]')).toBeVisible()
})

test('collapses the console group and brings it back at a usable size', async ({ page }) => {
  const output = page.getByTestId('console-output')
  // The default layout boots with the console's group collapsed, so the test opens it first.
  await page.locator('[data-zone] button[aria-label="Consola"]').first().click()
  await expect(page.locator('.sc-dock')).not.toHaveClass(/sc-animating/)
  await expect(output).toBeVisible()
  await page.getByRole('button', { name: 'Contraer' }).first().click()
  await expect(page.locator('.sc-dock')).not.toHaveClass(/sc-animating/)
  await expect(output).toBeHidden()

  await page.locator('[data-zone] button[aria-label="Consola"]').first().click()
  await expect(page.locator('.sc-dock')).not.toHaveClass(/sc-animating/)
  await expect(output).toBeVisible()
  const box = await output.boundingBox()
  expect(box?.height ?? 0).toBeGreaterThan(40)
})

test('floats Problemas out of the grid, where it no longer collapses', async ({ page }) => {
  await page.locator('[data-zone] button[aria-label="Problemas"]').first().click()
  // The tab is the drag handle, so the grab waits until the group has stopped sliding open.
  await expect(page.locator('.sc-dock')).not.toHaveClass(/sc-animating/)
  const panel = page.locator('section[aria-label="Problemas"]')
  await expect(panel).toBeVisible()
  const docked = await panel.boundingBox()

  // The shell renders no "Flotar" header action, so the float is dockview's own gesture: a tab
  // dragged out with Shift held down.
  const tab = page.locator('.dv-tab', { hasText: 'Problemas' }).first()
  const box = await tab.boundingBox()
  await page.keyboard.down('Shift')
  await page.mouse.move(
    (box?.x ?? 0) + (box?.width ?? 0) / 2,
    (box?.y ?? 0) + (box?.height ?? 0) / 2,
  )
  await page.mouse.down()
  await page.mouse.move(600, 400, { steps: 12 })
  await page.mouse.move(610, 410, { steps: 5 })
  await page.mouse.up()
  await page.keyboard.up('Shift')

  // Dockview's floating groups live in a resize container of their own.
  await expect(page.locator('.dv-resize-container')).toBeVisible()
  await expect(panel).toBeVisible()
  await expect
    .poll(async () => (await panel.boundingBox())?.width ?? 0)
    .toBeLessThan(docked?.width ?? 0)

  // Spec §3.3: a floating group never collapses, so its sidebar button only brings it forward.
  await page.locator('[data-zone] button[aria-label="Problemas"]').first().click()
  await expect(panel).toBeVisible()
})

// The shell renders no "Abrir en ventana" action anywhere (`strings.dock.popout` is unused), so
// there is nothing to click: this test waits for an affordance 4b never shipped.
test.fixme('pops the console out into its own window', async ({ page, context }) => {
  const opened = context.waitForEvent('page')
  await page.getByRole('button', { name: 'Abrir en ventana' }).first().click()
  const popout = await opened
  await expect(popout.locator('section[aria-label="Consola"]')).toBeVisible()
  await popout.close()
})

test('resets the layout from the Vista menu', async ({ page }) => {
  await dragToRightTop(page, 'Consola')
  await expect(page.locator('[data-zone="right-top"] button[aria-label="Consola"]')).toBeVisible()

  await page.getByRole('button', { name: 'Menú' }).click()
  await page.getByRole('menuitem', { name: 'Vista' }).click()
  await page.getByRole('menuitem', { name: 'Restablecer diseño' }).click()

  // The default layout docks Consola under the editor again, collapsed. Its icon only leaves the
  // right strip once the group has a box to measure, because a group with none keeps the zone its
  // panel last had (spec §3.3) — so opening it is what proves where the reset put it.
  await page.locator('[data-zone="right-top"] button[aria-label="Consola"]').click()
  await expect(page.locator('.sc-dock')).not.toHaveClass(/sc-animating/)
  await expect(page.locator('[data-zone="left-bottom"] button[aria-label="Consola"]')).toBeVisible()
  await expect(page.getByTestId('console-output')).toBeVisible()
})
