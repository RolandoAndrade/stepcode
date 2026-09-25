// Captures real screenshots of the live StepCode editor for the promo.
// Usage: node scripts/capture-screens.mjs [only-name]
// Env: CHROME_PATH (defaults to the Playwright chromium in ~/.cache/ms-playwright),
//      RESOLVE_IP (pins the editor host to an IP when the local resolver cannot see it).
import { existsSync, readdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { deflateRawSync } from 'node:zlib'
import { chromium } from 'playwright-core'

const HOST = 'stepcode.letsbuildsolutions.com'
const BASE = `https://${HOST}`
const OUT = new URL('../public/screens/', import.meta.url).pathname
const only = process.argv[2]

function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH
  const root = join(homedir(), '.cache/ms-playwright')
  const dirs = readdirSync(root)
    .filter((d) => /^chromium-\d+$/.test(d))
    .sort()
    .reverse()
  for (const d of dirs) {
    const p = join(root, d, 'chrome-linux64/chrome')
    if (existsSync(p)) return p
    const q = join(root, d, 'chrome-linux/chrome')
    if (existsSync(q)) return q
  }
  throw new Error('No chromium found; set CHROME_PATH')
}

/** Same contract as the editor's share link: base64url(deflate-raw(source)). */
function shareHash(source, name) {
  const code = deflateRawSync(Buffer.from(source, 'utf8')).toString('base64url')
  return `#code=${code}&profile=es&name=${encodeURIComponent(name)}`
}

const PROGRAMS = {
  suma: `Proceso SumarNumeros
  Definir i Como Entero;
  Definir suma Como Entero;
  suma ← 0;
  Para i ← 1 Hasta 5 Hacer
    suma ← suma + i;
  FinPara
  Escribir 'La suma es: ', suma;
FinProceso
`,
  error: `Proceso Calificacion
  Definir nota Como Entero;
  Escribir 'Ingresa tu nota:';
  Leer nota;
  Si nota >= 10 Entonces
    Escribir 'Aprobado';
  SiNo
    Escribir 'Reprobado';
FinProceso
`,
  complete: `Proceso Saludo
  Definir nombre Como Cadena;
  Leer nombre;

FinProceso
`,
}

const ANDROID_FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Roboto+Mono:wght@400;700&family=Noto+Color+Emoji&display=block');
:root { --font-sans: Roboto, "Noto Color Emoji", sans-serif !important; }
body, button, input, select, textarea { font-family: Roboto, "Noto Color Emoji", sans-serif; }
.cm-scroller, .cm-tooltip, code, pre, textarea.font-mono, .font-mono { font-family: "Roboto Mono", "Noto Color Emoji", monospace !important; }
.cm-completionIcon { font-family: "Noto Color Emoji", sans-serif !important; }
`

const PHONE = {
  viewport: { width: 430, height: 932 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
}

async function openEditor(browser, source, name, contextOptions = PHONE) {
  const context = await browser.newContext({
    ...contextOptions,
    colorScheme: 'dark',
    locale: 'es-419',
  })
  const page = await context.newPage()
  await page.goto(`${BASE}/${shareHash(source, name)}`, { waitUntil: 'networkidle' })
  await page.locator('.cm-content').waitFor()
  // Headless Linux has only DejaVu and no emoji font. Emulate what an Android phone renders
  // (system-ui = Roboto, monospace = Roboto Mono-like, color emoji for completion icons) so the
  // screenshots match a real device instead of a bare server.
  await page.addStyleTag({ content: ANDROID_FONTS })
  await page.evaluate(async () => {
    await Promise.all(
      [
        '400 16px Roboto',
        '700 16px Roboto',
        '400 16px "Roboto Mono"',
        '700 16px "Roboto Mono"',
        '16px "Noto Color Emoji"',
      ].map((f) => document.fonts.load(f, 'aé🔑')),
    )
    await document.fonts.ready
  })
  await page.waitForTimeout(800)
  return { context, page }
}

const shots = {
  // The editor with the example program, nothing else going on.
  async editor(browser) {
    const { context, page } = await openEditor(browser, PROGRAMS.suma, 'suma.stepcode')
    await page.screenshot({ path: `${OUT}editor.png` })
    await context.close()
  },

  // A missing FinSi: the checker flags it before running.
  async error(browser) {
    const { context, page } = await openEditor(browser, PROGRAMS.error, 'calificacion.stepcode')
    await page.waitForTimeout(1200)
    await page.getByRole('button', { name: 'Expandir' }).click()
    await page.getByRole('tab', { name: 'Problemas' }).click()
    await page.waitForTimeout(800)
    await page.screenshot({ path: `${OUT}error.png` })
    await context.close()
  },

  // Paused on a breakpoint with the Variables panel open.
  async debug(browser) {
    const { context, page } = await openEditor(browser, PROGRAMS.suma, 'suma.stepcode')
    const line = page.locator('.cm-line', { hasText: 'suma ← suma + i' }).first()
    const lineBox = await line.boundingBox()
    const gutter = page.locator('.cm-gutter.cm-stepcode-breakpoints')
    const gutterBox = await gutter.boundingBox()
    await page.mouse.click(gutterBox.x + gutterBox.width / 2, lineBox.y + lineBox.height / 2)
    await page.waitForTimeout(300)
    await page.getByRole('button', { name: 'Ejecutar' }).first().click()
    await page.waitForTimeout(800)
    const expand = page.getByRole('button', { name: 'Expandir' })
    if (await expand.isVisible()) await expand.click()
    await page.getByRole('tab', { name: 'Variables' }).click()
    await page.waitForTimeout(800)
    // One frame per loop iteration (i = 1..5), so the video can show the values changing.
    for (let k = 1; k <= 5; k++) {
      if (k > 1) {
        await page.getByRole('button', { name: 'Continuar' }).first().click()
        await page.waitForTimeout(700)
      }
      await page.screenshot({ path: `${OUT}debug-${k}.png` })
      if (k === 3) await page.screenshot({ path: `${OUT}debug.png` })
    }
    await context.close()
  },

  // Autocompletion popup with its beginner description.
  async complete(browser) {
    const { context, page } = await openEditor(browser, PROGRAMS.complete, 'saludo.stepcode')
    await page.locator('.cm-line').nth(3).click()
    await page.keyboard.press('End')
    await page.keyboard.type('  Escr', { delay: 120 })
    await page.locator('.cm-tooltip-autocomplete').waitFor()
    await page.waitForTimeout(900)
    await page.screenshot({ path: `${OUT}complete.png` })
    await context.close()
  },

  // Compartir → Insertar: the iframe snippet for Canvas / an LMS.
  async embed(browser) {
    const { context, page } = await openEditor(browser, PROGRAMS.suma, 'suma.stepcode')
    await page.getByRole('button', { name: 'Menú' }).click()
    await page.waitForTimeout(300)
    await page.getByText('Compartir…').first().click()
    await page.waitForTimeout(600)
    await page.getByRole('tab', { name: 'Insertar' }).click()
    await page.waitForTimeout(1800)
    await page.screenshot({ path: `${OUT}embed.png` })
    await context.close()
  },
}

const ip = process.env.RESOLVE_IP
const browser = await chromium.launch({
  executablePath: findChrome(),
  args: ip ? [`--host-resolver-rules=MAP ${HOST} ${ip}`] : [],
})
try {
  for (const [name, shot] of Object.entries(shots)) {
    if (only && only !== name) continue
    try {
      await shot(browser)
      console.log(`ok   ${name}`)
    } catch (error) {
      console.log(`FAIL ${name}: ${error.message.split('\n')[0]}`)
    }
  }
} finally {
  await browser.close()
}
