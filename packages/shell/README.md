# @marismoon/shell

React 工作区外壳提供三列导航与页面布局、命令面板和独立滚动区。宿主负责路由、翻译、菜单数据与业务面板。外壳禁止导入应用代码、路由库和翻译库，消费方从公开入口导入组件和样式，禁止深层导入包内文件。

## 接入

组件和类型从 `@marismoon/shell` 具名导入。宿主在 CSS 入口依次引入 UI 的令牌、材质和外壳样式，然后加载业务样式。

```css
@import "@marismoon/ui/styles/globals.css";
@import "@marismoon/ui/styles/fonts.css"; /* 可选：设计字体 */
@import "@marismoon/shell/styles";
```

```tsx
import { AppShell, ShellLabelsProvider, ShellRouterProvider } from "@marismoon/shell"

<ShellRouterProvider value={adapter}>
  <ShellLabelsProvider value={{ labels, languageControl }}>
    <AppShell navigation={navigation} routeModule={moduleId}>
      {page}
    </AppShell>
  </ShellLabelsProvider>
</ShellRouterProvider>
```

完整的 Demo 接线见 [shell-adapter.tsx](../../apps/demo/src/app/shell-adapter.tsx)。

## 路由、导航与语言

| 接口 | 宿主提供的值 |
| --- | --- |
| `ShellRouterAdapter` | `activePath` 是当前路径。`locationKey?` 区分同一路径的不同历史条目，用于恢复滚动与选中态。`onNavigate?(path)` 可返回 Promise。`renderLink?(props)` 自定义链接，接收 `ShellLinkProps`（`to`、`end?` 与原生锚点属性）。默认 `ShellLink` 渲染锚点，`end` 控制精确或分段前缀匹配。 |
| `WorkspaceNavigation` | 提供 `modules`、品牌标识与链接、用户头像、移动目录说明和不可用操作的文案。每个 `NavModule` 包含稳定的 `id`、已翻译的 `label`、`ReactNode` 图标、`railPosition`、`visibleOnMobile`、`items` 和 `commands`。 |
| `NavNode` | 以 `id`、`label` 定义条目，可带图标、`count`、链接 `path` 或分组 `children`。 |
| `ModuleCommands` | 当前模块的 `triggerLabel`、`placeholder` 和 `items`。`CommandItem` 提供已翻译的标题、说明、图标，可附搜索关键词和目标路径。 |
| `ShellLabels` | 外壳固定文案均为宿主已翻译的字符串。提供导航、范围与帮助文案，页面内容区、面包屑和语言控件的无障碍名称，以及搜索面板的标题、说明、输入框、结果列表与空态文案。完整字段见 [labels.ts](src/types/labels.ts)。 |
| `LanguageControlProps` | 传入当前语言 `value`、有序的 `options: { value, label }[]` 与 `onChange(value)`。宿主处理语言切换和持久化。 |

`useShellRouter()`、`useShellLabels()` 和 `useShellLanguageControl()` 读取对应 Provider 的值。第二列导航的选中与悬停高亮默认由 `@marismoon/ui/motion/NavPills` 绘制：两块底板以临界阻尼弹簧（`navPillSpring`）滑动，遵循减少动效偏好。它和页面过渡一样使用 `motion` 的 `m.*` 组件，宿主须在 `LazyMotion` 内渲染外壳。需要换成其他样式时，通过 `NavHighlightContext` 提供渲染函数；它接收 `NavHighlightRects`，其中 `active` 与 `hover` 分别为选中项、悬停项的 `HighlightRect` 或 `null`。

## 外壳与页面

`AppShellProps` 的必填字段为 `navigation`、`routeModule`（对应模块的 `id`）和 `children`（主区页面）。可选插槽如下。

