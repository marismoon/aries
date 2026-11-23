# 重构方案：通用前端框架 + 完整 Demo + 起步模板

> 状态：方案已确认，待执行。执行者必须先读 `AGENTS.md`、`CLAUDE.md`、`pnpm-workspace.yaml` 与 `docs/` 全部文档。
> 本文是执行契约：与 `AGENTS.md` 冲突时，以 `AGENTS.md` 的视觉与主题红线为准。

## 1. 目标

把耦合在 `apps/web` 中的删减型启动模板，重构为四层结构：

| 层 | 路径 | 职责 | 可发布 |
|---|---|---|---|
| 设计系统 | `packages/ui` (`@marismoon/ui`) | shadcn 基础组件、共享组合组件、图标、动效、9 套品牌主题、glass/clean 令牌 | 是 |
| 外壳框架 | `packages/shell` (`@marismoon/shell`) | 工作区外壳、导航、页面布局、命令面板 | 是 |
| 完整示例 | `apps/demo` (`@marismoon/demo`) | 原 `apps/web` 全部页面，作为框架回归基线 | 否 |
| 起步模板 | `templates/starter` | 最小可运行骨架 | 否 |
| 工程配置 | `packages/config` (`@marismoon/config`) | 共享 eslint / tsconfig，仅同仓使用 | 否 |

取消 `packages/core`：`format.ts` 并入 `packages/ui/src/lib`，`mocks/` 与业务 `types/` 迁入 `apps/demo` 各 feature。

## 2. 不可破坏的红线

- 遵守 `AGENTS.md` 全部视觉与主题红线：业务层禁止写死颜色、禁止新增 `dark:` 变体、Light/Dark 与 glass/clean 视觉完全一致、保留 `prefers-reduced-motion` 与触控目标规范。
- 现有全部页面的视觉、交互、中英文 i18n 覆盖不得退化。
- 仅使用 `pnpm`，保持现有 Node / pnpm / Turborepo 工具链。
- 本方案阶段一只做同仓 Workspace 源码消费（JIT），不做构建、`dist`、发布流程。

## 3. 目标目录树

```
aries/
├── AGENTS.md                         # 更新：依赖方向、shell 规则、shadcn 必须走 CLI
├── CLAUDE.md
├── README.md                         # 更新：四层结构、starter 使用方式、版本治理
├── package.json                      # scripts 新增 audit、test:visual
├── pnpm-workspace.yaml               # packages: apps/* packages/* templates/*；catalog / catalogs.dev
├── turbo.json
├── eslint.config.js                  # 引用 packages/config，声明各目录适用规则
├── .nvmrc  .editorconfig  .gitignore  .npmrc
├── .github/workflows/ci.yml          # 见 §8
├── .changeset/                       # 预留，阶段二启用
│
├── docs/
│   ├── guide/                        # 入门、新增页面、注册导航、复制 starter 起步
│   ├── reference/                    # ui 组件、shell Props/Slot/ShellLabels、i18n
│   ├── architecture/                 # 分层、依赖方向、启动流程、设计系统、技术栈、版本治理、阶段边界
│   └── decisions/                    # ADR（见 §9）
│
├── packages/
│   ├── config/                       # private
│   │   ├── package.json
│   │   ├── eslint/                   # base / react / boundaries
│   │   └── typescript/               # base.json / react.json / app.json
│   ├── ui/
│   │   ├── package.json              # exports 显式子路径；sideEffects 声明 CSS
│   │   ├── components.json           # shadcn 别名对齐 src/ui
│   │   ├── README.md
│   │   └── src/
│   │       ├── index.ts
│   │       ├── ui/                   # 扁平，沿用 shadcn CLI 结构（button.tsx 等）
│   │       ├── shared/<Name>/        # 自研组合组件，一组件一目录
│   │       ├── icons/  motion/  hooks/
│   │       ├── lib/                  # format.ts（来自原 core）
│   │       └── styles/               # 主题与材质令牌，提供 --glass-* / --sidebar-* 变量
│   └── shell/
│       ├── package.json              # dep: ui；peer: react、tailwindcss；不依赖 router / i18next
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
├── apps/
│   └── demo/                         # private；原 apps/web 改名
│       ├── package.json  index.html  vite.config.ts  playwright.config.ts
│       ├── e2e/
│       │   ├── smoke/                # CI 必跑
│       │   └── visual/               # 本地 / 发版前回归，不进默认 CI
│       └── src/
│           ├── main.tsx
│           ├── app/                  # App、router、providers、shell-adapter、workspace-pages
│           ├── features/
│           │   ├── overview/  bills/  copilot/
│           │   └── settings/{component-preview,motion,foundation,basic-info}/
│           │       # 每个 feature：pages/ components/ hooks/ mocks/ types/ locales/（按需）
│           ├── shared/
│           ├── lib/i18n/             # locales/{zh,en}，含 ShellLabels 映射
│           └── styles/index.css      # 显式两段：ui/styles → shell/styles → 业务样式
│
└── templates/
    └── starter/                      # private；纳入 workspace 与 CI
        ├── package.json              # workspace:* / catalog:；不得含 @marismoon/config
        ├── AGENTS.md                 # 精简版：新增页面、注册导航、视觉 Token 红线
        ├── tsconfig.json  eslint.config.js   # 自包含
        ├── index.html  vite.config.ts  playwright.config.ts
        ├── e2e/smoke.spec.ts
        └── src/
            ├── main.tsx
            ├── app/                  # App、router、providers、shell-adapter、nav.ts
            ├── features/{home,settings}/
            ├── shared/
            ├── lib/i18n/             # 最小 zh / en
            └── styles/index.css      # 同样两段显式导入
```

