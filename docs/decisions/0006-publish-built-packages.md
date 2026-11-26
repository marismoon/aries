# ADR 0006　以构建产物发布 UI 与 Shell

**背景**　`@marismoon/ui` 与 `@marismoon/shell` 需要被仓库外的 Vite 与 Next.js 项目安装。直接发布源码时，宿主需自行编译 TSX、声明 CSS 模块，并且会把 `shadcn` CLI 的依赖链带入运行时。npm 上的 `@aries` scope 已被他人持有。

**决定**　两个包以 `@marismoon` scope、同一版本号发布 ESM JavaScript、类型声明与样式（`dist`），由 `publishConfig.exports` 替换同仓的源码入口。React 与 React DOM 为 peer 依赖。字体拆为可选入口 `@marismoon/ui/styles/fonts.css`。发布走 Changesets 与 npm Trusted Publishing（OIDC + provenance），仓库不保存令牌。Aceternity 示例只留在 Demo。

**理由**　同仓开发仍直接消费源码，保留即时编译体验；仓库外宿主拿到的是无需额外配置的产物。peer 依赖避免宿主装出两份 React。

**后果**　发布形态与同仓形态并存，由 `pnpm check:package`（tarball、publint、attw）与 `pnpm test:consumer`（仓库外 Vite 与 Next.js 宿主）守住一致性；`pnpm check:workspace` 阻止 Aceternity 示例进入发布包与 Starter。操作步骤见[版本治理](../VERSIONING.md)。
