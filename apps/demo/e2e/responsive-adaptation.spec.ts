import type { Page } from "@playwright/test"

import { expect, test } from "./fixtures"

/**
 * Marismoon Responsive Adaptation Contract: every viewport reuses the same shell,
 * has no global horizontal scroll, keeps navigation reachable and keeps
 * overlays inside the screen.
 */
const viewports = [
  [1920, 1080, "PC"],
  [1440, 900, "PC"],
  [1280, 800, "紧凑桌面"],
  [1024, 768, "iPad 横屏"],
  [820, 1180, "iPad 竖屏"],
  [768, 1024, "平板"],
  [430, 932, "手机"],
  [390, 844, "手机"],
  [375, 667, "小屏手机"],
  [844, 390, "手机横屏"],
] as const

async function expectNavReachable(page: Page, width: number) {
  const rail = page.locator(".icon-rail")
  const mobileTrigger = page.getByRole("button", { name: "打开工作区导航" })
  if (width <= 700) {
    await expect(mobileTrigger).toBeVisible()
    await mobileTrigger.click()
    const directory = page.getByRole("dialog", { name: "工作区导航" })
    await expect(directory).toBeVisible()
    await expect(
      directory.getByRole("link", { name: "月账单", exact: true })
    ).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(directory).toHaveCount(0)
  } else {
    await expect(rail).toBeVisible()
    await expect(
      page.getByRole("button", { name: /导航/ }).first()
    ).toBeVisible()
  }
}

for (const [width, height, label] of viewports) {
  for (const scheme of ["light", "dark"] as const) {
    test(`${width}×${height} ${label} ${scheme}：无横向滚动，导航与页头可用`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height })
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: "reduce" })

      for (const path of ["/overview", "/bills"]) {
        await page.goto(path)
        const h1 = page.getByRole("heading", { level: 1 })
        await expect(h1).toBeVisible()
        await page.evaluate(() => document.fonts.ready)

        const overflow = await page.evaluate(() => ({
          document: document.documentElement.scrollWidth - window.innerWidth,
          body: document.body.scrollWidth - window.innerWidth,
          workspace:
            (document.querySelector(".page-content-viewport")?.scrollWidth ??
              0) -
            (document.querySelector(".page-content-viewport")?.clientWidth ??
              0),
        }))
        expect(overflow.document, `${path} document`).toBeLessThanOrEqual(0)
        expect(overflow.body, `${path} body`).toBeLessThanOrEqual(0)
        expect(overflow.workspace, `${path} workspace`).toBeLessThanOrEqual(1)

        // The header never covers the content beneath it.
        const header = await page.locator(".page-header").boundingBox()
        const content = await page
          .locator(".page-content-viewport")
          .boundingBox()
        expect(header && content).toBeTruthy()
        expect(header!.y + header!.height).toBeLessThanOrEqual(
          content!.y + content!.height
        )
        const h1Box = (await h1.boundingBox())!
        expect(h1Box.x + h1Box.width).toBeLessThanOrEqual(width + 1)
      }

      await page.goto("/overview")
      await expectNavReachable(page, width)
    })
  }
}

test("iPad 竖屏默认收起第二列，图标栏保留，可手动展开", async ({ page }) => {
  await page.setViewportSize({ width: 820, height: 1180 })
  await page.goto("/bills")
  await expect(page.locator(".app-shell")).toHaveAttribute(
    "data-nav-collapsed",
    "true"
  )
  await expect(page.locator(".icon-rail")).toBeVisible()
  const main = await page.getByRole("main").boundingBox()
  expect(main!.width).toBeGreaterThan(600)

  await page
    .getByRole("button", { name: /展开.*导航|导航/ })
    .first()
    .click()
  await expect(page.locator(".app-shell")).toHaveAttribute(
    "data-nav-collapsed",
    "false"
  )
})

