import { expect, test, type Page } from "@playwright/test"

// Layout contract: the three-column shell from @marismoon/shell must look the
// same on every page this app registers. Pages only fill the content area, so
// adding features must never change these numbers. The test walks every rail
// module and every directory link, so new pages are covered automatically.
//
// If @marismoon/shell itself changes its layout on purpose, update the
// expected values here together with that upgrade.

const desktop = { width: 1440, height: 900 }
const expected = {
  railWidth: 54,
  // The 38px rail plates sit centered between the viewport edge and column two.
  plateLeft: 13,
  plateToNav: 13,
  navLeft: 64,
  navWidth: 256,
  mainLeft: 330,
}

test.beforeEach(async ({ context }) => {
  await context.route(
    /^https?:\/\/(?!(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?(?:[/?#]|$))/i,
    (route) => route.fulfill({ status: 404, body: "" })
  )
})

async function measure(page: Page) {
  return page.evaluate(() => {
    const box = (selector: string) => {
      const element = document.querySelector(selector)
      if (!element) return null
      const { x, y, width, height, right, bottom } =
        element.getBoundingClientRect()
      return { x, y, width, height, right, bottom }
    }
    const scrollers = Array.from(document.querySelectorAll("main *")).filter(
      (element) => {
        const { overflowY } = getComputedStyle(element)
        return (
          (overflowY === "auto" || overflowY === "scroll") &&
          element.scrollHeight > element.clientHeight + 1
        )
      }
    )
    const plate = document.querySelector(".icon-rail .rail-control")
    const plateBox = plate?.getBoundingClientRect()
    return {
      shells: document.querySelectorAll(".app-shell").length,
      headers: document.querySelectorAll(".page-header").length,
      rail: box(".icon-rail"),
      nav: box(".workspace-nav--desktop"),
      main: box(".workspace-main"),
      header: box(".page-header"),
      viewport: box(".page-content-viewport"),
      // Center of the 44px hit area minus half of the 38px plate.
      plateLeft: plateBox ? plateBox.x + plateBox.width / 2 - 19 : null,
      pageScroll: {
        x: document.documentElement.scrollWidth - window.innerWidth,
        y: document.documentElement.scrollHeight - window.innerHeight,
      },
      // Only the page viewport may scroll inside the main column.
      extraScrollers: scrollers
        .filter((element) => !element.matches(".page-content-viewport"))
        .map((element) => element.className || element.tagName),
    }
  })
}

async function expectShellLayout(page: Page, label: string) {
  const m = await measure(page)
  const where = `${label} (${page.url()})`
  expect(m.shells, where).toBe(1)
  expect(m.headers, where).toBe(1)
  expect(m.rail?.x, where).toBe(0)
  expect(m.rail?.width, where).toBe(expected.railWidth)
  expect(m.plateLeft, where).toBeCloseTo(expected.plateLeft, 0)
  expect(m.nav?.x, where).toBe(expected.navLeft)
  expect(m.nav?.width, where).toBe(expected.navWidth)
  expect(
    expected.navLeft - ((m.plateLeft ?? 0) + 38),
    `${where}: rail plate to column two`
  ).toBeCloseTo(expected.plateToNav, 0)
  expect(m.main?.x, where).toBe(expected.mainLeft)
  expect(m.main?.right, where).toBeLessThanOrEqual(desktop.width)
  expect(m.main?.bottom, where).toBeLessThanOrEqual(desktop.height)
  // The header stays at the top of the main column; content scrolls below it.
  expect(m.header?.y, where).toBeLessThan(m.viewport?.y ?? 0)
  expect(m.pageScroll, `${where}: body must not scroll`).toEqual({
    x: 0,
    y: 0,
  })
  expect(m.extraScrollers, `${where}: extra scroll containers`).toEqual([])
}

test("每个页面都保持三列外壳布局（1440×900）", async ({ page }) => {
  await page.setViewportSize(desktop)
  await page.goto("/")
  await expect(page.getByRole("main")).toBeVisible()

  const modules = page
    .getByRole("navigation", { name: "主模块" })
    // Module entries only: toggles and panel launchers carry aria-expanded.
    .locator("button[aria-label]:not([aria-expanded]):not([aria-haspopup])")
  const moduleNames = await modules.evaluateAll((buttons) =>
    buttons
      .filter((button) => button.getClientRects().length > 0)
      .map((button) => button.getAttribute("aria-label") ?? "")
  )
  expect(moduleNames.length).toBeGreaterThan(0)

  let pages = 0
  for (const name of moduleNames) {
    await page
      .getByRole("navigation", { name: "主模块" })
      .getByRole("button", { name, exact: true })
      .click()
    const directory = page.getByRole("navigation", { name: "工作区目录" })
    const paths = await directory
      .getByRole("link")
      .evaluateAll((links) =>
        links.map((link) => link.getAttribute("href") ?? "")
      )
    for (const path of paths.filter((href) => href.startsWith("/"))) {
      await page.goto(path)
      await expect(page.getByRole("main")).toBeVisible()
      // Let route transitions and lazy content settle before measuring.
      await page.waitForLoadState("networkidle")
      await expectShellLayout(page, name)
      pages++
    }
  }
  expect(pages).toBeGreaterThan(0)
})

test("窄屏下不出现整页横向滚动", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/")
  await expect(page.getByRole("main")).toBeVisible()
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth
  )
  expect(overflow).toBe(0)
})
