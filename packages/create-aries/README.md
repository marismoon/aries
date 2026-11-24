# @marismoon/create-aries

创建一个使用 Aries 三列工作区外壳的新应用。生成的项目与仓库中的 Starter 相同：图标栏、目录、页头、主题与暗色材质、中英文切换、命令面板开箱即用，依赖已发布的 `@marismoon/ui` 与 `@marismoon/shell`。

## 用法

```sh
npm create @marismoon/aries@next my-app
# 或
pnpm create @marismoon/aries@next my-app
```

不带目录名时创建 `aries-app`。目标目录必须为空。检测到 pnpm 时自动安装依赖，传 `--no-install` 可跳过。项目使用 pnpm（`packageManager` 与 Playwright 的启动命令均基于 pnpm）。

```sh
cd my-app
pnpm dev                                  # http://localhost:5174
pnpm exec playwright install chromium     # 首次运行 E2E 前
pnpm typecheck && pnpm lint && pnpm build && pnpm test && pnpm test:ui
```

## 布局契约

在 `src/features/` 中写页面内容，在 `src/app/workspace-modules.ts` 注册路由与导航；外壳布局保持不变。规则写在项目的 `AGENTS.md` 中，供开发者与 AI 助手遵循，并由两道检查强制执行：

- `pnpm lint` 运行 `scripts/check-layout.mjs`，拦截覆盖外壳类名、重定义布局令牌、在页面中冒充外壳结构的代码。
- `pnpm test:ui` 中的 `e2e/layout.spec.ts` 逐页核对三列位置、宽度、页头与滚动边界，新页面自动纳入。

## 发布

本包与 `@marismoon/ui`、`@marismoon/shell` 同版本发布。打包时 `build-template.mjs` 由仓库的 `templates/starter` 生成 `template/`，依赖改写为同一次发布的版本。见[版本治理](https://github.com/marismoon/aries/blob/main/docs/VERSIONING.md)。
