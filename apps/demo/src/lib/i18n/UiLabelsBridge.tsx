import type { ReactNode } from "react"

import { UiLabelsProvider, type UiLabels } from "@aries/ui/lib/ui-labels"
import { useUiText } from "./use-ui-text"

/** Feeds translated text to the shared components in `@aries/ui`. */
export function UiLabelsBridge({ children }: { children: ReactNode }) {
  const tl = useUiText()
  // Rebuilt on every render of the bridge, which follows the language.
  const labels: UiLabels = {
    close: tl("关闭"),
    loading: tl("正在加载"),
    pageSize: tl("每页条数"),
    previousPage: tl("上一页"),
    nextPage: tl("下一页"),
    morePages: tl("更多页"),
    pageN: (page) => tl("第 {{page}} 页", { page }),
    tableRange: (first, last, count) =>
      tl("显示 {{first}}–{{last}} 条，共 {{count}} 条", {
        first,
        last,
        count,
      }),
    tableEmpty: tl("共 0 条"),
    selectedCount: (count) => tl("已选 {{count}} 条", { count }),
    clearSelection: tl("清除选择"),
    hour: tl("小时"),
    minute: tl("分钟"),
    nativeSelect: tl("下拉选择"),
    sliderValue: tl("数值"),
    themeToLight: tl("切换到浅色模式"),
    themeToDark: tl("切换到深色模式"),
    themeLoading: tl("正在读取主题"),
    themeShiftHint: tl(
      "按住 Shift 点击，或按 Shift+Enter 或 Shift+空格，跟随系统。"
    ),
    themeTitle: (label) => tl("{{label}}（Shift+点击跟随系统）", { label }),
    brandPalette: tl("品牌配色"),
    brandTooltip: (current, next) =>
      tl("当前配色为{{current}}，下一个配色为{{next}}", { current, next }),
    paletteName: (_palette, fallback) => tl(fallback),
    darkStyle: tl("暗色风格"),
    darkGlass: tl("毛玻璃暗色"),
    darkClean: tl("简洁暗色"),
    darkTooltip: (current, next) =>
      tl("当前为{{current}}，点击切换为{{next}}", { current, next }),
  }

  return <UiLabelsProvider value={labels}>{children}</UiLabelsProvider>
}
