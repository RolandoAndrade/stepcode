import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { expect, test } from '@playwright/test'

test.skip(({ isMobile }) => isMobile === true, 'the embed is sized by its host, not by a device')

const PROGRAM = "Proceso Remoto\n  Escribir 'desde el host';\nFinProceso\n"
const ASKING = 'Proceso Pregunta\n  Definir n Como Entero;\n  Leer n;\n  Escribir n;\nFinProceso\n'

interface HostWindow {
  received: { type: string; text?: string; state?: string }[]
  send(message: unknown): void
}

const hostHtml = readFileSync(
  fileURLToPath(new URL('./fixtures/host.html', import.meta.url)),
  'utf8',
)

test('titles itself from title=, from the example and from the file name', async ({ page }) => {
  // The title lives in the top bar; the program below it holds the same words, so every one of
  // these assertions names the bar rather than the page.
  const title = (text: string) => page.locator('header').getByText(text, { exact: true })

  await page.goto('/embed?title=Tarea%201&example=primeros-pasos/hola-mundo')
  await expect(title('Tarea 1')).toBeVisible()

  await page.goto('/embed?example=primeros-pasos/hola-mundo')
  await expect(title('Hola mundo')).toBeVisible()

  await page.route('https://raw.githubusercontent.com/**', (route) =>
    route.fulfill({ status: 200, contentType: 'text/plain', body: PROGRAM }),
  )
  const blob = 'https://github.com/ana/curso/blob/main/remoto.stepcode'
  await page.goto(`/embed?src=${encodeURIComponent(blob)}`)
  await expect(title('remoto')).toBeVisible()
})

test('readonly shows the lock and refuses typing', async ({ page }) => {
  await page.goto('/embed?readonly&example=primeros-pasos/hola-mundo')
  await expect(page.getByLabel('Solo lectura')).toBeVisible()
  await page.locator('.cm-line').first().click()
  await page.keyboard.type('XYZ')
  await expect(page.locator('.cm-content')).not.toContainText('XYZ')
})

test('autorun prints the program without anyone pressing anything', async ({ page }) => {
  await page.goto('/embed?autorun&example=primeros-pasos/hola-mundo')
  await expect(page.getByTestId('console-output')).toContainText('Hola, mundo')
})

test('debug adds Variables and the stepping buttons', async ({ page }) => {
  await page.goto('/embed?example=primeros-pasos/hola-mundo')
  await expect(page.getByRole('button', { name: 'Depurar' })).toHaveCount(0)
  await expect(page.locator('section[aria-label="Variables"]')).toHaveCount(0)

  await page.goto('/embed?debug&example=primeros-pasos/hola-mundo')
  await expect(page.getByRole('button', { name: 'Depurar' })).toBeVisible()
  await expect(page.locator('section[aria-label="Variables"]')).toBeVisible()
})

test('showProfile names the profile and theme=dark paints it dark', async ({ page }) => {
  await page.goto('/embed?example=primeros-pasos/hola-mundo')
  await expect(page.getByText('Español')).toHaveCount(0)

  await page.goto('/embed?showProfile&theme=dark&example=primeros-pasos/hola-mundo')
  await expect(page.getByText('Español')).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
})

for (const height of [200, 480, 800]) {
  test(`fits a ${height} px frame without scrolling the page`, async ({ page }) => {
    await page.setViewportSize({ width: 800, height })
    await page.goto('/embed?example=primeros-pasos/hola-mundo')
    await expect(page.getByTestId('console-output')).toBeVisible()
    const overflow = await page.evaluate(
      () => document.documentElement.scrollHeight - document.documentElement.clientHeight,
    )
    expect(overflow).toBeLessThanOrEqual(1)
  })
}

test('a host page drives the frame through postMessage', async ({ page }) => {
  await page.route('**/host.html', (route) =>
    route.fulfill({ status: 200, contentType: 'text/html', body: hostHtml }),
  )
  await page.goto('/host.html')

  await page.waitForFunction(() =>
    (window as unknown as HostWindow).received.some((message) => message.type === 'ready'),
  )

  await page.evaluate(
    (source) => (window as unknown as HostWindow).send({ type: 'setSource', source }),
    PROGRAM,
  )
  await page.evaluate(() => (window as unknown as HostWindow).send({ type: 'run' }))
  await page.waitForFunction(() =>
    (window as unknown as HostWindow).received.some((message) => message.type === 'done'),
  )

  const output = await page.evaluate(() =>
    (window as unknown as HostWindow).received
      .filter((message) => message.type === 'output')
      .map((message) => message.text ?? '')
      .join(''),
  )
  expect(output).toContain('desde el host')

  const done = await page.evaluate(() =>
    (window as unknown as HostWindow).received.find((message) => message.type === 'done'),
  )
  expect(done?.state).toBe('done')
})

test('a host page answers an input request', async ({ page }) => {
  await page.route('**/host.html', (route) =>
    route.fulfill({ status: 200, contentType: 'text/html', body: hostHtml }),
  )
  await page.goto('/host.html')
  await page.waitForFunction(() =>
    (window as unknown as HostWindow).received.some((message) => message.type === 'ready'),
  )

  await page.evaluate(
    (source) => (window as unknown as HostWindow).send({ type: 'setSource', source }),
    ASKING,
  )
  await page.evaluate(() => (window as unknown as HostWindow).send({ type: 'run' }))
  await page.waitForFunction(() =>
    (window as unknown as HostWindow).received.some((message) => message.type === 'inputRequest'),
  )
  await page.evaluate(() => (window as unknown as HostWindow).send({ type: 'input', value: '7' }))
  await page.waitForFunction(() =>
    (window as unknown as HostWindow).received.some((message) => message.type === 'done'),
  )
  const output = await page.evaluate(() =>
    (window as unknown as HostWindow).received
      .filter((message) => message.type === 'output')
      .map((message) => message.text ?? '')
      .join(''),
  )
  expect(output).toContain('7')
})
