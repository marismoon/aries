# 阶段二方案：发包准备

> 状态：**方案已确认（2026-11-24），尚未执行**。决定见第 11 节。下文包名按当前仓库写作 `@aries/*`，步骤 0 完成后统一为 `@marismoon/*`。本文延续 [REFACTOR_PLAN.md](REFACTOR_PLAN.md) 的执行规则（每步五项全绿再提交、每轮停下汇报）。与 [AGENTS.md](../AGENTS.md) 冲突时，以其视觉与主题红线为准。

## 1. 目标与范围

让 `@aries/ui`、`@aries/shell` 能作为 npm 包被**仓库外**的项目安装使用，并让 Starter 可以导出为独立项目。

- 不变：shell 不依赖 router、i18n 和业务；Starter 不依赖 `@aries/config`；ui 内部目录结构不重排；视觉与主题红线不变；同仓开发体验（`pnpm dev` 直接消费源码）保留。
- 不在本阶段：在线演示站点、文档站、新增组件。

## 2. 实验结论

2026-11-24 基于 `main`（`8419ce9`）实测。实验在临时目录进行，未进入仓库。

| 编号 | 实验 | 结论 |
| --- | --- | --- |
| E1 | `pnpm pack` 两个包，检查产物 `package.json` | `workspace:*` 被改写为 `0.0.1`，`catalog:` 被改写为 catalog 中的**精确版本**（如 `react: 19.3.1`）。发布后依赖全部锁死。 |
| E2 | 检查 ui 的依赖声明 | `react`、`react-dom` 写在 `dependencies` 而非 `peerDependencies`，且为精确版本。宿主的 React 版本稍有不同就会装出两份 React（推断，未单独复现）。 |
| E3 | 检查 tarball 内容 | 未设 `files`：ui 234 个文件、shell 36 个，包含测试、`tsconfig.json`（继承未发布的 `@aries/config`）与 `components.json`；不含 `LICENSE`。ui 仍为 `private: true`，无法发布。 |
| E4 | 仓库外临时项目从 tarball 安装 | shell 依赖 `@aries/ui@0.0.1`，必须先在同一注册表发布 ui（实验中用 `overrides` 指向本地 tarball 才装上）。 |
| E5 | 仓库外 Vite 8 + Tailwind 4.3 构建 | **构建失败**：`globals.css` 导入 `shadcn/tailwind.css`，而 `shadcn`（CLI 包）只是 ui 的开发依赖。 |
| E6 | 模拟修复 E5 后重新构建 | 构建成功。Vite 直接编译 `node_modules` 中的 TSX 源码；ui 与 shell 样式里的 `@source` 在 `node_modules` 内同样生效，ui 与 shell 的类名均被生成。产物含 105 个字体文件。 |
| E7 | 仓库外 TypeScript 严格模式检查 | ui 源码里的 CSS 副作用导入（如 `input.tsx` 的 `import "./text-field.css"`）报 TS2882；宿主自行声明 `*.css` 模块后通过。 |
| E8 | npm 注册表查询 scope | `@aries/ui`、`@aries/shell` 均为 404。但 scope 接口对不存在的 scope 返回 404「Scope not found」，对 `aries` 却返回 200，说明 **`@aries` 已被他人持有**。`marismoon` 返回 404「Scope not found」，**可用**。另有一个无 scope 的包 `aries`（他人于 2022 年发布 0.0.1），与 scope 无关。 |

审阅时另外记录的问题：shell 没有单元测试，只靠 Demo 的 E2E 间接覆盖；Starter 的 `AGENTS.md` 用 `../../` 链接根目录文档，导出为独立项目后会失效；`shadcn/tailwind.css` 共 637 行、MIT 许可，而 `shadcn` 包本身是 CLI，作为运行时依赖会把 CLI 的依赖链（含已记录的 minimatch 中危）带给宿主。

## 3. 关键决策：以什么形态发布

| | A. 源码发布 | B. 构建产物发布（推荐） |
| --- | --- | --- |
| 做法 | 继续发布 `src` 下的 TSX 与 CSS，`exports` 基本不变 | 用 tsdown 或 Vite library mode 产出 ESM JS 与 `.d.ts`；CSS 保留源文件，`@source` 改为扫描 `dist` |
| 宿主要求 | 必须用 Vite 或能编译 `node_modules` TSX 的构建工具；须声明 `*.css` 模块类型 | 任意支持 ESM 与 CSS 导入的构建工具；类型开箱可用 |
| 已验证 | E6、E7 已证明在 Vite 宿主可行 | 需在步骤 3 用实验验证：编译后 JS 里的类名字符串能被 Tailwind 扫描到 |
| 代价 | 改动最小；宿主类型检查会检查我们的源码，宿主严格度不同可能报错 | 改动较大；需要维护构建配置与双入口 |

