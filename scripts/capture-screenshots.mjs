import { mkdir, writeFile } from "node:fs/promises"
import { createRequire } from "node:module"
import { fileURLToPath, pathToFileURL } from "node:url"

const demo = new URL("../apps/demo/", import.meta.url)
const output = new URL("../docs/assets/screenshots/", import.meta.url)
const requireFromDemo = createRequire(new URL("package.json", demo))
const { chromium, expect } = requireFromDemo("@playwright/test")
const { createServer } = await import(
  pathToFileURL(requireFromDemo.resolve("vite")).href
)

const port = 4175
const baseURL = `http://127.0.0.1:${port}`
const desktop = { width: 1440, height: 900 }
const mobileViewport = { width: 390, height: 844 }
const defaultPalette = "telemedicine"

const scenes = [
  { name: "hero-light" },
  { name: "hero-dark", theme: "dark" },
  { name: "dark-clean", theme: "dark", darkStyle: "clean" },
  { name: "bills", path: "/bills" },
  { name: "settings-basic", path: "/settings/system/basic" },
  { name: "components", path: "/settings/components/basic" },
  { name: "command-palette", shortcut: "Control+k", panel: ".command-panel" },
  { name: "copilot", shortcut: "Control+Shift+k", panel: ".copilot-panel" },
  ...["telemedicine", "health-wellness"].map((palette) => ({
    name: `palette-${palette}`,
    palette,
    deviceScaleFactor: 0.6,
  })),
  { name: "mobile", mobile: true },
]

async function waitForContent(page, path, language) {
  if (path === "/overview") {
    await page.locator(".attention-list [data-attention-id]").first().waitFor()
  } else if (path === "/bills") {
    await expect(page.locator(".bills-totals")).toHaveAttribute(
      "aria-busy",
      "false"
    )
    await expect(page.locator("main tbody tr")).toHaveCount(10)
  } else if (path === "/settings/system/basic") {
    await page.locator("#basic-org-name").waitFor()
    // Use sample contact and editor details without changing form state.
    await page.evaluate(
      ({ contact, address }) => {
        document.getElementById("basic-contact").value = contact
        document.getElementById("basic-phone").value = "202-555-0142"
        document.getElementById("basic-email").value = "team@example.test"
        document.getElementById("basic-address").value = address
        document.querySelector(".basic-toolbar p").lastChild.textContent =
          contact
      },
      language === "zh-CN"
        ? { contact: "示例用户", address: "示例办公区" }
        : { contact: "Demo user", address: "Demo office" }
    )
  } else {
    await page.locator("#component-button [data-slot=button]").first().waitFor()
    await expect(
      page.locator(".component-section > [data-slot=skeleton]")
    ).toHaveCount(0)
  }
}

async function capture(
  browser,
  language,
  {
    path = "/overview",
    theme = "light",
    darkStyle = "glass",
    palette = defaultPalette,
    mobile = false,
    deviceScaleFactor = 1,
    shortcut,
    panel,
  }
) {
  const context = await browser.newContext({
    baseURL,
    viewport: mobile ? mobileViewport : desktop,
    deviceScaleFactor,
    hasTouch: mobile,
    locale: language,
    timezoneId: "UTC",
    colorScheme: theme,
    reducedMotion: "reduce",
    serviceWorkers: "block",
  })
  try {
    // Match Demo's e2e network fixture, including its fallback for avatars.
    await context.route(
      /^https?:\/\/(?!(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?(?:[/?#]|$))/i,
      (route) =>
        route.fulfill({
          status: 404,
          headers: { "x-playwright-external-placeholder": "1" },
          body: "",
        })
    )
    await context.addInitScript(
      (preferences) => {
        for (const [key, value] of Object.entries(preferences)) {
          localStorage.setItem(key, value)
        }
      },
      {
        "aries-theme": theme,
        "aries-palette": palette,
        "aries-language": language,
        "aries-dark-style": darkStyle,
      }
    )
    const page = await context.newPage()
    await page.clock.setFixedTime(new Date("2026-10-15T12:00:00Z"))
    await page.goto(path, { waitUntil: "networkidle" })
    const root = page.locator("html")
    await expect(root).toHaveAttribute("lang", language)
    await expect(root).toHaveClass(new RegExp(`\\b${theme}\\b`))
    await expect(root).toHaveAttribute("data-palette", palette)
    if (darkStyle === "clean") {
      await expect(root).toHaveAttribute("data-dark-style", "clean")
    }

    await waitForContent(page, path, language)
    if (mobile) {
      await expect(page.locator(".mobile-directory-trigger")).toHaveAttribute(
        "aria-expanded",
        "false"
      )
    }
    if (shortcut) {
      await page.keyboard.press(shortcut)
      await page.locator(panel).waitFor()
    }
    await page.evaluate(async () => {
      await document.fonts.ready
    })
    await expect(page.locator("vite-error-overlay")).toHaveCount(0)
    return await page.screenshot({
      type: "jpeg",
      quality: 88,
      scale: "device",
      animations: "disabled",
      caret: "hide",
    })
  } finally {
    await context.close()
  }
}

const server = await createServer({
  root: fileURLToPath(demo),
  server: { host: "127.0.0.1", port, strictPort: true },
})
try {
  await server.listen()
  const browser = await chromium.launch()
  const images = new Map()
  try {
    for (const language of ["zh-CN", "en"]) {
      for (const scene of scenes) {
        const name = `${scene.name}.${language}.jpg`
        const data = await capture(browser, language, scene)
        if (data.length > 400_000) {
          throw new Error(`${name} exceeds 400 kB (${data.length} bytes)`)
        }
        images.set(name, data)
        console.log(`${name}: ${data.length} bytes`)
      }
    }
  } finally {
    await browser.close()
  }

  const total = [...images.values()].reduce((sum, data) => sum + data.length, 0)
  if (total > 3_000_000) {
    throw new Error(`Screenshots exceed 3 MB (${total} bytes)`)
  }
  await mkdir(output, { recursive: true })
  for (const [name, data] of images) {
    await writeFile(new URL(name, output), data)
  }
  console.log(`Saved ${images.size} screenshots (${total} bytes)`)
} finally {
  await server.close()
}
