import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 45000,
  fullyParallel: false,
  workers: 2,
  retries: 0,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    headless: true,
  },
  webServer: [
    {
      command: 'npm.cmd --prefix server start',
      url: 'http://localhost:5000/api/health',
      reuseExistingServer: true,
      timeout: 15000,
    },
    {
      command: 'npm.cmd --prefix client run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: true,
      timeout: 15000,
    },
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});