已决定采用 **B**。shell 当初去掉对 router 的依赖，就是为了让 Next.js 等非 Vite 宿主也能复用，A 会让这个目标落空。不以 A 作为过渡，预览版与正式版都发布构建产物。同仓开发通过 `exports` 的自定义条件（例如 `"source"`）或 `publishConfig.exports` 继续指向源码，`pnpm dev` 不需要先构建。

## 4. 无论选 A 还是 B 都必须做的修复

1. **去掉对 shadcn CLI 的运行时依赖**：把 `shadcn/tailwind.css` 的内容内置为 `packages/ui/src/styles/shadcn.css`，文件头注明来源与 MIT 许可，并加入 [第三方许可声明](../THIRD_PARTY_NOTICES.md)。用 CSS 产物集合对比，证明替换前后零差异。
2. **依赖声明**：ui 把 `react`、`react-dom` 移到 `peerDependencies`（`^19`），开发依赖保留；发布包的运行时依赖改为区间版本（如 `^x.y.z`），需验证 lockfile 解析不变。
3. **包元数据**：移除 ui 的 `private`；两个包补 `files`（只含产物、`README.md`、`LICENSE`、`THIRD_PARTY_NOTICES.md`）、`publishConfig.access: "public"`、`repository`、`homepage`、`bugs`、`keywords`、`engines`；ui 补 `sideEffects: ["**/*.css"]`。
4. **许可证随包分发**：打包前把根目录的 `LICENSE` 与第三方声明复制进包目录（`prepack` 脚本，或提交副本并在 `check:workspace` 中校验一致）。ui 必须携带 Solar 图标的 CC BY 4.0 署名。
5. **字体可选**：考虑把两套字体拆到 `@aries/ui/styles/fonts.css` 单独入口，`globals.css` 默认不再强制引入，避免每个宿主都打包 105 个字体文件。已决定拆分：Demo 与 Starter 显式引入字体入口，保持外观不变。
6. **shell 补单元测试**：至少覆盖路由适配、`ShellLabels` 注入、受控右栏与导航 Schema 渲染。
7. **Starter 的文档链接**：改为不依赖仓库相对路径（链接到仓库 URL），或由导出脚本改写。

## 5. 版本与发布流程

- 用 Changesets 管理版本。ui 与 shell 设为 `fixed` 组，同步发版；首个正式版 `0.1.0`，此前用 `next` 通道发布预览版。
- 发布由 CI 完成：仅在 `main` 上触发；优先使用 npm 的 Trusted Publishing（OIDC）并开启 provenance，不在仓库中保存长期令牌。若必须用令牌，只存为仓库 Secret。
- 发布顺序：先 ui，后 shell（E4）。

## 6. Starter 导出脚本

新增 `scripts/export-starter.mjs`：把 `templates/starter` 复制到目标目录，将 `workspace:*` 与 `catalog:` 替换为注册表上已存在的真实版本（逐个查询确认可解析），改写文档链接，生成独立的 `pnpm-lock.yaml` 前不得残留任何 `workspace:` 或 `catalog:`。[STARTER.md](STARTER.md) 增加导出用法，并保留同仓复制的用法。

## 7. 质量门禁

| 检查 | 方式 | 是否进 CI |
| --- | --- | --- |
| 包规范 | `publint` | 是 |
| 类型解析 | `@arethetypeswrong/cli`（attw） | 是（选 B 时） |
| tarball 内容 | `pnpm pack` 后检查文件清单：无测试、无 `src` 泄漏（选 B 时）、有 LICENSE | 是 |
| 深层导入 | 宿主尝试导入未导出的路径必须失败 | 是 |
| **外部消费者测试** | 见第 8 节 | 是（独立 job） |

## 8. 外部消费者测试（本阶段的验证核心）

新增 `scripts/consumer-test.mjs` 与根脚本 `pnpm test:consumer`：

