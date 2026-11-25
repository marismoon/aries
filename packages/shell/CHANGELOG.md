# @marismoon/shell

## 0.1.0-next.4

### Minor Changes

- 5ed8b25: 基础组件加入与卡片一致的受光材质，并去掉偏方的圆角（亮色与毛玻璃暗色视觉有变化）：

  - 单行控件改为全圆胶囊：`Button`（40px、44px 与 `icon-lg` 不再露出直边，图标按钮为正圆）、`SelectTrigger`、`Input`，以及包着内嵌输入框的 `.field-surface` 容器；`ButtonGroup` 横向末端同为全圆。`Textarea` 和包着文本框的容器保持 `--radius-workspace-control`。在自定义的多行容器上使用 `.field-surface` 且直接子元素是 `<input>` 时会变成全圆，需要自行指定圆角。
  - 浮层里的选项行改为全圆胶囊：Select、DropdownMenu、ContextMenu、Menubar、Combobox、Command 的项与子菜单触发器（原为 10–12px 圆角），圆角只在 `popup.css` 定义；命令面板结果行同步为全圆。
  - 浮层选项行之间改为真正的 2px 间距（原来上下各 1px 的外边距会折叠成 1px，相邻的悬停底与选中底几乎相接）；`NavigationMenu` 弹层里的链接对齐到同一行规格：13px 字、单行 31px 高（原 36px）、行间 2px（原 0px）。
  - `Calendar` 的日期底色统一为比格子小 4px 的正圆：修复行首行尾的选中日期右侧（或左侧）变成直角、相邻选中日期与聚焦环相互压住的问题；范围色带改为与圆等高，今天的标记同尺寸。日期按钮由 36px 变为 32px，格子与日历整体尺寸不变。
  - 修复 `InputGroupTextarea` 聚焦时出现两层边框：它没有以 `embedded` 渲染，在输入组内部又画了一遍底色、阴影和聚焦渐变边。
  - 输入框聚焦边改用新令牌 `--field-glow-line`：渐变首尾都是主色，修复聚焦时左边深蓝、右边浅蓝、四角两种颜色拼接的问题。
  - 选项行尾部元素间距统一：Select 选项后面没有数量角标时不再保留 8px 间距（修复窄的分页数量下拉把 20、50 截成省略号，弹层宽度仍与触发器一致），数量角标去掉右侧多余的 8px；Menubar 多选/单选标记与文字的间距由 6px 改为 8px，缩进行同步对齐。
  - 导航栏收起按钮悬停放大时图标与背景圆同心（原来背景圆右移、图标不动）。
  - 按钮组里的输入框与按钮相接的一侧拉直（输入框圆角改放 `components` 层，工具类可以覆盖），聚焦边在接缝处不再断开；`ButtonGroupText` 改为全圆。
  - 第二列导航项、选中与悬停底板（`--sidebar-item-radius`）和导航计数角标改为全圆。
  - 抽屉头部不再放关闭图标，统一用页脚的「关闭」按钮。
  - 简洁暗色下第二列右侧的分割线上下各缩进 `--radius-panel`，与毛玻璃暗色下卡片右边的直线段等长（原为通高的右边框）；新增外壳令牌 `--nav-divider-display`、`--nav-divider-inset`。
  - 修复 `NavigationMenu` 弹层被后面的卡片遮挡：它不走 Portal，被困在宿主 `.surface` 的层叠上下文里；现在菜单打开期间宿主 `.surface` 会抬到 `z-index: 1`。
  - `Button` 的 `default`、`secondary`、`destructive` 与 `Kbd` 叠加一层很轻的受光渐变（顶部白 7%）；内描边高光与主色投影只给主按钮，强度略低于卡片投影。简洁暗色下保持平涂加发丝线。
  - 基础 `Card` 改用卡片投影与 `--glass-edge` 描边，`Alert` 改为浮起面板，不再画灰色边框。
  - 新增令牌 `--control-sheen`、`--control-rim`、`--primary-shadow`、`--card-shadow`；渐变在文字所在的中段完全透明，文字对比度不变。简洁暗色下 `--surface-inset-shadow` 由 `none` 改为一条发丝线。

- 5ed8b25: 暗色 glass 材质按 Raycast 的主题配方重做（clean 暗色与亮色未变）：中性色一律是文字色加透明度，侧栏与卡片共享主题色渐变和 1px 边框。桌面第二列采用 46% → 38% 填充、1.5px 模糊和 50% 背景亮度，透出动态背景；卡片使用 72px 模糊，选中为主色 10% 平涂，状态标签为本色加 15% 底。卡片比 Raycast 厚（74% 不透明，Raycast 约 52%；内容区的滚动边缘遮罩让卡片不再模糊背后的光，光透得更集中），次级文字为文字色 80%（Raycast 60%），使光经过时次级文字仍 ≥ 4.5:1。`AppShell` 新增 `glassBackdrop` 属性，可替换背景或传 `null` 关闭。新增令牌 `--glass-source/text/tint/tint-2/base`；`--tone-k` 为 0 时整套变为中性灰（极简灰）。暗色 glass 下 `--page-background` 为透明。

  新增三款 随品牌配色的 WebGL 2 背景组件 AriesMagicRings、AriesAntigravity 和 AriesLightfall。

### Patch Changes

