import { defineConfig, devices } from "@playwright/test"

const baseURL = "http://127.0.0.1:4174"

export default defineConfig({
  testDir: "./e2e",
  workers: 1,
  use: {
    ...devices["Desktop Chrome"],
    channel: process.env.MARISMOON_BROWSER === "chrome" ? "chrome" : undefined,
    baseURL,
    serviceWorkers: "block",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "pnpm dev --host 127.0.0.1 --port 4174 --strictPort",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
})
