import { defineConfig } from "@playwright/test";

// E2E-Happy-Path gegen die lokal gestartete App mit gemockter
// Ghost-/Anthropic-Schicht (MOCK_KI=1, MOCK_GHOST=1). Benötigt eine
// erreichbare PostgreSQL-Datenbank (DATABASE_URL) mit angewendeten
// Migrationen; läuft in GitHub Actions im Job "e2e".
export default defineConfig({
  testDir: "tests/e2e",
  globalSetup: "./tests/e2e/global-setup.ts",
  timeout: 120_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "line" : "list",
  use: {
    baseURL: process.env.APP_URL ?? "http://localhost:3000",
    ...(process.env.E2E_CHROMIUM_PATH
      ? { launchOptions: { executablePath: process.env.E2E_CHROMIUM_PATH } }
      : {}),
  },
  webServer: {
    command: "npm run start",
    url: "http://localhost:3000/login",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
