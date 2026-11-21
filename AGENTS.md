# AGENTS.md — Marismoon 工作区开发契约

本文件是给人类开发者和 AI 编程助手的**可执行契约**。所有路径、包名、脚本、变量名均来自本仓库真实代码。
关键词含义：**MUST** 必须；**SHOULD** 应当（有充分理由可例外并在 PR 说明）；**MUST NOT** 严禁。

> 本仓库是脱敏后的启动模板。`apps/web` 中的「系统设置 → 组件预览 / 动效 / 基础页面」以及 overview、bills、copilot 是**调试与示例页面**，正式项目开发完成后会删除；`packages/*` 是需要长期保留的共享层。

## 0. 速查

| 项 | 值 |
| --- | --- |
| 包管理 / 任务 | pnpm 12.16.1（workspace）+ Turborepo；Node ^24 |
| 包 | `@marismoon/web`（apps/web）、`@marismoon/ui`（packages/ui）、`@marismoon/core`（packages/core） |
| 启动 | `pnpm install` → `pnpm dev`（Vite，<http://localhost:5173>） |
| 自检 | `pnpm typecheck` · `pnpm lint` · `pnpm build` · `pnpm test` · `pnpm test:ui` |
| 详细文档 | [架构](docs/ARCHITECTURE.md) · [技术栈](docs/TECH_STACK.md) · [设计系统](docs/DESIGN_SYSTEM.md) · [组件](docs/COMPONENTS.md) · [国际化](docs/I18N.md) |

## 1. Monorepo 边界

依赖方向只能是 `apps/web → packages/ui`、`apps/web → packages/core`，`packages/ui` 与 `packages/core` 互不依赖。

| 位置 | 职责 | 禁止 |
| --- | --- | --- |
| `packages/ui` | shadcn 基础组件（`components/ui`）、共享组合组件（`components/shared`）、Solar 图标（`components/icons`）、动效（`components/motion`）、`lib/utils`、`lib/storage`（主题偏好）、`hooks/use-mobile`、**全部全局样式与设计令牌**（`styles/`） | MUST NOT 导入 `apps/web`、`@/` 别名、业务数据 |
| `packages/core` | 与 UI 无关的类型（zod）、格式化函数（`format.ts`）、Mock 数据与 Mock 服务 | MUST NOT 依赖 React 或 `@marismoon/ui` |
| `apps/web` | 应用外壳（`components/layout`）、路由（`app/`）、页面与业务（`features/`）、i18n（`lib/i18n`） | MUST NOT 复制 `packages/ui` 的组件或样式 |

1. **MUST** 通过包导出路径使用共享层：`@marismoon/ui/ui/<name>`、`@marismoon/ui/shared/<name>`、`@marismoon/ui/motion/<name>`、`@marismoon/ui/icons`、`@marismoon/ui/lib/<name>`、`@marismoon/ui/hooks/<name>`、`@marismoon/ui/styles/<file>`、`@marismoon/core/<path>`（映射见各包 `package.json` 的 `exports`）。
2. **MUST NOT** 使用 `@marismoon/ui/src/...` 深层路径；**MUST NOT** 在 `packages/ui` 内使用 `@/` 别名（包内一律相对路径）。`@/` 只在 `apps/web` 内表示 `apps/web/src`。
3. 应用内分层 `components/layout ← features ← app`：下层 **MUST NOT** 导入上层。`eslint.config.js` 已对 `packages/ui` 强制「不得导入 `apps/web`」与「`components/ui`、`lib` 不得导入 `shared`」。
4. **MUST** 仅用 `pnpm`；**MUST NOT** 提交 `package-lock.json` / `yarn.lock`。

## 2. 新增内容的唯一入口

