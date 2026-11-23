import type { Locator } from "@playwright/test"

import { expect, test } from "./fixtures"

const moduleMenus = [
  [
    "接入与采集",
    ["采集任务", "云账号管理", "采集规则", "采集日志"],
    ["采集监控", ["待执行任务", "失败任务"]],
  ],
  [
    "商务与合同",
    ["合同列表", "供应商合同", "合同审批", "续约提醒"],
    ["合同状态", ["履约中", "即将到期"]],
  ],
  [
    "凭证与发票",
    ["发票管理", "账单凭证", "凭证归档", "开票申请"],
    ["发票分类", ["增值税专用发票", "增值税普通发票"]],
  ],
  [
    "告警通知",
    ["告警中心", "待处理告警", "告警规则", "通知记录"],
    ["告警级别", ["严重告警", "一般告警"]],
  ],
  [
    "成本分析",
    ["成本总览", "成本趋势", "预算管理", "成本分摊"],
    ["分析维度", ["按供应商", "按项目"]],
  ],
  [
    "系统设置",
    [],
    [
      "组件预览",
      [
        "规范",
        "基础组件",
        "表单与输入",
        "导航",
        "浮层与反馈",
        "数据展示",
        "对话与 AI",
      ],
    ],
    ["基础页面", ["登录与账号", "个人安全与二次验证", "会话与异常"]],
    [
      "动态效果",
      [
        "组件动效",
        "文字动效",
        "滚动动效",
        "业务场景动效",
        "业务交互动效",
        "图表动效",
        "切换动效",
      ],
    ],
    ["组织权限", ["成员管理", "角色权限", "部门架构"]],
    ["系统配置", ["基础信息", "全局参数"]],
    ["集成通知", ["应用集成", "群机器人", "消息规则"]],
    ["安全审计", ["安全策略", "操作日志"]],
  ],
] as const

async function expectLeafSpacing(tree: Locator) {
  const rows = await tree
    .locator(":scope > li > .nav-tree-leaf")
    .evaluateAll((leaves) =>
      leaves.map((leaf) => {
        const { top, bottom, height } = leaf.getBoundingClientRect()
        const midpoint = top + height / 2
        const item = leaf.parentElement!
        const itemRect = item.getBoundingClientRect()
        const branch = getComputedStyle(item, "::after")
        const stem = getComputedStyle(item, "::before")
        const badge = leaf
          .querySelector(".workspace-nav-count")
          ?.getBoundingClientRect()

        return {
          top,
          bottom,
          height,
          fontSize: getComputedStyle(leaf).fontSize,
          branchOffset:
            itemRect.top +
            parseFloat(branch.top) +
            parseFloat(branch.height) -
            midpoint,
          stemStart: itemRect.top + parseFloat(stem.top),
          stemEnd: itemRect.bottom - parseFloat(stem.bottom),
          badgeOffset: badge ? badge.top + badge.height / 2 - midpoint : null,
        }
      })
    )

  expect(rows.length).toBeGreaterThan(1)
  for (const [index, row] of rows.entries()) {
    expect(row.height).toBe(28)
    expect(row.fontSize).toBe("12px")
    expect(Math.abs(row.branchOffset)).toBeLessThanOrEqual(0.5)
    if (row.badgeOffset !== null) {
      expect(Math.abs(row.badgeOffset)).toBeLessThanOrEqual(0.5)
    }
    const next = rows[index + 1]
    if (next) {
      expect(next.top - row.bottom).toBe(4)
      expect(row.stemEnd).toBeGreaterThanOrEqual(next.stemStart)
    }
  }

  return rows
}

const overviewTrees = [
  [
    "供应商组合",
    [
      ["阿里云", "14"],
      ["腾讯云", "9"],
      ["华为云", "8"],
      ["七牛云", "6"],
      ["Cloudflare / 海外", "11"],
    ],
  ],
  [
    "关注监控",
    [
      ["授权即将过期", "6"],
      ["差异待确认", "12"],
      ["预算临近阈值", "9"],
    ],
  ],
] as const

