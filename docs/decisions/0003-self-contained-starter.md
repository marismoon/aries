# ADR 0003　起步模板自包含工程配置

**背景**　起步模板既要复制到同仓应用目录，也要能导出为独立项目（已由 `scripts/export-starter.mjs` 实现，见[起步指南](../STARTER.md)）。

**决定**　模板携带自己的 TypeScript、ESLint 和测试配置。TSConfig 与 ESLint 配置只引用模板声明的工具。依赖方向规则只保留禁止导入 UI 与 Shell 私有源码路径这一项。

**理由**　复制模板后可以直接运行自身命令。未来拆出应用时，无需额外发布同仓工程配置包。

**后果**　调整工程工具时要验证模板自身与根目录 lint。模板通过 workspace 链接消费 UI、Shell，通过 catalog 对齐工具版本。[起步指南](../STARTER.md)
