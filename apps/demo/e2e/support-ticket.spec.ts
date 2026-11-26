import { expect, test } from "./fixtures"

test("本地工单的补充说明在刷新后仍可按需查看", async ({ page }) => {
  await page.goto("/settings/org/members")
  const openSupport = page.getByRole("button", {
    name: "技术支持",
    exact: true,
  })
  const dialog = page.getByRole("dialog", { name: "技术支持" })
  const details = dialog.getByRole("button", { name: /^工单 .+ 的补充说明$/ })
  const notes = "账期切换后重复载入\n期望只载入一次"

  await openSupport.click()
  await expect(dialog.getByText("华为云 11 月子项目分摊比例核对")).toBeVisible()
  await expect(details).toHaveCount(0)
  await dialog.getByRole("textbox", { name: "问题摘要" }).fill("分摊明细刷新")
  await dialog
    .getByRole("textbox", { name: "补充说明（可选）" })
    .fill(`  ${notes}  `)
  await dialog.getByRole("button", { name: "保存工单" }).click()
  await expect(page.getByText(/^已保存演示工单 TK-/)).toBeVisible()
  await expect(details).toHaveAttribute("aria-expanded", "false")

  await page.reload()
  await openSupport.click()
  await expect(dialog.getByText("分摊明细刷新", { exact: true })).toBeVisible()
  await expect(details).toHaveAttribute("aria-expanded", "false")
  await details.press("Enter")
  await expect(details).toHaveAttribute("aria-expanded", "true")
  await expect(dialog.getByText(notes)).toBeVisible()
  expect(await dialog.getByText(notes).textContent()).toBe(notes)
})
