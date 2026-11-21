# 设计系统

全部样式与令牌位于 `packages/ui/src/styles/`，由 `globals.css` 汇总引入（顺序：tailwindcss → tw-animate-css → shadcn/tailwind.css → 字体 → `tokens.css` → `spectrum.css` → `materials.css` → `dark-base.css` → `dark-clean.css` → `components/ui/popup.css` → `motion.css` → `soft-edge.css`）。应用入口 `apps/web/src/index.css` 引入它并 `@source` 应用代码。

| 文件 | 内容 |
| --- | --- |
| `tokens.css` | `:root` 基础令牌（亮色）、`.dark` 暗色（含玻璃材质参数）、各品牌主题 `[data-palette="…"]` |
| `spectrum.css` | 默认主题（saas-analytics-spectrum）、图表/强调色谱 `--spectrum-*` 与 `--swatch-*` |
| `materials.css` | 玻璃材质：`.surface`、`.surface-inset`、`.frost-divider`、`.hero-surface`、页面环境光 |
| `dark-base.css` | 暗色共同底座（glass 与 clean 共用）+ glass 的染色与极光；不含 `marismoon-light` |
| `dark-clean.css` | 简洁暗色材质（`.dark[data-dark-style="clean"]`）：关闭模糊、光晕、阴影 |
| `motion.css` | 缓动/时长令牌、对话框退出、`prefers-reduced-motion`、`.shimmer-text`/`.shimmer-block` |
| `soft-edge.css` | 滚动容器边缘渐隐（scroll-driven animation，不支持时降级） |

## 1. 主题与模式

- **模式**：`next-themes`（`attribute="class"`）切换 `.dark`；`:root` 声明 `color-scheme: light`。
- **品牌主题**（`<html data-palette="…">`，`lib/storage.ts` 的 `paletteLabels`，localStorage 键 `marismoon-palette`）：`saas-analytics-spectrum`（默认）、`telemedicine`、`mental-health`、`pet-adoption`、`health-wellness`、`violet-aurora`、`amber-sand`、`rose-quartz`、`marismoon-light`。`marismoon-light` 为**纯浅色**主题（`color-scheme: light`，暗色块也保持浅色）。
- **暗色风格**（`<html data-dark-style="glass|clean">`，键 `marismoon-dark-style`）：`glass` 毛玻璃（默认）、`clean` 简洁。详见 §2。
- 切换控件：`BrandPaletteControl`（轮换主题）、`DarkStyleControl`（仅暗色模式显示）、`ThemeSwitcher`（明暗）。

## 2. 暗色体系

暗色由三层组成：**共同底座**（两种风格一致）→ **主题块**（只给主色与图表等）→ **材质**（glass 或 clean，唯一的差别）。只改 `.dark` 作用域，不动亮色。

### 2.1 共同底座（`dark-base.css`）

| 项 | 规则 |
| --- | --- |
| 色相 | 每个主题只声明 `--dark-hue`；染色饱和度统一 `--dark-tint: 6%` |
| 表面亮度（HSL L） | recess 8 < 画布 12 < 卡片 15 < 控件 19 < 浮层 23；台阶小，主要靠发丝线分层 |
| 文字 | 正文 L96、次级 L70（均带主题色相），不使用纯白 |
| 发丝线（白色 alpha） | `--border-subtle` 10%、`--border` 18%、`--layout-control-border` 22%、`--input` 32%、`--surface-edge` 15% |
| 语义色 | `--success #6ee7a8`、`--warning #fbd075`、`--danger #ff8fa3`、`--info #8fb8ff`；背景为 14% 混色；全主题固定 |
| 遮罩 | `--overlay`，带色相的近黑 62%；不写 `bg-black/…` |
| 浏览器自绘部件 | 暗色下 `scrollbar-color` 为白色 24% 的滑块、透明轨道 |

主题块（`tokens.css` / `spectrum.css` 的 `.dark[data-palette="…"]`）**只提供**：主色与前景、强调、`--chart-1…8`、极光 `--environment-*`、hero 令牌。不再写表面、边框、语义色。

### 2.2 glass 材质

- 卡片 `--card`、控件 `--control`（`--secondary`、`--muted` 同值）、浮层 `--popover`、凹槽 `--recess`、页面底色 `--environment-base` 都取**主色色相**，用固定的 OKLCH 亮度/彩度，使各主题深度一致：`--card-l 0.26`、`--control-l 0.30`、`--popover-l 0.33`、`--recess-l 0.20`、`--base-l 0.20`；`--card-c`、`--base-c` 为彩度。
- 卡片填充 52% / 44% 不透明度、12% 描边、`blur(40px)`；极光为 **2 个**径向光晕（右上、左下）、强度 `--environment-strength: 100%`。
- `--background` 保持中性（供 `<meta name="theme-color">` 使用，不要改成 `oklch(from …)`）。

### 2.3 clean 材质

无模糊、无极光、无阴影；卡片保持中性灰；浮层靠亮度台阶与 1px 发丝线。作用域 `.dark[data-dark-style="clean"]`。

### 2.4 控件边框

