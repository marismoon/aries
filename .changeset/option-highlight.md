---
"@marismoon/ui": minor
"@marismoon/shell": patch
---

亮色下浮层列表选项（Select、下拉菜单、右键菜单、Menubar、Combobox、Command）的悬停与选中底色加深：原先对浮层底只有 1.03–1.05:1，几乎看不出；现在悬停约 1.10:1、选中约 1.20:1、选中并悬停约 1.27:1，选项文字在各档上 ≥ 4.9:1。新增令牌 `--option-hover`、`--option-selected`、`--option-selected-hover`、`--option-foreground`，五套主题随主色取值；外壳命令面板的结果行改用同一组令牌。暗色沿用原有取值（Select 悬停由强调色 35% 统一为 45%）。
