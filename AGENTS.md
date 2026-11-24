# AGENTS.md — Marismoon 工作区开发契约

本文件是给人类开发者和 AI 编程助手的**可执行契约**。所有路径、包名、脚本、变量名均来自本仓库真实代码。
关键词含义：**MUST** 必须；**SHOULD** 应当（有充分理由可例外并在 PR 说明）；**MUST NOT** 严禁。

文档优先级：本文件与 `docs/` 冲突时以本文件为准；`docs/` 提供令牌定义、组件接口与操作细节，同一规则尽量只在一处完整定义，其余位置给出链接。

> 新项目从 [Starter](docs/STARTER.md) 起步。`apps/demo` 中的「系统设置 → 组件预览 / 动效 / 基础页面」以及 overview、bills、copilot 是**调试与示例页面**，保留为框架的回归基线。

## 0. 速查

| 项 | 值 |
| --- | --- |
| 包管理 / 任务 | pnpm 12.16.1（workspace）+ Turborepo；Node ^24 |
| 包 | `@marismoon/demo`（apps/demo）、`@marismoon/starter`（templates/starter）、`@marismoon/shell`（packages/shell）、`@marismoon/ui`（packages/ui）、`@marismoon/config`（packages/config） |
| 启动 | `pnpm install` → `pnpm dev`（Vite，默认 <http://localhost:5173>，被占用时端口递增）；`pnpm dev:starter` 启动模板（默认 5174） |
| 自检 | `pnpm typecheck` · `pnpm lint` · `pnpm build` · `pnpm test` · `pnpm test:ui` · `pnpm check:workspace` |
| 单个 e2e | `pnpm --filter @marismoon/demo exec playwright test e2e/<name>.spec.ts`（Playwright 自动启动 Vite，端口 4173） |
| 详细文档 | [架构](docs/ARCHITECTURE.md) · [技术栈](docs/TECH_STACK.md) · [设计系统](docs/DESIGN_SYSTEM.md) · [组件](docs/COMPONENTS.md) · [国际化](docs/I18N.md) · [Starter](docs/STARTER.md) · [版本治理](docs/VERSIONING.md) |

## 1. Monorepo 边界

Demo 和 Starter 各自通过公开入口使用 Shell 与 UI；Shell 只依赖 UI。应用之间不得互相导入。Demo、Shell 与 UI 的 TypeScript 配置、根 ESLint 配置通过开发依赖引用 `@marismoon/config`。

| 位置 | 职责 | 禁止 |
| --- | --- | --- |
| `packages/ui` | shadcn 基础组件（`components/ui`）、共享组合组件（`components/shared`）、Solar 图标（`components/icons`）、动效（`components/motion`）、`lib/utils`、`lib/format`（金额与时间）、`lib/storage`（主题偏好）、`hooks/use-mobile`、**全部全局样式与设计令牌**（`styles/`） | MUST NOT 导入 `apps/demo`、`@/` 别名、业务数据 |
| `packages/shell` | 三列外壳、导航、页面布局、命令面板与布局样式（见 [外壳 API](packages/shell/README.md)） | MUST NOT 导入应用代码、路由库、国际化库或业务数据 |
| `templates/starter` | 可复制的首页、设置和宿主接线，见 [Starter 开发契约](templates/starter/AGENTS.md) | MUST NOT 依赖共享工程配置或 Demo 代码 |
| `packages/config` | 同仓共享的 ESLint 与 TypeScript 配置（private） | 仅用于开发工具 |
| `apps/demo` | 外壳接线与路由（`app/`）、页面与业务（`features/`）、跨功能 Mock 与业务类型（`shared/`）、i18n（`lib/i18n`） | MUST NOT 复制 `packages/ui` 的组件或样式 |

1. **MUST** 通过包导出路径使用共享层（UI 路径总表见 [COMPONENTS.md](docs/COMPONENTS.md) 开头，映射来自各包 `package.json` 的 `exports`）。
2. **MUST NOT** 使用 `@marismoon/ui/src/...` 或 `@marismoon/shell/src/...` 深层路径；**MUST NOT** 在 `packages/ui` 内使用 `@/` 别名（包内一律相对路径）。Demo 与 Starter 的 `@/` 均指向各自的 `src/`。
3. 分层 `packages/shell ← apps/demo/src/features ← apps/demo/src/app`：下层 **MUST NOT** 导入上层。`eslint.config.js` 已对 `packages/ui` 强制「不得导入 `apps/demo`」与「`components/ui`、`lib` 不得导入 `shared`」。
4. **MUST** 仅用 `pnpm`；**MUST NOT** 提交 `package-lock.json` / `yarn.lock`。

## 2. 新增内容的唯一入口

下表中的业务模块、页面注册路径适用于 Demo。Starter 的注册表和双语页面接线见[起步指南](docs/STARTER.md)。

