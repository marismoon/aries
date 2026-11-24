// Release gate for the publishable packages. Packs @marismoon/ui and
// @marismoon/shell exactly as `pnpm publish` would (prepack builds dist), then
// checks the tarballs:
//   - contents: dist, README and LICENSE ship; source and tests do not;
//     ui also carries THIRD_PARTY_NOTICES.md (Solar icons, CC BY 4.0)
//   - manifest: not private, no workspace:/catalog: specifiers, exports only
//     point into dist
//   - publint (strict) and @arethetypeswrong/cli (ESM consumers: node16 and
//     bundler resolution; stylesheet entry points are skipped)
import { execFileSync } from "node:child_process"
import { mkdtempSync, readdirSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { fileURLToPath } from "node:url"

const root = fileURLToPath(new URL("../", import.meta.url))
const out = mkdtempSync(join(tmpdir(), "aries-packages-"))
const packages = [
  { dir: "ui", notices: true, styles: ["./styles/*"] },
  { dir: "shell", notices: false, styles: ["./styles"] },
]
const errors = []

function bin(name, args) {
  return execFileSync("pnpm", ["exec", name, ...args], {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  })
}

for (const pkg of packages) {
  const cwd = join(root, "packages", pkg.dir)
  execFileSync("pnpm", ["pack", "--pack-destination", out], {
    cwd,
    stdio: "ignore",
  })
  const tarball = join(
    out,
    readdirSync(out).find((file) => file.startsWith(`marismoon-${pkg.dir}-`))
  )
  const files = execFileSync("tar", ["-tzf", tarball], { encoding: "utf8" })
    .split("\n")
    .filter(Boolean)
  const name = `@marismoon/${pkg.dir}`
  const fail = (message) => errors.push(`${name}: ${message}`)

  for (const required of [
    "package/package.json",
    "package/README.md",
    "package/LICENSE",
  ]) {
    if (!files.includes(required))
      fail(`tarball is missing ${required.slice(8)}`)
  }
  if (pkg.notices && !files.includes("package/THIRD_PARTY_NOTICES.md")) {
    fail("tarball is missing THIRD_PARTY_NOTICES.md")
  }
  if (!files.some((file) => file.startsWith("package/dist/")))
    fail("tarball has no dist")
  const leaked = files.filter(
    (file) =>
      file.startsWith("package/src/") || /\.test\.[cm]?[jt]sx?$/.test(file)
  )
  if (leaked.length)
    fail(`tarball ships source or tests: ${leaked.slice(0, 3).join(", ")}`)

  const manifest = JSON.parse(
    execFileSync("tar", ["-xzOf", tarball, "package/package.json"], {
      encoding: "utf8",
    })
  )
  if (manifest.private) fail("package is private")
  const specifier = JSON.stringify(manifest).match(
    /"(?:workspace|catalog):[^"]*"/
  )
  if (specifier) fail(`manifest keeps ${specifier[0]}`)
  const targets = []
  const collect = (value) => {
    if (typeof value === "string") targets.push(value)
    else if (value) Object.values(value).forEach(collect)
  }
  collect(manifest.exports)
  const outside = targets.filter((target) => !target.startsWith("./dist/"))
  if (outside.length) fail(`exports point outside dist: ${outside.join(", ")}`)

  for (const [tool, args] of [
    ["publint", ["run", tarball, "--strict"]],
    [
      "attw",
      [
        tarball,
        "--profile",
        "esm-only",
        "--exclude-entrypoints",
        ...pkg.styles,
      ],
    ],
  ]) {
    try {
      bin(tool, args)
    } catch (error) {
      fail(`${tool} failed\n${error.stdout ?? ""}${error.stderr ?? ""}`)
    }
  }
  console.log(`${name}: ${files.length} files checked`)
}

if (errors.length) {
  console.error(errors.join("\n"))
  process.exitCode = 1
} else {
  console.log(
    "Packed packages passed contents, manifest, publint and attw checks."
  )
}
