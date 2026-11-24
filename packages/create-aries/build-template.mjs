// Builds ./template from templates/starter for publishing: workspace and
// catalog specifiers become the versions released together with this package
// (the changesets "fixed" group keeps ui, shell and create-aries in step), and
// AGENTS.md links point at GitHub. Runs on prepack.
//
//   node build-template.mjs [--tarballs <dir>]   # tarballs: local testing
import { cpSync, rmSync } from "node:fs"
import { fileURLToPath } from "node:url"

import { exportStarter } from "../../scripts/export-starter.mjs"

const here = fileURLToPath(new URL("./", import.meta.url))
const template = fileURLToPath(new URL("./template", import.meta.url))
const args = process.argv.slice(2)
const tarballs = args.includes("--tarballs")
  ? args[args.indexOf("--tarballs") + 1]
  : undefined

rmSync(template, { recursive: true, force: true })
exportStarter({
  target: template,
  name: "aries-app",
  tarballs,
  // ui and shell are published in the same release as this package.
  registryCheck: false,
})
cpSync(
  fileURLToPath(new URL("../../LICENSE", import.meta.url)),
  `${here}LICENSE`
)
console.log(`Built ${template}`)
