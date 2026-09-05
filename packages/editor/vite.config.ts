import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    name: '@stepcode/editor',
    environment: 'node',
    setupFiles: ['./test/setup.ts'],
  },
})
