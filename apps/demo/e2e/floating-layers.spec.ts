import { expect, test } from "./fixtures"

for (const colorScheme of ["light", "dark"] as const) {
  test(`${colorScheme}：对话框、抽屉与 AlertDialog 页脚的按钮统一为 32px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.emulateMedia({ colorScheme, reducedMotion: "reduce" })
    const heights = (selector: string) =>
      page.$$eval(selector, (buttons) =>
        buttons.map((button) => [
          button.getAttribute("data-variant"),
          Math.round(button.getBoundingClientRect().height),
        ])
      )

    await page.goto("/bills")
    await page.locator(".bill-detail-action").first().click()
    expect(await heights("[data-slot=drawer-footer] button")).toEqual([
      ["default", 32],
      ["outline", 32],
    ])
    await page.keyboard.press("Escape")

    await page.goto("/overview")
    await page.locator(".attention-row button").first().click()
    expect(await heights("[data-slot=dialog-footer] button")).toEqual([
      ["outline", 32],
      ["default", 32],
    ])
  })
}

test("搜索页面浮层：输入框聚焦时显示渐变流光边框，且不改变高度", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto("/overview")
  await page.getByRole("button", { name: "导航搜索" }).click()
  const search = page.locator(".command-search")
  // Layout height (computed style), not the painted box: the dialog scales in
  // from 0.98, which would shrink getBoundingClientRect() mid-entrance.
  const idle = await search.evaluate((el) =>
    parseFloat(getComputedStyle(el).height)
  )
  await page.locator(".command-search input").focus()
  const focused = await search.evaluate((el) => {
    const style = getComputedStyle(el)
    return {
      height: parseFloat(style.height),
      border: style.borderTopWidth,
      image: style.backgroundImage,
    }
  })
  expect(focused.border).toBe("1px")
  expect(focused.image).toContain("gradient")
  expect(focused.height).toBe(idle)
})

test("按钮分级：页面级主操作 40px，浮层页脚 32px，小浮层 28px", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.emulateMedia({ reducedMotion: "reduce" })
  const height = (locator: ReturnType<typeof page.locator>) =>
    locator.evaluate((el) => (el as HTMLElement).offsetHeight)

  await page.goto("/settings/base/login")
  await page.locator(".base-card").first().click()
  expect(
    await height(
      page.locator(".base-preview-stage button[data-variant=default]").first()
    )
  ).toBe(40)

  await page.goto("/settings/components/overlay")
  await page.getByRole("button", { name: "Default", exact: true }).click()
  expect(
    await height(page.locator("[data-slot=alert-dialog-footer] button").first())
  ).toBe(32)
  await page.keyboard.press("Escape")
  await page.getByRole("button", { name: "Small", exact: true }).click()
  expect(
    await height(page.locator("[data-slot=alert-dialog-footer] button").first())
  ).toBe(28)
})

test("Navigation Menu 的原地弹层不被后面的卡片遮挡", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/settings/components/navigation")

  // Radix renders this popup in place (no portal), inside a glass card that is
  // its own stacking context; both modes must still paint above later cards.
  for (const [trigger, layer] of [
    ["Components", "navigation-menu-viewport"],
    ["List", "navigation-menu-content"],
  ] as const) {
    const button = page
      .locator("[data-slot=navigation-menu-trigger]")
      .filter({ hasText: new RegExp(`^${trigger}\\s*$`) })
    await button.scrollIntoViewIfNeeded()
    // Not a pointer click: right after another menu closes, Radix opens on
    // hover at once, and the click that follows would toggle it shut again.
    await button.dispatchEvent("click")
    const popup = page.locator(`[data-slot=${layer}][data-state=open]`)
    await expect(popup).toBeVisible()
    const covered = await popup.evaluate((element) => {
      const box = element.getBoundingClientRect()
      let count = 0
      for (const fx of [0.1, 0.5, 0.9])
        for (const fy of [0.1, 0.5, 0.9]) {
          const hit = document.elementFromPoint(
            box.left + box.width * fx,
            box.top + box.height * fy
          )
          if (!hit || !element.contains(hit)) count++
        }
      return count
    })
    expect(covered, `${trigger} 的弹层有采样点被遮挡`).toBe(0)
    await button.dispatchEvent("click")
    await expect(popup).toHaveCount(0)
  }
})

test("浮层选项行之间留 2px 间距，相邻的悬停与选中底色不相接", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.emulateMedia({ reducedMotion: "reduce" })

  // The visible highlight is the padding box: navigation links carry the gap
  // as a transparent edge, the shared rows as a margin.
  const highlights = (selector: string) =>
    page.$$eval(selector, (rows) =>
      rows.map((row) => {
        const box = row.getBoundingClientRect()
        const style = getComputedStyle(row)
        return {
          top: box.top + parseFloat(style.borderTopWidth),
          bottom: box.bottom - parseFloat(style.borderBottomWidth),
        }
      })
    )
  const gaps = (rows: { top: number; bottom: number }[]) =>
    rows.slice(1).map((row, index) => Math.round(row.top - rows[index]!.bottom))

  await page.goto("/bills")
  await page.locator("[data-slot=select-trigger]").first().click()
  const options = await highlights("[data-slot=select-item]")
  expect(options.length).toBeGreaterThan(2)
  expect(new Set(gaps(options))).toEqual(new Set([2]))
  await page.keyboard.press("Escape")

  await page.goto("/settings/components/navigation")
  await page
    .locator("[data-slot=navigation-menu-trigger]")
    .filter({ hasText: /^Simple List\s*$/ })
    .dispatchEvent("click")
  const links = await highlights(
    "[data-slot=navigation-menu-content][data-state=open] [data-slot=navigation-menu-link]"
  )
  expect(links).toHaveLength(3)
  expect(gaps(links)).toEqual([2, 2])
  // A single-line link is as tall as a menu row (31px), not a 36px card.
  for (const link of links)
    expect(Math.round(link.bottom - link.top)).toBeLessThanOrEqual(32)
})

test("分页数量下拉与触发器同宽，选项完整显示不被截断", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/bills")
  const trigger = page
    .locator(".data-table-pagination [data-slot=select-trigger]")
    .first()
  await trigger.scrollIntoViewIfNeeded()
  await trigger.click()
  const list = page.locator("[data-slot=select-content]")
  await expect(list).toBeVisible()
  // Wait out the open animation (it scales the list up from the trigger).
  const triggerWidth = Math.round((await trigger.boundingBox())!.width)
  await expect
    .poll(async () => Math.round((await list.boundingBox())!.width))
    .toBe(triggerWidth)
  const cut = await list
    .locator("[data-slot=select-item-text]")
    .evaluateAll((labels) =>
      labels
        .filter((label) => label.scrollWidth > label.clientWidth)
        .map((label) => label.textContent)
    )
  expect(cut).toEqual([])
})

test("抽屉头部不放关闭图标，只用页脚的关闭按钮", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.emulateMedia({ reducedMotion: "reduce" })
  for (const [path, open] of [
    ["/bills", () => page.locator(".bill-detail-action").first().click()],
    [
      "/settings/system/basic",
      () => page.getByRole("button", { name: "系统信息" }).first().click(),
    ],
  ] as const) {
    await page.goto(path)
    await open()
    await expect(page.locator("[data-slot=drawer-footer]")).toBeVisible()
    await expect(page.locator("[data-slot=drawer-header] button")).toHaveCount(
      0
    )
    await expect(
      page.locator("[data-slot=drawer-footer] button", { hasText: "关闭" })
    ).toHaveCount(1)
    await page.keyboard.press("Escape")
  }
})
