// Release gate for the publishable packages. Packs @marismoon/ui,
// @marismoon/shell and @marismoon/create-aries exactly as `pnpm publish` would
// (prepack builds dist / the template), then checks the tarballs:
//   - contents: dist, README and LICENSE ship; source and tests do not;
//     ui also carries THIRD_PARTY_NOTICES.md (Solar icons, CC BY 4.0)
//   - manifest: not private, no workspace:/catalog: specifiers, exports only
//     point into dist
//   - publint (strict) and @arethetypeswrong/cli (ESM consumers: node16 and
//     bundler resolution; stylesheet entry points are skipped)
//   - create-aries: the bundled template is complete (layout contract
//     included) and depends on the ui/shell versions of the same release
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

// @marismoon/create-aries ships a CLI and the starter template, not a library:
// check the template it would scaffold instead of exports and types.
{
  const name = "@marismoon/create-aries"
  const fail = (message) => errors.push(`${name}: ${message}`)
  const cwd = join(root, "packages", "create-aries")
  execFileSync("pnpm", ["pack", "--pack-destination", out], {
    cwd,
    stdio: "ignore",
  })
  const tarball = join(
    out,
    readdirSync(out).find((file) => file.startsWith("marismoon-create-aries-"))
  )
  const files = execFileSync("tar", ["-tzf", tarball], { encoding: "utf8" })
    .split("\n")
    .filter(Boolean)
  for (const required of [
    "package.json",
    "README.md",
    "LICENSE",
    "index.mjs",
    "template/package.json",
    "template/pnpm-workspace.yaml",
    "template/AGENTS.md",
    "template/scripts/check-layout.mjs",
    "template/e2e/layout.spec.ts",
    "template/e2e/smoke.spec.ts",
    "template/src/main.tsx",
  ]) {
    if (!files.includes(`package/${required}`))
      fail(`tarball is missing ${required}`)
  }
  const read = (file) =>
    execFileSync("tar", ["-xzOf", tarball, `package/${file}`], {
      encoding: "utf8",
    })
  const manifest = JSON.parse(read("package.json"))
  if (manifest.private) fail("package is private")
  const template = read("template/package.json")
  const specifier = template.match(/"(?:workspace|catalog|file):[^"]*"/)
  if (specifier) fail(`template/package.json keeps ${specifier[0]}`)
  const deps = JSON.parse(template).dependencies ?? {}
  for (const dep of ["@marismoon/ui", "@marismoon/shell"]) {
    if (deps[dep] !== `^${manifest.version}`)
      fail(
        `template depends on ${dep}@${deps[dep]}, expected ^${manifest.version} (same release)`
      )
  }
  if (/\]\(\.\.\/\.\.\//.test(read("template/AGENTS.md")))
    fail("template/AGENTS.md still links into the repository")
  try {
    bin("publint", ["run", tarball, "--strict"])
  } catch (error) {
    fail(`publint failed\n${error.stdout ?? ""}${error.stderr ?? ""}`)
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
