# 设计系统

共享主题样式与令牌位于 `packages/ui/src/styles/`，由 `globals.css` 汇总引入（顺序：tailwindcss → tw-animate-css → `shadcn.css`（内置自 shadcn 包，见[第三方许可声明](../THIRD_PARTY_NOTICES.md)）→ `tokens.css` → `materials.css` → `dark-base.css` → `dark-clean.css` → `components/ui/popup.css` → `motion.css` → `soft-edge.css` → `icon-states.css`）。字体（Inter、Noto Sans SC）拆为可选入口 `fonts.css`，不引入时回退到 `system-ui`。应用入口 `apps/demo/src/index.css` 先引入 `globals.css` 与 `fonts.css`，再引入 `@marismoon/shell/styles`，并用 `@source` 扫描应用代码。

| 文件 | 内容 |
| --- | --- |
| `tokens.css` | `:root` 基础令牌（亮色）、`.dark` 暗色（含玻璃的填充、描边、模糊参数）、各品牌主题 `[data-palette="…"]` 与 `--swatch-*`。默认主题 Aries Analytics（`ariesanalytics`）同时是兜底：它的亮色块选择器含 `:root:not(.dark)`，暗色值写在 `.dark`，所以未设置或设置了未知 `data-palette` 时渲染为 Aries Analytics；其他主题在其后覆盖 |
| `materials.css` | 玻璃材质：`.surface`、`.surface-inset`、`.frost-divider`、`.hero-surface`、页面环境光 |
| `dark-base.css` | 暗色共同底座（glass 与 clean 共用）+ glass 材质令牌（`--glass-*`，见 §2.2）；选择器用 `:root.dark` 以保持高于主题块的优先级 |
| `dark-clean.css` | 简洁暗色材质（`.dark[data-dark-style="clean"]`）：关闭模糊、光晕、阴影 |
| `glass-backdrop.css` | 暗色玻璃背景层的定位和显示范围 |
| `motion.css` | 缓动/时长令牌、对话框退出、`prefers-reduced-motion`、`.shimmer-text`/`.shimmer-block` |
| `soft-edge.css` | 滚动容器边缘渐隐（scroll-driven animation，不支持时降级） |
| `icon-states.css` | 图标 Linear/Bold 状态切换（见 COMPONENTS.md） |

## 1. 主题与模式

- **模式**：`next-themes`（`attribute="class"`）切换 `.dark`；`:root` 声明 `color-scheme: light`。宿主的 `index.html` 用同步内联脚本在首帧前写入 `.dark`、`data-palette` 与 `data-dark-style`，避免暗色或品牌主题刷新时先闪一下亮色；next-themes 自带的脚本只在服务端渲染时有效，客户端渲染的宿主以 `scriptProps={{ type: "application/json" }}` 让它保持惰性。
- **品牌主题**（`<html data-palette="…">`，localStorage 键 `aries-palette`）：以 `lib/storage.ts` 的 `paletteLabels` 为准，共五套：`ariesanalytics`（Aries Analytics，默认）、`mental-health`（静心雾蓝）、`northern-lights`（北极光）、`pet-adoption`（暖陶土）、`mono`（极简灰）。每套都有亮色与暗色；其中非默认四套的高亮模式采用增白清亮阶梯与明快图表色。本地存储中的值不在列表内时回落到默认主题。
- **暗色风格**（`<html data-dark-style="glass|clean">`，键 `aries-dark-style`）：`glass` 毛玻璃（默认）、`clean` 简洁。详见 §2。
- 切换控件：`BrandPaletteControl`（轮换主题）、`DarkStyleControl`（仅暗色模式显示）、`ThemeSwitcher`（明暗）。

## 2. 暗色体系

暗色由三层组成：**共同底座**（两种风格一致）→ **主题块**（只给主色与图表等）→ **材质**（glass 或 clean，两种风格的差别在此层）。

### 2.1 共同底座（`dark-base.css`）

