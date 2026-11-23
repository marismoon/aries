import { expect, test } from "./fixtures"

test.use({
  hasTouch: true,
  isMobile: true,
  viewport: { width: 1024, height: 768 },
})

test("触屏（pointer: coarse）下概览与导航的小控件点击区域不小于 40px", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/overview")
  expect(
    await page.evaluate(() => matchMedia("(pointer: coarse)").matches)
  ).toBe(true)
  await expect(page.locator(".attention-row").first()).toBeAttached()
  const heights = await page.evaluate(() => {
    const read = (selector: string) =>
      [...document.querySelectorAll<HTMLElement>(selector)]
        .filter((el) => el.getClientRects().length > 0)
        .map(
          (el) =>
            [selector, Math.round(el.getBoundingClientRect().height)] as const
        )
    return [
      ...read(".workflow-link"),
      ...read(".attention-action"),
      ...read(".workspace-nav-footer button"),
    ]
  })
  expect(heights.length).toBeGreaterThan(0)
  for (const [selector, height] of heights) {
    expect(height, selector).toBeGreaterThanOrEqual(40)
  }
})