test("桌面导航默认展开，只有手动切换能改变状态", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" })
  await page.goto("/overview")

  const shell = page.locator(".app-shell")
  const sidebar = page.locator('[data-layout-column="nav"]')
  const main = page.getByRole("main")
  const viewport = main.locator(".page-content-viewport")
  const rail = page.getByRole("navigation", { name: "主模块" })
  const panel = page.getByRole("complementary", { name: "AI 助手" })
  const collapse = rail.getByRole("button", { name: "收起工作区导航" })
  const expand = rail.getByRole("button", { name: "展开工作区导航" })
  const shellTracks = page.locator(".app-shell, [data-layout-column]")

  await expect(shellTracks).toHaveCount(4)
  const mountedTracks = await shell.evaluateHandle((element) => [
    element,
    ...element.querySelectorAll("[data-layout-column]"),
  ])

  async function expectWorkspacePage(title: string) {
    const workspacePage = main.locator(".workspace-page")
    const header = workspacePage.locator(".page-header")
    const controls = header.locator(".workspace-tools")
    await expect(shellTracks).toHaveCount(4)
    expect(
      await mountedTracks.evaluate((tracks) =>
        tracks.every((track) => track.isConnected)
      )
    ).toBe(true)
    await expect(workspacePage).toHaveCount(1)
    await expect(page.locator(".page-header")).toHaveCount(1)
    await expect(header.getByRole("heading", { level: 1 })).toHaveText(title)
    await expect(controls).toHaveCount(1)
    const dark = await page
      .locator("html")
      .evaluate((root) => root.classList.contains("dark"))
    // Language, brand and theme controls; dark mode adds the dark-style switch.
    await expect(controls.getByRole("button")).toHaveCount(dark ? 4 : 3)
    await expect(viewport).toHaveCSS("overflow-y", "auto")
    await expect(workspacePage).toHaveCSS("overflow-y", "visible")
  }

  await expectWorkspacePage("运营总览")
  expect(
    await page
      .locator("html")
      .evaluate((root) => root.scrollHeight - root.clientHeight)
  ).toBe(0)
  await expect(shell).toHaveCSS("width", "1440px")
  await expect(shell).toHaveCSS("height", "900px")
  await expect(shell).toHaveCSS("box-shadow", "none")
  await expect(shell).toHaveCSS("background-image", "none")
  await expect(shell).toHaveAttribute("data-nav-collapsed", "false")
  await expect(sidebar).toHaveCSS("width", "256px")
  await expect(sidebar).toBeVisible()
  const scope = sidebar.getByRole("tablist", { name: "工作区范围" })
  await expect(scope.getByRole("tab", { name: "全部数据" })).toHaveAttribute(
    "aria-selected",
    "true"
  )
  const myTasks = scope.getByRole("tab", { name: "我的待办" })
  await expect(myTasks).toBeDisabled()
  await expect(myTasks).not.toHaveAttribute("aria-controls")
  await expect(sidebar.getByRole("button", { name: "导航搜索" })).toHaveCSS(
    "height",
    "36px"
  )
  await expect(page.getByRole("button", { name: "导航搜索" })).toHaveCount(1)
  await expect(main.getByRole("button", { name: "搜索页面" })).toHaveCount(0)
  await expect(collapse).toHaveAttribute("aria-expanded", "true")

  const initialMain = await main.boundingBox()
  await expect(sidebar.getByText("账单周报订阅")).toHaveCount(0)
  await expect(
    sidebar.getByRole("button", { name: "Marismoon 智算助手" })
  ).toHaveCount(0)
  await page.keyboard.press("Control+Shift+k")
  await expect(panel).toBeVisible()
  expect(await main.boundingBox()).toEqual(initialMain)
  await expect(sidebar).toBeVisible()

  await page.emulateMedia({ colorScheme: "dark" })
  await expect(page.locator("html")).toHaveClass(/\bdark\b/)
  await sidebar.getByRole("link", { name: "月账单", exact: true }).click()
  await expect(page).toHaveURL(/\/bills$/)
  await expectWorkspacePage("月账单")
  await expect(sidebar).toBeVisible()
  await expect(panel).toBeVisible()
  await expect(shell).toHaveAttribute("data-nav-collapsed", "false")
  await panel.getByRole("button", { name: "关闭智算助手" }).click()
  await page.mouse.move(0, 0)
  await expect(panel).toHaveCount(0)
  await expect(main.locator("tbody tr")).toHaveCount(10)
  expect(
    await viewport.evaluate((element) => {
      element.scrollTop = element.scrollHeight
      return element.scrollTop
    })
  ).toBeGreaterThan(0)
  await expect(main.locator(".data-table-footer")).toBeInViewport({ ratio: 1 })
  expect(await page.evaluate(() => window.scrollY)).toBe(0)
  await viewport.evaluate((element) => {
    element.scrollTop = 0
  })

  await collapse.click()
  await expect(shell).toHaveAttribute("data-nav-collapsed", "true")
  await expect(sidebar).toBeHidden()
  await expect(expand).toHaveAttribute("aria-expanded", "false")
  await page.mouse.move(0, 0)
  await expect(page.locator('[data-slot="tooltip-content"]')).toHaveCount(0)
  await page.keyboard.press("Control+k")
  const command = page.getByRole("dialog", { name: "搜索页面" })
  await expect(command.getByRole("searchbox")).toBeFocused()
  await command.getByRole("searchbox").press("Escape")
  await expect(command).toBeHidden()
  await expect(expand).toBeFocused()
  await rail.getByRole("link", { name: "Marismoon 工作台" }).click()
  await expect(page).toHaveURL(/\/overview$/)
  await expectWorkspacePage("运营总览")
  await expect(sidebar).toBeHidden()
  await expect(shell).toHaveCSS("grid-template-columns", "54px 0px 1376px")
  await expand.click()
  await expect(sidebar).toBeVisible()
  await expect(shell).toHaveCSS("grid-template-columns", "54px 256px 1110px")
  await mountedTracks.dispose()
})

