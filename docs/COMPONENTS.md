# 组件清单

「系统设置 → 组件预览」（`/settings/components` 及六个分类页）是组件规范的**活文档**：渲染官方 shadcn 示例（`apps/demo/src/features/settings/examples/*.tsx`）、图表、动效、表格模版。新增/调整组件时同步更新预览页与本文件。

导入路径总表（来自 `packages/ui/package.json` 的 `exports`）：

| 导入 | 源文件 |
| --- | --- |
| `@marismoon/ui/ui/<name>` | `src/components/ui/<name>.tsx` |
| `@marismoon/ui/shared/<Name>` | `src/components/shared/<Name>.tsx` |
| `@marismoon/ui/shared/use-data-table` | `src/components/shared/use-data-table.ts` |
| `@marismoon/ui/motion/<Name>`、`@marismoon/ui/motion/motion-tokens` | `src/components/motion/*` |
| `@marismoon/ui/icons` | `src/components/icons/index.ts` |
| `@marismoon/ui/lib/utils`、`@marismoon/ui/lib/format`、`@marismoon/ui/lib/storage`、`@marismoon/ui/lib/ui-labels` | `src/lib/*.ts` |
| `@marismoon/ui/hooks/use-mobile` | `src/hooks/use-mobile.ts` |

## 1. 共享组合组件（`@marismoon/ui/shared/*`）

暗色玻璃背景组件 `AriesMagicRings`、`AriesAntigravity` 和 `AriesLightfall` 分别从同名 shared 路径导入，作为 `AppShell.glassBackdrop` 渲染。三款均使用原生 WebGL 2，品牌切换时更新着色器配色。组件填满视口，减少动态效果时显示静态帧。三款背景按自身时间轴播放，鼠标移动、点击或按住均不会改变动效。


### FrostCard

玻璃材质卡片，基于 `ui/card` 的 `Card`。Props：`ComponentProps<"div">`。内置类 `surface gap-0 overflow-visible bg-transparent p-0 shadow-none ring-0`。

```tsx
import { FrostCard } from "@marismoon/ui/shared/FrostCard"
<FrostCard className="p-(--card-inset)">…</FrostCard>
```

### MetricCard

指标卡（`<dl>` 语义）。

| Prop | 类型 | 说明 |
| --- | --- | --- |
| `label` | `string` | 指标名 |
| `value` | `ReactNode` | 指标值 |
| `icon?` | `AppIconComponent` | 右上角图标 |
| `description?` | `ReactNode` | 注释 |
| `children?` | `ReactNode` | 额外内容（进度、事实列表等） |
| `featured?` | `boolean`（默认 `false`） | 主推卡 |
| `density?` | `"default" \| "compact"` | 紧凑密度 |
| `className?` | `string` | |

### StatusBadge

| Prop | 类型 | 说明 |
| --- | --- | --- |
| `tone?` | `"neutral" \| "success" \| "warning" \| "danger" \| "info"`（默认 `neutral`） | 颜色来自 `--success/--warning/--danger/--info` 与 `-bg` 令牌 |
| `children` | `ReactNode` | 文本 |
| `pulse?` | `boolean` | 仅用于「进行中」的低频呼吸圆点（`.status-pulse`） |
| `className?` | `string` | |

### EmptyState

`title: string`、`description?: string`、`icon?: AppIconComponent`（默认 `SolarInbox`）、`action?: ReactNode`、`className?`。

### CopyButton

复制到剪贴板并就地确认：复制图标交叉淡入为对勾（`--success`），文字由原文案变为「已复制」，约 1.8s 后复原；两种状态叠放在同一格内，按钮宽度不变，只动 opacity、scale、blur。

| Prop | 类型 | 说明 |
| --- | --- | --- |
| `value` | `string` | 写入剪贴板的文本 |
| `label?` | `string` | 可见文案；省略时为纯图标按钮，`aria-label` 取 `UiLabels.copy` / `copied`（可用 `aria-label` 覆盖） |
| `onCopied?` / `onError?` | `() => void` | 复制成功 / 失败回调 |
| `announce?` | `boolean` | 默认 `true`，在 polite live region 播报「已复制」；宿主自己播报时设为 `false` |

其余 Prop 透传给 `Button`（默认 `variant="outline"`）。新的复制操作 **SHOULD** 用它，不再手写剪贴板与图标切换。

### DataTable + useDataTable

所有业务表格的唯一模板（shadcn Table + TanStack Table）。样式只在 `shared/data-table.css`。

