# 重构方案：通用前端框架 + 完整 Demo + 起步模板

> 状态：**阶段一已完成**（步骤 0–9 全部落地，终验于 `fd2ce86`）。本文保留为重构的历史记录与决策依据；后续规则以 `AGENTS.md` 与 `docs/` 现行文档为准，阶段二（发包、export 脚本、changeset）另行规划。
> 原执行要求：开始前读完 `AGENTS.md`、`CLAUDE.md`、`pnpm-workspace.yaml`、`docs/` 全部文档；与 `AGENTS.md` 冲突时，以其视觉与主题红线为准。
> 实施差异：CVE 应急的 `overrides` 实测生效位置为根 `pnpm-workspace.yaml` 顶层（见 `docs/VERSIONING.md`），而非下文 §6 所写的 `package.json#pnpm.overrides`。

## 1. 目标

把耦合在 `apps/web` 中的删减型启动模板，重构为：

| 层 | 路径 | 职责 | 可发布 |
|---|---|---|---|
| 设计系统 | `packages/ui` (`@marismoon/ui`) | shadcn 基础组件、共享组合组件、图标、动效、9 套品牌主题、glass/clean 令牌 | 是 |
| 外壳框架 | `packages/shell` (`@marismoon/shell`) | 工作区外壳、导航、页面布局、命令面板 | 是 |
| 完整示例 | `apps/demo` (`@marismoon/demo`) | 原 `apps/web` 全部页面，框架回归基线 | 否 |
| 起步模板 | `templates/starter` | 最小可运行骨架 | 否 |
| 工程配置 | `packages/config` (`@marismoon/config`) | 共享 eslint / tsconfig，仅同仓使用 | 否 |

取消 `packages/core`：`format.ts` 并入 `packages/ui/src/lib`，`mocks/` 与业务 `types/` 迁入 `apps/demo` 各 feature。

## 2. 执行规则（适用于每一步）

**红线**
- 遵守 `AGENTS.md` 全部视觉与主题红线：业务层禁止写死颜色、禁止新增 `dark:` 变体、Light/Dark 与 glass/clean 视觉一致、保留 `prefers-reduced-motion` 与触控目标规范。
- 页面视觉、交互、中英文 i18n 覆盖不得退化。
- 仅用 `pnpm`；不升级任何依赖；不改 Node / pnpm / Turborepo 版本。
- 阶段一只做同仓 Workspace 源码消费（JIT），不做构建产物、`dist`、发布；不创建 `scripts/export-starter.mjs`；`.changeset/` 仅预留。

**标准验证**（下文简称「五项」）：`pnpm typecheck`、`pnpm lint`、`pnpm build`、`pnpm test`、`pnpm test:ui`。

**节奏**
1. 严格按 §8 的顺序执行，不得跨步、合并步或提前做后续步骤。
2. 每步（或子步）结束：五项全绿 → 单独提交 → 才能进入下一步。
3. 按「轮次」推进，**每轮结束必须停下汇报，等待用户确认后才开始下一轮**：

| 轮次 | 步骤 |
|---|---|
| 一 | 0、1、2 |
| 二 | 3、4 |
| 三 | 5a–5e |
| 四 | 6 |
| 五 | 7、8、9 |

4. 禁止：`--no-verify`、`git push`（除非用户明确要求）、`git add -A`（只暂存本步相关文件）、修改 `.env`/密钥。

**起点必须全绿**：任一步开始前五项若有失败，先停下汇报。修复须单独提交，只做根因修复；**禁止**靠加大超时、`skip`/`fixme`、放宽断言让测试变绿；冒烟测试不得依赖外网（外部请求在 Playwright 层统一拦截，不改应用代码）。

**必须停下询问**：起点不绿且根因不明；依赖版本将发生变化；发现与本文不一致的现状（如引用位置超出预期）；五项失败且原因不明；需要放宽任一红线。

**汇报格式**（每轮结束）：提交哈希与信息 → 五项结果 → 改动清单 → 与本文不一致或待用户决定的事项。