test("七个业务模块共用目录结构、显示预定菜单并保留真实路由", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto("/bills")

  const rail = page.getByRole("navigation", { name: "主模块" })
  const overview = rail.getByRole("button", { name: "总览", exact: true })
  const sidebar = page.locator('[data-layout-column="nav"]')
  const title = sidebar.locator(".workspace-nav-heading strong")
  const directory = sidebar.getByRole("navigation", { name: "工作区目录" })
  const bills = directory.getByRole("link", { name: "月账单", exact: true })
  const menuLabels = directory.locator(
    ".workspace-nav-list > li > :is(a, button) > span:first-of-type"
  )
  const scope = sidebar.getByRole("tablist", { name: "工作区范围" })
  const create = sidebar.getByRole("button", {
    name: "新建采集计划，Demo 暂未开放",
    exact: true,
  })
  const search = sidebar.getByRole("button", { name: "导航搜索", exact: true })

  async function expectSidebarTemplate() {
    await expect(sidebar.locator(".workspace-nav")).toHaveCount(1)
    await expect(create).toBeDisabled()
    await expect(scope.getByRole("tab")).toHaveText(["我的待办", "全部数据"])
    await expect(scope.getByRole("tab", { name: "我的待办" })).toBeDisabled()
    await expect(scope.getByRole("tab", { name: "全部数据" })).toHaveAttribute(
      "aria-selected",
      "true"
    )
    await expect(search).toBeVisible()
    await expect(directory).toBeVisible()
  }

  await expect(rail.getByRole("link", { name: "月账单" })).toHaveCount(0)
  await expect(overview).toHaveAttribute("aria-current", "true")
  await expect(bills).toHaveAttribute("aria-current", "page")
  await expectSidebarTemplate()
  await expect(menuLabels).toHaveText(["运营总览", "供应商组合", "关注监控"])

  for (const [name, items, ...folders] of moduleMenus) {
    const module = rail.getByRole("button", { name, exact: true })
    await module.click()
    await expect(module).toHaveAttribute("aria-current", "true")
    await expect(rail.locator('[aria-current="true"]')).toHaveCount(1)
    await expect(title).toHaveText(name)
    await expectSidebarTemplate()
    await expect(menuLabels).toHaveText([
      ...items,
      ...folders.map(([folderLabel]) => folderLabel),
    ])
    for (const item of items) {
      await expect(
        directory.getByRole("button", { name: item, exact: true })
      ).toBeDisabled()
    }
    for (const [folderLabel, children] of folders) {
      const folder = directory.getByRole("button", {
        name: folderLabel,
        exact: true,
      })
      await expect(folder).toHaveAttribute("aria-expanded", "true")
      const treeId = await folder.getAttribute("aria-controls")
      expect(treeId).toBeTruthy()
      const tree = directory.locator(`[id=${JSON.stringify(treeId)}]`)
      if (
        folderLabel === "组件预览" ||
        folderLabel === "基础页面" ||
        folderLabel === "动态效果"
      ) {
        // The component preview folder holds real routes (links), one per page.
        await expect(tree.getByRole("link")).toHaveText([...children])
        await expectLeafSpacing(tree)
        await folder.press("Enter")
        await expect(folder).toHaveAttribute("aria-expanded", "false")
        await folder.click()
        await expect(folder).toHaveAttribute("aria-expanded", "true")
        continue
      }
      if (folderLabel === "系统配置") {
        // 基础信息 is a real route; 全局参数 is still a Demo placeholder.
        await expect(tree.getByRole("link")).toHaveText(["基础信息"])
        await expect(tree.getByRole("button")).toHaveText(["全局参数"])
        await expectLeafSpacing(tree)
        await folder.press("Enter")
        await expect(folder).toHaveAttribute("aria-expanded", "false")
        await folder.click()
        await expect(folder).toHaveAttribute("aria-expanded", "true")
        continue
      }
      await expect(tree.getByRole("button")).toHaveText([...children])
      await expectLeafSpacing(tree)
      for (const label of children) {
        await expect(
          tree.getByRole("button", { name: label, exact: true })
        ).toBeDisabled()
      }

      await folder.press("Enter")
      await expect(folder).toHaveAttribute("aria-expanded", "false")
      await expect(tree).toBeHidden()
      await expect(folder).toBeFocused()
      await folder.click()
      await expect(folder).toHaveAttribute("aria-expanded", "true")
      await expect(tree).toBeVisible()
      await tree.getByRole("button", { name: children[0], exact: true }).click({
        force: true,
      })
    }

    // Only 系统设置 carries real routes (组件预览、基础页面、动态效果 and 基础信息).
    await expect(directory.getByRole("link")).toHaveCount(
      name === "系统设置" ? 18 : 0
    )
    await expect(page).toHaveURL(/\/bills$/)
  }

  await rail.getByRole("img", { name: "演示用户 · 管理员" }).click()
  await expect(page).toHaveURL(/\/bills$/)
  await expect(
    rail.getByRole("button", { name: "系统设置", exact: true })
  ).toHaveAttribute("aria-current", "true")
  await expect(title).toHaveText("系统设置")
})

