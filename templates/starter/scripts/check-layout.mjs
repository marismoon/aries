// Layout guard: the three-column shell belongs to @marismoon/shell, so this
// app must not restyle it. Runs as part of `pnpm lint`.
//
// Fails when app code:
// 1. targets a shell class (e.g. `.app-shell`, `.page-header`) in CSS;
// 2. uses a shell class name in page code (`src/` outside `src/app/`, where the
//    host wiring may name a rail control);
// 3. redefines a shell layout token (`--rail-*`, `--workspace-*`, …) in CSS or
//    in an inline style.
//
// Shell class names are read from the installed shell stylesheet, minus the
// ones @marismoon/ui components render, so the list follows shell upgrades.
import { globSync, readFileSync } from "node:fs"
import { dirname, join, relative } from "node:path"
import { fileURLToPath } from "node:url"

const app = fileURLToPath(new URL("../", import.meta.url))
const layoutTokens =
  /--(?:icon-rail|rail|workspace|column-height|breadcrumb-leading|sidebar-leaf-height)[\w-]*/g

const stripComments = (text) =>
  text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1")

function classesIn(css) {
  const names = new Set()
  for (const [, selector] of stripComments(css).matchAll(/([^{};]+)\{/g)) {
    if (selector.trim().startsWith("@")) continue
    for (const [, name] of selector.matchAll(/\.([a-zA-Z][\w-]*)/g)) {
      names.add(name)
    }
  }
  return names
}

function readStyles(specifier) {
  const file = fileURLToPath(import.meta.resolve(specifier))
  return { file, text: readFileSync(file, "utf8") }
}

const shell = readStyles("@marismoon/shell/styles")
// Classes that @marismoon/ui components render themselves (such as
// `field-surface`) are shared, not shell layout; `dark` is the theme switch.
// globals.css sits in <package>/src/styles (workspace) or dist/styles (npm).
const uiRoot = dirname(
  dirname(readStyles("@marismoon/ui/styles/globals.css").file)
)
const uiSource = globSync("**/*.{js,jsx,ts,tsx}", { cwd: uiRoot })
  .map((file) => readFileSync(join(uiRoot, file), "utf8"))
  .join("\n")
const shared = (name) =>
  name === "dark" || new RegExp(`["'\`\\s]${name}["'\`\\s]`).test(uiSource)
const shellClasses = new Set(
  [...classesIn(shell.text)].filter((name) => !shared(name))
)
if (shellClasses.size < 10) {
  throw new Error(`Could not read shell classes from ${shell.file}`)
}

const errors = []
const report = (file, text, index, message) => {
  const line = text.slice(0, index).split("\n").length
  errors.push(`${relative(app, join(app, file))}:${line}: ${message}`)
}

for (const file of globSync("src/**/*.css", { cwd: app })) {
  const text = readFileSync(join(app, file), "utf8")
  const css = stripComments(text)
  for (const match of css.matchAll(/([^{};]+)\{/g)) {
    const selector = match[1]
    if (selector.trim().startsWith("@")) continue
    for (const [, name] of selector.matchAll(/\.([a-zA-Z][\w-]*)/g)) {
      if (shellClasses.has(name)) {
        report(
          file,
          css,
          match.index,
          `do not restyle the shell class .${name}; pages only style their own content.`
        )
      }
    }
  }
  for (const match of css.matchAll(/(--[\w-]+)\s*:/g)) {
    if (match[1].match(layoutTokens)?.[0] === match[1]) {
      report(
        file,
        css,
        match.index,
        `do not redefine the shell layout token ${match[1]}.`
      )
    }
  }
}

for (const file of globSync("src/**/*.{ts,tsx}", { cwd: app })) {
  if (/\.test\.tsx?$/.test(file)) continue
  const text = readFileSync(join(app, file), "utf8")
  const code = stripComments(text)
  const hostWiring = file.startsWith(join("src", "app") + "/")
  for (const match of code.matchAll(/(["'`])((?:\\.|(?!\1)[^\\])*)\1/g)) {
    const literal = match[2]
    for (const token of literal.match(layoutTokens) ?? []) {
      report(
        file,
        code,
        match.index,
        `do not set the shell layout token ${token}.`
      )
    }
    if (hostWiring) continue
    for (const word of literal.split(/[\s.]+/)) {
      if (shellClasses.has(word)) {
        report(
          file,
          code,
          match.index,
          `"${word}" is a shell class; build page content from @marismoon/ui instead of copying shell layout.`
        )
      }
    }
  }
}

if (errors.length) {
  console.error(
    `Layout guard: the shell layout must not change (see AGENTS.md).\n${errors.join("\n")}`
  )
  process.exitCode = 1
} else {
  console.log(
    `Layout guard passed (${shellClasses.size} shell classes, layout tokens).`
  )
}
