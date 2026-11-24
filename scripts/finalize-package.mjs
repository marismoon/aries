// Completes a package build after Vite (JS) and tsc (declarations):
// copies stylesheets into dist, points Tailwind's @source at the compiled
// JavaScript, and cleans the declaration files: CSS side-effect imports are
// dropped (hosts need no `*.css` module declaration to type-check) and
// relative imports get explicit `.js` extensions, so the types also resolve
// under Node's ESM rules (`moduleResolution: "node16"`), not only bundlers.
import {
  cpSync,
  existsSync,
  globSync,
  readFileSync,
  writeFileSync,
} from "node:fs"
import { dirname, join, resolve } from "node:path"

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

function withExtension(file, specifier) {
  if (/\.(?:js|json)$/.test(specifier)) return specifier
  const base = join(dirname(file), specifier)
  if (existsSync(`${base}.d.ts`)) return `${specifier}.js`
  if (existsSync(join(base, "index.d.ts"))) return `${specifier}/index.js`
  throw new Error(`${file}: cannot resolve ${specifier} to a declaration file`)
}

const declarations = globSync("**/*.d.ts", { cwd: dist })
let cleaned = 0
for (const file of declarations) {
  const path = join(dist, file)
  const text = readFileSync(path, "utf8")
  const next = text
    .replace(/^import\s+["'][^"']+\.css["'];?\r?\n/gm, "")
    .replace(
      /(\bfrom\s+|\bimport\s*\(\s*)(["'])(\.{1,2}\/[^"']+)\2/g,
      (_, lead, quote, specifier) =>
        `${lead}${quote}${withExtension(path, specifier)}${quote}`
    )
  if (next !== text) {
    writeFileSync(path, next)
    cleaned += 1
  }
}

console.log(
  `${packageDir}: copied ${styles.length} stylesheets, cleaned ${cleaned} declaration files`
)
