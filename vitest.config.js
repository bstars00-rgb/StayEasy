import { defineConfig } from 'vitest/config'

// Unit tests only. Playwright specs in ./e2e are run separately via `npm run e2e`.
export default defineConfig({
  test: {
    include: ['src/**/*.test.{js,jsx}'],
    exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
    environment: 'node',
  },
})