- 暗色下文本控件（`Input`、`Textarea`、`InputGroup`、`NativeSelect`、`Combobox` chips）静止态是**真实 1px 边框**，颜色 `--field-edge`（= `--input`，32%）；聚焦、报错态保持各自的边框处理，不叠加。
- `--field-shadow` 是外阴影（glass）/ 按钮与开关的发丝线环（clean），**不要**用它给文本控件画边。clean 下 `--field-text-shadow: none` 去掉文本控件的环。
- 自带边框的组件（AI 助手输入框的流光环）要把 `--field-shadow` 重置为外阴影，避免出现第二条分离的线。
- 边框叠加检查：任何元素不应同时有 1px `border` 与 1px 内描边（如 `.hero-surface` 在 clean 下 `--hero-outline: none`）。

### 2.5 对比度底线

- 正文 / 前景对卡片 ≥ 7:1；次级文字对卡片、控件、浮层 ≥ 4.5:1；主色当文字对卡片 ≥ 4.5:1；主色前景对主色 ≥ 4.5:1。
- 图表系列色对卡片 ≥ 3:1；文本控件边缘对卡片 ≈ 2.8:1 以上；`--border` 对卡片 ≥ 1.5:1。
- 提高卡片亮度（`--card-l` > 0.27）会让图表色与输入框边缘跌破上述线，调之前先复核。
- 按令牌估算不等于真实渲染：glass 的文字对比度还受背后极光影响，改动后在浏览器抽样确认。

### 2.6 回退与调参

- 想让 glass 卡片回到中性：`--card-c` 设为 0（卡片、控件、页面底色同时去色）。
- 页面更亮/更暗：调 `--base-l`；极光更弱：调 `--environment-strength`。

## 3. 令牌

> 本系统以**语义令牌**为主，不存在全局通用的 50–950 色阶。唯一的 50–950 色阶是 `marismoon-light` 主题内的 `--marismoon-primary-50…950` 与 `--marismoon-neutral-50…950`，业务代码应引用语义令牌而不是色阶。

### 语义色（组件只用这些）

`--background` `--foreground` `--card` `--card-bottom` `--card-foreground` `--popover` `--popover-foreground` `--primary` `--primary-foreground` `--primary-hover` `--secondary` `--secondary-foreground` `--muted` `--muted-foreground` `--accent` `--accent-foreground` `--destructive` `--border` `--border-subtle` `--input` `--ring` `--overlay` `--control` `--layout-control` `--layout-control-border` `--recess`。

状态色：`--success` `--warning` `--danger` `--info`，及背景 `--success-bg` `--warning-bg` `--danger-bg` `--info-bg`（暗色下四种语义色全主题固定，由 `dark-base.css` 定义，与品牌无关）。

图表色：`--chart-1` … `--chart-8`（Tailwind 映射 `--color-chart-1…8`）。

### 材质与表面

`--glass-fill-top` `--glass-fill-bottom` `--glass-edge` `--glass-specular` `--surface-edge` `--surface-highlight` `--surface-shadow` `--surface-shadow-color` `--surface-filter` `--nav-filter` `--surface-inset` `--surface-inset-shadow` `--field-surface` `--field-surface-hover` `--field-shadow` `--field-edge`（暗色文本控件边框）`--field-text-shadow`（clean 下关闭文本控件的内描边）`--glow-line`（聚焦渐变边）、`--hero-start/end/edge/ink/muted/bar`。

### 间距、尺寸、圆角、字号

| 类别 | 令牌 |
| --- | --- |
| 间距 | `--space-1`…`--space-6`（0.25rem 递增至 1.5rem，步长 0.25rem 起）、`--card-inset`（1rem）、`--workspace-safe-inline-end`、`--workspace-safe-block-end` |
| 控件高度 | `--control-size-dense` 2rem（默认 32px）、`--control-size-compact` 2.25rem、`--control-size` 2.5rem（40px）、`--control-size-touch` 2.75rem（`pointer: coarse`） |
| 圆角 | `--radius` 1rem、`--radius-control` 1rem、`--radius-workspace-control` 1.125rem、`--radius-panel` 1.5rem；Tailwind 的 `rounded-lg` → `--radius-control`，`rounded-2xl` → `--radius-panel` |
| 字号 | 仅 11 / 12 / 13 / 14 / 15 / 20px；`--text-label` 0.75rem、`--text-body` 0.875rem、`--metric-label-size` 0.8125rem、`--metric-value-size` 1.5rem（字重 720、字距 -0.042em）、`--metric-note-size` 0.6875rem |
| 字体 | `Inter Variable`、`Noto Sans SC Variable`、`system-ui`；金额/数字使用 `financial-number`（`tabular-nums lining-nums`） |

控件与表格正文 13px，表头与标签 12px，字重 620 用于分段胶囊选项。

## 4. 卡片规则

