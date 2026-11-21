# 设计系统

全部样式与令牌位于 `packages/ui/src/styles/`，由 `globals.css` 汇总引入（顺序：tailwindcss → tw-animate-css → shadcn/tailwind.css → 字体 → `tokens.css` → `spectrum.css` → `materials.css` → `dark-base.css` → `dark-clean.css` → `components/ui/popup.css` → `motion.css` → `soft-edge.css`）。应用入口 `apps/web/src/index.css` 引入它并 `@source` 应用代码。

| 文件 | 内容 |
| --- | --- |
| `tokens.css` | `:root` 基础令牌（亮色）、`.dark` 暗色、各品牌主题 `[data-palette="…"]` |
| `spectrum.css` | 图表/强调色谱 `--spectrum-*` 与 `--swatch-*` |
| `materials.css` | 玻璃材质：`.surface`、`.surface-inset`、`.frost-divider`、`.hero-surface`、页面环境光 |
| `dark-base.css` | 暗色共同底座：亮度阶梯、白色 alpha 发丝线、语义色，glass 与 clean 共用（不含 `marismoon-light`） |
| `dark-clean.css` | 简洁暗色材质（`.dark[data-dark-style="clean"]`）：仅关闭模糊/光晕/阴影 |
| `motion.css` | 缓动/时长令牌、对话框退出、`prefers-reduced-motion`、`.shimmer-text`/`.shimmer-block` |
| `soft-edge.css` | 滚动容器边缘渐隐（scroll-driven animation，不支持时降级） |

## 1. 主题与模式

- **模式**：`next-themes`（`attribute="class"`）切换 `.dark`；`:root` 声明 `color-scheme: light`。
- **品牌主题**（`<html data-palette="…">`，`lib/storage.ts` 的 `paletteLabels`，localStorage 键 `marismoon-palette`）：`saas-analytics-spectrum`（默认）、`telemedicine`、`mental-health`、`pet-adoption`、`health-wellness`、`violet-aurora`、`amber-sand`、`rose-quartz`、`marismoon-light`。`marismoon-light` 为**纯浅色**主题（`color-scheme: light`，暗色块也保持浅色）。
- **暗色风格**（`<html data-dark-style="glass|clean">`，键 `marismoon-dark-style`）：`glass` 毛玻璃（默认）、`clean` 简洁（无模糊/光晕/阴影，靠发丝线分层）。两种风格共用 `dark-base.css` 的骨架，只差材质。
- **暗色底座**：每个主题只声明 `--dark-hue`，饱和度统一 `--dark-tint: 6%`；亮度（HSL L）recess 8 < 画布 11 < 卡片 15 < 控件 19 < 浮层 23；发丝线为白色 alpha：`--border-subtle` 10%、`--border` 18%、`--layout-control-border` 22%、`--input` 32%；语义色全主题固定。主题块不再写表面/边框/语义色，只提供主色、强调、图表、光晕与 hero。图表色在暗色下须对卡片 ≥3:1。
- **玻璃卡片染色**：glass 的卡片取主色色相，固定 OKLCH 亮度/彩度（`--card-l: 0.26`、`--card-c: 0.032`），不透明度 52/44%，极光强度 70%；clean 卡片保持中性。回退把 `--card-c` 设为 0 即可。
- 切换控件：`BrandPaletteControl`（轮换主题）、`DarkStyleControl`（仅暗色模式显示）、`ThemeSwitcher`（明暗）。

## 2. 令牌

> 本系统以**语义令牌**为主，不存在全局通用的 50–950 色阶。唯一的 50–950 色阶是 `marismoon-light` 主题内的 `--marismoon-primary-50…950` 与 `--marismoon-neutral-50…950`，业务代码应引用语义令牌而不是色阶。

### 语义色（组件只用这些）

`--background` `--foreground` `--card` `--card-bottom` `--card-foreground` `--popover` `--popover-foreground` `--primary` `--primary-foreground` `--primary-hover` `--secondary` `--secondary-foreground` `--muted` `--muted-foreground` `--accent` `--accent-foreground` `--destructive` `--border` `--border-subtle` `--input` `--ring` `--overlay` `--control` `--layout-control` `--layout-control-border` `--recess`。

状态色：`--success` `--warning` `--danger` `--info`，及背景 `--success-bg` `--warning-bg` `--danger-bg` `--info-bg`（简洁暗色下四种语义色固定，与品牌无关）。

图表色：`--chart-1` … `--chart-8`（Tailwind 映射 `--color-chart-1…8`）。

### 材质与表面

`--glass-fill-top` `--glass-fill-bottom` `--glass-edge` `--glass-specular` `--surface-edge` `--surface-highlight` `--surface-shadow` `--surface-shadow-color` `--surface-filter` `--nav-filter` `--surface-inset` `--surface-inset-shadow` `--field-surface` `--field-surface-hover` `--field-shadow` `--glow-line`（聚焦渐变边）、`--hero-start/end/edge/ink/muted/bar`。

### 间距、尺寸、圆角、字号

| 类别 | 令牌 |
| --- | --- |
| 间距 | `--space-1`…`--space-6`（0.25rem 递增至 1.5rem，步长 0.25rem 起）、`--card-inset`（1rem）、`--workspace-safe-inline-end`、`--workspace-safe-block-end` |
| 控件高度 | `--control-size-dense` 2rem（默认 32px）、`--control-size-compact` 2.25rem、`--control-size` 2.5rem（40px）、`--control-size-touch` 2.75rem（`pointer: coarse`） |
| 圆角 | `--radius` 1rem、`--radius-control` 1rem、`--radius-workspace-control` 1.125rem、`--radius-panel` 1.5rem；Tailwind 的 `rounded-lg` → `--radius-control`，`rounded-2xl` → `--radius-panel` |
| 字号 | 仅 11 / 12 / 13 / 14 / 15 / 20px；`--text-label` 0.75rem、`--text-body` 0.875rem、`--metric-label-size` 0.8125rem、`--metric-value-size` 1.5rem（字重 720、字距 -0.042em）、`--metric-note-size` 0.6875rem |
| 字体 | `Inter Variable`、`Noto Sans SC Variable`、`system-ui`；金额/数字使用 `financial-number`（`tabular-nums lining-nums`） |