| `DataTable` Prop | 说明 |
| --- | --- |
| `table` | `useDataTable` 返回的实例 |
| `caption` | 屏幕阅读器标题与滚动区标签 |
| `columnAlign?` | `Record<columnId, "start" \| "end" \| "center">`，表头与单元格共用；金额/行内操作列 `end` |
| `rowHeaderColumn` | 作为 `th scope="row"` 的列 id |
| `selectAllLabel` / `selectRowLabel(row)` / `paginationLabel` | 无障碍文案 |
| `pageSizes?` | 默认 `[10, 20, 50]` |
| `empty` | 无匹配时渲染的内容（通常 `EmptyState`） |
| `scrollHint?` | `string`，仅在有数据且表格实际横向溢出时显示，并作为滚动区域的无障碍说明 |
| `loading?` | 与行高一致的扫光骨架 |

`use-data-table.ts` 导出：`dataTableFeatures`（列筛选、全局筛选、分页、行选择）、`DataTableInstance<TData>`、`createDataTableColumns<TData>()`、`useDataTable(options)`。参考 `apps/demo/src/features/bills/components/BillsTable.tsx`：

```tsx
const column = createDataTableColumns<Bill>()
const columns = [
  column.accessor("id", { header: "…" }),
  // …其余列
]
const table = useDataTable({
  columns,
  data: rows,
  getRowId: (bill) => bill.id,
  initialState: { pagination: { pageIndex: 0, pageSize: 10 } },
})
<DataTable table={table} caption="账单表格" columnAlign={{ issuedAmount: "end", actions: "end" }}
  rowHeaderColumn="id" selectAllLabel="…" selectRowLabel={(b) => `…${b.id}`}
  paginationLabel="…" empty={<EmptyState title="没有匹配的账单" />} />
```

规则：列宽用 `--column-fraction`；行内操作用 `data-column="actions"` 的文字按钮并打开抽屉；筛选生效的控件加 `.data-table-filter[data-active]`；不做排序控件；金额与数字不做动画。

### 主题与偏好控件

| 组件 | 说明 |
| --- | --- |
| `ThemeSwitcher({ className? })` | 明/暗切换（next-themes），带图标旋转缩放；遵守减少动态效果 |
| `BrandPaletteControl()` | 按 `paletteLabels` 的顺序轮换品牌主题并写入 localStorage |
| `DarkStyleControl()` | 仅暗色模式显示，切换 `glass` / `clean` |

## 2. 动效（`@marismoon/ui/motion/*`）

- `MotionSurface({ children })`：路由进入过渡（`data-motion-surface="route"`，`useReducedMotion` 时无初始态）。
- `NavPills({ active, hover })`：第二列导航的选中与悬停底板，`@marismoon/shell` 默认渲染，宿主一般无需直接使用。弹簧 `navPillSpring` 为临界阻尼，`useReducedMotion` 时瞬时移动。
- `motion-tokens`：`routeEntry`、`dialogEntry`、`overlayEntry`、`contentEntry`（缓动 `[0.23, 1, 0.32, 1]`）。
- `Tabs`（默认变体）：切换时一枚复制当前选中样式的浮层从旧 Tab 滑到新 Tab（220ms），静止时不增加任何元素，页面或外壳自定义的选中样式保持原样；`useReducedMotion` 时直接切换。Tab 面板进入时淡入上移 4px。

## 3. 图标（`@marismoon/ui/icons`）

只用 Solar。`AppIcon({ icon, size = 20, stateful?, … })` 渲染图标（有 `aria-label` 时 `role="img"`，否则 `aria-hidden`）；`AppIconComponent` 为图标类型。`Solar*` 命名导出来自 `components/icons/solar/*`（如 `SolarCog`、`SolarBell`、`SolarSearch`、`SolarMoon`、`SolarSun`、`SolarInbox`）。`IconPlaceholder`（`icon-placeholder.tsx`）把 shadcn CLI 生成的占位映射到 Solar。新增：加文件到 `solar/` 并在 `index.ts` 导出。