- 5ed8b25: 动效补齐：亮/暗切换在支持 View Transitions 的浏览器中从切换按钮中心以圆形揭示新主题（460ms，减弱动效或不支持时直接切换）；对话框入场改为 y 8→0 加 scale 0.98→1（200ms），退出同步加入轻微缩小；新增 `contentEntry` 动效令牌，用于加载完成、新条目与确认提示的出现；`motion.css` 新增纯 SVG 图表入场工具类 `.chart-in-draw/-grow-y/-grow-x/-pop/-fade/-sweep`，以 `--chart-index` 错开。

  新增共享组件 `CopyButton`（复制后图标与文案交叉淡入确认，宽度不变），`UiLabels` 新增 `copy`、`copied`。`Tabs` 默认变体切换时选中底板从旧 Tab 滑到新 Tab，面板进入淡入；`Skeleton` 自带扫光；`Progress` 数值变化平滑、无数值时显示往返段落；AlertDialog 与 Sheet 的入场退出曲线与 Dialog 对齐。外壳命令面板的结果行错开入场，空结果淡入。

- 38ee315: 亮色下浮层列表选项（Select、下拉菜单、右键菜单、Menubar、Combobox、Command）的悬停与选中底色加深：原先对浮层底只有 1.03–1.05:1，几乎看不出；现在悬停约 1.10:1、选中约 1.20:1、选中并悬停约 1.27:1，选项文字在各档上 ≥ 4.9:1。新增令牌 `--option-hover`、`--option-selected`、`--option-selected-hover`、`--option-foreground`，五套主题随主色取值；外壳命令面板的结果行改用同一组令牌。暗色沿用原有取值（Select 悬停由强调色 35% 统一为 45%）。
- 6826a12: 字体清晰度：去掉全局 `-webkit-font-smoothing: antialiased`（macOS 上小号中文笔画发虚），新增 `--label-foreground`（小号标签色），外壳第二列目录的二级项改用它。清除已移除默认主题的紫色残留：远程医疗蓝成为真正的兜底（未设置或未知 `data-palette` 时生效），亮色共享信息色改为蓝色（远程医疗蓝保留紫色信息色），亮色浮层阴影与暗色 Logo 底色改为随主题取色。补上 shadcn `Sidebar` 组件的 `--sidebar*` 颜色令牌与 Tailwind 映射（此前未定义，组件没有颜色）；移除从未定义的 `--color-chart-6…8` 映射。
- 5ed8b25: 内容区滚动边缘改为内容自身淡出：`.page-content-viewport` 上的遮罩在滚动后的顶部、下方还有内容时的底部，各 28px（`--workspace-scroll-edge`）内渐变到透明。此前是在边缘铺一条页面背景：暗色玻璃下页面背景透明，边缘被硬切；现在没有覆盖物，裁切处不再有分割线，亮色、简洁暗色、暗色玻璃一致。遮罩让内容视口成为背景模糊的边界，其中的玻璃卡片不再模糊页面背后的光。内容视口顶部新增 8px 余量（`--workspace-bleed-block-start`），内容框同步上移，第一排卡片悬停上浮时上沿与阴影不再被裁切，位置不变。移除不再使用的 `--workspace-fade-feather`。
- Updated dependencies [5ed8b25]
- Updated dependencies [5ed8b25]
- Updated dependencies [b94de31]
- Updated dependencies [647b397]
- Updated dependencies [5ed8b25]
- Updated dependencies [38ee315]
- Updated dependencies [911aa28]
- Updated dependencies [5e7b3a3]
- Updated dependencies [6826a12]
- Updated dependencies [5ed8b25]
- Updated dependencies [5ed8b25]
- Updated dependencies [5ed8b25]
  - @marismoon/ui@0.1.0-next.4

## 0.1.0-next.3

### Patch Changes

- @marismoon/ui@0.1.0-next.3

## 0.1.0-next.2

### Minor Changes

- 6c43ee0: 外壳接管两项原本由宿主各自实现的接线：新增 `useDocumentTitle(title)`；`AppShell` 在提供右栏时默认支持 ⌘⇧K / Ctrl+Shift+K 切换（`rightPanelShortcut` 可关闭），并向 `renderRightPanelTrigger` 提供 `keyShortcuts`。新增导出 `rightPanelKeyShortcuts`。
- 05b2914: 第二列导航的选中与悬停高亮改由外壳默认提供，宿主无需再实现 `NavHighlightContext`（仍可用它替换）。动画组件由 UI 新增导出 `@marismoon/ui/motion/NavPills`（含 `navPillSpring`）；弹簧改为临界阻尼，并遵循减少动效偏好。宿主需在 `LazyMotion` 内渲染外壳（与 `MotionSurface` 相同）。

### Patch Changes

- e367a29: 右栏入口（`.rail-ai`）移除彩色流光圆环，改用与其他侧栏控件相同的底板与悬停反馈；`--ai-*` 令牌仍由 `@marismoon/ui` 提供。
- bef721a: 桌面端侧栏图标在视口左边缘与第二列之间水平居中（左右各 13px），原先左侧 16px、右侧 10px。列宽与其他列位置不变。
- 26b61f2: 修复外壳的几处问题：侧栏 dock 动效改为临界阻尼弹簧，不再回弹；命令面板的快捷键提示在挂载后再判断平台，避免服务端渲染时 hydration 不一致；回车会跳到第一条带路径的结果，跳转失败也会关闭面板；记忆的滚动位置最多保留 50 条。
- Updated dependencies [05b2914]
  - @marismoon/ui@0.1.0-next.2

## 0.1.0-next.1

### Patch Changes

- 首个通过 Release 工作流（npm Trusted Publishing，附带 provenance）发布的版本，包内容与 0.1.0-next.0 相同。
- Updated dependencies
  - @marismoon/ui@0.1.0-next.1

## 0.1.0-next.0

### Minor Changes

- 51fe2fb: 首个预览版：ui 与 shell 以构建产物（ESM 与类型声明）发布，支持 Vite 与 Next.js 宿主。

### Patch Changes

- Updated dependencies [51fe2fb]
  - @marismoon/ui@0.1.0-next.0
