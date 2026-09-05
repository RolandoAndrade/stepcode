import { defineConfig, devices } from '@playwright/test'

const PORT = 4173
const baseURL = `http://localhost:${PORT}`
const ci = process.env.CI !== undefined && process.env.CI !== ''

/** Spec §6: Chromium only, against the built `dist` that `vite preview` serves. */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: ci,
  retries: ci ? 1 : 0,
  reporter: ci ? [['html', { open: 'never' }], ['list']] : [['list']],
  use: { baseURL, trace: 'on-first-retry' },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
    { name: 'phone', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    // `vite preview` serves the existing build; CI runs `pnpm build` before `pnpm e2e`.
    command: `pnpm exec vite preview --port ${PORT} --strictPort`,
    url: baseURL,
    reuseExistingServer: !ci,
    timeout: 120_000,
  },
})
