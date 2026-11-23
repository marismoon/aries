# 工作区外壳 CSS 变量契约

轮次三起点的 `layout.css` 包含 255 次 `var()` 引用，涉及 91 个变量。下表包含移入 UI 的派生变量所依赖的令牌。样式文件均位于 `packages/ui/src/styles/`，宿主通过 `@marismoon/ui/styles/globals.css` 引入。已有主题层叠顺序为 `tokens.css` → `spectrum.css` → `materials.css` → `dark-base.css` → `dark-clean.css`，动效令牌位于其后的 `motion.css`。

| 用途 | 变量 | 定义或主题覆盖文件 |
|---|---|---|
| 页面与控件的语义颜色 | `--accent` | `tokens.css`、`spectrum.css`、`dark-clean.css` |
| 页面与控件的语义颜色 | `--accent-foreground`、`--primary`、`--ring` | `tokens.css`、`spectrum.css` |
| 页面与控件的语义颜色 | `--background`、`--border`、`--border-subtle`、`--control`、`--foreground`、`--layout-control-border`、`--muted`、`--muted-foreground`、`--popover`、`--recess` | `tokens.css`、`spectrum.css`、`dark-base.css` |
| 页面与控件的语义颜色 | `--field-shadow` | `tokens.css`、`dark-clean.css` |
| 页面与控件的语义颜色 | `--field-surface`、`--layout-control`、`--popover-foreground` | `tokens.css` |
| 外壳尺寸与安全边距 | `--column-height`、`--icon-rail-width`、`--rail-block-end`、`--rail-block-start`、`--rail-item-gap`、`--rail-logo-center`、`--rail-logo-gap`、`--rail-start-inset`、`--workspace-column-gap`、`--workspace-inset-end`、`--workspace-inset-start`、`--workspace-nav-width`、`--workspace-safe-block-end`、`--workspace-safe-inline-end` | `tokens.css` |
| 轨道按钮的尺寸与材质 | `--icon-control-hover-bg`、`--rail-active-bg`、`--rail-active-fg`、`--rail-backplate-size`、`--rail-control-size`、`--rail-icon-size`、`--rail-logo-fg` | `tokens.css` |
| 轨道按钮的尺寸与材质 | `--rail-fill` | `materials.css` |
| 轨道按钮的尺寸与材质 | `--rail-logo-bg` | `tokens.css`、`spectrum.css` |
| 右栏入口的渐变与动效 | `--ai-angle` | `motion.css` |
| 右栏入口的渐变与动效 | `--ai-blue`、`--ai-cyan`、`--ai-pink`、`--ai-violet` | `materials.css` |
| 右栏入口的渐变与动效 | `--ai-blue-base`、`--ai-cyan-base`、`--ai-pink-base`、`--ai-violet-base` | `tokens.css` |
| 侧栏表面与导航状态 | `--nav-active-fill`、`--nav-active-shadow`、`--nav-border-width`、`--nav-hover-fill`、`--nav-hover-shadow` | `dark-clean.css` |
| 侧栏表面与导航状态 | `--nav-filter`、`--sidebar-background-clip`、`--sidebar-edge`、`--sidebar-radius`、`--sidebar-shadow` | `tokens.css`、`dark-clean.css` |
| 侧栏表面与导航状态 | `--nav-tree-line` | `materials.css` |
| 侧栏表面与导航状态 | `--scope-selected`、`--sidebar-item-height`、`--sidebar-item-hover`、`--sidebar-item-radius`、`--sidebar-leaf-height` | `tokens.css` |
| 侧栏表面与导航状态 | `--workspace-nav` | `tokens.css`、`spectrum.css`、`dark-base.css`、`dark-clean.css` |
| 内容视口的出血、渐隐和背景 | `--workspace-bleed-block`、`--workspace-bleed-inline`、`--workspace-edge-size`、`--workspace-fade-feather` | `tokens.css` |
| 内容视口的出血、渐隐和背景 | `--page-background` | `materials.css`、`dark-base.css` |
| 通用间距、控件、圆角与字号 | `--control-size-compact`、`--control-size-dense`、`--control-size-touch`、`--radius-control`、`--radius-workspace-control`、`--space-1`、`--space-2`、`--space-3`、`--space-4`、`--space-5`、`--space-6`、`--text-body`、`--text-label`、`--breadcrumb-leading` | `tokens.css` |
| 交互时长与缓动 | `--duration-feedback`、`--ease-feedback` | `motion.css` |
| 指针跟踪的逐帧输入 | `--dock`、`--dock-dy`、`--dock-t` | `IconRail.tsx` |

## 从外壳样式归入 UI 的声明

| 目标文件 | 原先定义在 `layout.css` 的变量 |
|---|---|
| `tokens.css` | `--rail-start-inset`、`--rail-block-start`、`--rail-block-end`、`--rail-item-gap`、`--rail-logo-gap`、`--rail-logo-center`、`--icon-rail-width`、`--workspace-nav-width`、`--workspace-column-gap`、`--column-height`、`--workspace-inset-start`、`--workspace-inset-end`、`--workspace-edge-size`、`--workspace-fade-feather`、`--workspace-bleed-inline`、`--workspace-bleed-block`、`--breadcrumb-leading`、`--sidebar-leaf-height`（移动目录覆盖） |
| `materials.css` | `--rail-fill`、`--nav-tree-line`、`--ai-blue`、`--ai-violet`、`--ai-pink`、`--ai-cyan` |
| `motion.css` | `--ai-angle` 的注册和 `rail-ai-flow` 关键帧 |

## 作用域与回退

- `.app-shell` 建立轨道宽度、列距和整列高度。`.workspace-main` 建立内容区起止边距，起始边距在视口宽度达到 701px 时切换。`.page-content-frame` 提供出血与渐隐距离，`.page-header` 提供面包屑行高。各变量继承原有元素上的值。
- `--rail-fill` 按品牌入口、常规、悬停和选中四种选择器赋值。`--nav-tree-line` 在目录子树上赋值，悬停或选中的分支仅在其 `li::after` 上加深。`--sidebar-leaf-height` 在移动目录内使用紧凑控件高度。
- 四个 `--ai-*-base` 色值与主色在 `.icon-rail` 上混合。`--ai-angle` 注册为不继承的角度，初值 0deg。`rail-ai-flow` 在入口伪元素上将其动画至 360deg。
- `--nav-active-*`、`--nav-hover-*`、`--nav-border-width` 等按主题提供，未声明时沿用消费处的 `var()` 回退。`--field-shadow` 另有 `.copilot-composer` 私有覆盖，作用于输入框自身。
- `IconRail.tsx` 通过控件的内联样式逐帧写入 `--dock`（缩放）、`--dock-t`（悬停强度）和 `--dock-dy`（纵向位移）。指针离开后移除，CSS 回退依次为 1、0 和 0px。
