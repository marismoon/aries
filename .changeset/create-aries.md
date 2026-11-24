---
"@marismoon/create-aries": minor
---

新增 `@marismoon/create-aries`：`npm create @marismoon/aries@next my-app` 创建带三列外壳的独立项目。生成的项目带布局契约：`AGENTS.md` 规则、`pnpm lint` 中的 `scripts/check-layout.mjs`（拦截覆盖外壳类名、重定义布局令牌）和 `e2e/layout.spec.ts`（逐页核对外壳几何），新增内容不得改变布局。