| 项 | 规则 |
| --- | --- |
| 色相 | 每个主题声明 `--dark-hue`（0–360 的色相角，不带单位）；染色饱和度默认 `--dark-tint: 6%`。静心雾蓝用薰衣草色相 262 与 9%（薰衣草是它的第二品牌色：glass 表面经 `--surface-source` 也取这个色相）。clean 下统一把 `--dark-tint` 提到 10%，并给数据大字卡 9% 的主色，让主题在平涂表面上仍可辨认 |
| 表面亮度（HSL L；clean 取用，glass 见 §2.2） | recess 8 < 画布（`--background`）12 < 卡片 15 < 控件 19 < 浮层 23；台阶小，主要靠发丝线分层 |
| 文字 | 正文 L96、次级 L70（均带主题色相），不使用纯白 |
| 发丝线（白色 alpha） | `--border-subtle` 10%、`--border` 18%、`--layout-control-border` 22%、`--input` 34%（对画布 ≥ 3:1）、`--surface-edge` 15% |
| 语义色 | `--success #6ee7a8`、`--warning #fbd075`、`--danger #ff8fa3`、`--info #8fb8ff`；背景为该色 14% 与透明的混色。默认全主题一致；品牌色与某个状态色撞色时，该主题在 `dark-base.css` 末尾用 `:root.dark[data-palette="…"]` 覆盖该状态色（§2.5） |
| 遮罩 | `--overlay`，带色相的近黑 62%；不写 `bg-black/…` |
| 浏览器自绘部件 | 暗色下 `scrollbar-color` 为白色 24% 的滑块、透明轨道 |

主题块（`tokens.css` 的 `.dark[data-palette="…"]`）**只提供**：主色与前景、强调（可用 `--accent-source` 指定强调色的混色来源，默认取主色，glass 与 clean 共用）、`--chart-1…5`、极光 `--environment-*`、hero 令牌；表面、边框、语义色统一由本节定义（状态色的例外见 §2.5）。

### 2.2 glass 材质

