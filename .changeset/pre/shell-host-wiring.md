---
"@marismoon/shell": minor
---

外壳接管两项原本由宿主各自实现的接线：新增 `useDocumentTitle(title)`；`AppShell` 在提供右栏时默认支持 ⌘⇧K / Ctrl+Shift+K 切换（`rightPanelShortcut` 可关闭），并向 `renderRightPanelTrigger` 提供 `keyShortcuts`。新增导出 `rightPanelKeyShortcuts`。
