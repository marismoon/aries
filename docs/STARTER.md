# 在同仓创建应用

从工作区根目录运行 `pnpm install`、`pnpm dev:starter` 可预览模板，默认地址为 <http://localhost:5174>。首页和设置各有一个占位页，共用三列外壳、主题控件、React Query 和中英文切换。完整的业务示例可用 `pnpm dev` 查看。

## 复制模板

1. 选择尚未使用的目录名。以下命令从当前提交复制模板的受控文件，自动排除本机的 `node_modules/`、`dist/`、`test-results/` 和 `.turbo/`。

   ```sh
   mkdir apps/my-workspace && git archive HEAD:templates/starter | tar -x -C apps/my-workspace
   ```

2. 将新目录的 `package.json` 中的 `name` 改为唯一的包名，例如 `@aries/my-workspace`，保留 `private: true`、`workspace:*` 及 catalog 引用。
3. 将新应用 `vite.config.ts` 中的 `server.port` 从 5174 改为可用端口，例如 5175。将 `playwright.config.ts` 中的 `baseURL` 与 `webServer.command` 的 `--port` 一起从 4174 改为另一可用端口，例如 4175。这样 Demo、模板和新应用可以同时跑冒烟。
4. 根 workspace 已包含 `apps/*`。回到根目录安装并启动新包。

   ```sh
   pnpm install
   pnpm --filter @aries/my-workspace dev
   ```

## 注册页面与导航

模板中每个模块有一个页面。`src/app/workspace-modules.ts` 同时供路由和导航读取。默认模块 `home` 位于第一列主体，`settings` 位于底部。访问根路径会进入注册表第一项。

1. 在新应用的 `src/features/<name>/` 添加内容组件，沿用首页的 `useTranslation()` 用法。在 `src/lib/i18n/resources.ts` 的 `zh-CN.translation` 和 `en.translation` 同时添加标题与正文。
2. 在 `src/app/workspace-modules.ts` 登记唯一的 `id` 和 `path`、`titleKey`、`bodyKey`、Solar 图标、`railPosition` 与内容组件 `Content`。路由会渲染共享的 `WorkspacePage`。外壳适配器将同一条记录转换成模块入口、目录链接和搜索结果。按业务需要调整注册表中的图标、顺序及菜单名称。
3. 更新新应用的 `e2e/smoke.spec.ts`，验证从模块入口选择目录链接后到达正确页面，并验证两种语言。首次测试安装 Chromium，随后运行包内五项。

   ```sh
   pnpm --filter @aries/my-workspace exec playwright install chromium
   pnpm --filter @aries/my-workspace typecheck
   pnpm --filter @aries/my-workspace lint
   pnpm --filter @aries/my-workspace build
   pnpm --filter @aries/my-workspace test
   pnpm --filter @aries/my-workspace test:ui
   ```

宿主通过公开入口消费 UI 与 Shell，样式先引入 UI 的 `globals.css`，再引入 Shell。模板同仓运行所需的工程配置和开发约定随源码一起复制。阶段二才提供独立仓库的导出工具。见[起步应用开发契约](../templates/starter/AGENTS.md)、[Shell 接口](../packages/shell/README.md)与[版本治理](VERSIONING.md)。
