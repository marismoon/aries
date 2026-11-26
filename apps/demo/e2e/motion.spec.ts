import { expect, test } from "./fixtures"

test("减少动效时，页面与命令面板直接呈现最终态", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/overview")

  const route = page.locator('[data-motion-surface="route"]')
  await expect(route).toHaveCSS("opacity", "1")
  await expect(route).toHaveCSS("transform", "none")

  const directory = page.getByRole("navigation", { name: "工作区目录" })
  await directory.getByRole("link", { name: "月账单", exact: true }).click()
  await expect(page).toHaveURL(/\/bills$/)
  await expect(route).toHaveCSS("opacity", "1")
  await expect(route).toHaveCSS("transform", "none")

  const searchTrigger = page.getByRole("button", {
    name: "导航搜索",
    exact: true,
  })
  await searchTrigger.focus()
  await page.keyboard.press("Control+k")

  const dialog = page.getByRole("dialog", { name: "搜索页面" })
  await expect(dialog).toBeVisible()
  await expect(dialog).toHaveCSS("opacity", "1")
  await expect(dialog).toHaveCSS("transform", "none")
  await expect(dialog).toHaveCSS("animation-name", "none")
  await expect(
    dialog.getByRole("combobox", { name: "输入页面名称" })
  ).toBeFocused()

  await page.keyboard.press("Escape")
  await expect(dialog).toHaveCount(0)
  await expect(searchTrigger).toBeFocused()
})

test("快捷键直接打开命令面板，鼠标入口仍有过渡", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" })
  await page.goto("/overview")
  const trigger = page.getByRole("button", { name: "导航搜索", exact: true })
  await expect(trigger).toBeVisible()

  const dialog = page.getByRole("dialog", { name: "搜索页面" })
  await page.keyboard.press("Control+k")
  await expect(dialog).toHaveAttribute("data-motion", "instant")
  await expect(dialog).toHaveCSS("opacity", "1")
  await expect(dialog).toHaveCSS("transform", "none")
  await expect(
    dialog.getByRole("combobox", { name: "输入页面名称" })
  ).toBeFocused()
  await page.keyboard.press("Control+k")
  await expect(dialog).toHaveCount(0)
  await expect(trigger).toBeFocused()

  await trigger.click()
  await expect(dialog).toBeVisible()
  await expect(dialog).not.toHaveAttribute("data-motion", "instant")
  await page.keyboard.press("Escape")
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()
})

test("减少动态效果下：加载转圈仍在转，其余动画被关闭，跑马灯不保留合成层", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/settings/components/basic")
  const spinner = page.locator(".animate-spin").first()
  await expect(spinner).toBeAttached()
  const spin = await spinner.evaluate((el) => {
    const style = getComputedStyle(el)
    return [style.animationDuration, style.animationIterationCount]
  })
  expect(spin).toEqual(["2.4s", "infinite"])

  await page.goto("/overview")
  const track = page.locator(".attention-track").first()
  await expect(track).toBeAttached()
  expect(await track.evaluate((el) => getComputedStyle(el).willChange)).toBe(
    "auto"
  )
})
