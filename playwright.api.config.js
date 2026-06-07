import { defineConfig, devices } from '@playwright/test'

// API-mode E2E: boots the backend (8787) AND the frontend in API mode (5174)
// together, then runs specs in ./e2e-api against the real API.
// Run with: npm run e2e:api
export default defineConfig({
  testDir: './e2e-api',
  timeout: 40000,
  fullyParallel: false, // shared in-memory backend state
  workers: 1,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5174',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'npm run backend',
      url: 'http://localhost:8787/health',
      reuseExistingServer: !process.env.CI,
      timeout: 30000,
    },
    {
      // Vite exposes VITE_-prefixed vars from process.env, so this enables API mode.
      command: 'npm run dev -- --port 5174 --strictPort',
      url: 'http://localhost:5174',
      reuseExistingServer: !process.env.CI,
      timeout: 60000,
      env: { VITE_API_BASE_URL: 'http://localhost:8787' },
    },
  ],
})
