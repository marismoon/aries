// @vitest-environment node
// Server rendering (for example Next.js prerendering) has no window or
// document: the shell must render without touching browser globals.
import { SolarBell } from "@marismoon/ui/icons"
import { TooltipProvider } from "@marismoon/ui/ui/tooltip"
import type { ReactNode } from "react"
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { AppShell } from "./components/AppShell"
import { LanguageControl } from "./components/LanguageControl"
import { NavTree } from "./components/NavTree"
import { ShellLink } from "./components/ShellLink"
import { ShellRouterProvider } from "./types/adapter"
import { ShellLabelsProvider, type ShellLabels } from "./types/labels"
import type { WorkspaceNavigation } from "./types/nav"

const labels = new Proxy({} as ShellLabels, {
  get: (_, key) => `label:${String(key)}`,
})
const languageControl = {
  value: "zh-CN",
  options: [
    { value: "zh-CN", label: "简体中文" },
    { value: "en", label: "English" },
  ],
  onChange: () => {},
}

const navigation: WorkspaceNavigation = {
  modules: [
    {
      id: "bills",
      label: "账单",
      icon: null,
      railPosition: "main",
      visibleOnMobile: true,
      items: [{ id: "list", label: "账单列表", path: "/bills" }],
      commands: { triggerLabel: "搜索账单", placeholder: "搜索", items: [] },
    },
  ],
  directoryDescription: "目录",
  createLabel: "新建",
  unavailableLabel: "暂不可用",
  brandLabel: "Aries",
  brandPath: "/",
  brandMark: null,
  userLabel: "示例用户",
  avatarSrc: "",
  avatarFallback: "A",
}

function renderOnServer(ui: ReactNode) {
  return renderToString(
    <ShellRouterProvider value={{ activePath: "/bills" }}>
      <ShellLabelsProvider value={{ labels, languageControl }}>
        <TooltipProvider>{ui}</TooltipProvider>
      </ShellLabelsProvider>
    </ShellRouterProvider>
  )
}

describe("服务端渲染", () => {
  it("运行环境没有 window", () => {
    expect(typeof window).toBe("undefined")
  })

  it("ShellLink 把相对链接视为站内链接并标记当前页", () => {
    const html = renderOnServer(
      <>
        <ShellLink to="/bills" end>
          账单
        </ShellLink>
        <ShellLink to="https://example.com/bills" end>
          外部
        </ShellLink>
      </>
    )
    expect(html).toContain('href="/bills"')
    expect(html.match(/aria-current="page"/g)).toHaveLength(1)
  })

  it("NavTree 与 LanguageControl 可在服务端渲染", () => {
    const html = renderOnServer(
      <ul>
        <NavTree label="工作区" icon={<SolarBell />}>
          <li>账单</li>
        </NavTree>
        <li>
          <LanguageControl {...languageControl} />
        </li>
      </ul>
    )
    expect(html).toContain('aria-expanded="true"')
    expect(html).toContain('aria-label="label:language"')
  })

  it("AppShell 可在服务端渲染并输出导航与内容", () => {
    const html = renderOnServer(
      <AppShell navigation={navigation} routeModule="bills">
        <p>页面内容</p>
      </AppShell>
    )
    expect(html).toContain("页面内容")
    expect(html).toContain("账单列表")
  })

  it("隐藏无路径的导航和无回调的帮助入口", () => {
    const [activeModule] = navigation.modules
    if (!activeModule) throw new Error("Missing test module")
    const html = renderOnServer(
      <AppShell
        navigation={{
          ...navigation,
          showPlaceholders: false,
          modules: [
            {
              ...activeModule,
              items: [
                ...activeModule.items,
                { id: "example", label: "占位条目" },
                { id: "empty", label: "空分组", children: [] },
              ],
            },
          ],
        }}
        routeModule="bills"
        onSupportClick={() => {}}
      >
        <p>页面内容</p>
      </AppShell>
    )
    expect(html).toContain("账单列表")
    expect(html).not.toContain("占位条目")
    expect(html).not.toContain("空分组")
    expect(html).not.toContain("label:setupGuide")
    expect(html).toContain("label:support")
    expect(html).not.toContain("label:myTasks")
  })
})
