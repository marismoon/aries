---
"@marismoon/shell": patch
"@marismoon/ui": patch
---

内容区滚动边缘改为内容自身淡出：`.page-content-viewport` 上的遮罩在滚动后的顶部、下方还有内容时的底部，各 28px（`--workspace-scroll-edge`）内渐变到透明。此前是在边缘铺一条页面背景：暗色玻璃下页面背景透明，边缘被硬切；现在没有覆盖物，裁切处不再有分割线，亮色、简洁暗色、暗色玻璃一致。遮罩让内容视口成为背景模糊的边界，其中的玻璃卡片不再模糊页面背后的光。内容视口顶部新增 8px 余量（`--workspace-bleed-block-start`），内容框同步上移，第一排卡片悬停上浮时上沿与阴影不再被裁切，位置不变。移除不再使用的 `--workspace-fade-feather`。