test("浏览器前进、后退和刷新会恢复真实路由所属的导航状态", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto("/bills")

  const rail = page.getByRole("navigation", { name: "主模块" })
  const overview = rail.getByRole("button", { name: "总览", exact: true })
  const sidebar = page.locator('[data-layout-column="nav"]')
  const title = sidebar.locator(".workspace-nav-heading strong")
  const directory = sidebar.getByRole("navigation", { name: "工作区目录" })
  const overviewEntry = directory.getByRole("link", {
    name: "运营总览",
    exact: true,
  })
  const bills = directory.getByRole("link", { name: "月账单", exact: true })

  await rail.getByRole("button", { name: "系统设置", exact: true }).click()
  await rail.getByRole("link", { name: "Marismoon 工作台" }).click()
  await expect(page).toHaveURL(/\/overview$/)
  await expect(overview).toHaveAttribute("aria-current", "true")
  await page.goBack()
  await expect(page).toHaveURL(/\/bills$/)
  await expect(overview).toHaveAttribute("aria-current", "true")
  await expect(title).toHaveText("总览")
  await expect(bills).toHaveAttribute("aria-current", "page")
  await page.goForward()
  await expect(page).toHaveURL(/\/overview$/)
  await expect(overview).toHaveAttribute("aria-current", "true")
  await expect(overviewEntry).toHaveAttribute("aria-current", "page")
  await page.goBack()
  await expect(bills).toHaveAttribute("aria-current", "page")

  for (const [name, children] of overviewTrees) {
    const group = directory.getByRole("button", { name, exact: true })
    await expect(group).toHaveAttribute("aria-expanded", "true")
    const treeId = await group.getAttribute("aria-controls")
    expect(treeId).toBeTruthy()
    const tree = directory.locator(`[id=${JSON.stringify(treeId)}]`)
    if (name === "关注监控") {
      await expect(
        tree.getByRole("link", { name: "月账单", exact: true })
      ).toHaveAttribute("aria-current", "page")
      await group.click()
      await expect(bills).toBeHidden()
      await group.click()
      await expect(bills).toBeVisible()
    }
    await expect(tree.locator("li > button > span:first-of-type")).toHaveText(
      children.map(([label]) => label)
    )
    await expect(tree.locator("li > button > .workspace-nav-count")).toHaveText(
      children.map(([, count]) => count)
    )
  }

  const suppliers = directory.getByRole("button", { name: "供应商组合" })
  const supplier = directory.getByRole("button", { name: /Cloudflare/ })
  await expect(suppliers).toHaveAttribute("aria-expanded", "true")
  await expect(suppliers).toHaveCSS("height", "32px")
  await expect(suppliers).toHaveCSS("font-size", "13.5px")
  await expect(supplier).toBeDisabled()
  await expect(bills).toHaveCSS("border-radius", "18px")
  await expect(bills).toHaveCSS("height", "28px")
  // The selected fill is the shared sliding pill behind the item.
  await expect(directory.locator(".nav-pill--active")).not.toHaveCSS(
    "box-shadow",
    "none"
  )
  await expect(supplier).toHaveCSS("border-radius", "18px")
  await expect(supplier).toHaveCSS("height", "28px")
  const hoverPill = directory.locator(".nav-pill--hover")
  await page.mouse.move(0, 0)
  await expect(hoverPill).toHaveCount(0)
  await supplier.hover()
  await expect(hoverPill).toHaveCount(1)
  await suppliers.focus()
  await page.keyboard.press("Shift+Tab")
  await page.keyboard.press("Tab")
  await expect(suppliers).toBeFocused()
  await expect(suppliers).toHaveCSS("outline-width", "2px")
  await suppliers.click()
  await expect(supplier).toBeHidden()
  await expect(directory.getByText("预算临近阈值")).toBeVisible()

  await rail.getByRole("button", { name: "接入与采集" }).click()
  await page.reload()
  await expect(overview).toHaveAttribute("aria-current", "true")
  await expect(bills).toHaveAttribute("aria-current", "page")
  await overviewEntry.click()
  await expect(page).toHaveURL(/\/overview$/)
  await page.reload()
  await expect(overview).toHaveAttribute("aria-current", "true")
  await expect(overviewEntry).toHaveAttribute("aria-current", "page")
})