## 3. 目标目录树

```
aries/
├── AGENTS.md  CLAUDE.md  README.md
├── package.json                      # 新增 audit 脚本
├── pnpm-workspace.yaml               # apps/* packages/* templates/*；catalog / catalogs.dev
├── turbo.json  eslint.config.js      # eslint 引用 packages/config
├── .github/workflows/ci.yml          # 见 §6
├── .changeset/                       # 预留，阶段二启用
├── docs/
│   ├── ARCHITECTURE.md  TECH_STACK.md  DESIGN_SYSTEM.md  COMPONENTS.md  I18N.md   # 保持扁平（CLAUDE.md / AGENTS.md 已链接），内容按新结构更新
│   ├── STARTER.md                    # 新增：基于 starter 起步（阶段一用法、新增页面、注册导航）
│   ├── VERSIONING.md                 # 新增：catalog 升级、audit、overrides 应急、阶段边界与可发布清单
│   └── decisions/                    # 新增：ADR，见 §7（shell API 以 packages/shell/README.md 为准）
│
├── packages/
│   ├── config/                       # private
│   │   ├── eslint/                   # base / react / boundaries
│   │   └── typescript/               # base / react / app
│   ├── ui/
│   │   ├── components.json           # 保持现状（别名 @marismoon/ui/ui）
│   │   └── src/                      # 内部结构保持现状，不重排；对外导出路径（exports）不变
│   │       ├── components/
│   │       │   ├── ui/               # 扁平，shadcn CLI 结构
│   │       │   ├── shared/           # 自研组合组件（现为扁平文件，保持）
│   │       │   └── icons/  motion/
│   │       ├── hooks/
│   │       ├── lib/                  # 新增 format.ts（来自 core）
│   │       └── styles/               # 主题与材质令牌，提供 --glass-* / --sidebar-* 变量
│   └── shell/
│       ├── README.md                 # 职责、API、禁止事项、CSS 变量契约
│       └── src/
│           ├── index.ts              # 唯一公开入口
│           ├── components/<Name>/    # AppShell IconRail WorkspaceNav NavTree SidebarNavItem
│           │                         # NavHighlight MainWorkspace WorkspacePageLayout WorkspacePage
│           │                         # PageHeader WorkspaceControls LanguageControl CommandPalette
│           ├── types/                # nav.ts labels.ts adapter.ts
│           ├── context/              # ShellLabelsBridge
│           └── styles/layout.css     # 自带 @source；不嵌套 import ui 样式
│
├── apps/demo/                        # private；原 apps/web
│   ├── e2e/                          # 现有 E2E 保持平铺，即 CI 的 test:ui 全集
│   └── src/
│       ├── app/                      # App、router、providers、shell-adapter、workspace-pages
│       ├── features/                 # overview bills copilot settings/{component-preview,motion,foundation,basic-info}
│       │                             # 每个 feature：pages/ components/ hooks/ mocks/ types/ locales/（按需）
│       ├── shared/
│       ├── lib/i18n/                 # locales/{zh,en}，含 ShellLabels 映射
│       └── styles/index.css          # 显式两段：ui/styles → shell/styles → 业务样式
│
└── templates/starter/                # private；纳入 workspace 与 CI
    ├── AGENTS.md                     # 精简版：新增页面、注册导航、视觉 Token 红线
    ├── package.json                  # workspace:* / catalog:；不得含 @marismoon/config
    ├── tsconfig.json  eslint.config.js   # 自包含
    ├── e2e/smoke.spec.ts
    └── src/                          # app/ features/{home,settings}/ shared/ lib/i18n/ styles/index.css
```

## 4. 依赖方向

```
apps/demo ─────────┐
                   ├──▶ packages/shell ──▶ packages/ui
templates/starter ─┘
packages/config ──▶ 仅被 ui、shell、demo 使用（starter 不依赖）
```