- 使用 `FrostCard`（`.surface`，透明底 + 玻璃材质）或 `MetricCard`；内边距 `--card-inset`；圆角 `--radius-panel`；卡片内分组 `--radius-control`。
- 同一卡片在相同视口/断点下外部尺寸稳定；Tabs、筛选、分页、加载、数据变化不改变宽高；Hover/Focus 不引起布局跳动（明确的展开/收起除外）。
- 内容溢出、空状态、加载状态由卡片内部处理，**不**拉伸列表行填满卡片，**不**裁剪重要内容。
- 滚动内容边缘使用 `soft-edge.css` 的渐隐（容器需列入其选择器），**不**用边框/阴影/遮罩层掩盖裁剪。
- 阴影不得被 `overflow` 裁剪：预留出血（padding）并用等量负 margin 抵消。

## 5. 控件视觉

- 表单控件（`Input`、`SelectTrigger`、`InputGroup`、`NativeSelect`、`Combobox`、`InputOTP`）统一 `field-surface`；聚焦为 `--glow-line` 1px 渐变边，错误态为 destructive 描边。暗色下文本控件的静止边框是真实的 1px `--field-edge`（见 §2.4），不用阴影环模拟。
- 分段胶囊族（Tabs、ToggleGroup、Menubar）：`--recess` 胶囊、内边距 3px、选项 28px 高、12px 字、字重 620；悬停 `--sidebar-item-hover`，选中为 `--layout-control` 浮起胶囊。
- 浮层统一 `components/ui/popup.css`（玻璃底、圆角、26px 圆角行、悬停强调色）；下拉用 `SelectContent position="popper"`。
- 表格：标题栏圆头色条、透明背景，上方与首条记录上方无分割线（见 `shared/data-table.css`）。
- Badge 提供 Ant Design 预设色 `red volcano orange gold yellow lime green cyan blue geekblue purple magenta gray`：`<Badge variant="blue">` 柔和，加 `solid` 实心；状态用 `StatusBadge`。
- 图标：Solar，默认 Linear，选中/悬停切同名 Bold（`AppIcon stateful`，见 COMPONENTS.md）；`AppIcon` 默认 20px；Button/Badge 内图标写 `data-icon="inline-start|inline-end"`，尺寸随组件自动缩放。

## 6. 动效规则

| 令牌/类 | 值 / 用途 |
| --- | --- |
| `--ease-feedback` | `cubic-bezier(0.23, 1, 0.32, 1)`（所有 `transition-*` 默认曲线，默认时长 160ms） |
| `--duration-feedback` / `--duration-exit` | 150ms / 145ms |
| `routeEntry`（`motion-tokens.ts`） | 路由进入：opacity 0.65→1，210ms |
| `dialogEntry` / `overlayEntry` | 180ms（y 6→0）/ 160ms |
| 表格 | 行悬停 140ms；行进入 180ms 淡入（`--row-index` 错开，最多 8 行）；勾选行左侧 3px 指示条；`StatusBadge pulse` 低频呼吸；`DataTable loading` 扫光骨架 |
| `.shimmer-text` / `.shimmer-block` | 扫光文字/占位块 |

规则：**不使用 layout 动画与弹簧回弹**；金额与数字不做滚动/跳动动画；**`prefers-reduced-motion: reduce` 下关闭所有 CSS 动画/过渡**（`motion.css` 全局兜底，新增动效仍须自检）；JS 动效使用 `useReducedMotion`。

## 7. 图表规则

- 使用 `components/ui/chart.tsx`（`ChartContainer` + `ChartConfig`）封装 recharts 3.8.0；系列色只引用 `--chart-1…8`，不写死色值。
- 图表卡片的外部尺寸固定，图例/Tab 切换不改变卡片高度；坐标轴刻度使用 `financial-number`；每个图表提供文字替代（`figcaption`/`aria-label`）。
- 参考实现：`apps/web/src/features/overview/components/OverviewCharts.tsx` 与 `features/settings/chart-demos.tsx`、`ChartShowcase.tsx`。

## 8. 响应式

断点：≤700px 手机、701–899px iPad 竖屏（第二列默认收起）、≥900px 三列。`pointer: coarse` 下控件 ≥ 40px。验收视口：1920×1080、1440×900、1280×800、1024×768、820×1180、768×1024、430×932、390×844、375×667（`e2e/responsive-adaptation.spec.ts`，Light/Dark）。

## 9. 新增主题的步骤

1. `tokens.css` 增 `[data-palette="x"]:not(.dark)` 与 `.dark[data-palette="x"]` 两块。暗色块只写主色与前景、强调、`--chart-1…8`、`--environment-*`、hero 令牌（§2.1）；亮色块覆盖全部语义色。
2. `spectrum.css`（或 `tokens.css`）增 `--swatch-x`；`lib/storage.ts` 的 `paletteLabels` 登记。
3. `dark-base.css` 增一条 `.dark[data-palette="x"] { --dark-hue: … }`；纯浅色主题已被 `:not([data-palette="marismoon-light"])` 排除，无需处理。
4. 按 §2.5 核对：主色对卡片 ≥ 4.5:1，图表色 ≥ 3:1。
5. 在「系统设置 → 组件预览」核对 glass 与 clean 两种暗色，并回归主题相关 e2e（`e2e/theme.spec.ts`）。
