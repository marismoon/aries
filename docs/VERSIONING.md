# 版本治理

同仓应用在 pnpm workspace 内通过 `workspace:*` 消费源码。可发布清单为 `@marismoon/ui`、`@marismoon/shell` 和 `@marismoon/create-aries`。前两者以构建产物发布到 npm（取舍见 [ADR 0006](decisions/0006-publish-built-packages.md)）。其他工作区包必须保留 `private: true`。三个包均携带 [LICENSE](../LICENSE)，`@marismoon/ui` 还随包分发含 Solar 图标 CC BY 4.0 署名的[第三方许可声明](../THIRD_PARTY_NOTICES.md)。起步流程见 [STARTER.md](STARTER.md)。

`@marismoon/ui` 与 `@marismoon/shell` 的 `pnpm build` 产出 `dist`（ESM JavaScript、类型声明与样式），只用于发布：Vite 按模块输出并保留 `"use client"`，`tsc` 生成声明，[finalize-package.mjs](../scripts/finalize-package.mjs) 复制样式、把 `@source` 指向编译后的 `.js`，并移除声明文件中的 CSS 导入。同仓开发继续通过 `exports` 直接消费源码；打包时 `publishConfig.exports` 替换为 `dist` 路径，`files` 限定只发布 `dist`、README 与许可证文件。

## 升级依赖

1. 在根 [pnpm-workspace.yaml](../pnpm-workspace.yaml) 的默认 `catalog` 更新核心栈版本，在 `catalogs.dev` 更新测试或 lint 工具。默认 catalog 中被可发布包（`@marismoon/ui`）用作运行时依赖的条目写兼容区间（如 `^3.8.0`），发布后宿主可与之去重；其余条目写精确版本。实际安装版本一律由 `pnpm-lock.yaml` 锁定。React 与 React DOM 是 ui 的 `peerDependencies`（`^19`）。使用方继续写 `catalog:` 或 `catalog:dev`。直接写在包清单中的依赖在相应清单更新，并核对其他使用方和公共包的 peer 范围。
2. 在根目录用项目锁定的 pnpm 执行 `pnpm install`。检查 `pnpm-lock.yaml` 的 importer、packages 与 snapshots 的差异，确认解析变化都能归因于此次升级。recharts 的升级还需核对共享图表组件，见[技术栈](TECH_STACK.md)。
3. 运行[开发契约 §9](../AGENTS.md) 的提交前自检和 `pnpm run audit`，将清单与 lockfile 一起提交。大版本升级单独提交，记录受影响的包和兼容性。

## 发布

`@marismoon/ui`、`@marismoon/shell` 与 `@marismoon/create-aries` 由 [Changesets](../.changeset/README.md) 管理版本，三者同版本发布（`fixed` 组），当前处于 `next` 预发布模式。create-aries 打包时由 `templates/starter` 生成模板，依赖写为同一次发布的 ui 与 shell 版本，所以三者须在同一次 Release 中发布。

1. 改动影响发布包时，用 `pnpm changeset` 记录包、版本级别和改动说明。按[开发契约 §9](../AGENTS.md) 自检，运行 `pnpm run audit`，推送功能分支并用 `gh pr create --base main` 提交 PR。完成审阅并确认 [CI](../.github/workflows/ci.yml) 的 `verify` 和 `consumer` 均通过后，用 `gh pr merge <PR 编号> --merge` 合并。
2. 功能 PR 合并后，从最新的 `main` 创建独立版本分支。发首个正式版时先运行 `pnpm changeset pre exit`，后续发布选用 `latest`。运行 `pnpm changeset version`，核对三个包的版本号、`CHANGELOG.md` 与 `.changeset/` 的变更。运行提交前自检和 `pnpm test:consumer`，推送版本分支，用 `gh pr create --base main` 提交版本 PR。确认 CI 通过后合并。
3. 在版本 PR 合并后确认 `main` 的对应提交和 CI 结果，再运行 `gh workflow run release.yml --ref main -f dist-tag=next`。[Release 工作流](../.github/workflows/release.yml)通过 OIDC 发布 npm，自动附带 provenance，只发布注册表上还没有的版本。
4. 确认对应的 Release 运行成功。用 `pnpm view <包名> dist-tags --json` 查询三个包，核对本次发布所选的 `next` 或 `latest` 均指向同一版本。

三个现有包均已完成首发和可信发布。新增可发布包时，维护者先用启用 2FA 且拥有 `marismoon` 发布权限的账号完成首发，然后在 npm 包设置中添加 Trusted Publisher，选择 GitHub Actions、组织 `marismoon`、仓库 `aries`、工作流 `release.yml`，允许直接发布，并在 2 天内完成首次可信发布。若使用 npm 暂存发布创建新包，注册表会出现公开的占位版本 `0.0.0-stage`。[npm 可信发布](https://docs.npmjs.com/trusted-publishers/) · [npm 暂存发布](https://docs.npmjs.com/staged-publishing/)

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