| 需求 | 做法 |
| --- | --- |
| 新业务模块（第一列） | **MUST** 在 `apps/web/src/components/layout/workspace-modules.ts` 注册导航数据，由共享 Sidebar 渲染 |
| 新页面 | **MUST** 在 `apps/web/src/app/workspace-pages.tsx` 注册 `WorkspacePageConfig`（`id/moduleId/path/titleKey/breadcrumbs/load`），业务组件放 `apps/web/src/features/<name>/`，文案键加入 `apps/web/src/lib/i18n/resources.ts` |
| 新 shadcn 组件 | **SHOULD** 用 `pnpm dlx shadcn@latest add <name>`（先 `shadcn view` 看官方实现；`components.json` 的别名已指向 `@marismoon/ui`，**该 CLI 流程在拆包后未经验证**，不通过时手动落到 `packages/ui/src/components/ui`）；**MUST NOT** 对现有项目重新执行 `shadcn init`（预设 `b27GcrRo`：radix / rhea / neutral / Inter） |
| 新共享组合组件 | **MUST** 放 `packages/ui/src/components/shared`，并同步 [docs/COMPONENTS.md](docs/COMPONENTS.md) |
| 新图标 | **MUST** 只用 Solar：从 `@marismoon/ui/icons` 引入；缺图标时在 `components/icons/solar` 增文件并在 `index.ts` 导出。变体规则见 §3.1 |
| 新主题色 | **MUST** 在 `packages/ui/src/styles/tokens.css` 增 `[data-palette="…"]` 块（亮、暗各一），在 `dark-base.css` 增该主题的 `--dark-hue`，并登记 `lib/storage.ts` 的 `paletteLabels` 与 `--swatch-*`；步骤与对比度底线见 [DESIGN_SYSTEM §9](docs/DESIGN_SYSTEM.md) |

## 3. 视觉与主题红线

> 当前仓库仍有少量**历史遗留**违例：组件预览/动效演示的 CSS 与 `examples/*` 中的 `dark:`，以及 `lib/highlighter.tsx` 里 shiki 双主题所需的 `dark:`（代码高亮的官方写法，保留）。AI 助手的流光色值已进入 `tokens.css`（`--ai-*-base`、`--glow-*`、`--copilot-surface-clear`），在线状态点使用 `--success`。下列规则对**新增与被修改的代码**生效；不要为了清理遗留而改动已确认的视觉。

1. **MUST** 颜色只使用主题变量（`--primary`、`--accent`、`--muted`、`--destructive`、`--success`、`--warning`、`--danger`、`--info`、`--chart-1..8` 等，见 [DESIGN_SYSTEM](docs/DESIGN_SYSTEM.md)）。
2. **MUST NOT** 在 `apps/web/src/features` 与 `components/layout` 的新代码中写十六进制/rgb/hsl 颜色；**MUST NOT** 用 `style={{ color/background… }}` 写死颜色（动态值只能引用 `var(--token)`，如 `StatusBadge`）。颜色字面量只允许出现在 `packages/ui/src/styles/*.css` 的令牌定义中。
3. **MUST NOT** 新增 `dark:` 变体。深色适配**优先通过令牌**（`.dark` 块）完成；`dark:` 仅允许出现在 `packages/ui/src/components/ui` 的 shadcn 组件内（沿用官方写法）。
4. **MUST NOT** 修改已确认的亮色（Light）视觉去适配深色；深色问题只改 `.dark` 作用域。暗色共同底座（亮度阶梯、发丝线、语义色）在 `styles/dark-base.css`，glass 与 clean 共用；「简洁暗色」材质在 `styles/dark-clean.css`，作用域 `.dark[data-dark-style="clean"]`（详见 [DESIGN_SYSTEM §2](docs/DESIGN_SYSTEM.md)）；`marismoon-light` 主题为纯浅色，**MUST NOT** 给它增加深色分支。
5. **MUST** 以「系统设置 → 组件预览」为唯一规范：不写 `size` 的 `Button/Input/SelectTrigger` 即 32px 标准控件；按钮分三级：**页面级主操作**（登录卡片的「登录」、向导与表单提交）40px，写 `size="default"`；**组件与浮层内的操作**（配置、设置、对话框/抽屉/AlertDialog/Sheet 页脚、空状态按钮）32px，不写 `size`；**小浮层**（`AlertDialog size="sm"`、小 Popover、Toast 操作）28px，写 `size="small"`（AlertDialog sm 由 `popup.css` 自动处理）。触屏下自动放大到 ≥40px。字号只用 11/12/13/14/15/20px；控件与表格正文 13px，表头与标签 12px。
6. **MUST** 圆角走令牌：控件 `--radius-workspace-control`，卡片/面板 `--radius-panel`，卡片内分组 `--radius-control`；**MUST NOT** 使用方角。
7. **MUST** 表单控件统一 `field-surface` 外观；聚焦样式唯一（`--glow-line` 1px 渐变边），**MUST NOT** 叠加 outline/ring；暗色下文本控件的静止边框用真实 1px `--field-edge`，**MUST NOT** 再用 `--field-shadow` 内描边环叠一层。
8. **MUST NOT** 页面样式覆盖全局布局与页头规则；页面 CSS 只负责业务区。
9. 带阴影的元素位于 `overflow` 非 visible 的容器内时，**MUST** 预留不小于阴影外延的出血（padding 加等量负 margin）。
10. 已确认的布局、尺寸、材质和视觉样式变更 **MUST** 先取得确认。