- 配方来自 Raycast 开源的主题实现（[raycast/ray-so](https://github.com/raycast/ray-so)）：**中性色一律是文字色加透明度**，**表面一律是同一种窗口材质**，选中是主色 10% 的平涂，状态标签是本色文字加 15% 底。令牌在 `dark-base.css` 的 glass 块里。
- 颜色来源：`--glass-source` 取主题的 `--surface-source`，没有时取主色（静心雾蓝因此是薰衣草色）。由它派生：
  - `--glass-text`：文字色，L 0.96。
  - `--glass-tint` 与 `--glass-tint-2`：材质渐变的两端，L 0.19 → 0.25，后者彩度更高。
  - `--glass-base`：页面底色，近黑，L 0.15。

  所有彩度都乘以 `--tone-k`，极简灰把它设为 0，整套变成中性灰。
- 中性色：正文 `--glass-text`；次级文字 80%（Raycast 是 60%，提高是为了光经过时仍达标）、`--secondary-foreground` 80%；`--border` 与 `--glass-edge` 20%；`--border-subtle` 10%；`--input` 40%；`--control`（及 `--secondary`、`--muted`）10%；`--recess` 5%。
- 窗口材质：沿用 86% 主题色调 + 14% 中性灰的单层玻璃渐变，配合 1px 顶部微光棱线（`--glass-specular`）：
  - **卡片**：74% 不透明，`--surface-filter: blur(72px)`。内容视口始终开启滚动边缘遮罩，卡片半透明透出背后的 WebGL 光环（不被 72px 模糊糊黑），配合 80% 次级文字保证光经过卡片背后时对比度仍 ≥ 4.5:1。
  - **桌面第二列**：使用卡片的主题色渐变，顶部填充不透明度 46%，下部 38%，背景模糊 1.5px、亮度 50%，让光环、粒子和光迹的轮廓透过面板。开启减少透明度时使用不透明的 `--popover` 底色，并关闭背景模糊。
  - **主推卡与选中态**：`.hero-surface` 叠加 10% 顶部主色径向微光拉开焦点层级；导航与分段选中态采用 M3 色调胶囊（主色 16% 填充 + 22% 内描边）。
  - **浮层、模态与内嵌卡片**：下拉菜单/Popover/Select 在暗色玻璃下为 82% 磨砂（`--popover-fill` / `--popover-filter`），搜索弹框（Dialog）/AlertDialog/Drawer/Sheet 为 84% 高厚磨砂（`--modal-fill` / `--modal-filter`），`Alert` 与非 `.surface` 基础 `Card` 为 78% `--card` 透明玻璃；开启减少透明度时统一回退为不透明 `--popover`。
- 暗色玻璃背景固定在页面后方。背景随品牌读取 `--primary`、`--chart-2` 和 `--chart-3`。默认背景是 `AriesMagicRings`，宿主可通过 `AppShell` 的 `glassBackdrop` 替换背景，传入 `null` 时只显示底色。
- glass 下唯一保持中性的表面令牌是 `--background`：它供 `<meta name="theme-color">` 使用，不要改成 `oklch(from …)`。

### 2.3 clean 材质

无模糊、无极光、无阴影；第二列右侧是一条 1px 分割线（`--nav-divider-*`，由外壳的 `::after` 绘制），上下各缩进 `--radius-panel`，与 glass 下第二列卡片右边的直线段等长；卡片取 §2.1 的 `--card`（HSL L15、饱和度 6%，近中性，不随主色染色）；浮层靠亮度台阶与 1px 发丝线。作用域 `.dark[data-dark-style="clean"]`。

### 2.4 控件边框

- 暗色下文本控件（`Input`、`Textarea`、`InputGroup`、`NativeSelect`、`Combobox` chips）静止态是**真实 1px 边框**，颜色 `--field-edge`（= `--input`，34%）；聚焦、报错态保持各自的边框处理，不叠加。
- `--field-shadow` 是外阴影（glass）/ 按钮与开关的发丝线环（clean），**不要**用它给文本控件画边。文本控件读取 `--field-text-shadow`：clean 下为 `none`，glass 下未定义，回退为 `--field-shadow`（外阴影）。
- 自带边框的组件（AI 助手输入框的流光环）要把 `--field-shadow` 重置为外阴影，避免出现第二条分离的线。
- 边框叠加检查：任何元素不应同时有 1px `border` 与 1px 内描边（如 `.hero-surface` 在 clean 下 `--hero-outline: none`）。

### 2.5 对比度与色相底线（亮色与暗色都适用）

本节约束**每套主题的亮色与暗色**（glass、clean）。新增或调整主题后按本节逐项复核，`e2e/theme.spec.ts` 自动校验色相间隔。

- 正文 / 前景对卡片 ≥ 7:1；次级文字（`--muted-foreground`）对卡片、控件、浮层与状态色浅底 ≥ 4.5:1；主色当文字对画布与卡片 ≥ 4.5:1；主色前景对主色 ≥ 4.5:1（亮色主色因此偏深，浅而亮的品牌色只用于图表、极光、Logo 与数据大字）。
- 强调文字对强调底 ≥ 4.5:1；状态色文字对其浅底 ≥ 4.5:1；聚焦环对画布 ≥ 3:1。
- 图表系列色 `--chart-1…5` 对卡片 ≥ 3:1，且是一组**分类色**：五个系列之间要能分辨（OKLCH 色差 ΔE ≥ 0.08），靠色相与明度错开，不能只调明度挤在同一档。亮色卡片上满足 3:1 的明度窗口约为 OKLCH L 0.35–0.62。
- 文本控件边缘对画布 ≥ 3:1；`--border` 对卡片 ≥ 1.5:1。
- **色相间隔**（OKLCH 色相角）：主色与危险色、警告色 ≥ 30°，与成功色、信息色 ≥ 25°；图表系列与危险色、警告色 ≥ 25°。不满足时**移动状态色而不是品牌色**：亮色在主题块内覆盖 `--danger`/`--warning`/`--success`/`--info` 及对应 `-bg`，暗色在 `dark-base.css` 末尾覆盖（`-bg` 由 color-mix 自动跟随）。现有覆盖：Aries Analytics 的信息色（紫）、静心雾蓝的亮色信息色（天蓝）、北极光的成功色（青）、暖陶土的危险色（玫红）与警告色（暖金）。没有色相的颜色（极简灰的主色与图表灰阶）不参与色相间隔检查；极简灰的暗色 glass 把 `--tone-k` 设为 0，光晕与表面都是中性灰。
- glass 卡片的不透明度（`--glass-fill-top/bottom`）低于 74%、次级文字低于 80%，或调亮背后的光时，光经过卡片背后会让次级文字跌破 4.5:1，调之前先复核。
- glass 的文字对比度还受背后的光影响，光会移动，令牌估算之外 **SHOULD** 在浏览器里把动画冻结在一整圈的多个位置抽样确认。

### 2.6 调参

- glass 整体中性：`--tone-k` 设为 0（表面、文字与背后的光都变成中性灰，极简灰即如此）。
- glass 卡片厚度：`--glass-fill-top/bottom`（受 §2.5 限制）；背后的光：替换或关闭见 §2.2「换背景」。

## 3. 令牌

> 令牌以**语义令牌**为主，没有全局 50–950 色阶。业务代码引用语义令牌，不引用色阶。

### 语义色（组件只用这些）

`--background` `--foreground` `--card` `--card-bottom`（卡片渐变下端；clean 与 `--card` 相同）`--card-foreground` `--popover` `--popover-foreground` `--primary` `--primary-foreground` `--primary-hover` `--secondary` `--secondary-foreground` `--muted` `--muted-foreground` `--label-foreground`（小号标签：目录二级项、抽屉字段名等「命名一个值」的文字，次级色中混入少量前景色：亮色 25%、暗色 15%，比次级说明深一档，笔画对比约为次级色的 1.5 倍）`--option-hover` `--option-selected` `--option-selected-hover` `--option-foreground`（浮层列表行——Select、菜单、Combobox、命令面板结果——的悬停、选中、选中并悬停底色与文字色。亮色取主色 8% / 14% / 18% 混入 `--popover`，对浮层底约 1.10 / 1.20 / 1.27:1；文字为强调字 70% 与正文色混合，在最深一档上仍 ≥ 4.5:1。暗色取主色 6% / 11% / 14% 混入 `--popover`，深浅与亮色一致；不要混 `--accent`，暗色强调色的明度与浮层相同，混不出层次）`--item-hover` `--item-selected`（卡片等表面上的胶囊项——页签、ToggleGroup、菜单栏与导航菜单的触发器和链接、分页——的悬停与选中底色：主色 9% / 15% 的透明混合，对卡片约 1.11 / 1.20:1。暗色为主色 7% / 13% 的透明混合。组件类名里的回退值（如 `bg-[var(--item-selected,var(--layout-control))]`）只在令牌缺失时生效。两种模式下 `--sidebar-item-hover` 都等于 `--item-hover`）`--accent` `--accent-foreground` `--destructive` `--border` `--border-subtle` `--input` `--ring` `--overlay` `--control` `--layout-control` `--layout-control-border` `--recess`。

状态色：`--success` `--warning` `--danger` `--info`，及背景 `--success-bg` `--warning-bg` `--danger-bg` `--info-bg`。亮色与暗色各有一组共享默认值（信息色为蓝），与品牌撞色的主题按 §2.5 覆盖对应状态色。

图表色：`--chart-1` … `--chart-5`（Tailwind 映射 `--color-chart-1…5`）。

shadcn `Sidebar` 组件的 `--sidebar*` 颜色令牌是语义令牌的别名（`--sidebar` → `--card`、`--sidebar-accent` → `--accent`、`--sidebar-border` → `--border` 等），随主题变化，不单独维护。

### 材质与表面

`--glass-fill-top` `--glass-fill-bottom` `--glass-edge` `--glass-specular` `--surface-edge` `--surface-highlight` `--surface-shadow` `--surface-shadow-color` `--surface-filter` `--nav-filter` `--surface-inset` `--surface-inset-shadow` `--sidebar-item-hover` `--environment-top/side/bottom/base`（极光与页面底色）`--field-surface` `--field-surface-hover` `--field-shadow` `--field-edge`（暗色文本控件边框）`--field-text-shadow`（clean 下关闭文本控件的内描边）`--glow-line`（AI 助手流光环）`--field-glow-line`（输入框聚焦渐变边，首尾同色）、`--hero-start/end/edge/ink/muted/bar`。

控件材质（§5）：`--control-sheen`（叠在底色上的受光渐变）`--control-rim`（等宽内描边高光，仅主按钮）`--primary-shadow`（内描边 + 主色投影，仅主按钮）`--card-shadow`（基础 `Card` 的投影，等于 `--surface-shadow`）。

### 间距、尺寸、圆角、字号

| 类别 | 令牌 |
| --- | --- |
| 间距 | `--space-1`…`--space-6`（0.25rem 至 1.5rem，每级 +0.25rem）、`--card-inset`（1rem）、`--workspace-safe-inline-end`、`--workspace-safe-block-end` |
| 控件高度 | `--control-size-small` 1.75rem（28px，Button `small`）、`--control-size-dense` 2rem（32px，默认）、`--control-size-compact` 2.25rem（36px，Button `sm`）、`--control-size` 2.5rem（40px，Button `default`）、`--control-size-touch` 2.75rem（Button `lg`）；`pointer: coarse` 下 dense、compact 放大到 2.5rem，`--control-size` 放大到 2.75rem |
| 圆角 | `--radius` 1rem、`--radius-control` 1rem、`--radius-workspace-control` 1.125rem、`--radius-panel` 1.5rem；Tailwind 的 `rounded-lg` → `--radius-control`，`rounded-2xl` → `--radius-panel` |
| 字号 | 阶梯 11 / 12 / 13 / 14 / 15 / 20px；指标数值 `--metric-value-size`（24px）是唯一例外；`--text-label` 0.75rem、`--text-body` 0.875rem、`--metric-label-size` 0.8125rem、`--metric-value-size` 1.5rem（字重 720、字距 -0.042em）、`--metric-note-size` 0.6875rem |
| 字体 | `Inter Variable`、`Noto Sans SC Variable`、`system-ui`；金额/数字使用 `financial-number`（`tabular-nums lining-nums`）。**不设置** `-webkit-font-smoothing: antialiased`：macOS 的灰度平滑会让 12–13px 的中文笔画变细发虚，保留平台默认平滑。小号中文标签不要同时用 400 字重与次级灰，改用 `--label-foreground` |

控件与表格正文 13px，表头与标签 12px，字重 620 用于分段胶囊选项。

## 4. 卡片规则

- 使用 `FrostCard`（`.surface`，透明底 + 玻璃材质）或 `MetricCard`；内边距 `--card-inset`；圆角 `--radius-panel`；卡片内分组 `--radius-control`。
- 尺寸稳定性见 AGENTS.md §4.4；Hover/Focus 不引起布局跳动（明确的展开/收起除外）。
- 内容溢出、空状态、加载状态由卡片内部处理，**不**拉伸列表行填满卡片，**不**裁剪重要内容。
- 滚动内容边缘使用 `soft-edge.css` 的渐隐（容器需列入其选择器），**不**用边框/阴影/遮罩层掩盖裁剪。
- 第三列内容区的顶部/底部虚化在 `packages/shell/src/styles/layout.css` 的 `.page-content-viewport`：内容自身淡出，而不是在上面盖一条带。
  - 遮罩一直开着：滚动后顶部、下方还有内容时底部，各在 `--workspace-scroll-edge`（28px）内从不透明渐变到透明（`--scroll-edge-start/end` 由 `data-scrolled`、`data-has-more-below` 切换）。没有覆盖物，所以裁切处不会出现分割线，亮色、简洁暗色、暗色玻璃表现一致。**不要**改回在边缘铺一条页面背景或半透明模糊带：前者在暗色玻璃下无从匹配会动的光，后者会在裁切处留下一条线。
  - 代价：遮罩让内容视口成为背景模糊（`backdrop-filter`）的边界，里面的玻璃卡片只模糊视口内的东西，不再模糊页面背后的光（§2.2 因此把暗色 glass 卡片加厚到 74%）。
  - 内容视口顶部留 `--workspace-bleed-block-start`（8px）余量，内容框同时上移同样距离，第一排卡片位置不变，悬停上浮与阴影不被裁切（左右下三边原本就有 `--workspace-bleed-inline/block`）。
- 阴影出血规则见 AGENTS.md §3 规则 9。

## 5. 控件视觉

- 表单控件（`Input`、`SelectTrigger`、`InputGroup`、`NativeSelect`、`Combobox`、`InputOTP`）统一 `field-surface`；聚焦为 `--field-glow-line` 1px 渐变边（横向渐变，首尾都是主色，所以左右两条边和四角同色；`--glow-line` 以浅蓝收尾，只用于 AI 助手输入框的流光环），错误态为 destructive 描边；暗色静止边框见 §2.4。放进 `InputGroup` 的 `Input` 与 `Textarea` 都以 `embedded` 渲染：底色、阴影和聚焦边只由外层的组画一次，内层控件透明、无圆角。
- 控件材质：有底色的控件带一点受光，但刻意压得很轻：按钮是一屏里反复出现的小控件，受光要比它所在的卡片弱。底色仍只来自语义令牌，再叠 `--control-sheen`（`bg-(image:--control-sheen)`）：顶部白 7%（暗色 4%），到高度 24% 处消失，下方不加暗化（会让浅色底发灰），文字（小到 20px 键帽里的字）落在令牌原色上，对比度与不叠时相同；改动停靠点前先按 §2.5 复核。内描边 `--control-rim` 与主色投影 `--primary-shadow`（扩散层主色 16%，略低于卡片自身的 18%）只给主按钮；次按钮沿用 `--field-shadow`，危险按钮与 `Kbd` 只叠渐变。`Badge`、`Avatar`、`Progress`、`Empty` 不叠控件材质，保持纯色。基础 `Card` 用 `--card-shadow` 加 `--glass-edge` 描边，`Alert` 用 `--surface-inset-shadow`，都不再画灰色边框。clean 暗色下渐变与高光关闭，按钮回到 `--field-shadow` 发丝线环，`Card`、`Alert` 各保留一条发丝线。
- 单行控件是全圆胶囊，任何高度两端都是半圆：`Button`、`SelectTrigger` 用 `rounded-full`；`Input` 与包着内嵌输入框的容器（命令面板搜索框、账单搜索框）由 `text-field.css` 的 `.field-surface:is(input, button, :has(> input))` 统一处理。`--radius-workspace-control`（18px）只够 36px 以下的控件闭合成胶囊，40px 以上的控件（以及粗指针下放大后的全部控件）会露出直边，所以它只留给多行控件：`Textarea` 和包着文本框的容器（AI 助手输入框）。`ButtonGroup` 横向的末端同为全圆、相接的一侧拉直（输入框也一样：`text-field.css` 的圆角放在 `components` 层，低于工具类，容器才能把接缝拉直），纵向两端用 `--radius-workspace-control`；组内的文字段 `ButtonGroupText` 同为全圆。第二列导航项与选中/悬停底板（`--sidebar-item-radius`）、导航计数角标也是全圆。
- 分段胶囊族（Tabs、ToggleGroup、Menubar）：`--recess` 胶囊、内边距 3px、选项 28px 高、12px 字、字重 620；悬停 `--sidebar-item-hover`，选中为 `--layout-control` 浮起胶囊。
- 浮层统一 `components/ui/popup.css`（玻璃底、圆角、最小 26px 高的全圆胶囊行、悬停强调色）；下拉用 `SelectContent position="popper"`。选项行（Select、DropdownMenu、ContextMenu、Menubar、Combobox、Command 的项与子菜单触发器）的圆角只在 `popup.css` 一处定义，任何行高都是全圆；命令面板结果行（`.command-result`）同此规则。相邻两行之间留 2px，悬停底与选中底不相接：间距加在「跟在另一行后面的那一行」的上边距上，不要给每行上下各写 1px（块级行之间外边距会折叠成 1px）。`NavigationMenu` 弹层里的链接按同一规格（13px 字、6px/8px 内边距、单行 31px 高），它的列表常用 `<li>` 包裹或网格，所以 2px 间距用透明的 1px 上下边加 `background-clip: padding-box` 实现；多行的链接卡片保持 20px 圆角，不做全圆。表格行、Accordion 展开项、日历范围的中间格是通栏色带，不做圆角。
- 日历（`Calendar`）：日期格的底色一律是比格子小 4px 的正圆（格子留 2px 内边距），选中、今天、悬停、聚焦同一个尺寸，相邻两天的圆之间留 4px，聚焦环不压到邻格；行首行尾不再单独改圆角。范围选择是与圆等高的强调色带，由日期格的 `::before` 绘制：两端只画靠内的半格，在一周的行首行尾收成半圆。今天的标记用 `::after`，不与色带抢 `::before`。
- 选项行的尾部元素（Select、DropdownMenu、ContextMenu、Menubar、Combobox、Command 共用）：
  1. 静态尾部元素（数量角标、快捷键、子菜单箭头）只在存在时与标签隔 8px（`--space-2`），不存在时不留。用 flex 间距或「后面跟着尾部元素」的兄弟选择器实现，不给标签写固定外边距。
  2. 可切换的勾选标记（多选、单选、Combobox 选中）无论是否勾选都预留「16px 图标 + 8px」的位置，勾选时文字不位移：标记在右时行右侧预留 32px（8px 边距 + 图标 + 8px），在左时文字从 30px 起（6px 边距 + 图标 + 8px），同一菜单里的缩进行（`inset`）与之对齐。
  3. 尾部元素自身不再额外留边距，离行尾的距离只由行内边距决定，与左侧对称。
  4. 弹层宽度与触发器一致；空间不够时从行内结构找，不改弹层宽度。
- 抽屉（`Drawer`）的头部只放标题与说明，右上角不放关闭图标；关闭统一用页脚的「关闭」按钮（`DrawerClose` + `variant="outline"`），打开时焦点落在它上面，Esc 与点遮罩同样可以关闭。
- 浮层的层叠：`.surface` 带 `backdrop-filter`，自身是一个层叠上下文，在它内部原地渲染的浮层无论 `z-index` 多大都会被后面的 `.surface` 盖住，所以浮层一律渲染到 Portal。唯一的例外是 `NavigationMenu`（Radix 把它的 viewport 与 content 渲染在原地）：`materials.css` 在菜单挂载期间把宿主 `.surface` 抬到 `z-index: 1`（base 层、零优先级，不覆盖宿主自己的定位）。新增原地渲染的浮层时按同样方式处理，并在 `e2e/floating-layers.spec.ts` 补遮挡断言。
- 表格：标题栏圆头色条、透明背景，上方与首条记录上方无分割线（见 `shared/data-table.css`）。
- Badge 提供 Ant Design 预设色 `red volcano orange gold yellow lime green cyan blue geekblue purple magenta gray`（色值为 `tokens.css` 的 `--tone-*`，与品牌无关）：`<Badge variant="blue">` 柔和，加 `solid` 实心；状态用 `StatusBadge`。暗色下文字对比度 ≥ 4.5:1 由 `--tone-*-mix`（柔和标签里的色占比）与 `--tone-*-ink`（实心标签的字色）保证，仅 `dark:` 类读取，亮色不受影响。
- 图标：Solar，默认 Linear，选中/悬停/按下切同名 Bold（`AppIcon stateful`，见 COMPONENTS.md）；`AppIcon` 默认 20px；Button/Badge 内图标写 `data-icon="inline-start|inline-end"`，尺寸随组件自动缩放。

## 6. 动效规则

| 令牌/类 | 值 / 用途 |
| --- | --- |
| `--ease-feedback` | `cubic-bezier(0.23, 1, 0.32, 1)`（所有 `transition-*` 默认曲线；Tailwind `transition-*` 默认时长 160ms，来自 `globals.css` 的 `@theme`） |
| `--duration-feedback` / `--duration-exit` | 150ms（自定义 CSS 反馈过渡）/ 145ms（对话框退出） |
| `routeEntry`（`motion-tokens.ts`） | 路由进入：opacity 0.65→1，210ms |
| `dialogEntry` / `overlayEntry` | 200ms（y 8→0、scale 0.98→1）/ 160ms；面板退出 `aries-dialog-content-exit`（opacity→0、scale→0.98，145ms） |
| `contentEntry` | 状态变化后出现的块（加载完成、新条目、「已保存」）：opacity 0→1、y 4→0，220ms；配合 `AnimatePresence` 时退出 120ms 淡出 |
| 亮/暗切换 | `ThemeSwitcher` 经 `motion/theme-transition.ts` 用 View Transitions 从按钮中心圆形揭示新主题（460ms，`--ease-feedback`）；不支持该 API 或减弱动效时直接切换 |
| `.chart-in-draw` / `-grow-y` / `-grow-x` / `-pop` / `-fade` / `-sweep` | 纯 SVG 图表的一次性入场（描线、柱从基线生长、点弹出、淡入、弧沿描边扫开），`--chart-index` 错开 50ms（最多 10）；`-draw` 需 `pathLength="1"`，`-sweep` 用 `--chart-dash-from` 指定零长度 dasharray |
| 表格 | 行悬停 140ms；行进入 180ms 淡入（`--row-index` 错开，最多 8 行）；勾选行左侧 3px 指示条；`StatusBadge pulse` 低频呼吸；`DataTable loading` 扫光骨架 |
| `.shimmer-text` / `.shimmer-block` | 扫光文字/占位块 |
| `Skeleton` | 所有占位块自带扫光（`::after` 平移，1.6s）；减弱动效时静止 |
| `Progress` | 数值变化 480ms 滑动；无数值（indeterminate）时 40% 宽的段落往返，减弱动效时显示 45% 透明度的整条 |
| Tabs | 切换滑块 220ms（见 COMPONENTS §2）；面板进入 200ms 淡入、y 4→0 |
| `CopyButton` | 图标与文案交叉淡入（160ms，opacity / scale 0.6→1 / blur），确认态保持约 1.8s |
| AlertDialog / Sheet | 与 Dialog 同一曲线：AlertDialog 入场 200ms（fade、zoom 0.98、y 8px），退出 145ms；Sheet 入场 240ms、退出 180ms |
| 命令面板 | 结果行入场 180ms、错开 20ms（最多 6 档），空结果淡入；以键盘快捷键瞬时打开时不播放 |
| 列表移除 | 处理完的条目淡出并收起高度（220ms，`AnimatePresence` + `exit`，非 layout 动画），参照 `AttentionList` |

减弱动效（`prefers-reduced-motion`）与 `.animate-spin` 例外、禁用 layout 动画/弹簧/数字动画等规则见 AGENTS.md §6。

## 7. 图表规则

- 使用 `components/ui/chart.tsx`（`ChartContainer` + `ChartConfig`）封装 recharts 3.8.0；系列色只引用 `--chart-1…5`，不写死色值。
- 图表卡片的外部尺寸固定，图例/Tab 切换不改变卡片高度；坐标轴刻度使用 `financial-number`；每个图表提供文字替代（`figcaption`/`aria-label`）。
- 纯 SVG 图表的入场用 §6 的 `.chart-in-*` 工具类；悬停时其余系列降到 0.35 透明度（只变透明度，不移动），见 `overview-charts.css` 的 `data-chart-mark`。
- 参考实现：`apps/demo/src/features/overview/components/OverviewCharts.tsx` 与 `features/settings/chart-demos.tsx`、`ChartShowcase.tsx`。

## 8. 响应式

断点：≤700px 手机、701–899px iPad 竖屏（第二列默认收起）、≥900px 三列。触控目标规则见 AGENTS.md §6.3。验收视口：1920×1080、1440×900、1280×800、1024×768、820×1180、768×1024、430×932、390×844、375×667（`e2e/responsive-adaptation.spec.ts`，Light/Dark）。

## 9. 新增主题的步骤

1. `tokens.css` 增 `[data-palette="x"]:not(.dark)` 与 `.dark[data-palette="x"]` 两块（可复制现有主题再改）。暗色块只写主色与前景、强调、`--chart-1…5`、`--environment-*`、hero 令牌（§2.1）；亮色块覆盖 §3「语义色」「状态色」「图表色」中的全部令牌。
2. `tokens.css` 增 `--swatch-x`；`lib/storage.ts` 的 `paletteLabels` 登记。
3. `dark-base.css` 增一条 `.dark[data-palette="x"] { --dark-hue: <0–360> }`。
4. 按 §2.5 核对亮色与暗色：主色、次级文字、强调文字、状态色的对比度，图表分类色的对比度与相互区分，以及主色、图表与状态色的色相间隔；撞色时覆盖状态色。色块 `--swatch-x` 取亮色实际主色。
5. 在「系统设置 → 组件预览」核对 glass 与 clean 两种暗色，并回归主题相关 e2e（`e2e/theme.spec.ts`）。
