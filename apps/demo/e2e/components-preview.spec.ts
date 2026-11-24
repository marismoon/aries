import { expect, test } from "./fixtures"

const pages = [
  ["规范", "/settings/components"],
  ["基础组件", "/settings/components/basic"],
  ["表单与输入", "/settings/components/form"],
  ["导航", "/settings/components/navigation"],
  ["浮层与反馈", "/settings/components/overlay"],
  ["数据展示", "/settings/components/data"],
  ["对话与 AI", "/settings/components/ai"],
] as const

test("组件预览是两级菜单，每个二级页面展示对应组件", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto("/settings/components")
  const directory = page.getByRole("navigation", { name: "工作区目录" })
  const folder = directory.getByRole("button", {
    name: "组件预览",
    exact: true,
  })
  await expect(folder).toHaveAttribute("aria-expanded", "true")

  for (const [label, path] of pages) {
    await directory.getByRole("link", { name: label, exact: true }).click()
    await expect(page).toHaveURL(new RegExp(`${path}$`))
    // The URL changes at once, but the link turns current only after the lazy
    // preview page has loaded and rendered. These are the heaviest pages in the
    // demo (the navigation page takes ~0.9s locally); on a cold Vite dev server
    // in CI, shared by two workers, that can pass the default 5s.
    await expect(
      directory.getByRole("link", { name: label, exact: true })
    ).toHaveAttribute("aria-current", "page", { timeout: 20_000 })
    await expect(page.getByRole("main")).toBeVisible()
  }
})

test("基础组件页渲染官方示例：按钮图标随尺寸缩放，徽标有多种颜色", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto("/settings/components/basic")
  await expect(
    page.getByRole("heading", { name: "Button", level: 2, exact: true })
  ).toBeVisible()
  const icon = page.locator('[data-slot="button"] svg[data-icon]').first()
  await expect(icon).toBeVisible()
  const width = await icon.evaluate((svg) => svg.getBoundingClientRect().width)
  expect(width).toBeLessThanOrEqual(20)

  // Ant Design preset colours are available as badge variants.
  for (const tone of [
    "red",
    "gold",
    "green",
    "cyan",
    "blue",
    "geekblue",
    "purple",
    "magenta",
  ]) {
    await expect(
      page.locator(`[data-slot="badge"][data-variant="${tone}"]`).first()
    ).toBeVisible()
  }
})

test("数据展示页包含表格模版与图表", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto("/settings/components/data")
  const demo = page.getByRole("group", { name: "DataTable（表格模版）" })
  await expect(demo).toHaveCount(0) // rendered as a heading block, not a card
  await expect(
    page.getByRole("heading", { name: "DataTable（表格模版）" })
  ).toBeVisible()
  await expect(page.getByRole("table").first()).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "Chart", level: 2 })
  ).toBeVisible()
})