1. `pnpm pack` 生成 ui 与 shell 的 tarball；
2. 用导出脚本在仓库外的临时目录生成 Starter，并通过 `overrides` 指向 tarball 安装（不依赖注册表）；
3. 依次执行 install、typecheck、lint、build、test 与 Starter 冒烟 E2E；
4. 对比同仓 Starter 与导出 Starter 的生产 CSS：类选择器、`@keyframes`、自定义属性三份集合必须一致；
5. 验证深层导入被 `exports` 拒绝。

预计耗时 3 到 5 分钟，作为 CI 的独立 job 运行，本地一键执行。

## 9. 执行顺序

| 轮次 | 步骤 | 内容 | 提交示例 |
| --- | --- | --- | --- |
| 一 | 0 | 发布包所在 scope 改为 `@marismoon`：全部工作区包名 `@aries/*` → `@marismoon/*`（含导入、过滤器、CI、检查脚本、文档），项目名、展示文案、CSS 变量、存储键保持 Aries 不变；lockfile 除包名外零变化 | `refactor: 包 scope 改为 @marismoon 以便发布` |
| 一 | 1 | 内置 `shadcn.css`，移除运行时对 shadcn CLI 的依赖（CSS 集合零差异） | `refactor(ui): 内置 shadcn 基础样式` |
| 一 | 2 | 依赖声明：React 改为 peer，发布依赖改为区间版本（lockfile 不变） | `chore(ui): 调整依赖声明以便发布` |
| 一 | 3 | shell 单元测试 | `test(shell): 补充外壳单元测试` |
| 二 | 4 | 构建形态实验与落地（选 B 时：构建配置、双入口、`@source` 指向产物） | `build: ui 与 shell 产出 dist 与类型声明` |
| 二 | 5 | 包元数据、`files`、许可证随包分发；字体拆为 `@marismoon/ui/styles/fonts.css`，Demo 与 Starter 显式引入（CSS 集合零差异）；检查 Aceternity 示例不进入发布包与 Starter | `chore: 完善发布元数据` |
| 三 | 6 | 导出脚本与外部消费者测试（Vite 与 Next.js 两类宿主，含 attw），接入 CI | `test: 新增外部消费者测试` |
| 三 | 7 | Changesets 与 Trusted Publishing 发布工作流（先只发 `next`） | `ci: 新增发布工作流` |
| 四 | 8 | 首次预发布与验收：用户先在 npm 创建组织 `marismoon` 并为两个包配置 Trusted Publishing，确认后再执行 | — |

每一步都在独立分支完成，经 PR 合并；第 8 步前不做任何真实发布。

## 10. 风险

| 风险 | 对策 |
| --- | --- |
| 编译后 JS 的类名无法被 Tailwind 扫描，样式丢失 | 步骤 4 先做实验；外部消费者测试做 CSS 集合对比 |
| 双入口让同仓开发与发布形态分叉 | 外部消费者测试每次 CI 都跑发布形态 |
| 宿主装出两份 React | React 改为 peer，attw 与消费者测试覆盖 |
| `marismoon` 在创建组织前被他人注册 | 尽早由用户在 npm 创建组织 `marismoon`；步骤 0 之前确认 |
| 字体拆分改变 Demo、Starter 的样式入口 | 拆分前后做 CSS 集合与 computed 变量对比，要求零差异 |

## 11. 已决事项（2026-11-24 由用户确认）

| 事项 | 决定 | 对方案的影响 |
| --- | --- | --- |
| npm scope | `@marismoon`（`@aries` 已被他人持有，见 E8） | 新增步骤 0：工作区包名改为 `@marismoon/*`，项目名与界面仍为 Aries |
| 发布形态 | 构建产物（ESM JS + `.d.ts`） | 第 3 节方案 B；步骤 4 先做 Tailwind 扫描产物的实验 |
| 宿主范围 | Vite 与 Next.js | 质量门禁启用 attw；外部消费者测试覆盖 Next.js 宿主 |
| 字体 | 拆为可选入口 `@marismoon/ui/styles/fonts.css` | Demo 与 Starter 显式引入，外观不变 |
| 发布凭证 | npm Trusted Publishing（OIDC）+ provenance | 仓库不存令牌；首发前由用户在 npm 绑定仓库与工作流 |
| Aceternity 示例 | 保留在 Demo 并隔离 | `check:workspace` 增加检查：发布包与 Starter 不得包含该示例 |

执行前仍需用户完成：在 npm 创建组织 `marismoon`（越早越好，避免被抢注）。
