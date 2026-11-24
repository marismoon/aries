---
"@marismoon/ui": minor
"@marismoon/shell": patch
---

字体清晰度：去掉全局 `-webkit-font-smoothing: antialiased`（macOS 上小号中文笔画发虚），新增 `--label-foreground`（小号标签色），外壳第二列目录的二级项改用它。清除已移除默认主题的紫色残留：远程医疗蓝成为真正的兜底（未设置或未知 `data-palette` 时生效），亮色共享信息色改为蓝色（远程医疗蓝保留紫色信息色），亮色浮层阴影与暗色 Logo 底色改为随主题取色。补上 shadcn `Sidebar` 组件的 `--sidebar*` 颜色令牌与 Tailwind 映射（此前未定义，组件没有颜色）；移除从未定义的 `--color-chart-6…8` 映射。
