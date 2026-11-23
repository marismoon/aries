import type { Request } from "@playwright/test"

import {
  expect,
  externalPlaceholderHeader,
  sidebarAvatarUrl,
  test,
} from "./fixtures"

const viewports = [
  { width: 1920, height: 1080 },
  { width: 1536, height: 960 },
  { width: 1440, height: 900 },
  { width: 1280, height: 800 },
  { width: 1024, height: 768 },
  { width: 768, height: 900 },
  { width: 390, height: 844 },
  { width: 320, height: 800 },
]
const routes = [
  { path: "/overview", title: "运营总览" },
  { path: "/bills", title: "月账单" },
]

for (const { path, title } of routes) {
  for (const { width, height } of viewports) {
    test(`${title} ${width}×${height} 下明暗模式均无页面溢出或接口请求`, async ({
      page,
      baseURL,
    }) => {
      const appOrigin = new URL(baseURL!).origin
      const errors: string[] = []
      const unexpectedRequests: string[] = []
      const avatarRequests: Request[] = []

      page.on("pageerror", (error) => errors.push(error.message))
      page.on("request", (request) => {
        const url = new URL(request.url())
        if (url.protocol !== "http:" && url.protocol !== "https:") return

        const type = request.resourceType()
        if (
          url.href === sidebarAvatarUrl &&
          type === "image" &&
          request.method() === "GET"
        ) {
          avatarRequests.push(request)
          return
        }
        const isApiPath = /^\/(?:api|graphql)(?:\/|$)/.test(url.pathname)
        if (
          url.origin !== appOrigin ||
          isApiPath ||
          type === "fetch" ||
          type === "xhr"
        ) {
          unexpectedRequests.push(`${request.method()} ${url.href} (${type})`)
        }
      })

      await page.setViewportSize({ width, height })
      await page.goto(path)
      await expect(
        page.getByRole("heading", { name: title, exact: true })
      ).toBeVisible()
      if (path === "/bills") {
        await expect(page.getByRole("table")).toBeVisible()
        if (width >= 1280) {
          await expect
            .poll(() =>
              page
                .locator(".data-table-scroll")
                .evaluate(
                  (element) => element.scrollWidth - element.clientWidth
                )
            )
            .toBe(0)
        }
        if (width === 320) {
          const visibleFilterValues = await page
            .locator(".bills-selects [data-slot='select-value']")
            .evaluateAll((values) =>
              values.map((value) => value.scrollWidth <= value.clientWidth)
            )
          expect(visibleFilterValues).toEqual([true, true, true])
        }
      } else {
        await expect(
          page.getByRole("region", { name: "核心指标" })
        ).toBeVisible()
      }
      await page.evaluate(async () => {
        await document.fonts.ready
      })

      for (const colorScheme of ["light", "dark"] as const) {
        await page.emulateMedia({ colorScheme })
        await expect(page.locator("html")).toHaveClass(
          new RegExp(`\\b${colorScheme}\\b`)
        )
        const overflow = await page.evaluate(() => {
          const { clientWidth, scrollWidth } = document.documentElement
          return scrollWidth - clientWidth
        })
        expect(overflow, `${colorScheme} 模式页面横向溢出的像素数`).toBe(0)
      }

      expect(errors, "页面未捕获的 JavaScript 异常").toEqual([])
      expect(unexpectedRequests, "业务接口或外部网络请求").toEqual([])
      for (const request of avatarRequests) {
        const response = await request.response()
        expect(response?.headers()[externalPlaceholderHeader]).toBe("1")
      }
    })
  }
}

test("768px 的月账单可通过键盘搜索并选择币种", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 900 })
  await page.goto("/bills")
  const search = page.getByRole("searchbox", { name: "搜索账单" })
  await search.focus()
  await expect(search).toHaveCSS("outline-style", "none")
  await expect(search).toHaveCSS("border-color", "rgba(0, 0, 0, 0)")
  const surface = page.locator(".bills-search")
  await expect(surface).toHaveCSS("outline-style", "none")
  expect(
    await surface.evaluate((e) => getComputedStyle(e).backgroundImage)
  ).toContain("gradient")
  await search.pressSequentially("AWS")
  await expect(page.getByText(/共\s*8\s*条/).first()).toBeVisible()

  const currency = page.getByRole("combobox", { name: "币种", exact: true })
  const currencyBorder = await currency.evaluate(
    (element) => getComputedStyle(element).borderColor
  )
  await currency.focus()
  expect(
    await currency.evaluate((e) => getComputedStyle(e).backgroundImage)
  ).toContain("gradient")
  void currencyBorder
  await currency.press("Enter")
  const usd = page.getByRole("option", { name: "USD", exact: true })
  await expect(usd).toBeVisible()
  await usd.press("Enter")
  await expect(currency).toContainText("USD")
  await expect(page.getByRole("table")).toBeVisible()
})

