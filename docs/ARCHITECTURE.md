# 架构

## 1. 包与依赖方向

```text
apps/demo         ─┬─► packages/shell ──► packages/ui
templates/starter ─┘
两种宿主也可直接使用 packages/ui 的公开入口。
根 ESLint 配置、Demo、Shell 与 UI 的 TypeScript 配置 ──► packages/config (@marismoon/config)
```

| 包 | 入口（`exports`） | 内容 |
| --- | --- | --- |
| `@marismoon/ui` | `./ui/*` `./shared/*` `./motion/*` `./icons` `./icons/*` `./hooks/*` `./lib/*` `./styles/*`（同仓指向源码；发布时由 `publishConfig.exports` 换成 `dist`，见 [ADR 0006](decisions/0006-publish-built-packages.md)） | `src/components/{ui,shared,icons,motion}`、`src/hooks/use-mobile.ts`、`src/lib/{utils,format,storage}.ts`、`src/styles/*.css` |
| `@marismoon/shell` | `.`、`./styles`（同仓为源码，发布为 `dist`） | 三列外壳、页面布局和命令面板，见 [公开 API 与 CSS 变量契约](../packages/shell/README.md) |
| `@marismoon/config` | `./eslint/*`、`./typescript/*.json` | ESLint 的 base、react、boundaries 和 TypeScript 的 base、react、app 配置 |
| `@marismoon/demo` | — | `src/{app,features,shared,lib,test}`、`e2e/` |
| `@marismoon/starter` | — | 首页、设置、独立工程配置和冒烟测试，见[起步指南](STARTER.md) |

两个同仓宿主通过包导出路径引用 UI 和 Shell 的源码，由 Vite 直接编译；仓库外宿主安装 npm 上的构建产物。`packages/ui` 内部只用相对导入。

## 2. apps/demo 目录

```text
apps/demo/src
├── main.tsx            入口：载入 index.css 与应用模块，应用已保存的主题偏好后渲染 App
├── index.css           依次引入 @marismoon/ui/styles/globals.css、可选的 @marismoon/ui/styles/fonts.css 和 @marismoon/shell/styles，@source "./" 扫描应用代码
├── app/
│   ├── App.tsx         AppProviders + RouterProvider
│   ├── providers.tsx   QueryClient、next-themes、LazyMotion/MotionConfig（`reducedMotion="user"`）、TooltipProvider、演示状态；命令面板由 `AppShell` 内的 `CommandPaletteProvider` 提供
│   ├── router.tsx      按 workspacePages 生成懒加载路由，/ 重定向到 /overview
│   ├── shell-adapter.tsx  DemoShell 将路由、导航 Schema 与 AI 助手传给 AppShell
│   ├── command-items.ts   生成各模块已翻译的搜索条目和提示
│   ├── workspace-modules.ts  业务菜单注册与导航计数
│   ├── use-workspace-navigation.tsx  构造已翻译的导航 Schema
│   └── workspace-pages.tsx  页面注册表（WorkspacePageConfig）
├── features/           overview、bills、copilot、settings（均为示例/调试页面）
├── shared/             跨功能的 Mock 数据、服务（mocks/）和业务类型（types/）
├── lib/                i18n（i18next 资源、语言存储、`useUiText`，见 I18N.md）、query-client.ts、highlighter.tsx（shiki）
└── hooks/use-highlighted-code.ts
```

## 3. 启动与运行时

1. `main.tsx` 调用 `applyStoredPalette()` / `applyStoredDarkStyle()`（来自 `@marismoon/ui/lib/storage`）在首帧前写入 `data-palette` / `data-dark-style`。
2. `AppProviders`：React Query → next-themes（`.dark` 类，存储键 `aries-theme`，默认跟随系统）→ motion（`LazyMotion` + `domAnimation`，`MotionConfig reducedMotion="user"`）→ TooltipProvider → 演示数据上下文。`ThemeColor` 监听 `class`/`data-palette` 同步 `<meta name="theme-color">`。
3. `router.tsx`：`DemoShell` 连接布局路由与 `AppShell`。子路由由 `workspacePages` 生成，通过 `page.load()` 动态导入页面，并向 `WorkspacePage` 传入已翻译的页面信息和内容槽位。

