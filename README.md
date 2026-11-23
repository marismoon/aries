# Marismoon Aries — 工作区前端启动模板

基于真实项目脱敏裁剪的 React 工作区模板：三列 AppShell、玻璃质感设计系统（9 套品牌主题，亮色 + 暗色两种风格：玻璃 / 简洁）、基于 shadcn 的共享组件库、TanStack 数据表模板、图表与动效规范。可直接 `pnpm dev` 运行。

> `apps/demo` 里的 overview、bills、copilot 与「系统设置」下的组件预览、动效、基础页面是**示例与调试页面**，用于开发期对照规范；正式项目开发完成后可删除。`packages/*` 为长期保留的共享层。全部数据为本地 Mock。

## 仓库结构

```text
.
├── apps/demo           @marismoon/demo    外壳布局、路由、页面、业务类型（zod）、Mock 数据与服务、i18n、e2e
├── packages/ui         @marismoon/ui      shadcn 组件、共享组合组件、Solar 图标、动效、格式化、设计令牌与全局样式
├── packages/config     @marismoon/config  同仓共享的 ESLint 与 TypeScript 配置
├── docs/               架构 / 技术栈 / 设计系统 / 组件文档
├── AGENTS.md           开发契约（人与 AI 助手共同遵守）
└── CLAUDE.md           指向 AGENTS.md 的精简入口
```

## 快速开始

环境：Node.js ^24，pnpm 12（`packageManager: pnpm@12.16.1`）。

```bash
pnpm install
pnpm dev          # http://localhost:5173
```

## 脚本（根目录）

| 命令 | 作用 |
| --- | --- |
| `pnpm dev` | `turbo run dev --filter=@marismoon/demo` |
| `pnpm build` | 构建 Demo（`tsc -b && vite build`） |
| `pnpm typecheck` | 检查 UI 和 Demo 的类型 |
| `pnpm lint` | `eslint .` |
| `pnpm test` / `pnpm test:coverage` | Vitest |
| `pnpm test:ui` | Playwright e2e（首次 `pnpm --filter @marismoon/demo exec playwright install chromium`） |
| `pnpm format` | Prettier 写入 `**/*.{ts,tsx}` |

提交时 husky 运行 lint-staged（Prettier + `eslint --fix`）；需要先 `git init`。

## 文档

- [AGENTS.md](AGENTS.md) — 开发契约
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) · [docs/TECH_STACK.md](docs/TECH_STACK.md) · [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) · [docs/COMPONENTS.md](docs/COMPONENTS.md) · [docs/I18N.md](docs/I18N.md)

## 环境变量

仅 `.env.example` 的 `VITE_API_BASE_URL`（占位，Mock 服务替换为真实后端后使用）。不要提交 `.env`。
