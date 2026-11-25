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

test("AI 助手发送按钮：默认 Linear，悬停与按下为 Bold，禁用时不切换", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto("/overview")
  await page.locator('[data-copilot-trigger="rail"]').click()
  const panel = page.getByRole("complementary", { name: "AI 助手" })
  const send = panel.getByRole("button", { name: "发送问题" })

  await expect(send).toBeDisabled()
  await send.hover({ force: true })
  expect(await visible(send)).toEqual(["linear"])

  await page.mouse.move(700, 450)
  await panel.getByRole("textbox", { name: "向智算助手提问" }).fill("本月费用")
  await expect(send).toBeEnabled()
  expect(await visible(send)).toEqual(["linear"])

  await send.hover()
  expect(await visible(send)).toEqual(["bold"])

  // Pressed without hover: what a tap or a keyboard activation looks like.
  await page.mouse.move(700, 450)
  expect(await visible(send)).toEqual(["linear"])
  await send.focus()
  await page.keyboard.down("Space")
  expect(await visible(send)).toEqual(["bold"])
  await page.keyboard.up("Space")
})

test("关闭按钮：静止为次要色 Linear，悬停为正文色 Bold，始终不带底色", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto("/overview")
  await page.locator('[data-copilot-trigger="rail"]').click()
  const panel = page.getByRole("complementary", { name: "AI 助手" })
  const close = panel.getByRole("button", { name: "关闭智算助手" })
  const look = () =>
    close.evaluate((element) => {
      const { color, backgroundColor } = getComputedStyle(element)
      return { color, backgroundColor }
    })

  await page.mouse.move(700, 450)
  expect(await visible(close)).toEqual(["linear"])
  const idle = await look()
  expect(idle.backgroundColor).toBe("rgba(0, 0, 0, 0)")

  await close.hover()
  expect(await visible(close)).toEqual(["bold"])
  await expect.poll(async () => (await look()).color).not.toBe(idle.color)
  expect((await look()).backgroundColor).toBe("rgba(0, 0, 0, 0)")
})