## 4. 三列外壳

| 列 | 组件 | 职责 |
| --- | --- | --- |
| 第一列 | `IconRail` | 模块入口（`module`）、AI 助手/头像/折叠（`action`）、Logo（`navigation`，回 `/overview`） |
| 第二列 | `WorkspaceNav` | 根据当前模块的导航 Schema 渲染条目和计数 |
| 第三列 | `MainWorkspace` → `WorkspacePageLayout` | 固定 `PageHeader`，仅 `PageContentViewport` 滚动 |

- 第一列入口类型：`module` 切换第二列数据；`action` 不改变路由和模块；`navigation` 由目标路由决定模块。
- 页面的模块归属与选中态**以路由为准**（页面配置的 `moduleId`）。
- `app/use-workspace-navigation.tsx` 根据菜单注册表构造导航 Schema，每个模块携带已翻译的标签、图标和命令项。`app/shell-adapter.tsx` 将导航数据传给 `AppShell`，外壳把当前模块的命令传给 `CommandPaletteProvider`。
- 新增业务模块：在 `app/workspace-modules.ts` 注册（`WorkspaceEntry` 为 `route` / `folder` / `demo`）；新增页面：在 `workspace-pages.tsx` 注册，侧栏入口引用 `workspacePages.<id>.path`。
- `WorkspacePageSlots`：`Content`（必填）、`Subtitle`、`BreadcrumbDetail`、`Summary`。标题与面包屑来自页面配置（`titleKey` 经 i18n）。

## 5. 滚动边界

AppShell 固定视口；body 不滚动；仅 `PageContentViewport`（第三列）、第二列导航内容区、AI 助手消息区各自独立滚动；滚动不得传播导致 AppShell 移动。回归见 `e2e/scroll-boundary.spec.ts`、`e2e/workspace-scroll.spec.ts`。

## 6. 数据流

Demo 的 `@/shared/mocks/mock-service` 导出 `getDemoAttentionItems` 和 `getDemoBills`。两者模拟请求延迟，并用 `@/shared/types` 目录中的 Zod schema 校验返回值。页面通过各功能的 `useQuery` Hook 读取数据。概览专用的图表数据在 `features/overview/mocks/charts.ts`。接入真实后端时替换 Mock 服务并读取 `VITE_API_BASE_URL`。

## 7. 测试与边界

| 根命令 | 覆盖范围 |
| --- | --- |
| `pnpm test` | UI 图标、Shell 组件与服务端渲染、Demo 的业务和翻译、Starter 的双语资源 |
| `pnpm test:ui` | Demo 在 4173 运行 `apps/demo/e2e/*.spec.ts` 全集；Starter 在 4174 运行 [smoke.spec.ts](../templates/starter/e2e/smoke.spec.ts) |
| `pnpm test:consumer` | 打包 ui 与 shell，在仓库外分别以导出的 Starter（Vite）与 Next.js 应用安装并验证；需要联网，见 [consumer-test.mjs](../scripts/consumer-test.mjs) |
| `pnpm check:workspace` | 校验发布清单外的包、Starter 的工程依赖、全仓共享包导入路径，以及 Aceternity 示例不进入 ui、shell 与 Starter |
| `pnpm check:package` | 按发布方式打包 ui 与 shell，检查 tarball 内容（无源码与测试、带许可证）、清单与 `exports`，并运行 publint 与 attw，见 [check-packages.mjs](../scripts/check-packages.mjs) |

Demo 的示例与用例是共享框架的回归基线。新项目复制 Starter 到同仓的 `apps/`，操作见[起步指南](STARTER.md)。依赖方向、CSS 入口与目录结构的取舍见[架构决策](decisions/)。
