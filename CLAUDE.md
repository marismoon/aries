# CLAUDE.md

本仓库的开发契约统一维护在 [AGENTS.md](AGENTS.md)（MUST / SHOULD / MUST NOT、Monorepo 边界、视觉红线、提交前自检清单）。**开始任何修改前先阅读它**，不要在此重复维护规则。

按需阅读：

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — 包结构、启动流程、分层、路由与页面注册
- [docs/TECH_STACK.md](docs/TECH_STACK.md) — 精确版本、选型原因、禁止清单
- [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) — 主题、令牌、间距字号、卡片/动效/图表规则
- [docs/COMPONENTS.md](docs/COMPONENTS.md) — 公共组件清单、Props、用法、扩展规则
- [docs/I18N.md](docs/I18N.md) — 多语言用法、新增文案与语言
- [docs/STARTER.md](docs/STARTER.md) — 同仓创建应用与页面注册
- [docs/VERSIONING.md](docs/VERSIONING.md) — catalog、审计、应急修复与阶段边界
- [docs/decisions/](docs/decisions/) — 五项架构决策

常用命令（仓库根目录）：`pnpm dev` · `pnpm typecheck` · `pnpm lint` · `pnpm build` · `pnpm test` · `pnpm test:ui` · `pnpm check:workspace` · `pnpm check:package`。
