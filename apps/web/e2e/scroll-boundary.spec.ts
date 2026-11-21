import { expect, test, type Locator, type Page } from "@playwright/test"

const workspaceContent = (page: Page) =>
  page.getByRole("region", { name: "页面内容", exact: true })
const scrollTop = (target: Locator) =>
  target.evaluate((element) => element.scrollTop)
const verticalRange = (target: Locator) =>
  target.evaluate((element) => element.scrollHeight - element.clientHeight)

async function expectAtBottom(target: Locator, max: number) {
  await expect
    .poll(async () => Math.abs(max - (await scrollTop(target))))
    .toBeLessThanOrEqual(1)
}

async function wheel(
  page: Page,
  target: Locator,
  x: number,
  y: number,
  position?: { x: number; y: number }
) {
  await target.hover({ position })
  await page.mouse.wheel(x, y)
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      )
  )
}

const shellBounds = (page: Page) =>
  page
    .locator(
      ".app-shell, .icon-rail-column, .workspace-nav--desktop, .workspace-main, .page-header"
    )
    .evaluateAll((elements) =>
      elements.map((element) => {
        const { x, y, width, height } = element.getBoundingClientRect()
        return [x, y, width, height]
      })
    )

async function expectDocumentAtRest(page: Page) {
  expect(
    await page.evaluate(() => {
      const root = document.documentElement
      return [
        window.scrollX,
        window.scrollY,
        root.scrollWidth - root.clientWidth,
        root.scrollHeight - root.clientHeight,
      ]
    })
  ).toEqual([0, 0, 0, 0])
}

test("长内容在滚轮两端保持固定工作区和页头", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.emulateMedia({ reducedMotion: "reduce" })
  const viewport = workspaceContent(page)
  const header = page.locator(".page-header")

  for (const [path, ready] of [
    ["/overview", ".activity-card"],
    ["/bills", ".data-table tbody tr"],
  ]) {
    await page.goto(path)
    await expect(page.locator(ready).first()).toBeVisible()
    await page.evaluate(() => document.fonts.ready)
    await expect(viewport).toHaveCSS("overscroll-behavior", "contain")
    await expect(page.locator("html")).toHaveCSS("overscroll-behavior", "none")
    for (const selector of ["html", "body", "#root"]) {
      await expect(page.locator(selector)).toHaveCSS("overflow", "clip")
    }

    const frame = await shellBounds(page)
    const max = await verticalRange(viewport)
    const gutter = { x: 1, y: 40 }
    expect(max).toBeGreaterThan(0)
    await wheel(page, viewport, 0, -2000, gutter)
    expect(await scrollTop(viewport)).toBe(0)
    await expectDocumentAtRest(page)

    await wheel(page, viewport, 0, 2000, gutter)
    await expectAtBottom(viewport, max)
    await wheel(page, viewport, 0, 2000, gutter)
    await wheel(page, header, 0, -2000)
    await wheel(page, viewport, 2000, 0, gutter)
    await expectAtBottom(viewport, max)
    expect(await viewport.evaluate((element) => element.scrollLeft)).toBe(0)
    expect(await shellBounds(page)).toEqual(frame)
    await expectDocumentAtRest(page)

    await viewport.press("Home")
    await expect.poll(() => scrollTop(viewport)).toBe(0)
    await expect(viewport).toBeFocused()
    await expectDocumentAtRest(page)
  }
})

test("短表格不会纵向滚动，窄屏表格自身可以横向滚动", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/bills")
  const viewport = workspaceContent(page)
  const table = page.getByRole("region", { name: "账单表格", exact: true })
  await expect(table.locator("tbody tr")).toHaveCount(10)
  await page.evaluate(() => document.fonts.ready)
  const workspaceRange = await verticalRange(viewport)
  await page.getByRole("searchbox", { name: "搜索账单" }).fill("BL-2610-01")
  await expect(table.locator("tbody tr")).toHaveCount(1)
  expect(await verticalRange(table)).toBe(0)
  expect(await verticalRange(viewport)).toBe(workspaceRange)
  const frame = await shellBounds(page)
  const gutter = { x: 1, y: 40 }
  await wheel(page, viewport, 0, 2000, gutter)
  await expectAtBottom(viewport, workspaceRange)
  await wheel(page, viewport, 0, -2000, gutter)
  expect(await scrollTop(viewport)).toBe(0)
  expect(await shellBounds(page)).toEqual(frame)
  await expectDocumentAtRest(page)

  await page.setViewportSize({ width: 1024, height: 768 })
  await page.goto("/bills")
  await expect(table.locator("tbody tr")).toHaveCount(10)
  const horizontalRange = await table.evaluate(
    (element) => element.scrollWidth - element.clientWidth
  )
  expect(horizontalRange).toBeGreaterThan(0)
  await table.hover()
  const workspaceY = await scrollTop(viewport)
  await wheel(page, table, 2000, 0)
  await expect
    .poll(() =>
      table.evaluate(
        (element, max) => Math.abs(max - element.scrollLeft),
        horizontalRange
      )
    )
    .toBeLessThanOrEqual(1)
  expect(await scrollTop(viewport)).toBe(workspaceY)
  await expectDocumentAtRest(page)
})

test("侧栏和助手各自滚动，超过边界时工作区保持静止", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 560 })
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/overview")
  const viewport = workspaceContent(page)
  const directory = page.getByRole("navigation", { name: "工作区目录" })
  await expect(directory).toBeVisible()
  await expect(directory).toHaveCSS("overscroll-behavior", "contain")
  const initial = await shellBounds(page)
  const directoryMax = await verticalRange(directory)
  expect(directoryMax).toBeGreaterThan(0)
  await wheel(page, directory, 0, 2000)
  await expectAtBottom(directory, directoryMax)
  await wheel(page, directory, 0, 2000)
  const directoryY = await scrollTop(directory)
  expect(await scrollTop(viewport)).toBe(0)
  await expectDocumentAtRest(page)

  await page.locator('[data-copilot-trigger="rail"]').click()
  const copilot = page.getByRole("complementary", {
    name: "AI 助手",
    exact: true,
  })
  const question = copilot.getByRole("textbox", { name: "向智算助手提问" })
  for (const [index, text] of [
    "本月有哪些账单异常？",
    "帮我总结本月云成本情况。",
  ].entries()) {
    await question.fill(text)
    await question.press("Enter")
    await expect(copilot.getByRole("button", { name: "复制回复" })).toHaveCount(
      index + 1
    )
  }

  const history = copilot.locator(".copilot-history")
  await expect(history).toHaveCSS("overscroll-behavior", "contain")
  const historyMax = await verticalRange(history)
  expect(historyMax).toBeGreaterThan(0)
  await wheel(page, history, 0, -2000)
  await expect.poll(() => scrollTop(history)).toBe(0)
  await wheel(page, history, 0, -2000)
  await wheel(page, history, 0, 2000)
  await expectAtBottom(history, historyMax)
  await wheel(page, history, 0, 2000)

  expect(await scrollTop(directory)).toBe(directoryY)
  expect(await scrollTop(viewport)).toBe(0)
  expect(await shellBounds(page)).toEqual(initial)
  await expectDocumentAtRest(page)
})