| Props | 渲染位置与行为 |
| --- | --- |
| `headerExtra` | 通过 `HeaderExtraContext` 传至页头操作区，在工作区控制按钮之前渲染。 |
| `overlays` | 布局网格外，供宿主挂载浮层。 |
| `rightPanel`、`rightPanelOpen` | 右栏位于网格外。传入节点时按受控开合状态挂载或卸载。传入 `(open) => ReactNode` 时每次都调用，由宿主保留退出动画。 |
| `renderRightPanelTrigger`、`onRightPanelOpenChange` | 在图标栏渲染入口，接收 `{ open, onToggle, keyShortcuts }`。入口将触发元素交给 `onToggle`，宿主收到 `(open, launcher)` 后更新状态；`keyShortcuts` 用于入口的 `aria-keyshortcuts`。 |
| `rightPanelShortcut` | 默认 `true`：提供了 `rightPanel` 与 `onRightPanelOpenChange` 时，⌘⇧K / Ctrl+Shift+K（`rightPanelKeyShortcuts`）切换右栏；其他对话框打开时不响应。`launcher` 为当前焦点元素，焦点在页面上时为入口按钮。传 `false` 关闭。 |

`useDocumentTitle(title)` 在浏览器中把 `document.title` 同步为传入的字符串，宿主通常写 `` useDocumentTitle(`${页面标题} · 产品名`) ``。

页面用 `WorkspacePage` 接收页面元信息（`id`、已翻译的 `title`、可选 `description`、`breadcrumbs: readonly Breadcrumb[]`）和 `WorkspacePageSlots`。必填的 `Content` 与可选的 `Subtitle`、`BreadcrumbDetail`、`Summary` 均为组件。

| 组成部分 | 公开组件 |
| --- | --- |
| 图标栏与侧栏 | `IconRail`、`RailTooltip`、`WorkspaceNav`、`NavTree`、`NavHighlight`、`SidebarNavItem` |
| 主区与页头 | `MainWorkspace`、`WorkspacePageLayout`、`WorkspacePage`、`PageHeader`、`WorkspaceControls`、`LanguageControl` |
| 命令与链接 | `CommandPaletteProvider`、`CommandPalette`、`ShellLink` |

## CSS 变量契约

轮次三起点的 `layout.css` 包含 255 次 `var()` 引用，涉及 91 个变量。下表包含移入 UI 的派生变量所依赖的令牌。样式文件均位于 `packages/ui/src/styles/`，宿主通过 `@marismoon/ui/styles/globals.css` 引入。已有主题层叠顺序为 `tokens.css` → `materials.css` → `dark-base.css` → `dark-clean.css`，动效令牌位于其后的 `motion.css`。

