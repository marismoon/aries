---
"@marismoon/ui": minor
"@marismoon/shell": minor
---

第二列导航的选中与悬停高亮改由外壳默认提供，宿主无需再实现 `NavHighlightContext`（仍可用它替换）。动画组件由 UI 新增导出 `@marismoon/ui/motion/NavPills`（含 `navPillSpring`）；弹簧改为临界阻尼，并遵循减少动效偏好。宿主需在 `LazyMotion` 内渲染外壳（与 `MotionSurface` 相同）。
