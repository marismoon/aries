import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./e2e",
  use: {
    ...devices["Desktop Chrome"],
    channel: process.env.MARISMOON_BROWSER === "chrome" ? "chrome" : undefined,
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "pnpm dev --host 127.0.0.1 --port 4173 --strictPort",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
  },
})
