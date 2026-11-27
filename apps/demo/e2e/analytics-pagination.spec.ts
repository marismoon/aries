import { expect, test } from "./fixtures"

for (const route of ["cost-allocation", "cost-overview"]) {
  test(`${route} displays cost records inside the scroll region`, async ({
    page,
  }) => {
    await page.goto(`/analytics/${route}`)
    const region = page.getByRole("region", { name: "部门与项目成本分摊明细" })
    const department = (name: string) =>
      region.getByRole("rowheader").getByText(name, { exact: true })
    const first = department("研发中心")
    await first.scrollIntoViewIfNeeded()
    await expect(first).toBeInViewport()
    await expect(region.getByRole("row", { name: /研发中心/ })).toContainText(
      "¥240.2"
    )

    await page.getByLabel("下一页", { exact: true }).click()
    const last = department("技术文档部")
    await last.scrollIntoViewIfNeeded()
    await expect(last).toBeInViewport()
  })
}

for (const [route, record] of [
  ["backend-storage", "pg-notification-log"],
  ["system-infra", "inference-singapore"],
  ["system-sla", "用量预测服务"],
] as const) {
  test(`${route} keeps the selected page when rendering table data`, async ({
    page,
  }) => {
    await page.goto(`/analytics/${route}`)
    const rows = page.getByRole("table").locator("tbody tr")
    await expect(rows).toHaveCount(10)
    await page.getByLabel("下一页", { exact: true }).click()
    await expect(rows.filter({ hasText: record })).toBeVisible()
    await page.getByLabel("上一页", { exact: true }).click()
    await expect(rows).toHaveCount(10)
    await expect(rows.filter({ hasText: record })).toHaveCount(0)
  })
}
