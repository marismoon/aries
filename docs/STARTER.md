# 创建应用

新应用都从 Starter 起步：首页和设置各有一个占位页，共用与 Demo 相同的三列外壳、主题控件、React Query 和中英文切换。在工作区根目录运行 `pnpm dev:starter` 可预览模板（<http://localhost:5174>），完整的业务示例用 `pnpm dev` 查看。

| 场景 | 命令 |
| --- | --- |
| 在本仓库内新建应用 | `pnpm create:app <名称>` |
| 在仓库外新建独立项目 | `npm create @marismoon/aries@next <目录>`（或 `pnpm create @marismoon/aries@next <目录>`） |

两种方式生成的项目内容相同，都带有[布局契约](#布局契约)。

## 在本仓库内新建

```sh
pnpm create:app my-workspace
```

[create-app.mjs](../scripts/create-app.mjs) 把 `templates/starter` 的受控文件复制到 `apps/my-workspace`，包名设为 `@marismoon/my-workspace`，为开发服务器和 E2E 各分配一个未被占用的端口（从 5175、4175 起递增），然后运行 `pnpm install`。传 `--no-install` 可跳过安装。随后：

```sh
pnpm --filter @marismoon/my-workspace dev
pnpm --filter @marismoon/my-workspace exec playwright install chromium   # 首次运行 E2E 前
```

同仓应用通过 `workspace:*` 直接使用 UI 与 Shell 的源码，二者的改动立即生效。

## 在仓库外新建

```sh
npm create @marismoon/aries@next my-app
cd my-app
pnpm dev
```

[@marismoon/create-aries](../packages/create-aries/README.md) 内置随同一次发布生成的模板，依赖为已发布的 `@marismoon/ui` 与 `@marismoon/shell`（同版本）。检测到 pnpm 时自动安装依赖，传 `--no-install` 可跳过。维护者也可从仓库直接导出：`node scripts/export-starter.mjs ../my-app --name my-app`（UI 与 Shell 未发布时加 `--tarballs <目录>` 改用本地 tarball，[外部消费者测试](../scripts/consumer-test.mjs)即如此验证）。

## 注册页面与导航

每个模块对应一个页面。`src/app/workspace-modules.ts` 同时供路由和导航读取。默认模块 `home` 位于第一列主体，`settings` 位于底部，访问根路径进入注册表第一项。

Starter 将 `navigation.showPlaceholders` 设为 `false`。目录与搜索仅展示有目标页面的条目，帮助入口由宿主提供回调后显示。

1. 在 `src/features/<name>/` 添加内容组件。在 `src/lib/i18n/resources.ts` 的 `zh-CN.translation` 和 `en.translation` 同时添加标题和页面所需文案。
2. 在 `src/app/workspace-modules.ts` 登记唯一的 `id` 和 `path`、`titleKey`、Solar 图标、`railPosition` 与内容组件 `Content`。路由渲染共享的 `WorkspacePage`，外壳适配器把同一条记录转换成模块入口、目录链接和搜索结果。
3. 在应用目录运行自检：`pnpm typecheck`、`pnpm lint`、`pnpm build`、`pnpm test`、`pnpm test:ui`。

## 布局契约

外壳布局来自 `@marismoon/shell`，应用只负责内容区。新增内容（包括由 AI 助手生成的页面）**不得改变布局**，规则写在应用的 `AGENTS.md`，并由两道检查强制执行：

| 检查 | 位置 | 拦截 |
| --- | --- | --- |
| `pnpm lint` → [check-layout.mjs](../templates/starter/scripts/check-layout.mjs) | 静态检查 | CSS 中选择外壳类名（如 `.app-shell`、`.page-header`）、重定义布局令牌（`--rail-*`、`--workspace-*` 等）、页面代码中使用外壳类名。外壳类名从已安装的 Shell 样式读取，随升级自动更新 |
| `pnpm test:ui` → [layout.spec.ts](../templates/starter/e2e/layout.spec.ts) | E2E | 遍历第一列每个模块、第二列每个目录链接，在 1440×900 下核对各列位置与宽度、图标居中、页头位置、页面不整体滚动、内容区外无额外滚动层；另查窄屏无整页横向滚动 |

同仓应用的布局守卫也由根目录的 `pnpm check:workspace` 运行，CI 会拦截违规。Shell 有意调整布局并发布新版本时，随升级一起更新 `layout.spec.ts` 的期望值。

宿主通过公开入口消费 UI 与 Shell，样式先引入 UI 的 `globals.css` 与可选的 `fonts.css`，再引入 Shell。见[起步应用开发契约](../templates/starter/AGENTS.md)、[Shell 接口](../packages/shell/README.md)与[版本治理](VERSIONING.md)。
