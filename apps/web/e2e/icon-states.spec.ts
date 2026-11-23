import { expect, test } from "./fixtures"

const visible = (
  button: ReturnType<import("@playwright/test").Page["locator"]>
) =>
  button.evaluate((element) =>
    [...element.querySelectorAll<SVGElement>("svg[data-icon-variant]")]
      .filter((svg) => getComputedStyle(svg).display !== "none")
      .map((svg) => svg.dataset.iconVariant)
  )

test("一级导航：默认 Linear，选中与悬停为同网格的 Bold，且不改变尺寸", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto("/overview")
  const rail = page.getByRole("navigation", { name: "主模块" })
  const active = rail.getByRole("button", { name: "总览", exact: true })
  const idle = rail.getByRole("button", { name: "告警通知", exact: true })

  await expect(active).toHaveAttribute("aria-current", "true")
  expect(await visible(active)).toEqual(["bold"])
  expect(await visible(idle)).toEqual(["linear"])

  // Layout size (the dock zoom scales the button, not the icon box).
  const size = (selector: string) =>
    idle
      .locator(selector)
      .first()
      .evaluate((svg) => {
        const { width, height } = getComputedStyle(svg)
        return [width, height]
      })
  const before = await size("svg:visible")
  expect(before).toEqual(["22px", "22px"])

  await idle.hover()
  expect(await visible(idle)).toEqual(["bold"])
  expect(await size("svg:visible")).toEqual(before)

  await page.mouse.move(700, 450)
  expect(await visible(idle)).toEqual(["linear"])
})

test("第二列：当前页面图标为 Bold，未开放入口悬停不切换", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto("/overview")
  const directory = page.getByRole("navigation", { name: "工作区目录" })
  const current = directory.getByRole("link", { name: "运营总览", exact: true })
  expect(await visible(current)).toEqual(["bold"])
})