变体规则（Linear / Bold、`stateful`、24×24 网格）见 [AGENTS.md §3.1](../AGENTS.md)。`stateful` 同时渲染 Linear 与 Bold，由 `styles/icon-states.css` 按状态显示其一，不增加 DOM 包裹层。配对表在 `icon-variants.ts`（`boldIconOf`），目前覆盖 20 个图标，其中一级模块与第二列导航 18 个：`bell`、`chart-2`、`chart-square`、`clock-circle`、`cloud`、`settings`、`card`、`eye`、`document-text`、`folder`、`home-smile-angle`、`widget-2`、`letter`、`notebook`、`pallete-2`、`bill-list`、`refresh`、`shield-warning`；另有发送按钮的纸飞机 `plain-3`（`SolarPlain3`，悬停或按下时为 Bold）和关闭按钮的 `close-circle`。

**关闭图标**：关闭、移除、清除类按钮统一用 `@marismoon/ui/ui/close-button`。`CloseButton` 是图标按钮（`ghost`、默认 `size=\"icon-sm\"`，需传 `aria-label` 或 `sr-only` 子节点）；`CloseIcon` 是 16px、`stateful` 的 `SolarClose`（`close-circle-linear`，悬停或按下切 `close-circle-bold`）；`closeButtonClass` 给其他宿主按钮用。外观唯一：静止与悬停都不带底色，颜色由 `--muted-foreground` 变为 `--foreground`。`Dialog`、`Sheet` 的关闭按钮，`Combobox` 的清除与标签移除按钮都已使用；`IconPlaceholder` 的 `XIcon` 也映射到圆圈叉。无外圈的叉 `close-linear` 仍以 `SolarCloseLine` 导出，但不用于关闭按钮。

