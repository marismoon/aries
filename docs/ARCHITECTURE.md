# 架构

## 1. 包与依赖方向

```text
apps/demo (@marismoon/demo) ──► packages/ui (@marismoon/ui)
根 ESLint 配置、Demo 与 UI 的 TypeScript 配置 ──► packages/config (@marismoon/config)
```

| 包 | 入口（`exports`） | 内容 |
| --- | --- | --- |
| `@marismoon/ui` | `./ui/*` `./shared/*` `./motion/*` `./icons` `./icons/*` `./hooks/*` `./lib/*` `./styles/*`（直接导出源码，无构建步骤） | `src/components/{ui,shared,icons,motion}`、`src/hooks/use-mobile.ts`、`src/lib/{utils,format,storage}.ts`、`src/styles/*.css` |
| `@marismoon/config` | `./eslint/*`、`./typescript/*.json` | ESLint 的 base、react、boundaries 和 TypeScript 的 base、react、app 配置 |
| `@marismoon/demo` | — | `src/{app,components/layout,features,shared,lib,test}`、`e2e/` |

Demo 通过包导出路径引用 UI 源码，由 Vite 直接编译。`packages/ui` 内部只用相对导入。

## 2. apps/demo 目录

```text
apps/demo/src
├── main.tsx            入口：应用品牌/暗色风格偏好 → i18n → index.css → 渲染 App
├── index.css           @import "@marismoon/ui/styles/globals.css"; @source "./"
├── app/
│   ├── App.tsx         AppProviders + RouterProvider
│   ├── providers.tsx   QueryClient、next-themes、LazyMotion/MotionConfig（`reducedMotion="user"`）、TooltipProvider、演示状态；命令面板由 `AppShell` 内的 `CommandPaletteProvider` 提供
│   ├── router.tsx      AppShell 下按 workspacePages 生成懒加载路由；/ 重定向到 /overview
│   ├── command-items.ts  getModuleCommands 为命令面板提供当前模块的搜索条目
│   └── workspace-pages.tsx  页面注册表（WorkspacePageConfig）
├── components/layout/  AppShell、IconRail、WorkspaceNav(+NavTree/NavHighlight/SidebarNavItem)、MainWorkspace、PageHeader、WorkspaceControls、WorkspacePage、CommandPalette、workspace-modules.ts、layout.css
├── features/           overview、bills、copilot、settings（均为示例/调试页面）
├── shared/             跨功能的 Mock 数据、服务（mocks/）和业务类型（types/）
├── lib/                i18n（i18next 资源、语言存储、`useUiText`，见 I18N.md）、query-client.ts、highlighter.tsx（shiki）
└── hooks/use-highlighted-code.ts
```

## 3. 启动与运行时

1. `main.tsx` 调用 `applyStoredPalette()` / `applyStoredDarkStyle()`（来自 `@marismoon/ui/lib/storage`）在首帧前写入 `data-palette` / `data-dark-style`。
2. `AppProviders`：React Query → next-themes（`.dark` 类，存储键 `marismoon-theme`，默认跟随系统）→ motion（`LazyMotion` + `domAnimation`，`MotionConfig reducedMotion="user"`）→ TooltipProvider → 演示数据上下文。`ThemeColor` 监听 `class`/`data-palette` 同步 `<meta name="theme-color">`。
3. `router.tsx`：`AppShell` 作为布局路由，子路由由 `workspacePages` 生成，页面通过 `page.load()` 动态导入并以 `WorkspacePage` 渲染。

## 4. 三列外壳

| 列 | 组件 | 职责 |
| --- | --- | --- |
| 第一列 | `IconRail` | 模块入口（`module`）、AI 助手/头像/折叠（`action`）、Logo（`navigation`，回 `/overview`） |
| 第二列 | `WorkspaceNav` | 共用同一模板，模块切换只更新数据（`workspace-modules.ts`） |
| 第三列 | `MainWorkspace` → `WorkspacePageLayout` | 固定 `PageHeader`，仅 `PageContentViewport` 滚动 |

- 第一列入口类型：`module` 切换第二列数据；`action` 不改变路由和模块；`navigation` 由目标路由决定模块。
- 页面的模块归属与选中态**以路由为准**（页面配置的 `moduleId`）。
- `router.tsx` 将 Demo 的 `getModuleCommands` 传给 `AppShell`。外壳用当前模块调用它，将返回值通过 `commands` 传给 `CommandPaletteProvider`。
- 新增业务模块：在 `workspace-modules.ts` 注册（`WorkspaceEntry` 为 `route` / `folder` / `demo`）；新增页面：在 `workspace-pages.tsx` 注册，侧栏入口引用 `workspacePages.<id>.path`。
- `WorkspacePageSlots`：`Content`（必填）、`Subtitle`、`BreadcrumbDetail`、`Summary`。标题与面包屑来自页面配置（`titleKey` 经 i18n）。

## 5. 滚动边界

AppShell 固定视口；body 不滚动；仅 `PageContentViewport`（第三列）、第二列导航内容区、AI 助手消息区各自独立滚动；滚动不得传播导致 AppShell 移动。回归见 `e2e/scroll-boundary.spec.ts`、`e2e/workspace-scroll.spec.ts`。

## 6. 数据流

Demo 的 `@/shared/mocks/mock-service` 导出 `getDemoAttentionItems` 和 `getDemoBills`。两者模拟请求延迟，并用 `@/shared/types` 目录中的 Zod schema 校验返回值。页面通过各功能的 `useQuery` Hook 读取数据。概览专用的图表数据在 `features/overview/mocks/charts.ts`。接入真实后端时替换 Mock 服务并读取 `VITE_API_BASE_URL`。

## 7. 测试

| 层 | 工具 | 位置 |
| --- | --- | --- |
| 单测 | Vitest（Demo 使用 jsdom） | `packages/ui/src/**/*.test.{ts,tsx}`、`apps/demo/src/**/*.test.{ts,tsx}` |
| e2e | Playwright（Chromium，`pnpm dev` 作为 webServer，端口 4173） | `apps/demo/e2e/{app-shell,i18n,components-preview,motion,responsive,responsive-adaptation,scroll-boundary,theme,workspace-scroll}.spec.ts` |

## 8. 删除示例页面的步骤（正式开发时）

1. 在 `workspace-pages.tsx` 移除 overview / bills / settings 下相应条目，并同步 `workspace-modules.ts` 与 `lib/i18n/resources.ts` 文案。
2. 删除 `apps/demo/src/features/<name>`；`providers.tsx` 中的 `DemoProviders` 随之删除。
3. 若不再使用 Mock，先替换消费者（包括从 `@/shared/mocks/bills` 读取示例数量的 `workspace-modules.ts`），再删除 `apps/demo/src/shared/mocks`。
4. 删除对应 e2e 并保留外壳/主题/滚动/响应式用例（已不含业务数据断言）。