### 3.1 图标变体

1. 默认 **Linear**（`*-linear.tsx`）；选中或悬停时切换为同名 **Bold**（`*-bold.tsx`）。**MUST NOT** 使用 Broken、Line Duotone 等其他变体（Line Duotone 暂未引入，仅作预留扩展，引入前需设计确认）。
2. 所有图标 **MUST** 是 `24×24` 网格、颜色只来自 `currentColor`；Linear 与 Bold 同网格，切换不得改变尺寸或布局。
3. 有选中态的控件内图标写 `<AppIcon icon={…} stateful />`：同时渲染 Linear 与 Bold，由 `styles/icon-states.css` 按 `:hover`（仅非禁用、`hover: hover`）、`aria-current`、`aria-selected="true"`、`aria-pressed="true"`、`data-state=active|on|open` 切换。**MUST NOT** 用 JS 状态手动换图标；有 `aria-label` 的图标不参与切换。
4. 新增 Bold 时 **MUST** 同时补同名 Linear，并在 `components/icons/icon-variants.ts` 登记。只给会进入选中/悬停态的图标补 Bold（目前：一级模块与第二列导航用到的 18 个），**MUST NOT** 给纯展示图标批量补齐。
5. `icons.test.ts` 校验：仅 Linear/Bold、Bold 有 Linear 底图并登记、`viewBox` 与尺寸、无字面颜色。

## 4. 布局、滚动与卡片契约

1. 所有业务路由 **MUST** 挂载在同一个 `AppShell` 下：第一列 `IconRail`、第二列 `WorkspaceNav`、第三列 `MainWorkspace`；页面经 `WorkspacePage` 渲染 `PageHeader`。**MUST NOT** 复制这些 JSX/CSS 到业务页面。
2. `PageHeader` 右侧控件由 `WorkspaceControls` 统一渲染（`LanguageControl`、`BrandPaletteControl`、`ThemeSwitcher`，暗色模式另有 `DarkStyleControl`）；页面专属操作 **MUST** 放在业务区。
3. **滚动**：AppShell 固定在视口内，body 不滚动；第三列只有 `PageContentViewport` 做业务纵向滚动；第二列只有导航内容区滚动；AI 助手只有消息区滚动。**MUST NOT** 页面自建冲突滚动层，**MUST NOT** 用全局事件拦截滚动/输入。
4. **卡片**：同一卡片在相同视口与断点下外部尺寸稳定；Tabs、筛选、分页、加载不改变卡片宽高；内容溢出、空状态、加载状态由卡片内部负责；**MUST NOT** 拉伸列表行填满卡片。
5. **表格**：**MUST** 通过 `@marismoon/ui/shared/DataTable` + `useDataTable`（TanStack Table + shadcn Table）渲染，业务只提供列、单元格和列宽（`--column-fraction`）；**MUST NOT** 复制 Table JSX/CSS；每列用 `columnAlign` 声明对齐；行内操作用文字按钮打开抽屉，不用二级菜单。

## 4.1 国际化

1. 新增页面与组件的用户可见文案（含 `aria-label`、`title`）**MUST** 走 i18n，**MUST NOT** 在 `apps/web` 的新代码中新写死中文；用法见 [docs/I18N.md](docs/I18N.md)。
2. 页面标题/副标题用点号键（`resources.ts` 中 `zh-CN` 与 `en` **MUST** 同时新增）；导航与短文案用 `useUiText()` 的 `tl("中文原文")` 并在 `ui-en.ts` 补英文。
3. 导航与 Mock 数据保持中文原文，在渲染处翻译；`packages/ui` **MUST NOT** 依赖 i18next，固定文案走 `UiLabels`（`@marismoon/ui/lib/ui-labels`）与 `UiLabelsBridge`。
4. 提交前 `coverage.test.ts` 会检查所有 `tl("…")` 字面量有英文；英文下 `e2e/i18n.spec.ts` 扫描页面不得残留中文。