test("1440px 桌面三列充分利用页面宽度并保留首屏信息密度", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" })
  const avatarResponse = page.waitForResponse(sidebarAvatarUrl)
  await page.goto("/overview")

  const metrics = page.getByRole("region", { name: "核心指标" })
  await expect(metrics).toBeVisible()
  const rail = page.getByRole("navigation", { name: "主模块" })
  const avatar = rail.getByRole("img", { name: "演示用户 · 管理员" })
  expect((await avatarResponse).status()).toBe(404)
  await expect(avatar.getByText("M", { exact: true })).toBeVisible()
  await expect(avatar.locator('[data-slot="avatar-badge"]')).toBeVisible()
  await expect(avatar.locator('[data-slot="avatar-image"]')).toHaveCount(0)
  const railButton = rail.getByRole("button", { name: "收起工作区导航" })
  const nav = await page.locator('[data-layout-column="nav"]').boundingBox()
  const kpi = await metrics.boundingBox()
  await expect(railButton).toHaveCSS("width", "44px")
  await expect(railButton).toHaveCSS("height", "44px")
  expect(nav?.width).toBeGreaterThanOrEqual(244)
  expect(nav?.width).toBeLessThanOrEqual(280)
  expect(kpi?.width).toBeGreaterThan(1000)
  expect(kpi?.y).toBeLessThanOrEqual(150)

  await page.goto("/bills")
  const table = page.getByRole("table")
  await expect(table.locator("tbody tr")).toHaveCount(10)
  const register = await page.locator(".bills-register").boundingBox()
  expect(register?.width).toBeGreaterThan(1000)
  expect(register?.y).toBeLessThanOrEqual(250)
})

for (const [width, height] of [
  [1440, 900],
  [1920, 1080],
]) {
  test(`${width}px 面包屑对齐 Logo，标题对齐圆形控件且账单分页贴底`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height })
    await page.emulateMedia({ reducedMotion: "reduce" })
    await page.goto("/overview")
    const main = page.getByRole("main")
    const viewport = main.locator(".page-content-viewport")
    const logo = page.getByRole("link", { name: "Marismoon 工作台" })
    const breadcrumb = main.getByRole("navigation", { name: "面包屑" })
    const heading = main.locator(".page-header-title-row")
    const title = heading.getByRole("heading", {
      name: "运营总览",
      exact: true,
    })
    const palette = heading.getByRole("button", {
      name: "品牌配色",
      exact: true,
    })
    const mode = heading.getByRole("button", { name: /^切换到[浅深]色模式$/ })
    const lastCard = main.locator(".overview-charts > :last-child")
    await expect(lastCard).toBeVisible()
    await page.evaluate(() => document.fonts.ready)
    const [logoRect, breadcrumbRect, titleRect, paletteRect, modeRect] =
      await Promise.all([
        logo.boundingBox(),
        breadcrumb.boundingBox(),
        title.boundingBox(),
        palette.boundingBox(),
        mode.boundingBox(),
      ])
    if (!logoRect || !breadcrumbRect || !titleRect || !paletteRect || !modeRect)
      throw new Error("Header bounds unavailable")
    const midY = (rect: { y: number; height: number }) =>
      rect.y + rect.height / 2
    expect(Math.abs(midY(breadcrumbRect) - midY(logoRect))).toBeLessThanOrEqual(
      1
    )
    const titleGap = titleRect.y - breadcrumbRect.y - breadcrumbRect.height
    expect(titleGap).toBeGreaterThanOrEqual(12)
    expect(titleGap).toBeLessThanOrEqual(16)
    for (const control of [paletteRect, modeRect]) {
      expect(Math.abs(midY(control) - midY(titleRect))).toBeLessThanOrEqual(1)
      expect(control.width).toBe(control.height)
    }

    const overflow = (element: Element) =>
      element.scrollHeight - element.clientHeight
    const overviewOverflow = await viewport.evaluate(overflow)
    // The overview now ends with the chart grid, so it scrolls at every size.
    expect(overviewOverflow).toBeGreaterThan(0)
    await viewport.evaluate((element) => {
      element.scrollTop = element.scrollHeight
    })
    await expect(lastCard).toBeInViewport({ ratio: 1 })
    expect(await page.locator("html").evaluate(overflow)).toBe(0)

    await page.goto("/bills")
    const billsTitle = main.getByRole("heading", {
      name: "月账单",
      exact: true,
    })
    await expect(billsTitle).toHaveCSS("font-weight", "760")
    const billsTitleRect = await billsTitle.boundingBox()
    expect(billsTitleRect?.y).toBeCloseTo(titleRect.y, 0)
    const search = page.getByRole("searchbox", { name: "搜索账单" })
    const footer = main.locator(".data-table-footer")
    await expect(main.locator("tbody tr")).toHaveCount(10)
    const initialBillsOverflow = await viewport.evaluate(overflow)
    for (const query of ["", "BL-2610-01"]) {
      await search.fill(query)
      await expect(main.locator("tbody tr")).toHaveCount(query ? 1 : 10)
      const billsOverflow = await viewport.evaluate(overflow)
      expect(billsOverflow).toBe(initialBillsOverflow)
      if (height === 900) {
        expect(billsOverflow).toBeGreaterThan(0)
        await viewport.evaluate((element) => {
          element.scrollTop = element.scrollHeight
        })
      } else {
        expect(billsOverflow).toBe(0)
      }
      await expect(footer).toBeInViewport({ ratio: 1 })
      expect(await page.locator("html").evaluate(overflow)).toBe(0)
      const [workspace, pagination] = await Promise.all([
        main.boundingBox(),
        footer.boundingBox(),
      ])
      if (!workspace || !pagination)
        throw new Error("Workspace bounds unavailable")
      const footerGap =
        workspace.y + workspace.height - pagination.y - pagination.height
      // The register ends on the same line as the nav card (1px card border).
      expect(Math.abs(footerGap - 1)).toBeLessThanOrEqual(1)
    }
  })
}