禁止：`ui → shell`；`ui`/`shell` → `apps/*`；`starter → apps/*`；任何深层私有路径导入（如 `@marismoon/ui/src/*`）。用 ESLint `no-restricted-imports` 实现；starter 的 eslint 只复制「禁止深层私有路径导入」一条。

## 5. `packages/shell` 设计原则

1. **不认识路由**：只接收 `activePath` 与 `renderLink` / `onNavigate`；不依赖 `react-router`。
2. **不认识 i18n**：只接收已翻译字符串；`ShellLabels` 只含外壳固定文案；不依赖 `i18next` / `react-i18next`；延续 `UiLabelsBridge` 模式。
3. **不认识业务**：导航用声明式 Schema 注入（模块、分组、节点，图标为 `ReactNode`）；shell 只含类型，不含具体菜单。
4. **扩展靠 slot**：`AppShell` 暴露 `rightPanel`、`headerExtra`、`overlays`；右栏开合用受控 `rightPanelOpen`；禁止导入 `features/*`。
5. **`CommandPalette` 数据源注入**（`items` / `provider`）；现引用 `mocks/bills` 必须去除。
6. **`WorkspaceControls` 只做组装**，主题 / 深色风格 / 品牌色控件来自 `ui`；`LanguageControl` 受控（`value` / `options` / `onChange`）。
7. 样式入口 `@marismoon/shell/styles` 自带 Tailwind v4 `@source`；宿主先 `@import "@marismoon/ui/styles"`，再 `@import "@marismoon/shell/styles"`，两者互不嵌套。

接口草案（类型名可微调，语义不得改）：

```ts
interface ShellRouterAdapter {
  activePath: string;
  onNavigate?: (path: string) => void;
  renderLink?: (props: { to: string; className?: string; children: ReactNode }) => ReactNode;
}
interface NavNode { id: string; label: string; icon?: ReactNode; path?: string; children?: NavNode[] }
interface NavModule { id: string; label: string; icon: ReactNode; items: NavNode[] }
interface ShellLabels { /* 折叠、搜索占位、命令面板等外壳固定文案 */ }
```

## 6. 版本治理与 CI

- `catalog:`：默认 catalog 放 React、Vite、TypeScript、Tailwind 等核心栈；`catalogs.dev` 放测试与 lint 工具链；各包用 `"catalog:"` / `"catalog:dev"`。升级统一改 catalog；CVE 应急用根 `pnpm.overrides` 止血，修复后移除并记录。
- 包规范：`exports` 显式子路径；`peerDependencies` 宽范围（React、Tailwind）；实现依赖放 `dependencies`；CSS 入口声明 `sideEffects`。
- `private: true`：`apps/demo`、`templates/starter`、`packages/config`。可发布清单仅 `ui`、`shell`。
- 根 `package.json` 增加 `"audit": "pnpm audit --audit-level=high"`。
- `ci.yml` 必跑：`typecheck`、`lint`、`build`、`test`、`audit`、`test:ui`（demo 现有全部 E2E + starter 冒烟）。
- 额外检查：① 除 `ui`、`shell` 外所有包 `private: true`；② starter 的 `package.json` 不含 `@marismoon/config`；③ 无深层私有路径导入。

**阶段一不做**：`export-starter.mjs`、发包、`.changeset` 实际配置。starter 阶段一的用法是复制到同仓 `apps/` 下开发。

## 7. ADR（`docs/decisions/`，每条一页）

取消 `packages/core` · shell 不依赖 router 与 i18n · starter 自包含不依赖 config · CSS 两段显式导入 · `packages/ui` 内部结构保持现状（shadcn 扁平），仅新建的 `packages/shell` 采用一组件一目录

## 8. 执行步骤

### 轮次一

**步骤 0 起点**
- 做：确认工作区干净、分支正确；跑五项；存档 `pnpm-lock.yaml` 的解析版本。
- 起点不绿 → 按 §2「起点必须全绿」单独修复（可多个提交，仅根因修复）并连续两次 `test:ui` 稳定全绿后，重新存档 lockfile。
- 提交：无（修复除外）。