## 5. 动效与无障碍

1. 动效统一使用 `motion`（`LazyMotion` + `domAnimation`，**不使用 layout 动画**）与 `packages/ui/src/styles/motion.css`、`components/motion/motion-tokens.ts` 中的缓动与时长；金额与数字 **MUST NOT** 做滚动/跳动动画，**MUST NOT** 使用弹簧回弹。
2. **MUST** 支持 `prefers-reduced-motion: reduce`：新增 CSS 动画/过渡必须在该媒体查询下关闭或降到 0.01ms；JS 动效用 `useReducedMotion`。加载转圈（`animate-spin`）是唯一例外：它承载「正在加载」的含义，减少动态效果下保留为慢速旋转；常驻 `will-change` 只能在动画运行时存在。
3. 触控：`pointer: coarse` 下控件点击目标 **MUST** ≥ 40px（使用 `--control-size-*` 令牌与 `pointer-coarse:` 变体；自定义高度的小控件在 `@media (pointer: coarse)` 里用 `var(--control-size-dense)` 放大，`e2e/touch-targets.spec.ts` 覆盖概览与导航的几处）。
4. 键盘与语义：交互元素 **MUST** 可键盘操作，图标按钮 **MUST** 有 `aria-label`；`eslint-plugin-jsx-a11y` 已启用。
5. 弹层（Select、Drawer、AI 助手）**MUST** 适应视口边界，Drawer 头部与底部可达，Body 独立滚动。

## 6. 响应式

PC（1440×900、1920×1080）为视觉基线。断点：≤700px 手机（顶栏 + 工作区导航对话框），701–899px iPad 竖屏（第二列默认收起），≥900px 三列。**MUST NOT** 复制独立的 Mobile 页面；表格用自身局部横向滚动，**MUST NOT** 整体横向移动 AppShell。

## 7. 代码规范

- TypeScript strict，`noUncheckedIndexedAccess`、`erasableSyntaxOnly`（不使用 enum/namespace）；Prettier（无分号、双引号、`prettier-plugin-tailwindcss`）。
- `import-x/no-cycle` 为 error。
- **SHOULD** 先复用 `@marismoon/ui` 现有组件，其次组合，最后才新增。
- **MUST NOT** 引入与现有栈冲突的库（见 [TECH_STACK](docs/TECH_STACK.md) 的「禁止清单」）。
- **MUST NOT** 提交密钥、真实客户/账单数据；环境变量只放 `.env.example` 的占位（`VITE_API_BASE_URL`）。

## 8. 提交前自检清单

在仓库根目录依次执行，**全部通过**才可提交：

```bash
pnpm typecheck     # turbo: @marismoon/core、@marismoon/ui、@marismoon/web
pnpm lint          # eslint .
pnpm build
pnpm test          # vitest（core + web）
pnpm test:ui       # playwright（首次：pnpm --filter @marismoon/web exec playwright install chromium）
```

另需人工核对：

- [ ] **令牌合规**：`git diff -U0 | grep -nE '^\+.*(#[0-9a-fA-F]{3,8}\b|rgb\(|hsl\()'` 在 `apps/web` 下无新增命中
- [ ] **无新增 `dark:`**：`git diff -U0 | grep -n '^\+.*dark:'` 无命中
- [ ] **响应式**：1920×1080、1440×900、1280×800、1024×768、820×1180、768×1024、430×932、390×844、375×667 下无横向溢出、无重叠
- [ ] **主题**：Light / Dark 与品牌轮换后页头控件数量、图标、位置一致
- [ ] **`prefers-reduced-motion`**：开启后无残留动画
- [ ] **公共 UI 变更**：Overview、Bills、Sidebar、AI 助手、组件预览页回归；对比修改前后截图与关键元素尺寸
- [ ] 新共享组件已同步 [docs/COMPONENTS.md](docs/COMPONENTS.md)；新令牌已同步 [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md)

## 9. 给 AI 助手的工作方式

1. 先读本文件和 `docs/`，再动代码；不确定就问，不要猜测路径或 API。
2. 外科手术式修改：每一行改动都应能追溯到需求；不顺手重构、不改相邻格式。
3. 定义可验证目标（测试/截图/类型检查）并循环到通过。
4. 发现无关的坏代码只报告，不擅自删除。
