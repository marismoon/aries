# @marismoon/ui

## 0.1.0-next.2

### Minor Changes

- 05b2914: 第二列导航的选中与悬停高亮改由外壳默认提供，宿主无需再实现 `NavHighlightContext`（仍可用它替换）。动画组件由 UI 新增导出 `@marismoon/ui/motion/NavPills`（含 `navPillSpring`）；弹簧改为临界阻尼，并遵循减少动效偏好。宿主需在 `LazyMotion` 内渲染外壳（与 `MotionSurface` 相同）。

## 0.1.0-next.1

### Patch Changes

- 首个通过 Release 工作流（npm Trusted Publishing，附带 provenance）发布的版本，包内容与 0.1.0-next.0 相同。

## 0.1.0-next.0

### Minor Changes

- 51fe2fb: 首个预览版：ui 与 shell 以构建产物（ESM 与类型声明）发布，支持 Vite 与 Next.js 宿主。
