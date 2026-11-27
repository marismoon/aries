import { expect, test } from "./fixtures"

test("英文登录页加载时显示英文状态提示", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("aries-language", "en"))
  let releaseLoginModule!: () => void
  const loginModule = new Promise<void>((resolve) => {
    releaseLoginModule = resolve
  })
  await page.route("**/BasePagesPage.tsx*", async (route) => {
    await loginModule
    await route.continue()
  })

  try {
    await page.goto("/settings/base/login", { waitUntil: "commit" })
    await expect(page.locator("html")).toHaveAttribute("lang", "en")
    await expect(
      page.getByRole("status", { name: "Loading workspace" })
    ).toBeVisible()
  } finally {
    releaseLoginModule()
  }
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Sign-in and account"
  )
})

test("语言控件切换中英文，刷新后保留，并同步 html lang", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto("/overview")
  const html = page.locator("html")
  await expect(html).toHaveAttribute("lang", "zh-CN")
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("运营总览")

  await page.getByRole("button", { name: "语言", exact: true }).click()
  await expect(html).toHaveAttribute("lang", "en")
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Operations overview"
  )
  const rail = page.getByRole("navigation", { name: "Main modules" })
  await expect(
    rail.getByRole("button", { name: "Collection", exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole("navigation", { name: "Workspace directory" })
  ).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Language", exact: true })
  ).toBeVisible()

  await page.reload()
  await expect(html).toHaveAttribute("lang", "en")
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Operations overview"
  )

  await page.getByRole("button", { name: "Language", exact: true }).click()
  await expect(html).toHaveAttribute("lang", "zh-CN")
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("运营总览")
})

test("英文消息规则仅在表格横向溢出时显示渠道和静默时段提示", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.addInitScript(() => localStorage.setItem("aries-language", "en"))
  await page.goto("/settings/integrations/rules")

  const table = page.getByRole("region", { name: "Message rules", exact: true })
  const hint = page.getByText("Scroll sideways for channels and quiet hours", {
    exact: true,
  })
  await expect(table).toBeVisible()
  await expect(hint).toHaveCount(0)

  await page.setViewportSize({ width: 390, height: 844 })
  await expect(hint).toBeVisible()
  await expect(table).toHaveAccessibleDescription(
    "Scroll sideways for channels and quiet hours"
  )
  await table.focus()
  await page.keyboard.press("ArrowRight")
  await expect
    .poll(() => table.evaluate((el) => el.scrollLeft))
    .toBeGreaterThan(0)

  await page.setViewportSize({ width: 1440, height: 900 })
  await expect(hint).toHaveCount(0)
  await expect(table).not.toHaveAttribute("aria-describedby")
})

for (const path of [
  "/overview",
  "/bills",
  "/settings/components/charts",
  "/settings/base/login",
  "/settings/base/security",
  "/settings/base/session",
]) {
  test(`英文下 ${path} 没有遗留中文`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.addInitScript(() => localStorage.setItem("aries-language", "en"))
    await page.goto(path)
    await expect(page.locator("html")).toHaveAttribute("lang", "en")
    await expect(
      page.getByRole("main").getByRole("heading", { level: 1 })
    ).toBeVisible({ timeout: 20_000 })
    if (path === "/settings/components/charts") {
      await expect(
        page.getByRole("group", { name: "Sparkline KPI cards" })
      ).toBeVisible()
    }
    await page.waitForTimeout(600)
    const leftovers = await page.evaluate(() => {
      const cjk = /[一-鿿]/
      const found = new Set<string>()
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT
      )
      while (walker.nextNode()) {
        const text = walker.currentNode.textContent ?? ""
        if (cjk.test(text)) found.add(text.trim().slice(0, 60))
      }
      for (const element of document.querySelectorAll(
        "[aria-label],[title],[placeholder]"
      )) {
        for (const name of ["aria-label", "title", "placeholder"]) {
          const value = element.getAttribute(name) ?? ""
          if (cjk.test(value)) found.add(`@${name}: ${value.slice(0, 60)}`)
        }
      }
      return [...found]
    })
    expect(leftovers).toEqual([])
  })
}

test("英文下概览的标签、徽标与操作按钮不重叠、不超出容器", async ({ page }) => {
  for (const [width, height] of [
    [1440, 900],
    [1280, 800],
  ] as const) {
    await page.setViewportSize({ width, height })
    await page.addInitScript(() => localStorage.setItem("aries-language", "en"))
    await page.goto("/overview")
    await expect(page.locator(".attention-row").first()).toBeVisible()
    const problems = await page.evaluate(() => {
      const found: string[] = []
      const toolbar = document
        .querySelector(".activity-toolbar")!
        .getBoundingClientRect()
      for (const tab of document.querySelectorAll(
        ".activity-toolbar [data-slot=tabs-trigger]"
      )) {
        const box = tab.getBoundingClientRect()
        if (box.left < toolbar.left - 0.5 || box.right > toolbar.right + 0.5)
          found.push(`tab outside capsule: ${tab.textContent}`)
      }
      for (const row of document.querySelectorAll(".attention-row")) {
        const badge = row
          .querySelector(".attention-badge")
          ?.getBoundingClientRect()
        const action = row.querySelector("button")?.getBoundingClientRect()
        if (badge && action && badge.right > action.left - 2)
          found.push(`badge overlaps action: ${row.textContent?.slice(0, 40)}`)
      }
      for (const el of document.querySelectorAll(
        ".overview-kpi-heading *, .data-table th"
      )) {
        if (
          el.scrollWidth > el.clientWidth + 1 &&
          getComputedStyle(el).overflow !== "visible"
        )
          found.push(`clipped: ${el.textContent}`)
      }
      return found
    })
    expect(problems, `${width}px`).toEqual([])
  }
})

test("暗色下切换暗色风格后，滚动边缘仍由内容自身淡出", async ({ page }) => {
  await page.setViewportSize({ width: 1650, height: 1060 })
  await page.emulateMedia({ colorScheme: "dark" })
  await page.addInitScript(() =>
    localStorage.setItem("aries-dark-style", "clean")
  )
  await page.goto("/overview")
  await page.getByRole("button", { name: "暗色风格" }).click()
  await page.evaluate(() => {
    document.querySelector(".page-content-viewport")!.scrollTop = 60
  })
  await expect(page.locator(".page-content-viewport")).toHaveAttribute(
    "data-scrolled",
    "true"
  )
  // No strip is painted over the edge, so nothing has to match the page
  // background (which dark glass leaves transparent for its light).
  const edge = await page.evaluate(() => {
    const viewport = document.querySelector(".page-content-viewport")!
    const style = getComputedStyle(viewport)
    return {
      start: style.getPropertyValue("--scroll-edge-start").trim(),
      mask: style.maskImage.includes("linear-gradient"),
      overlay: getComputedStyle(viewport.parentElement!, "::after").content,
    }
  })
  expect(edge).toEqual({ start: "28px", mask: true, overlay: "none" })
})
