import { expect, test } from "@playwright/test"

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

for (const path of [
  "/overview",
  "/bills",
  "/settings/base/login",
  "/settings/base/security",
  "/settings/base/session",
]) {
  test(`英文下 ${path} 没有遗留中文`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.addInitScript(() =>
      localStorage.setItem("marismoon-language", "en")
    )
    await page.goto(path)
    await expect(page.locator("html")).toHaveAttribute("lang", "en")
    await expect(page.locator("main, [role=main], body").first()).toBeVisible()
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
    await page.addInitScript(() =>
      localStorage.setItem("marismoon-language", "en")
    )
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

test("暗色下切换暗色风格后，滚动边缘的渐隐与页面背景一致", async ({ page }) => {
  await page.setViewportSize({ width: 1650, height: 1060 })
  await page.emulateMedia({ colorScheme: "dark" })
  await page.addInitScript(() =>
    localStorage.setItem("marismoon-dark-style", "clean")
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
  const same = await page.evaluate(() => {
    const frame = document.querySelector(".page-content-frame")!
    const fade = getComputedStyle(frame, "::after").backgroundImage
    return fade === getComputedStyle(document.body).backgroundImage
  })
  expect(same).toBe(true)
})