**步骤 1 改名**
- 做：`git mv apps/web apps/demo`；包名 `@marismoon/demo`，加 `"private": true`；全仓更新对 `apps/web`、`@marismoon/web` 的引用（根 package.json、turbo.json、eslint 颜色豁免路径、tsconfig、CI、文档路径描述）。本文档中描述原状的 `apps/web` 不改。
- 不做：任何业务代码、样式、逻辑改动。
- 提交：`refactor: apps/web 重命名为 apps/demo`

**步骤 2 Catalog**
- 做：按 §6 引入 `catalog:` / `catalogs.dev`；仅迁移多包重复或明显属于核心栈的依赖；版本与现状**精确一致**；根 `package.json` 加 `audit`。
- 验证：迁移后各包 lockfile 解析版本与步骤 0 存档**完全一致**，有变化即失败。
- 提交：`chore: 引入 pnpm catalog 统一依赖版本`

### 轮次二

**步骤 3 config 包**
- 做：建 `packages/config`（private），抽出 eslint / tsconfig 共享配置，让 `ui`、`demo` 引用（`shell`、`starter` 尚未创建，不处理）；补依赖方向规则；颜色字面量豁免路径保持对原位置有效。
- 提交：`chore: 抽出 packages/config 共享工程配置`

**步骤 4 取消 core**
- 做：`format.ts` → `packages/ui/src/lib`（同步迁移其测试，若有）；`mocks/`、`types/` 迁入 `apps/demo` 对应 feature（跨 feature 的放 `demo/shared`），**连同 `mock-service.test.ts` 等测试一并迁移，测试数量不得减少**；`zod` 等 core 独有依赖随使用方迁移，并按 catalog 规则处理；删除 `packages/core`（含 workspace 引用、lockfile importer、ESLint / 文档中的 `@marismoon/core` 路径）；去除 `CommandPalette` 对 `mocks/bills` 的引用（改为由 demo 注入数据）。
- 提交：`refactor: 取消 packages/core，mocks 与类型迁入 demo`

### 轮次三：就地解耦（只在 demo 内改，**不搬文件**；每子步单独提交）

- **5a CSS 变量归位**：核对 `layout.css` 用到的 `--glass-*`、`--sidebar-*` 等变量是否全部定义在 `ui/styles`；定义在 demo 样式里的移入 ui，并整理成「CSS 变量契约」清单（供 shell README 使用）。
- **5b CommandPalette 数据注入**：改为接收 `items` / `provider`，组件内不再引用任何业务数据（若步骤 4 已完成则核对）。
- **5c 路由适配**：`layout/` 内去除 `react-router` 使用，改用 `ShellRouterAdapter`（`activePath` + `renderLink`/`onNavigate`）；在 `demo/app/shell-adapter` 实现适配。
- **5d 文案与语言**：`layout/` 内去除 `i18next` / `react-i18next` / `use-ui-text` 依赖，改用 `ShellLabels` 注入；`LanguageControl` 改受控；在 `demo/lib/i18n` 完成映射；逐条梳理词条，外壳固定文案进 `ShellLabels`，业务词条留 demo。
- **5e 导航 Schema 与 slot**：导航数据改为声明式 Schema 注入（具体菜单留在 `demo/app/workspace-pages`，类型定义为 shell 的 `types/nav.ts` 草案）；`CopilotPanel` 等经 `rightPanel`/`overlays` slot 挂载；`layout/` 内不得再 import `@/features/*`、`@/app/*`、`@/lib/*`。
- 轮次三结束验收：`layout/` 目录内无 `react-router`、`i18next`、`react-i18next`、`@marismoon/core`、`@/features`、`@/app`、`@/lib` 引用（用 grep 证明）。

### 轮次四

