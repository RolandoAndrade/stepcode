import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { configDefaults, defineConfig } from 'vitest/config'

const { version } = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
) as {
  version: string
}

export default defineConfig({
  define: { __APP_VERSION__: JSON.stringify(version) },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png', 'fonts/*.woff2'],
      manifest: {
        name: 'StepCode',
        short_name: 'StepCode',
        description: 'Editor de pseudocódigo',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        // Duplicated from the light theme's --sc-surface/--sc-bg in tokens.css: the manifest
        // cannot read CSS variables and the tokens-only scan covers src/ only.
        theme_color: '#ffffff',
        background_color: '#fafafa',
        icons: [
          { src: '/pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2,png,ico,svg}'],
        // The frame must never be answered with the app shell (spec §9).
        navigateFallbackDenylist: [/^\/embed/],
      },
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        index: fileURLToPath(new URL('./index.html', import.meta.url)),
        embed: fileURLToPath(new URL('./embed.html', import.meta.url)),
      },
    },
  },
  test: {
    name: '@stepcode/editor',
    environment: 'node',
    setupFiles: ['./test/setup.ts'],
    exclude: [...configDefaults.exclude, 'e2e/**'],
  },
})