## 4. 依赖方向

```
apps/demo ─────────┐
                   ├──▶ packages/shell ──▶ packages/ui
templates/starter ─┘

packages/config ──▶ 仅被 packages/ui、packages/shell、apps/demo 使用
templates/starter ──✕ 不依赖 config，不依赖 apps/*
```

禁止：`ui → shell`、`ui/shell → apps/*`、`starter → apps/*`、任何深层私有路径导入（如 `@marismoon/ui/src/*`）。用 ESLint `no-restricted-imports` 实现，starter 的 eslint 只复制「禁止深层私有路径导入」一条。

## 5. `packages/shell` 设计原则

1. **不认识路由**：只接收 `activePath` 与 `renderLink` / `onNavigate`；不依赖 `react-router`。
2. **不认识 i18n**：只接收已翻译字符串；`ShellLabels` 只含外壳固定文案；不依赖 `i18next` / `react-i18next`。延续 `UiLabelsBridge` 模式。
3. **不认识业务**：导航通过声明式 Schema 注入（模块、分组、节点；图标为 `ReactNode`），shell 只保留类型，不含具体菜单。
4. **扩展靠 slot**：`AppShell` 暴露 `rightPanel`、`headerExtra`、`overlays`；右栏开合用受控 `rightPanelOpen`；禁止导入 `features/copilot`。
5. **`CommandPalette` 数据源注入**（`items` / `provider`）；当前它引用 `mocks/bills`，抽离时必须去除。
6. **`WorkspaceControls` 只做组装**，主题 / 深色风格 / 品牌色控件仍来自 `ui`；`LanguageControl` 为受控组件（`value` / `options` / `onChange`）。
7. 样式入口 `@marismoon/shell/styles` 自带 Tailwind v4 `@source`；README 列出 CSS 变量契约。

接口草案（类型名为建议，落地时可微调，但语义不得改）：

```ts
// types/adapter.ts
interface ShellRouterAdapter {
  activePath: string;
  onNavigate?: (path: string) => void;
  renderLink?: (props: { to: string; className?: string; children: ReactNode }) => ReactNode;
}

// types/nav.ts（仅类型）
interface NavNode { id: string; label: string; icon?: ReactNode; path?: string; children?: NavNode[] }
interface NavModule { id: string; label: string; icon: ReactNode; items: NavNode[] }

// types/labels.ts
interface ShellLabels { /* 折叠、搜索占位、命令面板等外壳固定文案 */ }
```