**步骤 6 机械搬迁**
- 前置：搬迁**前**在本机 build demo，保存产物 CSS 的选择器集合（提取 `.class` 选择器去重排序存档）。
- 做：把已解耦的 `layout/` 移入 `packages/shell`；建 shell 的 `package.json`（`exports`、`peerDependencies`）、`README`（含 CSS 变量契约）、样式入口与 `@source`；demo 样式改为两段显式导入；更新 ESLint 规则与颜色字面量豁免路径（指向 `packages/shell/**`、`packages/ui/**`，移除旧路径）。本步只搬迁与接线，不改逻辑。
- 验证（主）：搬迁后 build 产物 CSS 选择器集合，相对搬迁前**缺失项为空**（抓 `@source` 漏扫）。
- 验证（辅）：本地 `test:visual` 截图对比（见下）；最后由用户人工过关键页面。
- 提交：`refactor: layout 外壳抽离为 packages/shell`

**视觉回归（仅辅助，不是门禁）**
- 独立命令 `test:visual`，不纳入 `test:ui`，不进默认 CI。
- 范围精简：3–4 个代表页面 × Light/Dark × glass；固定视口、禁用动画、等待字体与数据加载。
- 正式基线（将来接入 CI 时）必须在 Linux 容器生成；允许本机 macOS 生成本地基线，仅限本机对比使用（快照带平台后缀，互不覆盖）。
- 出现差异先判断真回归还是抖动；**禁止放宽阈值或更新基线来掩盖差异**。

### 轮次五

**步骤 7 starter**
- 做：建 `templates/starter`（home + settings 占位、最小 AppShell / 主题 / i18n / React Query）；自包含 tsconfig 与 eslint；精简版 `AGENTS.md`；冒烟 E2E；纳入 workspace 与 CI。
- 提交：`feat: 新增 templates/starter 起步模板`

**步骤 8 文档与 CI**
- 做：更新 `AGENTS.md`、`README.md`、`docs/`（按 §3 的 docs 结构：现有文档保持扁平并更新，新增 `STARTER.md`、`VERSIONING.md`、`decisions/`，含 §7 的 ADR）；落地 §6 的 CI 与三项检查。
- 提交：`docs: 更新架构文档与 CI 检查`

**步骤 9 终验**
- 做：依次跑五项并汇报每项结果；对照 §9 验收清单逐条给出证据。

## 9. 验收清单

- [ ] 页面视觉与重构前一致（Light/Dark × glass/clean）：CSS 选择器无缺失 + 用户人工复核；i18n 中英文覆盖不退化。
- [ ] `packages/shell` 的 `package.json` 与源码不含 `react-router`、`i18next`、`react-i18next`、`@marismoon/core`、`features/*` 引用。
- [ ] `apps/demo`、`templates/starter` 仅通过公开导出路径消费 `ui` / `shell`。
- [ ] §6 三项 CI 检查生效；`pnpm audit` 可用。
- [ ] 五项全部通过（`test:ui` 覆盖 demo 与 starter 冒烟）。

## 10. 迁移映射

| 原位置 | 新位置 |
|---|---|
| `apps/web` | `apps/demo` |
| `apps/web/src/components/layout/*`（除 `workspace-modules.ts`） | `packages/shell/src/components/<Name>/` |
| `layout/layout.css` | `packages/shell/src/styles/layout.css` |
| `layout/workspace-modules.ts`、`app/workspace-pages` | 类型 → `shell/types/nav.ts`；具体菜单 → `demo/app/workspace-pages` |
| `features/copilot` | `apps/demo/src/features/copilot`，经 slot 挂载 |
| `packages/core/src/mocks`、`types` | `demo/src/features/<feature>/mocks`、`types`；跨 feature 放 `demo/shared` |
| `packages/core/src/format.ts` | `packages/ui/src/lib/format.ts`；删除 `packages/core` |
| 外壳固定文案 i18n | demo 的 `lib/i18n` 映射为 `ShellLabels` |
| 业务词条 i18n | 留在 `demo/src/lib/i18n/locales` |
| 现有 Playwright E2E | `apps/demo/e2e`（保持平铺） |
| 颜色字面量豁免路径 | 改指向 `packages/shell/**`、`packages/ui/**`，移除旧路径 |
