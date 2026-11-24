# @marismoon/shell

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
