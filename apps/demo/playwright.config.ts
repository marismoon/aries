import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./e2e",
  // Vite serves the development module graph to every Chromium worker.
  workers: 2,
  use: {
    ...devices["Desktop Chrome"],
    channel: process.env.MARISMOON_BROWSER === "chrome" ? "chrome" : undefined,
    baseURL: "http://127.0.0.1:4173",
    serviceWorkers: "block",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "pnpm dev --host 127.0.0.1 --port 4173 --strictPort",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
  },
})
