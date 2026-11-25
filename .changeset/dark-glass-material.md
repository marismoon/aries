---
"@marismoon/ui": minor
"@marismoon/shell": minor
---

暗色 glass 材质按 Raycast 的主题配方重做（clean 暗色与亮色未变）：中性色一律是文字色加透明度，侧栏与卡片共享主题色渐变和 1px 边框。桌面第二列采用 46% → 38% 填充、1.5px 模糊和 50% 背景亮度，透出动态背景；卡片使用 72px 模糊，选中为主色 10% 平涂，状态标签为本色加 15% 底。卡片比 Raycast 厚（74% 不透明，Raycast 约 52%；内容区的滚动边缘遮罩让卡片不再模糊背后的光，光透得更集中），次级文字为文字色 80%（Raycast 60%），使光经过时次级文字仍 ≥ 4.5:1。`AppShell` 新增 `glassBackdrop` 属性，可替换背景或传 `null` 关闭。新增令牌 `--glass-source/text/tint/tint-2/base`；`--tone-k` 为 0 时整套变为中性灰（极简灰）。暗色 glass 下 `--page-background` 为透明。

新增三款 随品牌配色的 WebGL 2 背景组件 AriesMagicRings、AriesAntigravity 和 AriesLightfall。
