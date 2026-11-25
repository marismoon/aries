# Changesets

`@marismoon/ui`、`@marismoon/shell` 与 `@marismoon/create-aries` 用 [Changesets](https://github.com/changesets/changesets) 管理版本，三者属于同一 `fixed` 组，总是同版本发布。私有包（Demo、Starter、config）不参与。

- 改动会影响发布包时，运行 `pnpm changeset` 选择包与版本级别并写说明，生成的 Markdown 文件随 PR 提交。
- 功能 PR 合并后，从最新的 `main` 创建版本分支并运行 `pnpm changeset version`，以独立 PR 提交版本号与 `CHANGELOG.md`。
- 当前处于 `next` 预发布模式（见 `pre.json`），版本形如 `0.1.0-next.0`，以 `next` 标签发布。退出用 `pnpm changeset pre exit`。

发布流程与凭证见 [VERSIONING.md](../docs/VERSIONING.md)。
