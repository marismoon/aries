---
"@marismoon/ui": minor
"@marismoon/shell": minor
---

基础组件加入与卡片一致的受光材质，并去掉偏方的圆角（亮色与毛玻璃暗色视觉有变化）：

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