test("总览和月账单的叶子行间距一致，悬停不影响相邻选中态", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  const directory = page.getByRole("navigation", { name: "工作区目录" })
  const monthly = directory.getByRole("link", { name: "月账单", exact: true })
  const adjacent = directory.getByRole("button", { name: /授权即将过期/ })
  const hoverPill = directory.locator(".nav-pill--hover")
  const activePill = directory.locator(".nav-pill--active")
  // The pill glides on a spring: wait until it sits on the item.
  const expectPillOn = async (pill: Locator, leaf: Locator) =>
    expect
      .poll(async () => {
        const [a, b] = await Promise.all([
          pill.boundingBox(),
          leaf.boundingBox(),
        ])
        return a && b ? Math.abs(a.y - b.y) + Math.abs(a.height - b.height) : 99
      })
      .toBeLessThan(4)

  for (const colorScheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme, reducedMotion: "reduce" })
    await page.goto("/overview")
    await page.mouse.move(0, 0)
    await expect(monthly).toBeVisible()
    await expect(monthly).not.toHaveAttribute("aria-current", "page")
    await expect(monthly.locator(".workspace-nav-count")).toHaveText("64")
    const folder = directory.getByRole("button", {
      name: "关注监控",
      exact: true,
    })
    const treeId = await folder.getAttribute("aria-controls")
    expect(treeId).toBeTruthy()
    const tree = directory.locator(`[id=${JSON.stringify(treeId)}]`)
    const overviewRows = await expectLeafSpacing(tree)
    await expect(hoverPill).toHaveCount(0)

    await monthly.hover()
    await expect(hoverPill).toHaveCount(1)
    await expectPillOn(hoverPill, monthly)
    expect(await expectLeafSpacing(tree)).toEqual(overviewRows)

    await monthly.click()
    await expect(page).toHaveURL(/\/bills$/)
    await expect(monthly).toHaveAttribute("aria-current", "page")
    await page.mouse.move(0, 0)
    expect(await expectLeafSpacing(tree)).toEqual(overviewRows)
    await expectPillOn(activePill, monthly)

    await adjacent.hover()
    await expect(hoverPill).toHaveCount(1)
    await expectPillOn(hoverPill, adjacent)
    await expectPillOn(activePill, monthly)
    expect(await expectLeafSpacing(tree)).toEqual(overviewRows)
  }
})

