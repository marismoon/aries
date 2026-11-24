# 起步应用开发契约

本应用通过公开入口使用 UI 与 Shell。页面、导航、翻译及业务数据由应用维护。完整约定见[工作区开发契约](../../AGENTS.md)，外壳接口见[Shell 文档](../../packages/shell/README.md)。

## 布局契约（最高优先级）

三列外壳（第一列图标栏、第二列目录、第三列主区与页头）来自 `@marismoon/shell`，所有页面共用，**新增或修改内容时布局保持不变**。

- **MUST** 只在主区的内容区里放东西：页面就是 `src/features/<name>/` 中的内容组件，由 `WorkspacePage` 渲染到页面内容区（`.page-content-viewport`）中。页面标题来自 `src/app/workspace-modules.ts` 注册项的 `titleKey`，不在页面里另画页头。
- **MUST NOT** 在 CSS 中选择或覆盖外壳类名（`.app-shell`、`.icon-rail`、`.workspace-nav*`、`.workspace-main`、`.page-header*`、`.page-content*` 等），也不得重定义布局令牌（`--rail-*`、`--icon-rail-*`、`--workspace-*`、`--column-height` 等）。
- **MUST NOT** 在页面代码中使用外壳类名去模仿外壳结构，不得自建页头、侧栏、整页容器或第二个纵向滚动层；长内容交给页面内容区滚动，宽表格在自身容器内横向滚动。
- **MUST NOT** 为了页面需求改动 `src/app/shell-adapter.tsx`、`router.tsx`、`providers.tsx` 中 `AppShell` 的结构与接线；新增模块只改 `workspace-modules.ts`。
- 若需求确实要求改变外壳布局，停下并说明原因，由维护者在 `@marismoon/shell` 中修改，而不是在应用里覆盖。

两道检查守住这份契约，**提交前必须通过**：

- `pnpm lint` 会运行 `scripts/check-layout.mjs`，拦截上述 CSS 覆盖、布局令牌和外壳类名的使用。
- `pnpm test:ui` 中的 `e2e/layout.spec.ts` 逐个打开第一列的每个模块、第二列的每个目录链接，在 1440×900 下核对各列位置与宽度、图标居中、页头位置、页面不整体滚动、内容区之外没有额外的滚动层。新页面会被自动覆盖。**MUST NOT** 为了让测试通过而修改其中的期望值；只有升级 `@marismoon/shell` 且其布局有意调整时，才随升级一起更新。

## 开发约定

- **新增页面**。在 `src/features/<name>/` 编写内容组件，在 `src/app/workspace-modules.ts` 登记路由与导航，并补齐中英文资源。
- **样式与交互**。颜色、尺寸和圆角使用[设计令牌](../../docs/DESIGN_SYSTEM.md)，通过令牌适配明暗与 glass/clean。禁止新增暗色变体和硬编码颜色。优先复用 `@marismoon/ui` 的组件。尊重减少动效偏好，触屏控件点击目标至少 40px。
- **自检**。在应用目录运行 `pnpm typecheck`、`pnpm lint`、`pnpm build`、`pnpm test` 和 `pnpm test:ui`。保留路由导航、中英文切换与布局契约用例。
