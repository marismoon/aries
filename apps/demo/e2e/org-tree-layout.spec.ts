import { expect, test } from "./fixtures"

test("角色目录的顶级角色图标和名称左对齐", async ({ page }) => {
  await page.goto("/settings/org/roles")
  const tree = page.getByRole("region", { name: "角色目录" })
  await tree
    .getByRole("button", { name: "更多角色操作 超级管理员" })
    .press("Enter")
  await page.getByRole("menuitem", { name: "复制为新角色" }).press("Enter")

  const roots = tree.locator(
    ".workspace-nav-list > li > .dept-tree-row > .workspace-nav-item"
  )
  await expect(roots).toHaveCount(2)
  const offsets = await roots.evaluateAll((nodes) =>
    nodes.map((node) => {
      const icon = [...node.querySelectorAll(":scope > svg")].find(
        (svg) => svg.getClientRects().length > 0
      )!
      const name = node.querySelector(".dept-tree-name")!
      return [
        icon.getBoundingClientRect().left,
        name.getBoundingClientRect().left,
      ]
    })
  )
  expect(offsets[1]).toEqual(offsets[0])
})

const directories = [
  { page: "members", title: "企业员工", branch: "研发中心" },
  { page: "roles", title: "角色目录", branch: "成本分析师" },
  { page: "departments", title: "组织架构", branch: "研发中心" },
]

for (const mobile of [false, true]) {
  test.describe(mobile ? "手机目录" : "桌面目录", () => {
    test.use({
      viewport: mobile
        ? { width: 390, height: 844 }
        : { width: 1440, height: 900 },
      hasTouch: mobile,
      isMobile: mobile,
      reducedMotion: "reduce",
    })

    for (const directory of directories) {
      test(`${directory.title}的下级节点字体一致、同层左对齐`, async ({
        page,
      }) => {
        await page.goto(`/settings/org/${directory.page}`)
        const tree = page.getByRole("region", { name: directory.title })
        const branch = tree.getByRole("button", {
          name: new RegExp(`^${directory.branch}`),
        })
        await branch.press("Enter")
        await expect(branch).toHaveAttribute("aria-current", "true")

        const rows = await tree
          .locator(
            ".nav-tree-children > li > .dept-tree-row > .workspace-nav-item"
          )
          .evaluateAll((items) =>
            items
              .filter((item) => !item.closest("[inert]"))
              .map((item) => {
                const name = item.querySelector(".dept-tree-name")!
                const icon = [...item.querySelectorAll(":scope > svg")].find(
                  (svg) => svg.getClientRects().length > 0
                )!
                const { fontFamily, fontSize, fontWeight } =
                  getComputedStyle(name)
                let depth = 0
                let list = item.closest(".nav-tree-children")
                while (list) {
                  depth++
                  list =
                    list.parentElement?.closest(".nav-tree-children") ?? null
                }
                return {
                  depth,
                  font: `${fontFamily} ${fontSize} ${fontWeight}`,
                  nameLeft: name.getBoundingClientRect().left,
                  iconLeft: icon.getBoundingClientRect().left,
                  height: item.getBoundingClientRect().height,
                }
              })
          )

        expect(new Set(rows.map((row) => row.font)).size).toBe(1)
        expect(new Set(rows.map((row) => row.height)).size).toBe(1)
        if (mobile) expect(rows[0]!.height).toBeGreaterThanOrEqual(40)
        if (!mobile) {
          const navLeaf = page.locator(
            ".workspace-directory a.nav-tree-leaf[aria-current='page']"
          )
          await expect(navLeaf).toBeVisible()
          expect(rows[0]!.height).toBe((await navLeaf.boundingBox())!.height)
          await expect(
            tree.locator(".workspace-directory > .nav-pill--active")
          ).toHaveCSS(
            "height",
            await page
              .locator(
                ".workspace-directory:has(a[aria-current='page']) > .nav-pill--active"
              )
              .evaluate((pill) => getComputedStyle(pill).height)
          )
        }

        const levels = [...new Set(rows.map((row) => row.depth))].sort()
        expect(levels.length).toBeGreaterThan(1)
        for (const depth of levels) {
          const siblings = rows.filter((row) => row.depth === depth)
          expect(new Set(siblings.map((row) => row.nameLeft)).size).toBe(1)
          expect(new Set(siblings.map((row) => row.iconLeft)).size).toBe(1)
          const parent = rows.find((row) => row.depth === depth - 1)
          if (parent)
            expect(siblings[0]!.nameLeft).toBeGreaterThan(parent.nameLeft)
        }
      })
    }
  })
}

test("根组织和超级管理员可创建子节点，自身信息受保护", async ({ page }) => {
  await page.goto("/settings/org/departments")
  const org = page.getByRole("region", { name: "组织架构" })
  await org
    .getByRole("button", { name: "更多部门操作 Aries 科技有限公司" })
    .click()
  await expect(page.getByRole("menuitem", { name: "创建子部门" })).toBeVisible()
  await expect(page.getByRole("menuitem", { name: "编辑部门" })).toHaveCount(0)
  await expect(
    page.getByRole("menuitem", { name: "修改部门名称" })
  ).toHaveCount(0)

  await page.goto("/settings/org/roles")
  const roles = page.getByRole("region", { name: "角色目录" })
  await expect(page.getByRole("button", { name: "系统保护" })).toBeDisabled()
  await roles.getByRole("button", { name: "更多角色操作 超级管理员" }).click()
  await expect(page.getByRole("menuitem", { name: "创建子角色" })).toBeVisible()
  await expect(
    page.getByRole("menuitem", { name: "编辑名称与说明" })
  ).toHaveCount(0)
})
