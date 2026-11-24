import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { renderHook } from "@testing-library/react"
import type { ReactNode } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { TooltipProvider } from "@aries/ui/ui/tooltip"

import { LanguageControl } from "./components/LanguageControl"
import { NavTree } from "./components/NavTree"
import { ShellLink } from "./components/ShellLink"
import {
  ShellRouterProvider,
  useShellRouter,
  type ShellRouterAdapter,
} from "./types/adapter"
import {
  ShellLabelsProvider,
  useShellLabels,
  type LanguageControlProps,
  type ShellLabels,
} from "./types/labels"

const labelKeys = [
  "openNavigation",
  "navigationTitle",
  "skipToContent",
  "collapseNavigation",
  "expandNavigation",
  "mainModules",
  "pageContent",
  "breadcrumb",
  "language",
  "commandSearch",
  "commandTitle",
  "commandDescription",
  "commandInput",
  "commandResults",
  "commandEmpty",
  "directory",
  "switchModule",
  "workspaceScope",
  "myTasks",
  "allData",
  "help",
  "setupGuide",
  "support",
] as const satisfies readonly (keyof ShellLabels)[]

const labels = labelKeys.reduce(
  (all, key) => ({ ...all, [key]: `label:${key}` }),
  {} as ShellLabels
)

const languages: LanguageControlProps = {
  value: "zh-CN",
  options: [
    { value: "zh-CN", label: "简体中文" },
    { value: "en", label: "English" },
  ],
  onChange: () => {},
}

function renderShell(
  ui: ReactNode,
  router: Partial<ShellRouterAdapter> = {},
  languageControl: LanguageControlProps = languages
) {
  return render(
    <ShellRouterProvider value={{ activePath: "/", ...router }}>
      <ShellLabelsProvider value={{ labels, languageControl }}>
        <TooltipProvider>{ui}</TooltipProvider>
      </ShellLabelsProvider>
    </ShellRouterProvider>
  )
}

afterEach(cleanup)

describe("宿主注入", () => {
  it("缺少路由适配时给出明确错误", () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    expect(() => renderHook(() => useShellRouter())).toThrow(
      "ShellRouterProvider is required"
    )
  })

  it("缺少文案注入时给出明确错误", () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    expect(() => renderHook(() => useShellLabels())).toThrow(
      "ShellLabelsProvider is required"
    )
  })
})

describe("ShellLink", () => {
  it("精确匹配时标记当前页", () => {
    renderShell(
      <ShellLink to="/bills" end>
        账单
      </ShellLink>,
      { activePath: "/bills" }
    )
    const link = screen.getByRole("link", { name: "账单" })
    expect(link.getAttribute("href")).toBe("/bills")
    expect(link.getAttribute("aria-current")).toBe("page")
    expect(link.classList.contains("active")).toBe(true)
  })

  it("非精确匹配时子路径也算当前页，精确匹配时不算", () => {
    renderShell(
      <>
        <ShellLink to="/settings" end={false}>
          设置
        </ShellLink>
        <ShellLink to="/settings" end>
          设置首页
        </ShellLink>
      </>,
      { activePath: "/settings/system/basic" }
    )
    expect(
      screen.getByRole("link", { name: "设置" }).getAttribute("aria-current")
    ).toBe("page")
    expect(
      screen
        .getByRole("link", { name: "设置首页" })
        .getAttribute("aria-current")
    ).toBeNull()
  })

  it("未传 end 时不参与激活判定", () => {
    renderShell(<ShellLink to="/bills">账单</ShellLink>, {
      activePath: "/bills",
    })
    expect(
      screen.getByRole("link", { name: "账单" }).getAttribute("aria-current")
    ).toBeNull()
  })

  it("普通点击交给 onNavigate，修饰键与新窗口保留浏览器默认行为", () => {
    const onNavigate = vi.fn()
    renderShell(
      <>
        <ShellLink to="/overview">总览</ShellLink>
        <ShellLink to="/bills" target="_blank">
          新窗口
        </ShellLink>
      </>,
      { onNavigate }
    )
    const overview = screen.getByRole("link", { name: "总览" })
    expect(fireEvent.click(overview)).toBe(false)
    expect(onNavigate).toHaveBeenCalledWith("/overview")

    onNavigate.mockClear()
    expect(fireEvent.click(overview, { metaKey: true })).toBe(true)
    expect(fireEvent.click(screen.getByRole("link", { name: "新窗口" }))).toBe(
      true
    )
    expect(onNavigate).not.toHaveBeenCalled()
  })

  it("提供 renderLink 时交由宿主渲染", () => {
    const renderLink = vi.fn(({ to, children }) => (
      <a href={`/app${to}`} data-host-link="">
        {children}
      </a>
    ))
    renderShell(<ShellLink to="/bills">账单</ShellLink>, { renderLink })
    const link = screen.getByRole("link", { name: "账单" })
    expect(link.getAttribute("href")).toBe("/app/bills")
    expect(link.hasAttribute("data-host-link")).toBe(true)
    expect(renderLink).toHaveBeenCalledWith(
      expect.objectContaining({ to: "/bills" })
    )
  })
})

describe("LanguageControl", () => {
  it("使用注入的文案，并切换到下一个语言", () => {
    const onChange = vi.fn()
    renderShell(<LanguageControl {...languages} onChange={onChange} />)
    fireEvent.click(screen.getByRole("button", { name: "label:language" }))
    expect(onChange).toHaveBeenCalledWith("en")
  })

  it("最后一个语言之后回到第一个", () => {
    const onChange = vi.fn()
    renderShell(
      <LanguageControl {...languages} value="en" onChange={onChange} />
    )
    fireEvent.click(screen.getByRole("button", { name: "label:language" }))
    expect(onChange).toHaveBeenCalledWith("zh-CN")
  })
})

describe("NavTree", () => {
  it("点击父节点折叠与展开子级", () => {
    renderShell(
      <ul>
        <NavTree label="系统设置" icon={null}>
          <li>基础信息</li>
        </NavTree>
      </ul>
    )
    const toggle = screen.getByRole("button", { name: "系统设置" })
    const list = document.getElementById(
      toggle.getAttribute("aria-controls") ?? ""
    )
    expect(toggle.getAttribute("aria-expanded")).toBe("true")
    expect(list?.hidden).toBe(false)

    fireEvent.click(toggle)
    expect(toggle.getAttribute("aria-expanded")).toBe("false")
    expect(list?.hidden).toBe(true)
  })
})