## 6. 版本治理

- `pnpm-workspace.yaml` 启用 `catalog:`：默认 catalog 放 React、Vite、TypeScript、Tailwind 等核心栈；`catalogs.dev` 放测试与 lint 工具链。各包统一 `"catalog:"` 引用。
- `exports` 显式列出子路径；`peerDependencies` 用宽范围（React、Tailwind）；内部实现依赖放 `dependencies`；CSS 入口声明 `sideEffects`。
- 根 `package.json` 增加 `"audit": "pnpm audit --audit-level=high"`。
- 文档写明：升级通过修改 catalog 统一进行；CVE 应急用根 `pnpm.overrides` 止血，修复后须移除并记录。
- `private: true`：`apps/demo`、`templates/starter`、`packages/config` 必须声明。可发布包清单仅 `ui`、`shell`。

## 7. 阶段边界

| 项 | 阶段一（本次） | 阶段二（发包后，不在本次范围） |
|---|---|---|
| starter 使用 | 复制到同仓 `apps/` 下开发 | 启用 `scripts/export-starter.mjs`，替换 `workspace:*` / `catalog:` 并校验 registry 可解析 |
| 发布 | 不构建、不发布 | 启用 `.changeset/` |
| 视觉回归 | 本地 `test:visual` | 视情况接入 Linux 容器 CI |

阶段一**不要**创建 `scripts/export-starter.mjs`。

## 8. CI 与检查项

`ci.yml` 必跑：`typecheck`、`lint`、`build`、`test`、`audit`、`test:ui`（仅 `e2e/smoke`，覆盖 demo 与 starter）。

额外检查（脚本或 lint 规则实现）：

1. 除 `ui`、`shell` 外，所有包 `private: true`。
2. `templates/starter/package.json` 不得出现 `@marismoon/config`。
3. 任意包不得深层导入 `@marismoon/ui/src/*`、`@marismoon/shell/src/*`。

`e2e/visual/` 不进默认 CI；基线在 Linux 容器生成，避免 macOS 与 CI 字体差异误报。

## 9. ADR（写入 `docs/decisions/`，每条一页）

1. 取消 `packages/core`
2. shell 不依赖 router 与 i18n
3. starter 自包含，不依赖 config
4. CSS 两段显式导入（先 `@marismoon/ui/styles`，再 `@marismoon/shell/styles`，互不嵌套）
5. shadcn 基础组件保持扁平，自研组件一组件一目录

## 10. 文件迁移映射

| 原位置 | 新位置 |
|---|---|
| `apps/web` | `apps/demo`（单独一次 `git mv` 提交） |
| `apps/web/src/components/layout/*`（除 `workspace-modules.ts`） | `packages/shell/src/components/<Name>/` |
| `layout/layout.css` | `packages/shell/src/styles/layout.css` |
| `layout/workspace-modules.ts`、`app/workspace-pages` | 类型 → `shell/types/nav.ts`；具体菜单 → `demo/app/workspace-pages` |
| `features/copilot`（含 `CopilotPanel`、`useCopilot`） | `apps/demo/src/features/copilot`，经 slot 挂载 |
| `packages/core/src/mocks`、`types` | 对应 `apps/demo/src/features/<feature>/mocks`、`types`；跨 feature 的放 `demo/shared` |
| `packages/core/src/format.ts` | `packages/ui/src/lib/format.ts`；删除 `packages/core` |
| 外壳固定文案 i18n | demo 在 `lib/i18n` 映射成 `ShellLabels` 注入 |
| 业务词条 i18n | 留在 `apps/demo/src/lib/i18n/locales` |
| 现有 Playwright E2E | `apps/demo/e2e/smoke` |
| 新增冒烟 | `templates/starter/e2e/smoke.spec.ts` |
| `eslint.config.js` 颜色字面量豁免路径 | 改指向 `packages/shell/**`、`packages/ui/**`，移除 `apps/web` 旧路径 |

