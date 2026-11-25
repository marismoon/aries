---
"@marismoon/ui": minor
---

图标调整（关闭按钮的外观有变化）：

- 关闭、移除、清除类按钮统一，新增 `@marismoon/ui/ui/close-button`（`CloseButton`、`CloseIcon`、`closeButtonClass`）：图标是 16px 圆圈叉 `close-circle-linear`，静止与悬停都不带底色，悬停或按下时由次要色变为正文色的 `close-circle-bold`。`Dialog` 与 `Sheet` 的关闭按钮去掉了 `bg-secondary` 底色和悬停底色，`Sheet` 的图标由 20px 改为 16px；`Combobox` 的清除按钮和标签移除按钮同样处理（标签移除原先是 12px 无外圈叉、60% 透明度、悬停加底色）。`SolarClose` 改为与 `SolarX` 指向同一个圆圈叉；原先 `SolarClose` 指向的无外圈叉 `close-linear` 改由新增的 `SolarCloseLine` 导出。
- 新增纸飞机 `SolarPlain3`（`plain-3-linear`）及配对的 Bold（`plain-3-bold`），用于「发送」类按钮，写 `<AppIcon icon={SolarPlain3} stateful />`。
- `stateful` 图标在控件按下（`:active`，非禁用）时也显示 Bold。此前只有悬停与选中会切换，触屏点按和键盘触发时没有反馈；鼠标操作下表现不变。
