import { expect, test } from '@playwright/test'

test.skip(({ isMobile }) => isMobile === true, 'one shell is enough for the URL contract')

const PROGRAM = "Proceso Remoto\n  Escribir 'desde github';\nFinProceso\n"

test('?example= loads a bundled example', async ({ page }) => {
  await page.goto('/?example=primeros-pasos/hola-mundo')
  await expect(page.locator('.cm-content')).toContainText("Escribir 'Hola, mundo'")
})

test('?profile=en transposes the example', async ({ page }) => {
  await page.goto('/?example=primeros-pasos/hola-mundo&profile=en')
  // `en` spells the program header `Program`/`EndProgram` (packages/profiles/src/profiles/en.json).
  await expect(page.locator('.cm-content')).toContainText('Program')
  await expect(page.locator('.cm-content')).toContainText('Write')
})

test('?src= fetches a GitHub blob through its raw URL', async ({ page }) => {
  await page.route('https://raw.githubusercontent.com/**', (route) =>
    route.fulfill({ status: 200, contentType: 'text/plain', body: PROGRAM }),
  )
  const blob = 'https://github.com/ana/curso/blob/main/remoto.stepcode'
  await page.goto(`/?src=${encodeURIComponent(blob)}`)
  await expect(page.locator('.cm-content')).toContainText('desde github')
})

test('?src= fetches a Gist through its raw endpoint', async ({ page }) => {
  await page.route('https://gist.githubusercontent.com/**', (route) =>
    route.fulfill({ status: 200, contentType: 'text/plain', body: PROGRAM }),
  )
  const gist = 'https://gist.github.com/ana/0123456789abcdef'
  await page.goto(`/?src=${encodeURIComponent(gist)}`)
  await expect(page.locator('.cm-content')).toContainText('desde github')
})

test('a refused host says so and keeps the starter program', async ({ page }) => {
  await page.goto('/?src=https%3A%2F%2Fevil.test%2Fa.txt')
  // The toast is one <li>; its text also lives in the hidden live region Radix renders inside it,
  // so the assertion names the item rather than the text, which would match both.
  const toast = page
    .getByRole('listitem')
    .filter({ hasText: 'el enlace no es de GitHub ni de Gist' })
  await expect(toast).toBeVisible()
  await expect(page.locator('.cm-content')).toContainText('Hola, mundo')
})

test('#code= beats ?example=, keeps its name and leaves the query alone', async ({ page }) => {
  await page.goto('/')
  // Build the hash with the app's own encoder, so the test never reimplements the format.
  const hash = await page.evaluate(async (source) => {
    const deflated = await new Response(
      new Blob([new TextEncoder().encode(source)])
        .stream()
        .pipeThrough(new CompressionStream('deflate-raw')),
    ).arrayBuffer()
    let binary = ''
    for (const byte of new Uint8Array(deflated)) binary += String.fromCharCode(byte)
    const code = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    return `#code=${code}&profile=es&name=desde-el-enlace.stepcode`
  }, PROGRAM)

  await page.goto(`/?example=primeros-pasos/hola-mundo&keep=1${hash}`)
  await expect(page.locator('.cm-content')).toContainText('desde github')
  await expect(page.locator('.cm-content')).not.toContainText('Hola, mundo')
  await expect(page.getByLabel('Nombre del archivo')).toHaveValue('desde-el-enlace')
  expect(new URL(page.url()).hash).toBe('')
  expect(new URL(page.url()).search).toBe('?example=primeros-pasos/hola-mundo&keep=1')
})
