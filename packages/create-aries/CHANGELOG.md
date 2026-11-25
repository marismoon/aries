# @marismoon/create-aries

## 0.1.0-next.4

- 更新内置 Starter 模板，加入四套品牌配色与刷新时的主题恢复。生成的项目依赖同版本的 `@marismoon/ui` 与 `@marismoon/shell`。

## 0.1.0-next.3

### Patch Changes

- 2a72bcc: 修复 `npm create @marismoon/aries` / `pnpm create @marismoon/aries` 不执行任何操作的问题：经 `node_modules/.bin` 符号链接启动时，CLI 现在按真实路径识别入口。0.1.0-next.1 与 0.1.0-next.2 受影响。

## 0.1.0-next.2

### Minor Changes

- 1e5c81a: 新增 `@marismoon/create-aries`：`npm create @marismoon/aries@next my-app` 创建带三列外壳的独立项目。生成的项目带布局契约：`AGENTS.md` 规则、`pnpm lint` 中的 `scripts/check-layout.mjs`（拦截覆盖外壳类名、重定义布局令牌）和 `e2e/layout.spec.ts`（逐页核对外壳几何），新增内容不得改变布局。
