// Exports templates/starter as a standalone project outside the workspace.
//
//   node scripts/export-starter.mjs <target> [--name <package-name>]
//        [--tarballs <dir>] [--skip-registry-check]
//
// workspace:* dependencies become the published version range of each package
// (checked against the registry), or file: tarballs with --tarballs (used by the
// consumer test before anything is published). catalog: entries become the
// versions declared in pnpm-workspace.yaml, and relative links that point back
// into this repository become GitHub links.
import { execFileSync } from "node:child_process"
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs"
import { basename, dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const root = fileURLToPath(new URL("../", import.meta.url))
const starter = join(root, "templates/starter")
const repository = "https://github.com/marismoon/aries/blob/main/"

/** Reads the default and named catalogs from pnpm-workspace.yaml. */
export function readCatalogs() {
  const lines = readFileSync(join(root, "pnpm-workspace.yaml"), "utf8").split(
    "\n"
  )
  const catalogs = { "": {} }
  let section = null
  let named = null
  for (const line of lines) {
    if (/^\S/.test(line)) {
      section = line.replace(/:\s*$/, "")
      named = null
      continue
    }
    const entry = /^(\s+)"?([^":]+?)"?:\s*(\S+)?\s*$/.exec(line)
    if (!entry) continue
    const [, indent, key, rawValue] = entry
    const value = rawValue?.replace(/^(["'])(.*)\1$/, "$2")
    if (section === "catalog" && indent.length === 2 && value) {
      catalogs[""][key] = value
    } else if (section === "catalogs" && indent.length === 2 && !value) {
      named = key
      catalogs[named] = {}
    } else if (section === "catalogs" && named && indent.length === 4) {
      catalogs[named][key] = value
    }
  }
  // The parser only understands the flat layout used today; fail loudly
  // instead of exporting a project with missing versions.
  if (!Object.keys(catalogs[""]).length || !catalogs.dev) {
    throw new Error(
      "Could not read catalog/catalogs.dev from pnpm-workspace.yaml; update readCatalogs()."
    )
  }
  for (const [name, entries] of Object.entries(catalogs)) {
    for (const [key, version] of Object.entries(entries)) {
      if (!version)
        throw new Error(
          `Catalog "${name || "default"}" has no version for ${key}.`
        )
    }
  }
  return catalogs
}

function workspaceVersion(name) {
  for (const dir of readdirSync(join(root, "packages"))) {
    const path = join(root, "packages", dir, "package.json")
    if (!existsSync(path)) continue
    const manifest = JSON.parse(readFileSync(path, "utf8"))
    if (manifest.name === name) return manifest.version
  }
  throw new Error(`No workspace package named ${name}`)
}

function findTarball(dir, name) {
  const prefix = name.replace(/^@/, "").replace("/", "-") + "-"
  const file = readdirSync(dir).find(
    (entry) => entry.startsWith(prefix) && entry.endsWith(".tgz")
  )
  if (!file) throw new Error(`No tarball for ${name} in ${dir}`)
  return join(dir, file)
}

export function exportStarter({
  target,
  name = basename(target),
  tarballs,
  registryCheck = !tarballs,
}) {
  target = resolve(target)
  if (existsSync(target) && readdirSync(target).length) {
    throw new Error(`${target} is not empty`)
  }
  const catalogs = readCatalogs()
  const manifest = JSON.parse(
    readFileSync(join(starter, "package.json"), "utf8")
  )
  manifest.name = name
  const local = {}
  for (const field of ["dependencies", "devDependencies"]) {
    for (const [dep, spec] of Object.entries(manifest[field] ?? {})) {
      if (spec.startsWith("workspace:")) {
        if (tarballs) {
          local[dep] = `file:${findTarball(resolve(tarballs), dep)}`
          manifest[field][dep] = local[dep]
        } else {
          manifest[field][dep] = `^${workspaceVersion(dep)}`
        }
      } else if (spec.startsWith("catalog:")) {
        const catalog = spec.slice("catalog:".length)
        const version = catalogs[catalog]?.[dep]
        if (!version)
          throw new Error(`${dep} is missing from catalog "${catalog}"`)
        manifest[field][dep] = version
      }
    }
  }
  const leftover = JSON.stringify(manifest).match(
    /"(?:workspace|catalog):[^"]*"/
  )
  if (leftover) throw new Error(`Unresolved specifier ${leftover[0]}`)
  if (registryCheck) {
    for (const field of ["dependencies", "devDependencies"]) {
      for (const [dep, spec] of Object.entries(manifest[field] ?? {})) {
        if (!dep.startsWith("@marismoon/")) continue
        let found = ""
        try {
          found = execFileSync("npm", ["view", `${dep}@${spec}`, "version"], {
            encoding: "utf8",
            stdio: ["ignore", "pipe", "ignore"],
          }).trim()
        } catch {
          // npm exits non-zero when the package or range does not exist.
        }
        if (!found) {
          throw new Error(
            `${dep}@${spec} is not on the registry yet. Publish it first, or pass --tarballs.`
          )
        }
      }
    }
  }

  const files = execFileSync("git", ["ls-files", "-z", "templates/starter"], {
    cwd: root,
    encoding: "utf8",
  })
    .split("\0")
    .filter(Boolean)
  for (const file of files) {
    const to = join(target, file.slice("templates/starter/".length))
    mkdirSync(dirname(to), { recursive: true })
    cpSync(join(root, file), to)
  }

  writeFileSync(
    join(target, "package.json"),
    JSON.stringify(manifest, null, 2) + "\n"
  )

  // Standalone workspace file: build permissions, plus overrides so packages
  // that depend on each other resolve to the same local tarballs.
  const workspace = ["packages: []", "allowBuilds:", "  esbuild: true"]
  if (tarballs) {
    workspace.push("overrides:")
    for (const [dep, spec] of Object.entries(local)) {
      workspace.push(`  "${dep}": "${spec}"`)
    }
  }
  writeFileSync(
    join(target, "pnpm-workspace.yaml"),
    workspace.join("\n") + "\n"
  )

  const agents = join(target, "AGENTS.md")
  writeFileSync(
    agents,
    readFileSync(agents, "utf8").replace(
      /\]\(\.\.\/\.\.\/([^)]+)\)/g,
      (_, path) => `](${repository}${path})`
    )
  )
  return target
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2)
  const option = (flag) => {
    const index = args.indexOf(flag)
    return index === -1 ? undefined : args.splice(index, 2)[1]
  }
  const name = option("--name")
  const tarballs = option("--tarballs")
  const skip = args.includes("--skip-registry-check")
  const target = args.find((arg) => !arg.startsWith("--"))
  if (!target) {
    console.error(
      "Usage: node scripts/export-starter.mjs <target> [--name <name>] [--tarballs <dir>] [--skip-registry-check]"
    )
    process.exit(1)
  }
  const out = exportStarter({
    target,
    name,
    tarballs,
    registryCheck: !tarballs && !skip,
  })
  console.log(`Exported the starter to ${out}`)
}
