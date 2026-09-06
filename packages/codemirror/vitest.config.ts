import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: '@stepcode/codemirror',
    environment: 'node',
    setupFiles: ['./test/setup.ts'],
  },
})