## 11. 执行步骤

每一步结束必须能通过 `pnpm typecheck && pnpm lint && pnpm build && pnpm test`，并单独提交。

0. **前置**：当前分支 `layout.css` 有未提交改动，先确认并提交或由用户处理；然后在 `apps/web` 用 Playwright 对全部页面 × Light/Dark × glass/clean 截基线图（存放 `e2e/visual`，不进默认 CI）。
1. **改名**：`apps/web` → `apps/demo`（纯 `git mv`，仅改引用与包名），单独提交。
2. **Catalog**：引入 `catalog:` / `catalogs.dev`，各包切换，不改业务代码。
3. **config 包**：创建 `packages/config`，把 eslint / tsconfig 共享并让 ui、demo 引用；补依赖方向规则与颜色豁免路径。
4. **取消 core**：`format.ts` → `ui/lib`；mocks、types 迁入 demo features；处理 `CommandPalette` 对 `mocks/bills` 的依赖。
5. **就地解耦（先不搬文件）**：在 demo 内完成路由适配、`ShellLabels`、导航 Schema、slot、`CommandPalette` 数据注入、`LanguageControl` 受控化。**第一项任务**：核对 `layout.css` 用到的 `--glass-*` / `--sidebar-*` 变量是否全部定义在 `ui/styles`，有定义在 demo 样式里的先归位到 ui。
6. **机械搬迁**：把已解耦的 `layout/` 整体移入 `packages/shell`，同步样式入口、`@source`、`exports`、ESLint 规则；跑视觉对比，必须与基线一致。
7. **starter**：创建最小骨架（home + settings 占位、最小 AppShell / 主题 / i18n / React Query）、自包含 tsconfig 与 eslint、精简版 `AGENTS.md`、冒烟 E2E，并纳入 workspace 与 CI。
8. **文档与 CI**：更新 `AGENTS.md`、`README.md`、`docs/`（含 ADR）；补 `audit` 脚本；加入 §8 的三项检查；`.changeset/` 仅预留。
9. **全量验证并汇报**：依次跑通 `pnpm typecheck`、`pnpm lint`、`pnpm build`、`pnpm test`、`pnpm test:ui`（覆盖 `apps/demo` 与 `templates/starter` 冒烟），汇报每项结果。

## 12. 风险与对策

| 风险 | 对策 |
|---|---|
| Tailwind v4 `@source` 跨包漏类名，样式悄悄消失 | 步骤 0 基线截图，步骤 6 对比 |
| `layout.css` 依赖的变量定义在 demo | 步骤 5 第一项核对并归位 |
| 隐式业务依赖（`CommandPalette`、`useCopilot`）抽离时才暴露 | 先在 demo 内解耦再搬文件 |
| i18n 词条归属混乱 | 逐条梳理，外壳固定文案进 `ShellLabels`，业务词条留 demo，不整体搬 |
| starter 腐烂 | 纳入 workspace 与 CI 冒烟 |
| 误发布非发布包 | `private: true` + CI 检查 |
| shadcn CLI 路径失配 | `ui/src/ui` 保持扁平，`components.json` 对齐 |

## 13. 验收标准

- 全部页面视觉与重构前一致（Light/Dark × glass/clean），i18n 中英文覆盖不退化。
- `packages/shell` 的 `package.json` 与源码中不出现 `react-router`、`i18next`、`react-i18next`、`@marismoon/core`、`features/*` 引用。
- `apps/demo` 与 `templates/starter` 只通过公开导出路径消费 `ui` / `shell`。
- §8 三项检查在 CI 中生效；`pnpm audit` 脚本可用。
- §11 步骤 9 的五项命令全部通过，并给出结果汇报。