test("目录搜索只显示当前模块的菜单，演示结果不能跳转", async ({ page }) => {
  await page.goto("/bills")
  const module = page
    .getByRole("navigation", { name: "主模块" })
    .getByRole("button", { name: "接入与采集", exact: true })
  await module.click()

  const launcher = page.getByRole("button", { name: "导航搜索", exact: true })
  await launcher.press("Enter")
  const dialog = page.getByRole("dialog", { name: "搜索页面" })
  const search = dialog.getByRole("searchbox")
  const results = dialog.getByRole("list", { name: "搜索结果" })
  await expect(search).toBeFocused()
  const [, items, [, children]] = moduleMenus[0]
  await expect(results.locator("li strong")).toHaveText([...items, ...children])

  for (const query of ["采集规则", "失败任务"]) {
    await search.fill(query)
    await expect(results.getByRole("listitem")).toHaveCount(1)
    await expect(results.getByRole("button", { name: query })).toBeDisabled()
    await expect(results.getByRole("link")).toHaveCount(0)
    await search.press("Enter")
    await expect(dialog).toBeVisible()
    await expect(page).toHaveURL(/\/bills$/)
  }
  await search.press("Escape")
  await expect(dialog).toBeHidden()
  await expect(module).toHaveAttribute("aria-current", "true")
  await expect(launcher).toBeFocused()
})

test("移动目录可以切换模块，保留总览下的真实导航", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/overview")
  await page.getByRole("button", { name: "打开工作区导航" }).click()
  const directory = page.getByRole("dialog", { name: "工作区导航" })
  const modules = directory.getByRole("combobox", { name: "切换工作区模块" })
  await modules.click()
  await expect(page.getByRole("option")).toHaveText([
    "总览",
    ...moduleMenus.map(([name]) => name),
  ])
  await page.getByRole("option", { name: "凭证与发票" }).click()
  await expect(directory.locator(".workspace-nav-heading strong")).toHaveText(
    "凭证与发票"
  )
  await expect(
    directory.getByRole("button", { name: "账单凭证", exact: true })
  ).toBeDisabled()
  const folder = directory.getByRole("button", {
    name: "发票分类",
    exact: true,
  })
  const leaf = directory.getByRole("button", {
    name: "增值税专用发票",
    exact: true,
  })
  await expect(folder).toHaveAttribute("aria-expanded", "true")
  await expect(leaf).toBeDisabled()
  await expect(leaf).toHaveCSS("height", "36px")
  await folder.click()
  await expect(leaf).toBeHidden()
  await folder.click()
  await expect(leaf).toBeVisible()
  await expect(page).toHaveURL(/\/overview$/)
  await modules.click()
  await page.getByRole("option", { name: "系统设置", exact: true }).click()
  await expect(
    directory.getByRole("button", { name: "群机器人", exact: true })
  ).toBeDisabled()
  await modules.click()
  await page.getByRole("option", { name: "总览", exact: true }).click()
  await directory.getByRole("link", { name: "月账单", exact: true }).click()
  await expect(page).toHaveURL(/\/bills$/)
  await expect(directory).toBeHidden()
})
