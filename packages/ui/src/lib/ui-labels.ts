import { createContext, useContext } from "react"

/**
 * User-visible text that lives inside shared components. `@marismoon/ui` has no
 * i18n dependency: the app supplies translated labels through
 * `UiLabelsProvider`; without a provider the Chinese defaults below apply.
 */
export interface UiLabels {
  close: string
  copy: string
  copied: string
  loading: string
  pageSize: string
  previousPage: string
  nextPage: string
  morePages: string
  pageN: (page: number) => string
  tableRange: (first: number, last: number, count: number) => string
  tableEmpty: string
  selectedCount: (count: number) => string
  clearSelection: string
  hour: string
  minute: string
  nativeSelect: string
  sliderValue: string
  themeToLight: string
  themeToDark: string
  themeLoading: string
  themeShiftHint: string
  themeTitle: (label: string) => string
  brandPalette: string
  brandTooltip: (current: string, next: string) => string
  paletteName: (palette: string, fallback: string) => string
  darkStyle: string
  darkGlass: string
  darkClean: string
  darkTooltip: (current: string, next: string) => string
}

export const defaultUiLabels: UiLabels = {
  close: "关闭",
  copy: "复制",
  copied: "已复制",
  loading: "正在加载",
  pageSize: "每页条数",
  previousPage: "上一页",
  nextPage: "下一页",
  morePages: "更多页",
  pageN: (page) => `第 ${page} 页`,
  tableRange: (first, last, count) =>
    `显示 ${first}–${last} 条，共 ${count} 条`,
  tableEmpty: "共 0 条",
  selectedCount: (count) => `已选 ${count} 条`,
  clearSelection: "清除选择",
  hour: "小时",
  minute: "分钟",
  nativeSelect: "下拉选择",
  sliderValue: "数值",
  themeToLight: "切换到浅色模式",
  themeToDark: "切换到深色模式",
  themeLoading: "正在读取主题",
  themeShiftHint: "按住 Shift 点击，或按 Shift+Enter 或 Shift+空格，跟随系统。",
  themeTitle: (label) => `${label}（Shift+点击跟随系统）`,
  brandPalette: "品牌配色",
  brandTooltip: (current, next) => `当前配色为${current}，下一个配色为${next}`,
  paletteName: (_palette, fallback) => fallback,
  darkStyle: "暗色风格",
  darkGlass: "毛玻璃暗色",
  darkClean: "简洁暗色",
  darkTooltip: (current, next) => `当前为${current}，点击切换为${next}`,
}

const UiLabelsContext = createContext(defaultUiLabels)

export const UiLabelsProvider = UiLabelsContext.Provider

export function useUiLabels() {
  return useContext(UiLabelsContext)
}
