import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/performance',
  globalTeardown: './tests/support/preview-global-teardown.ts',
  fullyParallel: false,
  workers: 1,
  retries: 1,
  timeout: 60_000,
  use: {
    baseURL: 'http://127.0.0.1:4322',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'node tests/support/preview-server.mjs',
    url: 'http://127.0.0.1:4322',
    reuseExistingServer: true,
    timeout: 30_000,
  },
  projects: [
    {
      name: 'mobile-chromium',
      use: { ...devices['Pixel 5'] },
    },
  ],
});
