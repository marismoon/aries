# 技术栈

版本为本模板锁定安装时的实际版本（`pnpm ls -r`）。各包的 `package.json` 引用的 catalog 定义在 `pnpm-workspace.yaml`。

## 运行环境与工具链

| 项 | 版本 | 说明 |
| --- | --- | --- |
| Node.js | ^24（`engines`） | |
| pnpm | 12.16.1 | workspace：`apps/*`、`packages/*`、`templates/*` |
| Turborepo | 2.11.13 | 任务：dev（无缓存、常驻）、build、typecheck、test、test:coverage、test:ui |
| TypeScript | 6.0.3 | UI、Shell 与 Demo 通过 `@marismoon/config` 共享编译配置，Starter 自带 tsconfig。业务代码启用 strict、`noUncheckedIndexedAccess`、`erasableSyntaxOnly` |
| ESLint | 9.39.5 | typescript-eslint（type-checked）、react-hooks、react-refresh、jsx-a11y、import-x（`no-cycle`） |
| Prettier | 3.10.1 | + `prettier-plugin-tailwindcss`（函数 `cn`、`cva`） |
| husky / lint-staged | 9.1.7 / ^17.6 | 提交前对暂存的 ts/tsx 运行 Prettier 与 `eslint --fix` |

## 应用依赖

| 类别 | 库 | 版本 | 选型原因 |
| --- | --- | --- | --- |
| 框架 | react / react-dom | 19.3.1 | |
| 构建 | vite + `@vitejs/plugin-react` | 8.3.8 / 6.3.0 | 无单独 Babel 配置 |
| 样式 | tailwindcss + `@tailwindcss/vite` | 4.3.5 | CSS-first（`@theme`、`@custom-variant dark`），令牌用 CSS 变量 |
| 组件 | shadcn（radix-rhea 预设）+ `radix-ui` | CLI ^4.23 / 1.8.1 | 复制到仓库的可改源码；少量组件用 `@base-ui/react` 1.9.0、`@shadcn/react` 0.3.1 |
| 变体 | class-variance-authority / `cn` | 0.7.1 / ^0.5.2 | `lib/utils.ts` 重导出 `cn` |
| 动画 | motion | 14.14.0 | `LazyMotion` + `domAnimation`；不使用 layout 动画 |
| 动画样式 | tw-animate-css | 1.4.0 | |
| 图表 | recharts | 3.8.0（默认 catalog 精确锁定） | 与 `components/ui/chart.tsx` 配套 |
| 表格 | `@tanstack/react-table` | 9.3.1 | 经 `useDataTable` 封装 |
| 数据 | `@tanstack/react-query` | 5.108.1 | Mock 服务查询 |
| 路由 | react-router | 8.5.2 | `createBrowserRouter` + `lazy` |
| 国际化 | i18next / react-i18next | 27.2.2 / 18.0.3 | `apps/demo/src/lib/i18n` |
| 主题 | next-themes | 0.4.6 | `attribute="class"` 切换 `.dark` |
| 校验 | zod（`@marismoon/demo`） | 4.6.7 | 校验账单与概览数据 |
| 其他 UI | vaul 1.1.2（Drawer）、sonner 2.0.8、cmdk 1.1.1、input-otp 1.5.0、react-day-picker 10.0.2、date-fns 4.4.0、embla-carousel-react 8.6.0、react-resizable-panels 4.24.1、shiki 4.6.0 | | 均由 shadcn 组件或预览页使用 |
| 字体 | `@fontsource-variable/inter`、`@fontsource-variable/noto-sans-sc` | | 在 `globals.css` 引入 |
| 测试 | vitest 5.1.1、jsdom 31、Testing Library、`@playwright/test` 1.65.1 | | 单测 `src/**/*.test.{ts,tsx}`；e2e 在 `apps/demo/e2e` 和 `templates/starter/e2e` |

## 禁止清单（与现有栈冲突）

- **图标**：lucide-react、`@tabler/*`、`@phosphor-icons/*`、`@hugeicons/*`、`@remixicon/*`、react-icons（ESLint 已禁止）。只用 `@marismoon/ui/icons`（Solar）。
- **样式方案**：styled-components、emotion、CSS Modules、Sass/Less、Tailwind v3 配置文件（`tailwind.config.js`）、其他 UI 库（Ant Design、MUI、Chakra、Mantine）。
- **动画**：framer-motion（已由 `motion` 取代）、GSAP、react-spring（与「无弹簧回弹」冲突）。
- **表格/图表**：ag-grid、react-table v7/8、echarts、chart.js、visx（与 TanStack Table + recharts 重复）。
- **状态/请求**：Redux、MobX、SWR、axios（服务端状态用 React Query，原生 `fetch`）。
- **路由**：react-router-dom（v8 起合并为 `react-router`）。
- **包管理**：npm、yarn。

## 版本策略

Catalog 升级、审计与临时覆盖的操作步骤见[版本治理](VERSIONING.md)。升级 recharts 前核对共享 `chart.tsx`。
