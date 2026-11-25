---
"@marismoon/ui": patch
"@marismoon/shell": patch
---

动效补齐：亮/暗切换在支持 View Transitions 的浏览器中从切换按钮中心以圆形揭示新主题（460ms，减弱动效或不支持时直接切换）；对话框入场改为 y 8→0 加 scale 0.98→1（200ms），退出同步加入轻微缩小；新增 `contentEntry` 动效令牌，用于加载完成、新条目与确认提示的出现；`motion.css` 新增纯 SVG 图表入场工具类 `.chart-in-draw/-grow-y/-grow-x/-pop/-fade/-sweep`，以 `--chart-index` 错开。

新增共享组件 `CopyButton`（复制后图标与文案交叉淡入确认，宽度不变），`UiLabels` 新增 `copy`、`copied`。`Tabs` 默认变体切换时选中底板从旧 Tab 滑到新 Tab，面板进入淡入；`Skeleton` 自带扫光；`Progress` 数值变化平滑、无数值时显示往返段落；AlertDialog 与 Sheet 的入场退出曲线与 Dialog 对齐。外壳命令面板的结果行错开入场，空结果淡入。