| 需求 | 做法 |
| --- | --- |
| 新业务模块（第一列） | **MUST** 在 `apps/demo/src/app/workspace-modules.ts` 注册导航数据，由 Demo 构造已翻译的导航 Schema 后交给共享 Sidebar 渲染 |
| 新页面 | **MUST** 在 `apps/demo/src/app/workspace-pages.tsx` 注册 `WorkspacePageConfig`：`id`、`moduleId`、`path`、`titleKey`、`descriptionKey?`、`breadcrumbs`（`readonly { label: string; path?: string }[]`）、`load`（`() => Promise<WorkspacePageSlots>`，懒加载页面槽位）；业务组件放 `apps/demo/src/features/<name>/`，文案键加入 `apps/demo/src/lib/i18n/resources.ts`。要让页面出现在导航里，还需在 `apps/demo/src/app/workspace-modules.ts` 对应模块下增加条目（字段见该文件的 `WorkspaceEntry` 类型） |
| 新 shadcn 组件 | **SHOULD** 用 `pnpm dlx shadcn@latest add <name>`（先 `shadcn view` 看官方实现）。`apps/demo/components.json` 与 `packages/ui/components.json` 的别名均指向 `@marismoon/ui`（style `radix-rhea`、baseColor `neutral`）；拆包后该 CLI 流程**待验证**，失败时手动写入 `packages/ui/src/components/ui`。**MUST NOT** 对现有项目重新执行 `shadcn init` |
| 新共享组合组件 | **MUST** 放 `packages/ui/src/components/shared`，并同步 [docs/COMPONENTS.md](docs/COMPONENTS.md) |
| 新图标 | **MUST** 只用 Solar：从 `@marismoon/ui/icons` 引入；缺图标时在 `components/icons/solar` 增文件并在 `index.ts` 导出。变体规则见 §3.1 |
| 新主题色 | **MUST** 按 [DESIGN_SYSTEM §9](docs/DESIGN_SYSTEM.md) 的步骤：`tokens.css` 增亮、暗两块，`dark-base.css` 增该主题的 `--dark-hue`，`spectrum.css` 或 `tokens.css` 增 `--swatch-*`，`lib/storage.ts` 的 `paletteLabels` 登记 |

## 3. 视觉与主题红线

以下规则对**新增与被修改的代码**生效；**MUST NOT** 为清理存量而改动已确认的视觉。存量豁免（不得扩大）：

- 颜色字面量沿用 [boundaries.js 中列出的七个 CSS 文件](packages/config/eslint/boundaries.js)，其中外壳样式为 `packages/shell/src/styles/layout.css`，按 §9 人工核对。
- `dark:` 变体：`apps/demo/src/features/settings/examples/*`（官方示例写法）与 `apps/demo/src/lib/highlighter.tsx`（shiki 双主题）。

1. **MUST** 颜色只使用主题变量（`--primary`、`--accent`、`--muted`、`--destructive`、`--success`、`--warning`、`--danger`、`--info`、`--chart-1..8` 等，完整列表见 [DESIGN_SYSTEM §3](docs/DESIGN_SYSTEM.md)）。
2. **MUST NOT** 在 `apps/demo/src/features` 与 `packages/shell/src` 的新代码中写十六进制、`rgb()`、`hsl()`、`oklch()` 颜色；**MUST NOT** 用 `style={{ color/background… }}` 写死颜色（动态值只能引用 `var(--token)`，如 `StatusBadge`）。颜色字面量只允许出现在 `packages/ui/src/styles/*.css` 的令牌定义中。
3. **MUST NOT** 新增 `dark:` 变体。深色适配**优先通过令牌**（`.dark` 块）完成；`dark:` 仅允许出现在 `packages/ui/src/components/ui` 的 shadcn 组件内（沿用官方写法）。
4. **MUST NOT** 修改已确认的亮色（Light）视觉去适配深色；深色问题只改 `.dark` 作用域。暗色共同底座在 `styles/dark-base.css`（glass 与 clean 共用），简洁暗色材质在 `styles/dark-clean.css`（作用域 `.dark[data-dark-style="clean"]`），规则见 [DESIGN_SYSTEM §2](docs/DESIGN_SYSTEM.md)。
   `marismoon-light` 为纯浅色主题，**MUST NOT** 给它增加深色分支（`tokens.css` 中已有的 `.dark[data-palette="marismoon-light"]` 块只用于让它在暗色类下保持浅色）。
