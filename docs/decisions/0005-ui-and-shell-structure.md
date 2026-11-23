# ADR 0005　UI 保留扁平结构，Shell 按组件分目录

**背景**　UI 包已经使用扁平的 shadcn 基础组件及公开子路径。Shell 从应用中抽离时需要建立独立的组件边界。

**决定**　保留 UI 的 `components/ui`、`components/shared` 结构与 exports。Shell 在 `src/components/<Name>/` 维护组件和其入口，通过包的根入口导出组件、类型及上下文。

**理由**　保留现有 UI 路径有助于对照 shadcn 实现并维持调用方兼容。Shell 组件按职责分目录后，宿主仍可从一个入口接线。

**后果**　扩展时遵循所属包的目录规则。调用方使用公开导出，包内文件布局可独立演进。[UI 组件清单](../COMPONENTS.md) · [Shell 公开接口](../../packages/shell/README.md)
