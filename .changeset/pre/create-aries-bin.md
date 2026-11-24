---
"@marismoon/create-aries": patch
---

修复 `npm create @marismoon/aries` / `pnpm create @marismoon/aries` 不执行任何操作的问题：经 `node_modules/.bin` 符号链接启动时，CLI 现在按真实路径识别入口。0.1.0-next.1 与 0.1.0-next.2 受影响。