5. **MUST** 以「系统设置 → 组件预览」（模板阶段）与 [COMPONENTS.md](docs/COMPONENTS.md) 为组件规范；预览页删除后以 COMPONENTS.md 为准。不写 `size` 的 `Button/Input/SelectTrigger` 即 32px 标准控件；页面级主操作用 `size="default"`（40px），小浮层用 `size="small"`（28px），适用范围见 [COMPONENTS §5](docs/COMPONENTS.md)。字号与控件高度只使用 [DESIGN_SYSTEM §3](docs/DESIGN_SYSTEM.md) 的令牌。
6. **MUST** 圆角走令牌：控件 `--radius-workspace-control`，卡片/面板 `--radius-panel`，卡片内分组 `--radius-control`；**MUST NOT** 使用方角。
7. **MUST** 表单控件统一 `field-surface` 外观，聚焦样式唯一，**MUST NOT** 叠加 outline/ring；规则与暗色边框见 [DESIGN_SYSTEM §2.4、§5](docs/DESIGN_SYSTEM.md)。
8. **MUST NOT** 页面样式覆盖全局布局与页头规则；页面 CSS 只负责业务区。
9. 带阴影的元素位于 `overflow` 非 visible 的容器内时，**MUST** 预留不小于阴影外延的出血（padding 加等量负 margin）。
10. 已确认的布局、尺寸、材质和视觉样式变更 **MUST** 先取得确认。

### 3.1 图标变体

1. 默认 **Linear**（`*-linear.tsx`）；选中或悬停时切换为同名 **Bold**（`*-bold.tsx`）。**MUST NOT** 使用 Linear 与 Bold 之外的变体（Broken、Line Duotone 等）；确需引入 Line Duotone 时先取得设计确认。
2. 所有图标 **MUST** 是 `24×24` 网格、颜色只来自 `currentColor`；Linear 与 Bold 同网格，切换不得改变尺寸或布局。
3. 有选中态的控件内图标写 `<AppIcon icon={…} stateful />`：同时渲染 Linear 与 Bold，由 `styles/icon-states.css` 按 `:hover`（仅非禁用、`hover: hover`）、`aria-current`、`aria-selected="true"`、`aria-pressed="true"`、`data-state=active|on|open` 切换。**MUST NOT** 用 JS 状态手动换图标；有 `aria-label` 的图标不参与切换。
4. 新增 Bold 时 **MUST** 同时补同名 Linear，并在 `components/icons/icon-variants.ts` 登记。只给会进入选中/悬停态的图标补 Bold（现有配对见 [COMPONENTS §3](docs/COMPONENTS.md)），**MUST NOT** 给纯展示图标批量补齐。
5. `icons.test.ts` 校验：仅 Linear/Bold、Bold 有 Linear 底图并登记、`viewBox` 与尺寸、无字面颜色。

## 4. 布局、滚动与卡片契约

1. 所有业务路由 **MUST** 挂载在同一个 `AppShell` 下：第一列 `IconRail`、第二列 `WorkspaceNav`、第三列 `MainWorkspace`；页面经 `WorkspacePage` 渲染 `PageHeader`。**MUST NOT** 复制这些 JSX/CSS 到业务页面。
2. `PageHeader` 右侧控件由 `WorkspaceControls` 统一渲染，顺序为 `DarkStyleControl`（仅暗色模式显示）、`LanguageControl`、`BrandPaletteControl`、`ThemeSwitcher`；页面专属操作 **MUST** 放在业务区。
3. **滚动**：AppShell 固定在视口内，body 不滚动；第三列只有 `PageContentViewport` 做业务纵向滚动；第二列只有导航内容区滚动；AI 助手只有消息区滚动。**MUST NOT** 页面自建冲突滚动层，**MUST NOT** 用全局事件拦截滚动/输入。
4. **卡片**：同一卡片在相同视口与断点下外部尺寸稳定；Tabs、筛选、分页、加载不改变卡片宽高；内容溢出、空状态、加载状态由卡片内部负责；**MUST NOT** 拉伸列表行填满卡片。
5. **表格**：**MUST** 通过 `@marismoon/ui/shared/DataTable` + `useDataTable`（TanStack Table + shadcn Table）渲染，业务只提供列、单元格和列宽（`--column-fraction`）；**MUST NOT** 复制 Table JSX/CSS；每列用 `columnAlign` 声明对齐；行内操作用文字按钮打开抽屉，不用二级菜单。

## 5. 国际化

1. 新增页面与组件的用户可见文案（含 `aria-label`、`title`）**MUST** 走 i18n，**MUST NOT** 在 `apps/demo` 的新代码中新写死中文文案；用法见 [docs/I18N.md](docs/I18N.md)。
2. 页面标题/副标题用点号键（`resources.ts` 中 `zh-CN` 与 `en` **MUST** 同时新增）；导航与短文案用 `useUiText()` 的 `tl("中文原文")` 并在 `ui-en.ts` 补英文。
3. 导航与 Mock 数据本身保持中文原文（作为翻译键），在渲染处用 `tl()` 翻译；`packages/ui` **MUST NOT** 依赖 i18next，固定文案走 `UiLabels`（`@marismoon/ui/lib/ui-labels`）与 `UiLabelsBridge`。
4. `coverage.test.ts`（含在 `pnpm test`）检查所有 `tl("…")` 字面量有英文；`e2e/i18n.spec.ts`（含在 `pnpm test:ui`）扫描英文页面不得残留中文。

