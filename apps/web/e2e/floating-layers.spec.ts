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
  const idle = await search.evaluate((el) => el.getBoundingClientRect().height)
  await page.locator(".command-search input").focus()
  const focused = await search.evaluate((el) => {
    const style = getComputedStyle(el)
    return {
      height: el.getBoundingClientRect().height,
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
