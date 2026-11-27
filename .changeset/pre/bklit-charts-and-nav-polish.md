---
"@marismoon/ui": minor
"@marismoon/shell": patch
---

迁移图表库至 `@marismoon/ui/charts`（Bklit 原生 SVG + Motion），补充 `bklit-charts.css` 与图表语义色令牌（`--chart-positive` / `--chart-warning` / `--chart-negative`），新增 `SolarLogout` / `SolarLock` 图标，并统一工作区第二列导航控件高度为 32px。

原有的 `@marismoon/ui/ui/chart` 入口随本次预发布移除。使用旧封装的项目需迁移到 `@marismoon/ui/charts` 的组件 API。
