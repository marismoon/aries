# 起步应用开发契约

本应用通过公开入口使用 UI 与 Shell。页面、导航、翻译及业务数据由应用维护。完整约定见[工作区开发契约](../../AGENTS.md)，外壳接口见[Shell 文档](../../packages/shell/README.md)。

- **新增页面**。在 `src/features/<name>/` 编写内容组件，在 `src/app/workspace-modules.ts` 登记路由与导航，并补齐中英文资源。页面共用同一个 `AppShell` 和 `WorkspacePage`。
- **样式与交互**。颜色、尺寸和圆角使用[设计令牌](../../docs/DESIGN_SYSTEM.md)，通过令牌适配明暗与 glass/clean。禁止新增暗色变体和硬编码颜色。尊重减少动效偏好，触屏控件点击目标至少 40px。
- **自检**。在应用目录运行 `pnpm typecheck`、`pnpm lint`、`pnpm build`、`pnpm test` 和 `pnpm test:ui`。保留路由导航与中英文切换冒烟用例。
