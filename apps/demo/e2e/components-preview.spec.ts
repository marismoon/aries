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

test("日历的选中底是比格子小一圈的正圆，相邻两天不相接", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/settings/components/form")

  // April 2026 in the Spanish example: the 4th is a Saturday and the 5th a
  // Sunday, the last column, where the end of a range used to lose its
  // right-hand rounding.
  const month = page.getByRole("grid", { name: "abril 2026" })
  const day = (label: string) =>
    month
      .locator("tbody td:not([data-outside]) button")
      .filter({ hasText: new RegExp(`^${label}$`) })
  await day("4").scrollIntoViewIfNeeded()
  await day("4").click()
  await day("5").click()

  const shape = (label: string) =>
    day(label).evaluate((button) => {
      const box = button.getBoundingClientRect()
      const cell = button.closest("td")!.getBoundingClientRect()
      const style = getComputedStyle(button)
      return {
        left: box.left,
        right: box.right,
        width: box.width,
        height: box.height,
        cell: cell.width,
        round: [
          style.borderTopLeftRadius,
          style.borderTopRightRadius,
          style.borderBottomRightRadius,
          style.borderBottomLeftRadius,
        ].every((radius) => parseFloat(radius) >= box.height / 2),
      }
    })
  const start = await shape("4")
  const end = await shape("5")
  for (const circle of [start, end]) {
    expect(circle.round).toBe(true)
    expect(circle.width).toBe(circle.height)
    expect(circle.cell - circle.width).toBe(4)
  }
  expect(end.left - start.right).toBe(4)
})

test("输入组里的多行文本框聚焦时只有外层一条渐变边", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/settings/components/form")

  const group = page
    .locator("[data-slot=input-group]")
    .filter({ hasText: "0/500 characters" })
  const textarea = group.locator("textarea")
  await textarea.scrollIntoViewIfNeeded()
  await textarea.focus()

  // The group is the field surface and carries the focus edge...
  expect(
    await group.evaluate((element) => getComputedStyle(element).backgroundImage)
  ).toContain("gradient")
  // ...and the textarea inside it draws nothing of its own.
  await expect(textarea).not.toHaveClass(/field-surface/)
  await expect(textarea).toHaveCSS("background-image", "none")
  await expect(textarea).toHaveCSS("background-color", "rgba(0, 0, 0, 0)")
  await expect(textarea).toHaveCSS("border-top-left-radius", "0px")
  expect(
    await textarea.evaluate((element) =>
      getComputedStyle(element)
        .boxShadow.split(/,(?![^(]*\))/)
        .every((layer) => / 0px 0px 0px 0px$/.test(layer.trim()))
    )
  ).toBe(true)
})

test("输入框聚焦边的渐变首尾同色，左右两条边和四角颜色一致", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/settings/components/form")

  for (const selector of [
    "input[data-slot=input]:not([data-embedded])",
    "textarea:not([data-embedded])",
  ]) {
    const field = page.locator(selector).first()
    await field.scrollIntoViewIfNeeded()
    await field.focus()
    // The edge is the second background layer; a horizontal gradient paints
    // the left border with its last stop and the right border with its first.
    const stops = await field.evaluate((element) => {
      const edge = getComputedStyle(element).backgroundImage.split(
        "linear-gradient(270deg"
      )[1]
      return edge?.match(/rgba?\([^)]+\)|color\([^)]+\)/g) ?? []
    })
    expect(stops.length).toBeGreaterThan(2)
    expect(stops.at(-1)).toBe(stops[0])
  }
})
