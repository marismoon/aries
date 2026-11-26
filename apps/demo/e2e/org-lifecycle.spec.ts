import { expect, test } from "./fixtures"

test.use({ reducedMotion: "reduce" })

test("成员可以停用、启用和确认删除，刷新后不会恢复模拟成员", async ({
  page,
}) => {
  await page.goto("/settings/org/members")
  const filter = page.getByRole("searchbox", { name: "搜索姓名、邮箱或部门" })
  await filter.fill("jordan.shen@aries.example")
  const edit = page.getByRole("button", { name: "编辑成员 Jordan Shen" })
  await edit.click()

  const drawer = page.getByRole("dialog", { name: "Jordan Shen" })
  await drawer.getByRole("button", { name: "停用", exact: true }).click()
  await expect(drawer.getByRole("combobox", { name: "账号状态" })).toHaveText(
    "已禁用"
  )
  await drawer.getByRole("button", { name: "启用", exact: true }).click()
  await expect(drawer.getByRole("combobox", { name: "账号状态" })).toHaveText(
    "正常"
  )

  const remove = drawer.getByRole("button", { name: "删除", exact: true })
  const confirmation = page.getByRole("alertdialog", {
    name: "删除「Jordan Shen」？",
  })
  await remove.click()
  await confirmation.getByRole("button", { name: "取消" }).click()
  await expect(drawer).toBeVisible()
  await remove.click()
  await confirmation.getByRole("button", { name: "删除", exact: true }).click()
  await expect(drawer).toBeHidden()
  await expect(edit).toHaveCount(0)
  await page.reload()
  await filter.fill("jordan.shen@aries.example")
  await expect(edit).toHaveCount(0)
})

test("已停用的角色无法添加成员，自定义角色可确认删除", async ({ page }) => {
  await page.goto("/settings/org/roles")
  const tree = page.getByRole("region", { name: "角色目录" })
  await tree
    .getByRole("button", { name: "更多角色操作 超级管理员" })
    .press("Enter")
  await page.getByRole("menuitem", { name: "复制为新角色" }).press("Enter")
  const name = "超级管理员 (副本)"
  await expect(page.getByRole("heading", { name, exact: true })).toBeVisible()
  await page.getByRole("button", { name: "停用", exact: true }).click()
  await page.getByRole("tab", { name: "关联成员" }).click()
  const add = page.getByRole("button", { name: "添加", exact: true })
  await expect(add).toBeDisabled()
  await page.reload()
  await tree.getByRole("button", { name: /^超级管理员 \(副本\)/ }).click()
  await expect(
    page.getByRole("button", { name: "启用", exact: true })
  ).toBeVisible()
  await page.getByRole("button", { name: "删除", exact: true }).click()
  await page
    .getByRole("alertdialog", { name: `删除「${name}」？` })
    .getByRole("button", { name: "删除", exact: true })
    .click()
  await expect(
    tree.getByRole("button", { name: /^超级管理员 \(副本\)/ })
  ).toHaveCount(0)
})

test("部门停用后不能新建下级，删除空部门后返回上级", async ({ page }) => {
  await page.goto("/settings/org/departments")
  const tree = page.getByRole("region", { name: "组织架构", exact: true })
  const newDepartment = tree.getByRole("button", {
    name: "新增子部门",
    exact: true,
  })
  await newDepartment.click()
  const create = page.getByRole("dialog", { name: "新增子部门", exact: true })
  const name = "测试归档部门"
  await create.getByRole("textbox", { name: "部门名称" }).fill(name)
  await create.getByRole("combobox", { name: "部门负责人" }).fill("陈思远")
  await create.getByRole("option", { name: /陈思远/ }).click()
  await create.getByRole("button", { name: "创建部门" }).click()

  await tree
    .getByRole("button", { name: `更多部门操作 ${name}` })
    .press("Enter")
  await page.getByRole("menuitem", { name: "编辑部门" }).press("Enter")
  const drawer = page.getByRole("dialog", { name })
  await drawer.getByRole("button", { name: "停用", exact: true }).click()
  await expect(drawer.getByText("已停用", { exact: true })).toBeVisible()
  await drawer.getByRole("button", { name: "关闭", exact: true }).click()
  await expect(newDepartment).toBeDisabled()
  await tree
    .getByRole("button", { name: `更多部门操作 ${name}` })
    .press("Enter")
  await page.getByRole("menuitem", { name: "编辑部门" }).press("Enter")
  await drawer.getByRole("button", { name: "删除", exact: true }).click()
  await page
    .getByRole("alertdialog", { name: `删除「${name}」？` })
    .getByRole("button", { name: "删除", exact: true })
    .click()
  await expect(drawer).toBeHidden()
  await expect(
    tree.getByRole("button", { name: new RegExp(`^${name}`) })
  ).toHaveCount(0)
  await expect(
    tree.getByRole("button", { name: /^Aries 科技有限公司/ })
  ).toHaveAttribute("aria-current", "true")
})
