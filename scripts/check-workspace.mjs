import { execFileSync } from "node:child_process"
import { existsSync, readFileSync } from "node:fs"
import { join, relative } from "node:path"
import { fileURLToPath } from "node:url"
import ts from "typescript"

const root = fileURLToPath(new URL("../", import.meta.url))
const publishable = new Set(["@marismoon/ui", "@marismoon/shell"])
const privateSource = /^@marismoon\/(?:ui|shell)\/src(?:\/|$)/
const errors = []

const packages = JSON.parse(
  execFileSync("pnpm", ["list", "-r", "--depth", "-1", "--json"], {
    cwd: root,
    encoding: "utf8",
  })
)
for (const pkg of packages) {
  const path = join(pkg.path, "package.json")
  const manifest = JSON.parse(readFileSync(path, "utf8"))
  if (!publishable.has(manifest.name) && manifest.private !== true) {
    errors.push(
      `${relative(root, path)}: ${manifest.name} must set "private": true.`
    )
  }
}

const starterManifest = "templates/starter/package.json"
if (
  readFileSync(join(root, starterManifest), "utf8").includes(
    "@marismoon/config"
  )
) {
  errors.push(
    `${starterManifest}: starter must provide its own configuration. Remove @marismoon/config.`
  )
}

function checkModule(file, text, position, specifier) {
  if (!privateSource.test(specifier)) return
  const line = text.slice(0, position).split("\n").length
  errors.push(
    `${file}:${line}: use a public package export instead of ${specifier}.`
  )
}

function checkScript(file, text) {
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest)
  function visit(node) {
    let specifier
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      specifier = node.moduleSpecifier
    } else if (ts.isExternalModuleReference(node)) {
      specifier = node.expression
    } else if (
      ts.isImportTypeNode(node) &&
      ts.isLiteralTypeNode(node.argument)
    ) {
      specifier = node.argument.literal
    } else if (ts.isCallExpression(node)) {
      const callee = node.expression
      if (
        callee.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(callee) && callee.text === "require")
      ) {
        specifier = node.arguments[0]
      }
    }
    if (specifier && ts.isStringLiteralLike(specifier)) {
      checkModule(file, text, specifier.getStart(source), specifier.text)
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
}

function checkStylesheet(file, text) {
  // Skip comments and quoted content; only an @import rule loads another stylesheet.
  const tokens =
    /\/\*[\s\S]*?\*\/|"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'|@import\b/gi
  const target =
    /^(?:\s|\/\*[\s\S]*?\*\/)*(?:url\(\s*)?(?:"([^"]+)"|'([^']+)'|([^\s;)]+))/i
  for (const match of text.matchAll(tokens)) {
    if (match[0].toLowerCase() !== "@import") continue
    const url = target.exec(text.slice(match.index + match[0].length))
    if (url) checkModule(file, text, match.index, url[1] ?? url[2] ?? url[3])
  }
}

// Include untracked source during local development, respecting repository ignores.
const files = execFileSync(
  "git",
  ["ls-files", "-z", "--cached", "--others", "--exclude-standard"],
  {
    cwd: root,
    encoding: "utf8",
  }
).split("\0")
for (const file of files) {
  if (!/\.(?:[cm]?[jt]sx?|css)$/i.test(file)) continue
  const path = join(root, file)
  if (!existsSync(path)) continue
  const text = readFileSync(path, "utf8")
  // The Aceternity-style demos stay in apps/demo; their licence does not allow
  // redistributing them as templates or package source.
  if (
    /^(?:packages\/(?:ui|shell)|templates\/starter)\//.test(file) &&
    /aceternity/i.test(file + text)
  ) {
    errors.push(
      `${file}: Aceternity examples must stay in apps/demo and must not ship in packages or the starter.`
    )
  }
  if (file.endsWith(".css")) checkStylesheet(file, text)
  else checkScript(file, text)
}

if (errors.length) {
  console.error(errors.join("\n"))
  process.exitCode = 1
} else {
  console.log(
    "Workspace packages, starter configuration, public imports and demo-only examples passed."
  )
}
