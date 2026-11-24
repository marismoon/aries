# 版本治理

阶段一在 pnpm workspace 内通过 `workspace:*` 消费源码。可发布清单只有 `@aries/ui` 和 `@aries/shell`。UI 当前仍标记为 private。其他工作区包必须保留 `private: true`。阶段二再处理独立导出、发布构建与 Changesets。发包前须确认 [LICENSE](../LICENSE) 与 [第三方许可声明](../THIRD_PARTY_NOTICES.md) 随包分发，`@aries/ui` 须携带 Solar 图标的 CC BY 4.0 署名。起步流程见 [STARTER.md](STARTER.md)。

## 升级依赖

1. 在根 [pnpm-workspace.yaml](../pnpm-workspace.yaml) 的默认 `catalog` 更新核心栈版本，在 `catalogs.dev` 更新测试或 lint 工具。默认 catalog 中被可发布包（`@aries/ui`）用作运行时依赖的条目写兼容区间（如 `^3.8.0`），发布后宿主可与之去重；其余条目写精确版本。实际安装版本一律由 `pnpm-lock.yaml` 锁定。React 与 React DOM 是 ui 的 `peerDependencies`（`^19`）。使用方继续写 `catalog:` 或 `catalog:dev`。直接写在包清单中的依赖在相应清单更新，并核对其他使用方和公共包的 peer 范围。
2. 在根目录用项目锁定的 pnpm 执行 `pnpm install`。检查 `pnpm-lock.yaml` 的 importer、packages 与 snapshots 的差异，确认解析变化都能归因于此次升级。recharts 的升级还需核对共享图表组件，见[技术栈](TECH_STACK.md)。
3. 运行根目录五项自检、`pnpm check:workspace` 和 `pnpm run audit`，将清单与 lockfile 一起提交。大版本升级单独提交，记录受影响的包和兼容性。五项命令见[开发契约](../AGENTS.md)。

## 安全公告与临时覆盖

CI 运行 `pnpm run audit`，调用 `pnpm audit --audit-level=high`。高危和严重级别公告会阻断流水线。用 `pnpm why -r <包名>` 追踪上游依赖，核对公告中的受影响范围、修复版本与实际解析版本。

若上游依赖暂时引入易受影响的版本，在工作区根 `pnpm-workspace.yaml` 的顶层 `overrides` 添加尽量精确的父包和子包选择器，并指定已修复的版本。示意如下，包名和版本须替换为公告对应的实际值。

```yaml
overrides:
  "parent-package>affected-package": "1.2.4"
```

方案中所称的根级 `pnpm.overrides` 在本仓由上述 YAML 配置实现。pnpm 12.16.1 会忽略根 `package.json` 的旧字段 `pnpm.overrides`。[pnpm 工作区配置](https://pnpm.io/settings)

执行 `pnpm install` 并核实锁定版本，重跑自检和审计。在修复提交记录公告编号、影响路径、选定版本与移除条件。上游正式版本覆盖修复后，升级上游、移除临时覆盖，再次核对解析结果和审计，在同一提交记录解除原因。

### 已评估、接受风险 · minimatch 开发工具链（2026-11-23）

中危公告 CVE-2026-118764 涉及 `>=7.0.0 <11.0.1`。Demo 和 UI 各自的开发依赖链为 `shadcn@4.23.0 → ts-morph@26.0.0 → @ts-morph/common@0.27.0 → minimatch@10.2.6`。上游声明 `^10.0.1`，公告列出的首个修复版 `11.0.1` 超出该范围。[上游公告 GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249)

本次保留锁定版本，接受开发工具处理不可信 glob 模式时的拒绝服务风险。已核对两个应用的全部生产 JavaScript，包括异步加载的代码块。Demo 的 114 个文件和 Starter 的 1 个文件均未包含这条 CLI 依赖链。默认审计继续报告该项，CI 维持高危阻断。若上游发布兼容修复、工具链转用已修复版本，或这条依赖进入运行时，重新评估并更新本记录。
