---
"@marismoon/ui": minor
---

亮色下胶囊项的悬停与选中底色加深：`Tabs` 与 `ToggleGroup` 的选中项、`Menubar` 与 `NavigationMenu` 的触发器（悬停与展开）和链接、`Pagination` 的悬停与当前页。原先是白色或极淡的底，对卡片只有 1.02–1.06:1；现在悬停约 1.11:1、选中约 1.20:1。新增仅亮色定义的令牌 `--item-hover`、`--item-selected`（主色 9% / 15% 的透明混合），亮色下 `--sidebar-item-hover` 取 `--item-hover`，所以日期选择器与外壳侧栏底部按钮等使用该令牌的悬停底也同步加深。暗色不变。
