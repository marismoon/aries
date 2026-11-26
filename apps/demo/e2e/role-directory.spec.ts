import { expect, test } from "./fixtures"

test.use({
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
  reducedMotion: "reduce",
})

test("手机上可从角色详情打开权限矩阵并添加成员", async ({ page }) => {
  await page.goto("/settings/org/roles")

  const create = page.getByRole("button", {
    name: "新建自定义角色",
    exact: true,
  })
  const matrix = page.getByRole("button", { name: "权限矩阵", exact: true })
  const { height } = (await create.boundingBox())!
  expect(await matrix.boundingBox()).toMatchObject({ height })
  await matrix.tap()
  await expect(page.getByRole("heading", { name: "权限矩阵" })).toBeVisible()
  const table = page.getByRole("table", { name: "权限矩阵", exact: true })
  await expect(table.locator("tbody tr")).toHaveCount(10)
  await expect(table.getByRole("checkbox")).toHaveCount(0)
  await expect(
    page.getByText("横向滚动查看各角色权限", { exact: true })
  ).toHaveCount(0)
  await expect(
    page.getByRole("button", { name: "新建角色", exact: true })
  ).toHaveCount(0)

  const frozenHeader = table.getByRole("columnheader", {
    name: "功能域 / 权限项",
  })
  const frozenCell = table.locator('tbody [data-column="label"]').first()
  await expect(
    table.getByRole("columnheader", { name: "敏感标识" })
  ).toBeVisible()
  await expect(
    table.locator('tbody [data-column="label"] [data-slot="badge"]')
  ).toHaveCount(0)
  await expect(
    table
      .locator('tbody [data-column="sensitive"]')
      .getByText("高敏", { exact: true })
  ).toHaveCount(2)
  expect(
    await frozenCell.evaluate((cell) => getComputedStyle(cell).backgroundColor)
  ).toBe(
    await table
      .locator("tbody td")
      .first()
      .evaluate((cell) => getComputedStyle(cell).backgroundColor)
  )
  expect(
    await frozenCell
      .locator("span")
      .evaluateAll((spans) =>
        spans.every((span) => getComputedStyle(span).whiteSpace === "nowrap")
      )
  ).toBe(true)
  const headerBefore = await frozenHeader.boundingBox()
  const cellBefore = await frozenCell.boundingBox()
  const scroll = page.getByRole("region", { name: "权限矩阵", exact: true })
  await scroll.evaluate((element) => {
    element.scrollLeft = 300
  })
  await expect
    .poll(() => scroll.evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(0)
  expect((await frozenHeader.boundingBox())!.x).toBe(headerBefore!.x)
  expect((await frozenCell.boundingBox())!.x).toBe(cellBefore!.x)

  for (const offset of [80, 160, 240, 500, 700, 0]) {
    await scroll.evaluate((element, offset) => {
      element.scrollLeft = offset
    }, offset)
    await expect
      .poll(() =>
        table.evaluate((element) => {
          const viewport = element.parentElement!.getBoundingClientRect()
          const conflicts: string[] = []
          for (const cell of element.querySelectorAll(
            'tbody [data-column="label"]'
          )) {
            const rect = cell.getBoundingClientRect()
            const y = rect.y + rect.height / 2
            if (y <= viewport.top + 38 || y >= viewport.bottom) continue
            for (const fraction of [0.25, 0.5, 0.75, 0.95]) {
              for (const hit of document.elementsFromPoint(
                rect.x + rect.width * fraction,
                y
              )) {
                const column = hit
                  .closest("[data-column]")
                  ?.getAttribute("data-column")
                if (column && column !== "label") conflicts.push(column)
              }
            }
          }
          return conflicts
        })
      )
      .toEqual([])
  }

  await page.getByRole("button", { name: "返回", exact: true }).tap()
  await matrix.tap()
  await page
    .getByRole("navigation", { name: "权限矩阵分页" })
    .getByLabel("下一页")
    .tap()
  await expect(table.locator("tbody tr")).toHaveCount(2)
  await expect(table.getByText("安全与审计", { exact: true })).toHaveCount(2)
  await table.getByRole("button", { name: /^财务管理员/ }).tap()
  await expect(
    page.getByRole("heading", { name: "财务管理员", exact: true })
  ).toBeVisible()

  await page.getByRole("tab", { name: "关联成员" }).tap()
  const add = page.getByRole("button", { name: "添加", exact: true })
  await expect(add).toHaveAttribute("data-size", "small")
  await add.tap()
  const dialog = page.getByRole("dialog", { name: "添加成员到此角色" })
  const search = dialog.getByRole("combobox", { name: "选择成员" })
  const confirm = dialog.getByRole("button", { name: "确认分配" })
  await expect(confirm).toBeDisabled()
  await search.fill("chensiyuan@aries.example")
  await dialog.getByRole("option", { name: /陈思远/ }).tap()
  await search.fill("周明")
  await dialog.getByRole("option", { name: /周明/ }).tap()
  await expect(dialog.locator('[data-slot="combobox-chip"]')).toHaveCount(2)
  await confirm.tap()
  await expect(dialog).toBeHidden()
  const members = page.getByRole("table", { name: "关联成员", exact: true })
  await expect(members.getByRole("rowheader", { name: /陈思远/ })).toBeVisible()
  await expect(members.getByRole("rowheader", { name: /周明/ })).toBeVisible()
})

test("新增子部门时先搜索，再选定一名负责人", async ({ page }) => {
  await page.goto("/settings/org/departments")
  await page
    .getByRole("region", { name: "组织架构", exact: true })
    .getByRole("button", { name: "新增子部门", exact: true })
    .tap()

  const dialog = page.getByRole("dialog", { name: "新增子部门", exact: true })
  const search = dialog.getByRole("combobox", { name: "部门负责人" })
  const create = dialog.getByRole("button", { name: "创建部门" })
  await dialog.getByRole("textbox", { name: "部门名称" }).fill("平台协作组")
  await search.tap()
  await expect(dialog.getByRole("option")).toHaveCount(0)
  await expect(create).toBeDisabled()
  await search.fill("no-matching-member")
  await expect(dialog.getByText("没有匹配的成员")).toBeVisible()
  await search.fill("chensiyuan@aries.example")
  await expect(dialog.getByRole("option")).toHaveCount(1)
  await dialog.getByRole("option", { name: /陈思远/ }).tap()
  await expect(search).toHaveValue("陈思远")
  await expect(dialog.getByRole("option")).toHaveCount(0)
  await search.fill("周明")
  await expect(create).toBeDisabled()
  await search.press("ArrowDown")
  await search.press("Enter")
  await expect(search).toHaveValue("周明")
  await create.tap()
  await expect(dialog).toBeHidden()
  await expect(
    page.locator(".dept-meta-bar").getByText("周明", { exact: true })
  ).toBeVisible()
})
