import type { ReactNode } from "react"
import { ShellLabelsProvider, type ShellLabels } from "@marismoon/shell"
import { i18n } from "./index"
import {
  applyDocumentLanguage,
  defaultLanguage,
  isLanguage,
  languages,
  setStoredLanguage,
} from "./language"
import { useUiText } from "./use-ui-text"

const options = Object.entries(languages).map(([value, label]) => ({
  value,
  label,
}))

function changeLanguage(next: string) {
  if (!isLanguage(next)) return
  setStoredLanguage(next)
  applyDocumentLanguage(next)
  void i18n.changeLanguage(next)
}

export function ShellLabelsBridge({ children }: { children: ReactNode }) {
  const tl = useUiText()
  const labels: ShellLabels = {
    openNavigation: tl("打开工作区导航"),
    navigationTitle: tl("工作区导航"),
    skipToContent: tl("跳到主内容"),
    collapseNavigation: tl("收起工作区导航"),
    expandNavigation: tl("展开工作区导航"),
    mainModules: tl("主模块"),
    pageContent: tl("页面内容"),
    breadcrumb: tl("面包屑"),
    language: tl("语言"),
    commandSearch: tl("导航搜索"),
    commandTitle: tl("搜索页面"),
    commandDescription: tl("输入页面名称，或用方向键浏览结果。"),
    commandInput: tl("输入页面名称"),
    commandResults: tl("搜索结果"),
    commandEmpty: tl("未找到匹配的页面。"),
    directory: tl("工作区目录"),
    switchModule: tl("切换工作区模块"),
    workspaceScope: tl("工作区范围"),
    myTasks: tl("我的待办"),
    allData: tl("全部数据"),
    help: tl("帮助"),
    setupGuide: tl("配置手册"),
    support: tl("技术支持"),
  }
  const languageControl = {
    value: isLanguage(i18n.language) ? i18n.language : defaultLanguage,
    options,
    onChange: changeLanguage,
  }
  return (
    <ShellLabelsProvider value={{ labels, languageControl }}>
      {children}
    </ShellLabelsProvider>
  )
}
