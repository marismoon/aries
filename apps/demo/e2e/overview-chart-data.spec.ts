import { expect, test } from "./fixtures"

test("overview plots preserve scatter points, heatmap intensity and budget precision", async ({
  page,
}) => {
  await page.goto("/overview")
  const scatter = page.getByRole("group", { name: "金额与解析耗时" })
  await expect(scatter).toBeVisible({ timeout: 20_000 })
  const points = scatter.getByRole("img").locator("svg circle")
  await expect(points).toHaveCount(14)

  const heatmap = page.getByRole("group", { name: "采集任务热力" })
  const cells = heatmap.locator(
    'rect[fill^="color-mix"]:not([pointer-events="none"])'
  )
  await expect(cells).toHaveCount(35)
  const fills = await cells.evaluateAll((rects) =>
    rects.map((r) => r.getAttribute("fill"))
  )
  expect(new Set(fills).size).toBeGreaterThan(1)

  const budget = page.getByRole("group", { name: "年度预算使用率" })
  await expect(
    budget.getByRole("img").getByText("84.4%", { exact: true })
  ).toBeVisible()
})