控件与表格正文 13px，表头与标签 12px，字重 620 用于分段胶囊选项。

## 3. 卡片规则

- 使用 `FrostCard`（`.surface`，透明底 + 玻璃材质）或 `MetricCard`；内边距 `--card-inset`；圆角 `--radius-panel`；卡片内分组 `--radius-control`。
- 同一卡片在相同视口/断点下外部尺寸稳定；Tabs、筛选、分页、加载、数据变化不改变宽高；Hover/Focus 不引起布局跳动（明确的展开/收起除外）。
- 内容溢出、空状态、加载状态由卡片内部处理，**不**拉伸列表行填满卡片，**不**裁剪重要内容。
- 滚动内容边缘使用 `soft-edge.css` 的渐隐（容器需列入其选择器），**不**用边框/阴影/遮罩层掩盖裁剪。
- 阴影不得被 `overflow` 裁剪：预留出血（padding）并用等量负 margin 抵消。

## 4. 控件视觉

- 表单控件（`Input`、`SelectTrigger`、`InputGroup`、`NativeSelect`、`Combobox`、`InputOTP`）统一 `field-surface`；聚焦为 `--glow-line` 1px 渐变边，错误态为 destructive 描边。
- 分段胶囊族（Tabs、ToggleGroup、Menubar）：`--recess` 胶囊、内边距 3px、选项 28px 高、12px 字、字重 620；悬停 `--sidebar-item-hover`，选中为 `--layout-control` 浮起胶囊。
- 浮层统一 `components/ui/popup.css`（玻璃底、圆角、26px 圆角行、悬停强调色）；下拉用 `SelectContent position="popper"`。
- 表格：标题栏圆头色条、透明背景，上方与首条记录上方无分割线（见 `shared/data-table.css`）。
- Badge 提供 Ant Design 预设色 `red volcano orange gold yellow lime green cyan blue geekblue purple magenta gray`：`<Badge variant="blue">` 柔和，加 `solid` 实心；状态用 `StatusBadge`。
- 图标：Solar，默认 Linear，选中/悬停切同名 Bold（`AppIcon stateful`，见 COMPONENTS.md）；`AppIcon` 默认 20px；Button/Badge 内图标写 `data-icon="inline-start|inline-end"`，尺寸随组件自动缩放。

## 5. 动效规则

| 令牌/类 | 值 / 用途 |
| --- | --- |
| `--ease-feedback` | `cubic-bezier(0.23, 1, 0.32, 1)`（所有 `transition-*` 默认曲线，默认时长 160ms） |
| `--duration-feedback` / `--duration-exit` | 150ms / 145ms |
| `routeEntry`（`motion-tokens.ts`） | 路由进入：opacity 0.65→1，210ms |
| `dialogEntry` / `overlayEntry` | 180ms（y 6→0）/ 160ms |
| 表格 | 行悬停 140ms；行进入 180ms 淡入（`--row-index` 错开，最多 8 行）；勾选行左侧 3px 指示条；`StatusBadge pulse` 低频呼吸；`DataTable loading` 扫光骨架 |
| `.shimmer-text` / `.shimmer-block` | 扫光文字/占位块 |

规则：**不使用 layout 动画与弹簧回弹**；金额与数字不做滚动/跳动动画；**`prefers-reduced-motion: reduce` 下关闭所有 CSS 动画/过渡**（`motion.css` 全局兜底，新增动效仍须自检）；JS 动效使用 `useReducedMotion`。

## 6. 图表规则

- 使用 `components/ui/chart.tsx`（`ChartContainer` + `ChartConfig`）封装 recharts 3.8.0；系列色只引用 `--chart-1…8`，不写死色值。
- 图表卡片的外部尺寸固定，图例/Tab 切换不改变卡片高度；坐标轴刻度使用 `financial-number`；每个图表提供文字替代（`figcaption`/`aria-label`）。
- 参考实现：`apps/web/src/features/overview/components/OverviewCharts.tsx` 与 `features/settings/chart-demos.tsx`、`ChartShowcase.tsx`。

## 7. 响应式

断点：≤700px 手机、701–899px iPad 竖屏（第二列默认收起）、≥900px 三列。`pointer: coarse` 下控件 ≥ 40px。验收视口：1920×1080、1440×900、1280×800、1024×768、820×1180、768×1024、430×932、390×844、375×667（`e2e/responsive-adaptation.spec.ts`，Light/Dark）。

## 8. 新增主题的步骤

1. `tokens.css` 增 `[data-palette="x"]:not(.dark)` 与 `.dark[data-palette="x"]` 两块，覆盖全部语义色与 `--chart-1…8`。
2. `spectrum.css`（或 `tokens.css`）增 `--swatch-x`；`lib/storage.ts` 的 `paletteLabels` 登记。
3. 若支持简洁暗色，在 `dark-clean.css` 增 `--clean-hue`；纯浅色主题在 `:not([data-palette="…"])` 中排除。
4. 在「系统设置 → 组件预览」核对，并回归主题相关 e2e（`e2e/theme.spec.ts`）。
