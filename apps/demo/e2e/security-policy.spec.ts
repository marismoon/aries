import { expect, test } from "./fixtures"

test("不强制二次验证在刷新后保留，兼容旧版保存的值", async ({ page }) => {
  await page.goto("/settings/security/policy")

  const scope = page.getByRole("combobox", { name: "二次验证（2FA）范围" })
  const timeout = page.getByRole("spinbutton", { name: "会话超时时间（小时）" })
  const form = page.locator("form").filter({ has: scope })

  await timeout.fill("18")
  await scope.click()
  await page.getByRole("option", { name: "不强制", exact: true }).click()
  await form.getByRole("button", { name: "保存" }).click()
  await expect(page.getByText("已保存二次验证与会话策略")).toBeVisible()

  await page.reload()
  await expect(scope).toHaveText("不强制")
  await expect(timeout).toHaveValue("18")

  await page.evaluate(() => {
    const key = "aries-demo-workspace-v1"
    const state = JSON.parse(localStorage.getItem(key)!)
    state.securityPolicy.enforceTwoFactor = "off"
    localStorage.setItem(key, JSON.stringify(state))
  })

  await page.reload()
  await expect(scope).toHaveText("不强制")
  await expect(timeout).toHaveValue("18")
})