| 用途 | 变量 | 定义或主题覆盖文件 |
|---|---|---|
| 页面与控件的语义颜色 | `--accent` | `tokens.css`、`dark-clean.css` |
| 页面与控件的语义颜色 | `--accent-foreground`、`--primary`、`--ring` | `tokens.css` |
| 页面与控件的语义颜色 | `--background`、`--border`、`--border-subtle`、`--control`、`--foreground`、`--layout-control-border`、`--muted`、`--muted-foreground`、`--popover`、`--recess` | `tokens.css`、`dark-base.css` |
| 页面与控件的语义颜色 | `--field-shadow` | `tokens.css`、`dark-clean.css` |
| 页面与控件的语义颜色 | `--field-surface`、`--layout-control`、`--popover-foreground` | `tokens.css` |
| 外壳尺寸与安全边距 | `--column-height`、`--icon-rail-width`、`--rail-block-end`、`--rail-block-start`、`--rail-item-gap`、`--rail-logo-center`、`--rail-logo-gap`、`--rail-start-inset`、`--workspace-column-gap`、`--workspace-inset-end`、`--workspace-inset-start`、`--workspace-nav-width`、`--workspace-safe-block-end`、`--workspace-safe-inline-end` | `tokens.css` |
| 轨道按钮的尺寸与材质 | `--icon-control-hover-bg`、`--rail-active-bg`、`--rail-active-fg`、`--rail-backplate-size`、`--rail-control-size`、`--rail-icon-size`、`--rail-logo-fg` | `tokens.css` |
| 轨道按钮的尺寸与材质 | `--rail-fill` | `materials.css` |
| 轨道按钮的尺寸与材质 | `--rail-logo-bg` | `tokens.css` |
| 侧栏表面与导航状态 | `--nav-active-fill`、`--nav-active-shadow`、`--nav-border-width`、`--nav-hover-fill`、`--nav-hover-shadow` | `dark-clean.css` |
| 侧栏表面与导航状态 | `--nav-filter`、`--sidebar-background-clip`、`--sidebar-edge`、`--sidebar-radius`、`--sidebar-shadow` | `tokens.css`、`dark-clean.css` |
| 侧栏表面与导航状态 | `--nav-tree-line` | `materials.css` |
| 侧栏表面与导航状态 | `--scope-selected`、`--sidebar-item-height`、`--sidebar-item-hover`、`--sidebar-item-radius`、`--sidebar-leaf-height` | `tokens.css` |
| 侧栏表面与导航状态 | `--workspace-nav` | `tokens.css`、`dark-base.css`、`dark-clean.css` |
| 内容视口的出血、渐隐和背景 | `--workspace-bleed-block`、`--workspace-bleed-inline`、`--workspace-edge-size`、`--workspace-fade-feather` | `tokens.css` |
| 内容视口的出血、渐隐和背景 | `--page-background` | `materials.css`、`dark-base.css` |
| 通用间距、控件、圆角与字号 | `--control-size-compact`、`--control-size-dense`、`--control-size-touch`、`--radius-control`、`--radius-workspace-control`、`--space-1`、`--space-2`、`--space-3`、`--space-4`、`--space-5`、`--space-6`、`--text-body`、`--text-label`、`--breadcrumb-leading` | `tokens.css` |
| 交互时长与缓动 | `--duration-feedback`、`--ease-feedback` | `motion.css` |
| 指针跟踪的逐帧输入 | `--dock`、`--dock-dy`、`--dock-t` | `IconRail.tsx` |

### 从外壳样式归入 UI 的声明

| 目标文件 | 原先定义在 `layout.css` 的变量 |
|---|---|
| `tokens.css` | `--rail-start-inset`、`--rail-block-start`、`--rail-block-end`、`--rail-item-gap`、`--rail-logo-gap`、`--rail-logo-center`、`--icon-rail-width`、`--workspace-nav-width`、`--workspace-column-gap`、`--column-height`、`--workspace-inset-start`、`--workspace-inset-end`、`--workspace-edge-size`、`--workspace-fade-feather`、`--workspace-bleed-inline`、`--workspace-bleed-block`、`--breadcrumb-leading`、`--sidebar-leaf-height`（移动目录覆盖） |
| `materials.css` | `--rail-fill`、`--nav-tree-line`、`--ai-blue`、`--ai-violet`、`--ai-pink`、`--ai-cyan` |
| `motion.css` | `--ai-angle` 的注册和 `rail-ai-flow` 关键帧 |

### 作用域与回退

- `.app-shell` 建立轨道宽度、列距和整列高度。`.workspace-main` 建立内容区起止边距，起始边距在视口宽度达到 701px 时切换。`.page-content-frame` 提供出血与渐隐距离，`.page-header` 提供面包屑行高。各变量继承原有元素上的值。
- `--rail-fill` 按品牌入口、常规、悬停和选中四种选择器赋值。`--nav-tree-line` 在目录子树上赋值，悬停或选中的分支仅在其 `li::after` 上加深。`--sidebar-leaf-height` 在移动目录内使用紧凑控件高度。
- `--ai-*` 色值、`--ai-angle` 与 `rail-ai-flow` 仍由 `@marismoon/ui` 提供，外壳的右栏入口已不再使用。
- `--nav-active-*`、`--nav-hover-*`、`--nav-border-width` 等按主题提供，未声明时沿用消费处的 `var()` 回退。`--field-shadow` 另有 `.copilot-composer` 私有覆盖，作用于输入框自身。
- `IconRail.tsx` 通过控件的内联样式逐帧写入 `--dock`（缩放）、`--dock-t`（悬停强度）和 `--dock-dy`（纵向位移）。指针离开后移除，CSS 回退依次为 1、0 和 0px。
