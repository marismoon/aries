// Completes a package build after Vite (JS) and tsc (declarations):
// copies stylesheets into dist, points Tailwind's @source at the compiled
// JavaScript, and drops CSS side-effect imports from declaration files so
// hosts do not need a `*.css` module declaration to type-check.
import { cpSync, globSync, readFileSync, writeFileSync } from "node:fs"
import { join, resolve } from "node:path"

const packageDir = resolve(process.argv[2] ?? ".")
const src = join(packageDir, "src")
const dist = join(packageDir, "dist")

const styles = globSync("**/*.css", { cwd: src })
for (const file of styles) {
  const target = join(dist, file)
  cpSync(join(src, file), target)
  const css = readFileSync(target, "utf8")
  const compiled = css.replace(/(@source\s+"[^"]*)\.tsx("\s*;)/g, "$1.js$2")
  if (compiled !== css) writeFileSync(target, compiled)
}

const declarations = globSync("**/*.d.ts", { cwd: dist })
let stripped = 0
for (const file of declarations) {
  const path = join(dist, file)
  const text = readFileSync(path, "utf8")
  const next = text.replace(/^import\s+["'][^"']+\.css["'];?\r?\n/gm, "")
  if (next !== text) {
    writeFileSync(path, next)
    stripped += 1
  }
}

console.log(
  `${packageDir}: copied ${styles.length} stylesheets, cleaned ${stripped} declaration files`
)
