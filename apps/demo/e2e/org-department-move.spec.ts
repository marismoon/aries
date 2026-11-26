import { expect, test } from "./fixtures"

for (const touch of [false, true]) {
  test.describe(touch ? "手机触控" : "桌面键盘", () => {
    test.use({
      viewport: touch
        ? { width: 390, height: 844 }
        : { width: 1440, height: 900 },
      hasTouch: touch,
      isMobile: touch,
      reducedMotion: "reduce",
    })

    test("从部门菜单调整归属并在刷新后保留", async ({ page }) => {
      await page.goto("/settings/org/departments")
      const tree = page.getByRole("region", { name: "组织架构", exact: true })
      const trigger = tree.getByRole("button", {
        name: "更多部门操作 研发中心",
      })
      const dialog = page.getByRole("dialog", { name: "移动「研发中心」" })
      const target = dialog.getByRole("combobox", { name: "目标上级部门" })
      async function openMove() {
        const action = page.getByRole("menuitem", { name: "移动到…" })
        if (touch) {
          await trigger.tap()
          await action.tap()
        } else {
          await trigger.press("Enter")
          await action.press("Enter")
          await expect(target).toBeFocused()
        }
      }

      await openMove()
      await expect(
        dialog.getByRole("button", { name: "确认移动" })
      ).toBeDisabled()
      await page.keyboard.press("Escape")
      await expect(dialog).toBeHidden()
      if (!touch) await expect(trigger).toBeFocused()

      await openMove()
      if (touch) await target.tap()
      else await target.press("Enter")

      const options = page.getByRole("listbox")
      await expect(options).toHaveAttribute("data-align-trigger", "true")
      await expect(
        options.getByRole("option", {
          name: /Aries 科技有限公司|研发中心|云平台部|质量工程组|站点可靠性组/,
        })
      ).toHaveCount(0)
      const finance = options.getByRole("option", { name: /^财务运营部/ })
      if (touch) await finance.tap()
      else await finance.press("Enter")

      await expect(target).toContainText("财务运营部")
      const targetBox = (await target.boundingBox())!
      if (touch) await target.tap()
      else await target.press("Enter")
      await expect(finance).toHaveAttribute("data-state", "checked")
      const targetCenter = targetBox.y + targetBox.height / 2
      await expect
        .poll(async () => {
          const selectedBox = (await finance.boundingBox())!
          return Math.abs(targetCenter - selectedBox.y - selectedBox.height / 2)
        })
        .toBeLessThanOrEqual(2)
      await page.keyboard.press("Escape")
      await expect(options).toBeHidden()

      const confirmMove = dialog.getByRole("button", { name: "确认移动" })
      if (touch) await confirmMove.tap()
      else await confirmMove.press("Enter")
      await expect(
        page.getByText("已调整部门层级归属", { exact: true })
      ).toBeVisible()
      await expect(dialog).toBeHidden()
      if (!touch) await expect(trigger).toBeFocused()

      await page.reload()
      const newLocation = tree.locator(
        'li:has(> .dept-tree-row > [data-department-id="dept-finops"]) [data-department-id="dept-rd"]'
      )
      await expect(newLocation).toBeAttached()
      await expect(
        tree.getByRole("button", { name: /^Aries 科技有限公司/ })
      ).toBeVisible()
      await expect(
        tree.getByText("拖拽调整部门层级", { exact: true })
      ).toHaveCount(0)
    })
  })
}