## 6. 动效与无障碍

1. 动效统一使用 `motion`（`LazyMotion` + `domAnimation`，**不使用 layout 动画**）与 `packages/ui/src/styles/motion.css`、`components/motion/motion-tokens.ts` 中的缓动与时长；金额与数字 **MUST NOT** 做滚动/跳动动画，**MUST NOT** 使用弹簧回弹。
2. **MUST** 支持 `prefers-reduced-motion: reduce`：新增 CSS 动画/过渡在该媒体查询下时长降到 0.01ms（`motion.css` 有全局兜底，新增动效仍须自检）；JS 动效用 `useReducedMotion`。唯一例外是加载转圈 `animate-spin`：它承载「正在加载」的含义，减少动态效果下保留为 2.4s 慢速旋转。常驻 `will-change` 只能在动画运行时存在。
3. 触控：`pointer: coarse` 下控件点击目标 **MUST** ≥ 40px（使用 `--control-size-*` 令牌与 `pointer-coarse:` 变体；自定义高度的小控件在 `@media (pointer: coarse)` 里用 `var(--control-size-dense)` 放大，`e2e/touch-targets.spec.ts` 覆盖概览与导航的几处）。
4. 键盘与语义：交互元素 **MUST** 可键盘操作，图标按钮 **MUST** 有 `aria-label`；`eslint-plugin-jsx-a11y` 已启用。
5. 弹层（Select、Drawer、AI 助手）**MUST** 适应视口边界，Drawer 头部与底部可达，Body 独立滚动。

## 7. 响应式

PC（1440×900、1920×1080）为视觉基线。断点与验收视口见 [DESIGN_SYSTEM §8](docs/DESIGN_SYSTEM.md)。**MUST NOT** 复制独立的 Mobile 页面；表格用自身局部横向滚动，**MUST NOT** 整体横向移动 AppShell。

## 8. 代码规范

- TypeScript strict，`noUncheckedIndexedAccess`、`erasableSyntaxOnly`（不使用 enum/namespace）；Prettier（无分号、双引号、`prettier-plugin-tailwindcss`）。
- `import-x/no-cycle` 为 error。
- **SHOULD** 先复用 `@marismoon/ui` 现有组件，其次组合，最后才新增。
- **MUST NOT** 引入与现有栈冲突的库（见 [TECH_STACK](docs/TECH_STACK.md) 的「禁止清单」）。
- **MUST NOT** 提交密钥、真实客户/账单数据；环境变量只放 `.env.example` 的占位（`VITE_API_BASE_URL`）。

## 9. 提交前自检清单

在仓库根目录依次执行，**全部通过**才可提交：

```bash
pnpm typecheck     # turbo: UI、Shell、Demo、Starter
pnpm lint          # eslint .
pnpm build
pnpm test          # vitest（ui、shell、demo、starter）
pnpm test:ui       # demo 全集 + starter 冒烟，首次先安装 Playwright Chromium
pnpm check:workspace
```

另需人工核对：

- [ ] **令牌合规**：`git diff -U0 -- apps/demo packages/shell | grep -nE '^\+.*(#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(|oklch\()'` 无新增命中（豁免文件见 §3）
- [ ] **无新增 `dark:`**：`git diff -U0 -- . ':!packages/ui/src/components/ui' | grep -n '^\+.*dark:'` 无命中
- [ ] **响应式**：[DESIGN_SYSTEM §8](docs/DESIGN_SYSTEM.md) 的验收视口下无横向溢出、无重叠（`e2e/responsive-adaptation.spec.ts` 已覆盖，改动页面再手动抽查）
- [ ] **主题**：Light / Dark（glass 与 clean）与品牌轮换后页头控件数量、图标、位置一致
- [ ] **`prefers-reduced-motion`**：开启后无残留动画
- [ ] **公共 UI 变更**：Overview、Bills、Sidebar、AI 助手、组件预览页回归；对比修改前后截图与关键元素尺寸
- [ ] **已确认的视觉变更**（§3 规则 10）已取得确认
- [ ] 新共享组件已同步 [docs/COMPONENTS.md](docs/COMPONENTS.md)；新令牌已同步 [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md)

## 10. 给 AI 助手的工作方式

1. 先读本文件和 `docs/`，再动代码；不确定就问，不要猜测路径或 API。
2. 发现无关的坏代码只报告，不擅自删除。