**三点图标**统一用 `SolarEllipsis`，所有状态均为实心三点。`IconPlaceholder` 的 `MoreHorizontalIcon` 使用同一图标。[Solar Menu Dots Bold](https://www.shadcn.io/icon/solar-menu-dots-bold)

**别名对照**（命名与实际图形不一致，引用前先看这里）：`SolarCheck` 与 `SolarCircleCheck` 同为 `check-circle-linear`；`SolarX` 与 `SolarClose` 同为 `close-circle-linear`；`SolarFileSearch` = `document-text`；`SolarSquareMenu` = `file-text`；`SolarChartNoAxesColumnIncreasing` = `chart-2`；`SolarReceiptText` = `bill-list`；`SolarCog` = `settings`；`SolarClock3` = `clock-circle`。

## 4. 工具与 Hook

- `lib/utils`：`cn`（重导出自 `cn` 包）。
- `lib/format` 提供万元数值格式化 `formatWan`、金额格式化 `formatCurrency` 和活动时间格式化 `formatActivityTime`。
- `lib/storage`：`paletteLabels`、`isPalette`、`getStoredPalette`、`applyStoredPalette`、`getActivePalette`、`setStoredPalette`、`DarkStyle`、`getActiveDarkStyle`、`applyStoredDarkStyle`、`setStoredDarkStyle`。
- `hooks/use-mobile`：`useIsMobile()`。
- `lib/ui-labels`：`UiLabels`、`defaultUiLabels`（中文）、`UiLabelsProvider`、`useUiLabels()`；共享组件的固定文案（Dialog 关闭、表格底栏与分页、主题/品牌/暗色控件等）由此读取，应用通过 `UiLabelsBridge` 提供翻译。

## 5. 基础组件（`@marismoon/ui/ui/*`，64 个组件 + 3 个样式文件）

shadcn（radix-rhea）+ 本项目扩展，均已按本项目令牌定制。

`accordion` `alert-dialog` `alert` `aspect-ratio` `attachment` `avatar` `badge` `breadcrumb` `bubble` `button-group` `button` `calendar` `card` `carousel` `chart` `checkbox` `code-block` `collapsible` `combobox` `command` `context-menu` `date-picker` `dialog` `direction` `drawer` `dropdown-menu` `empty` `field` `hover-card` `input-group` `input-otp` `input` `item` `kbd` `label` `marker` `menubar` `message-scroller` `message` `native-select` `navigation-menu` `pagination` `popover` `progress` `questionnaire` `radio-group` `resizable` `scroll-area` `select` `separator` `sheet` `sidebar` `skeleton` `slider` `sonner` `spinner` `switch` `table` `tabs` `textarea` `toggle-group` `toggle` `tooltip` `trace`。样式文件：`popup.css`、`select.css`、`text-field.css`。

### 默认值（规范）

- `Button`：`variant` 默认 `default`，可选 `outline | secondary | ghost | destructive | link`；`shape` 默认 `workspace`（全圆胶囊，任何高度两端都是半圆；图标按钮为正圆）。`size` 默认 **`dense`（32px，不写 `size` 即此值）**，`default` 反而是 40px：

  | `size` | 高度 | 用途 |
  | --- | --- | --- |
  | `default` | 40px | 页面级主操作（登录卡片的「登录」、向导与表单提交） |
  | `dense`（默认） | 32px | 组件与浮层内的操作：对话框、抽屉、AlertDialog、Sheet 页脚、空状态按钮 |
  | `small` | 28px（`--control-size-small`） | 小浮层：`AlertDialog size="sm"`、小 Popover、Toast 操作 |
  | `sm` / `lg` / `xs` | 36 / 44 / 24px | 其余场景 |
  | `icon` / `icon-xs` / `icon-sm` / `icon-lg` | 32 / 24 / 28 / 40px | 图标按钮 |

  `pointer: coarse` 下 `small`、`icon-xs`、`icon-sm` 放大到 40px，`xs` 放大到 36px。普通 AlertDialog 页脚为 32px，`size="sm"` 的页脚为 28px（由 `popup.css` 自动处理）。各 variant 的底色只来自令牌，暗色没有单独写法：`default` 用 `--primary` / `--primary-foreground`（悬停 `--primary-hover`），`outline` 用 `--field-surface` 加 `--field-shadow`，`secondary` 用 `--secondary`，`ghost` 悬停用 `--muted`，`destructive` 为 `--destructive` 的 10% 底色。有底色的 `default`、`secondary`、`destructive` 再叠一层很轻的受光渐变 `--control-sheen`；内描边与主色投影（`--primary-shadow`）只给 `default`，`secondary` 沿用 `--field-shadow`，`destructive` 不加投影，规则见 [DESIGN_SYSTEM §5](DESIGN_SYSTEM.md)；`outline`、`ghost`、`link` 不叠。
- `Badge`：`variant` 含 `default secondary destructive outline ghost link`，以及 Ant Design 预设色 `red volcano orange gold yellow lime green cyan blue geekblue purple magenta gray`（加 `solid` 为实心）。
- `Input`、`SelectTrigger`、`InputGroup`、`NativeSelect`、`Combobox`、`InputOTP`：统一 `field-surface`，不写 `size` 即 32px。`Input` 与 `SelectTrigger` 在任何高度都是全圆胶囊；`Textarea` 保持 `--radius-workspace-control`。
- `SelectContent` 的 `alignItemWithTrigger` 默认为 `true`，将已选项与触发器对齐。设为 `false` 时，弹层沿触发器边缘展开。已有 `position` 用法继续有效，同时传入时以 `alignItemWithTrigger` 为准。
- `Tabs` / `ToggleGroup` / `Menubar`：`--recess` 分段胶囊，选项 28px。

## 6. 工作区布局组件（`@marismoon/shell`）

工作区布局、导航、页头和命令面板由 `@marismoon/shell` 根入口导出。组件清单、Props、插槽、导航与语言适配统一见 [Shell README](../packages/shell/README.md)。Demo 的用户头像沿用基础组件 `Avatar` + `AvatarBadge` 的默认尺寸、颜色与描边。

## 7. 示例实现（可参考，正式开发时删除）

| 能力 | 位置 |
| --- | --- |
| KPI 卡、图表卡（recharts） | `features/overview/components/OverviewKpis.tsx`、`OverviewCharts.tsx` |
| 连续匀速滚动列表（跑马灯，仅列表滚动，不含数字动画） | `features/overview/components/AttentionList.tsx` + `hooks/useAttentionScroll.ts` |
| Tabs 切换卡片（尺寸稳定） | `features/overview/components/ActivityTimeline.tsx` |
| 表格 + 抽屉 | `features/bills/components/BillsTable.tsx`、`BillDrawer.tsx` |
| 登录/安全/会话等基础页面 | `features/settings/base-pages/` |
| AI 助手面板 | `features/copilot/` |

## 8. 扩展规则

1. 先在预览页/本文件查找可复用组件；其次组合现有组件；最后才新增。
2. 基础组件放 `packages/ui/src/components/ui`（保持 shadcn 结构以便 CLI diff）；有业务无关的组合放 `shared`；业务组合放 `apps/demo/src/features/<name>/components`。
3. 颜色、圆角、字号一律走令牌（见 [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)）；Button/Badge 内图标写 `data-icon="inline-start|inline-end"`，不手写图标尺寸。
4. 包边界与提交前回归清单见 [AGENTS.md](../AGENTS.md) §1 与 §9。