test("账单表格在 iPad 和手机上局部横向滚动，页面不动", async ({ page }) => {
  for (const [width, height] of [
    [820, 1180],
    [390, 844],
  ] as const) {
    await page.setViewportSize({ width, height })
    await page.goto("/bills")
    const scroll = page.getByRole("region", { name: "账单表格", exact: true })
    await expect(scroll).toBeVisible()
    expect(await scroll.evaluate((e) => e.scrollWidth > e.clientWidth)).toBe(
      true
    )
    // Every column stays reachable by scrolling the table itself.
    await scroll.evaluate((e) => {
      e.scrollLeft = e.scrollWidth
    })
    await expect(
      page.getByRole("columnheader", { name: "操作" })
    ).toBeInViewport()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth
      )
    ).toBeLessThanOrEqual(0)
  }
})

for (const [width, height] of [
  [1024, 768],
  [820, 1180],
  [430, 932],
  [375, 667],
] as const) {
  test(`${width}×${height}：Select、抽屉、AI 助手都在视口内`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height })
    await page.emulateMedia({ reducedMotion: "reduce" })
    await page.goto("/bills")
    const inside = async (selector: string) => {
      // Floating content starts off-screen until Radix has positioned it.
      await expect
        .poll(
          async () =>
            (await page.locator(selector).first().boundingBox())?.y ?? -999
        )
        .toBeGreaterThanOrEqual(-1)
      const box = (await page.locator(selector).first().boundingBox())!
      expect(box.x, `${selector} left`).toBeGreaterThanOrEqual(-1)
      expect(box.x + box.width, `${selector} right`).toBeLessThanOrEqual(
        width + 1
      )
      expect(box.y + box.height, `${selector} bottom`).toBeLessThanOrEqual(
        height + 1
      )
    }

    await page.getByRole("combobox", { name: "供应商", exact: true }).click()
    await expect(page.locator('[data-slot="select-content"]')).toBeVisible()
    await inside('[data-slot="select-content"]')
    await page.keyboard.press("Escape")

    await page.getByRole("button", { name: "查看账单 BL-2610-01" }).click()
    const drawer = page.locator('[data-slot="drawer-content"]')
    await expect(drawer).toBeVisible()
    await expect(drawer).toBeInViewport({ ratio: 0.99 })
    await inside('[data-slot="drawer-content"]')
    // Header and footer stay reachable while the body scrolls on its own.
    await expect(
      drawer.getByRole("button", { name: "关闭账单详情" })
    ).toBeInViewport()
    await expect(drawer.getByRole("button", { name: "编辑" })).toBeInViewport()
    await page.keyboard.press("Escape")
    await expect(drawer).toHaveCount(0)

    await page
      .getByRole("button", { name: /智算助手/ })
      .first()
      .click()
    await expect(page.locator(".copilot-panel")).toBeVisible()
    await inside(".copilot-panel")
    await inside(".copilot-composer")
  })
}

test("触控设备上主要控件的点击目标不小于 40px", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 820, height: 1180 },
    hasTouch: true,
    isMobile: true,
  })
  const page = await context.newPage()
  await page.goto("/bills")
  await expect(page.getByRole("table")).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  const small = await page.evaluate(() =>
    Array.from(
      document.querySelectorAll(
        'main button:not([role="checkbox"]), main [role="combobox"], main input, [data-slot="pagination-link"]'
      )
    )
      .map((element) => {
        const r = element.getBoundingClientRect()
        return {
          name: (
            element.getAttribute("aria-label") ??
            element.textContent ??
            ""
          ).slice(0, 16),
          w: Math.round(r.width),
          h: Math.round(r.height),
        }
      })
      .filter(({ w, h }) => w > 0 && h > 0 && (h < 40 || w < 32))
  )
  expect(small).toEqual([])

  // Checkboxes stay 16px visually; their hit area (::after) reaches 40px.
  const hit = await page.evaluate(() => {
    const box = document.querySelector('[role="checkbox"]')!
    const after = getComputedStyle(box, "::after")
    return {
      h: box.getBoundingClientRect().height + 2 * -parseFloat(after.top),
      w: box.getBoundingClientRect().width + 2 * -parseFloat(after.left),
    }
  })
  expect(hit.h).toBeGreaterThanOrEqual(40)
  expect(hit.w).toBeGreaterThanOrEqual(40)
  await context.close()
})
