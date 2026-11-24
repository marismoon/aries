# Changesets

`@marismoon/ui` 与 `@marismoon/shell` 用 [Changesets](https://github.com/changesets/changesets) 管理版本，二者属于同一 `fixed` 组，总是同版本发布。私有包（Demo、Starter、config）不参与。

- 改动会影响发布包时，运行 `pnpm changeset` 选择包与版本级别并写说明，生成的 Markdown 文件随 PR 提交。
- 发版前运行 `pnpm changeset version`，更新版本号与 `CHANGELOG.md`，单独提交。
- 当前处于 `next` 预发布模式（见 `pre.json`），版本形如 `0.1.0-next.0`，以 `next` 标签发布。退出用 `pnpm changeset pre exit`。

发布流程与凭证见 [VERSIONING.md](../docs/VERSIONING.md)。
