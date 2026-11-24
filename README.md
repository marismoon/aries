# Marismoon Aries

Aries 是一个从真实项目脱敏提取的 React 工作区框架。运行 Demo 可查看九套品牌、明暗主题、账单、TanStack 数据表、图表与基于 shadcn 的组件示例，业务数据来自本地 Mock。新应用从包含首页与设置页的 Starter 起步。

| 层 | 位置 | 职责 |
| --- | --- | --- |
| 设计系统 | `packages/ui` | shadcn 组件、Solar 图标、动效、主题和材质令牌 |
| 工作区外壳 | `packages/shell` | 三列布局、导航、页头和命令面板 |
| 完整示例 | `apps/demo` | 带本地 Mock 的示例页面与框架回归用例 |
| 起步模板 | `templates/starter` | 接好主题、路由、React Query 和双语文案的最小应用 |

`packages/config` 提供仓库内部使用的 ESLint 与 TypeScript 配置。Starter 自带工程配置。

## 启动

使用 Node.js 24 和根 `packageManager` 锁定的 pnpm。先在根目录运行 `pnpm install`，再选择应用。

| 命令 | 应用 | 默认地址 |
| --- | --- | --- |
| `pnpm dev` | Demo | <http://localhost:5173> |
| `pnpm dev:starter` | Starter | <http://localhost:5174> |

在同一 workspace 下创建应用、修改端口、添加页面和注册导航，见[从 Starter 创建应用](docs/STARTER.md)。

## 验证

| 根命令 | 检查内容 |
| --- | --- |
| `pnpm typecheck`、`pnpm lint` | 工作区类型与源码规则 |
| `pnpm build` | 构建 Demo 和 Starter |
| `pnpm test`、`pnpm test:coverage` | Vitest 单测；后者运行已配置的覆盖率任务 |
| `pnpm test:ui` | Demo 全集（4173）与 Starter 冒烟（4174） |
| `pnpm check:workspace` | 包的私有标记、模板独立性、共享包公开导入路径 |
| `pnpm run audit` | 运行高危及以上级别阻断的依赖审计 |
| `pnpm format` | 用 Prettier 格式化 TypeScript 和 TSX |

提交钩子使用 husky 和 lint-staged，对暂存的 TypeScript 与 TSX 运行 Prettier 和 ESLint。流程见[持续集成工作流](.github/workflows/ci.yml)。

首次运行 UI 测试前执行 `pnpm --filter @aries/demo exec playwright install chromium`。两套测试共用该浏览器版本。

## 文档

- [开发契约](AGENTS.md) · [架构](docs/ARCHITECTURE.md) · [技术栈](docs/TECH_STACK.md)
- [设计系统](docs/DESIGN_SYSTEM.md) · [UI 组件](docs/COMPONENTS.md) · [Shell API 与 CSS 变量](packages/shell/README.md) · [国际化](docs/I18N.md)
- [版本治理与阶段边界](docs/VERSIONING.md) · [架构决策](docs/decisions/)

## 环境变量

`.env.example` 中的 `VITE_API_BASE_URL` 是替换 Demo Mock 服务时使用的占位值。密钥与本地 `.env` 不提交。
