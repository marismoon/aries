// Creates a new app in this workspace from templates/starter.
//
//   pnpm create:app <name> [--no-install]
//
// Copies the starter's tracked files into apps/<name>, names the package
// @marismoon/<name>, gives it a dev port and an E2E port no other app uses,
// and runs `pnpm install`. The app keeps the starter's layout contract
// (AGENTS.md, scripts/check-layout.mjs, e2e/layout.spec.ts).
import { execFileSync } from "node:child_process"
import {
  cpSync,
  existsSync,
  globSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs"
import { dirname, join, relative } from "node:path"
import { fileURLToPath } from "node:url"

const root = fileURLToPath(new URL("../", import.meta.url))
const template = "templates/starter"
const starterDevPort = 5174
const starterTestPort = 4174

/** Ports already taken by the demo (Vite defaults), the starter and apps. */
export function usedPorts() {
  const dev = new Set([5173, starterDevPort])
  const test = new Set([4173, starterTestPort])
  for (const file of globSync("apps/*/vite.config.ts", { cwd: root })) {
    const port = /port:\s*(\d+)/.exec(readFileSync(join(root, file), "utf8"))
    if (port) dev.add(Number(port[1]))
  }
  for (const file of globSync("apps/*/playwright.config.ts", { cwd: root })) {
    for (const [, port] of readFileSync(join(root, file), "utf8").matchAll(
      /(?::|--port\s+)(\d{4,5})\b/g
    )) {
      test.add(Number(port))
    }
  }
  return { dev, test }
}

function nextFree(used, from) {
  let port = from
  while (used.has(port)) port++
  return port
}

export function createApp({ name, install = true }) {
  if (!/^[a-z][a-z0-9-]*$/.test(name ?? "")) {
    throw new Error(
      "Use a lowercase name of letters, digits and dashes, e.g. my-app."
    )
  }
  const target = join(root, "apps", name)
  if (existsSync(target)) throw new Error(`apps/${name} already exists.`)
  const packageName = `@marismoon/${name}`
  const taken = JSON.parse(
    execFileSync("pnpm", ["list", "-r", "--depth", "-1", "--json"], {
      cwd: root,
      encoding: "utf8",
    })
  ).some((pkg) => pkg.name === packageName)
  if (taken) throw new Error(`${packageName} is already used in the workspace.`)

  const { dev, test } = usedPorts()
  const devPort = nextFree(dev, starterDevPort + 1)
  const testPort = nextFree(test, starterTestPort + 1)

  const files = execFileSync("git", ["ls-files", "-z", template], {
    cwd: root,
    encoding: "utf8",
  })
    .split("\0")
    .filter(Boolean)
  if (!files.length) throw new Error(`${template} has no tracked files.`)
  for (const file of files) {
    const to = join(target, relative(template, file))
    mkdirSync(dirname(to), { recursive: true })
    cpSync(join(root, file), to)
  }

  const edit = (file, change) => {
    const path = join(target, file)
    const before = readFileSync(path, "utf8")
    const after = change(before)
    if (after === before) throw new Error(`Could not update ${file}.`)
    writeFileSync(path, after)
  }
  edit("package.json", (text) => {
    const manifest = JSON.parse(text)
    manifest.name = packageName
    return JSON.stringify(manifest, null, 2) + "\n"
  })
  edit("vite.config.ts", (text) =>
    text.replace(`port: ${starterDevPort}`, `port: ${devPort}`)
  )
  edit("playwright.config.ts", (text) =>
    text.replaceAll(String(starterTestPort), String(testPort))
  )

  if (install) {
    execFileSync("pnpm", ["install"], { cwd: root, stdio: "inherit" })
  }
  return { target, packageName, devPort, testPort }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2)
  const name = args.find((arg) => !arg.startsWith("--"))
  try {
    const app = createApp({ name, install: !args.includes("--no-install") })
    const filter = `pnpm --filter ${app.packageName}`
    console.log(`
Created ${relative(root, app.target)} (${app.packageName}).
  Dev server:  ${filter} dev        → http://localhost:${app.devPort}
  E2E port:    ${app.testPort}
  First E2E:   ${filter} exec playwright install chromium
  Checks:      ${filter} typecheck | lint | build | test | test:ui

Add pages in src/features/ and register them in src/app/workspace-modules.ts.
The layout contract is in ${relative(root, app.target)}/AGENTS.md.`)
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    console.error("Usage: pnpm create:app <name> [--no-install]")
    process.exitCode = 1
  }
}
