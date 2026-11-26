import { expect, test } from "./fixtures"

const cards = [
  { path: "/settings/org/members", title: "企业员工" },
  { path: "/settings/org/departments", title: "组织架构" },
] as const

for (const [width, height] of [
  [1440, 900],
  [390, 844],
] as const) {
  test(`${width}×${height} 组织顶层固定，下级部门独立滚动`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height })
    await page.emulateMedia({ reducedMotion: "reduce" })

    for (const { path, title } of cards) {
      await page.goto(path)
      const card = page.getByRole("region", { name: title, exact: true })
      const root = card.getByRole("button", { name: /^Aries 科技有限公司/ })
      const rootPill = card.locator(
        ".dept-tree-root > .dept-tree-row > .nav-pill--active"
      )
      const children = card.getByRole("group", { name: "下级部门" })
      const firstDepartment = children.getByRole("button", {
        name: /^财务运营部/,
      })
      await expect(root).toBeVisible()
      await expect(rootPill).toBeVisible()
      await expect(
        children.getByRole("button", { name: /^法务事务部/ })
      ).toBeAttached()

      await children.focus()
      const rootBefore = await root.boundingBox()
      const pillBefore = await rootPill.boundingBox()
      const firstBefore = (await firstDepartment.boundingBox())!
      if (width >= 900) {
        await children.hover()
        await page.mouse.wheel(0, 260)
      } else {
        await page.keyboard.press("PageDown")
      }
      await expect
        .poll(() => children.evaluate((element) => element.scrollTop))
        .toBeGreaterThan(0)
      expect((await firstDepartment.boundingBox())!.y).toBeLessThan(
        firstBefore.y
      )
      expect(await root.boundingBox()).toEqual(rootBefore)
      expect(await rootPill.boundingBox()).toEqual(pillBefore)

      const toggle = card.getByRole("button", {
        name: "展开或收起 Aries 科技有限公司",
      })
      await toggle.click()
      await expect(toggle).toHaveAttribute("aria-expanded", "false")
      await expect(
        card.locator(".dept-tree-root > .nav-tree-panel")
      ).toHaveAttribute("inert", "")
      await toggle.click()
      await expect(toggle).toHaveAttribute("aria-expanded", "true")

      await card.getByRole("searchbox").fill("法务事务部")
      await expect(root).toBeVisible()
      await expect(
        children.getByRole("button", { name: /^法务事务部/ })
      ).toBeVisible()
      await expect(firstDepartment).toHaveCount(0)
      await card.getByRole("searchbox").fill("没有匹配的部门")
      await expect(root).toBeVisible()
      await expect(children.locator(".dept-tree-row")).toHaveCount(0)
    }
  })
}
