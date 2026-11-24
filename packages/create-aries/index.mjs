#!/usr/bin/env node
// npm create @marismoon/aries@next [directory] [--no-install]
// pnpm create @marismoon/aries [directory] [--no-install]
//
// Copies the bundled template (the Aries starter with published package
// versions) into a new directory, names the package after it, and installs
// dependencies with pnpm.
import { execFileSync } from "node:child_process"
import {
  cpSync,
  existsSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs"
import { basename, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const template = fileURLToPath(new URL("./template", import.meta.url))

/** A valid npm package name derived from the directory name. */
export function packageNameFor(directory) {
  const name = basename(resolve(directory))
    .toLowerCase()
    .replace(/[^a-z0-9-~._]+/g, "-")
    .replace(/^[-._]+|[-._]+$/g, "")
  return name || "aries-app"
}

export function scaffold({ directory = "aries-app", templateDir = template }) {
  const target = resolve(directory)
  if (existsSync(target) && readdirSync(target).length) {
    throw new Error(`${target} is not empty. Choose a new directory.`)
  }
  if (!existsSync(templateDir)) {
    throw new Error(`Template not found at ${templateDir}.`)
  }
  cpSync(templateDir, target, { recursive: true })
  const manifestPath = resolve(target, "package.json")
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"))
  manifest.name = packageNameFor(directory)
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n")
  return { target, name: manifest.name }
}

function hasPnpm() {
  try {
    execFileSync("pnpm", ["--version"], { stdio: "ignore" })
    return true
  } catch {
    return false
  }
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const args = process.argv.slice(2)
  const directory = args.find((arg) => !arg.startsWith("-"))
  try {
    const { target } = scaffold({ directory })
    const relativePath = relative(process.cwd(), target) || "."
    const where = /\s/.test(relativePath) ? `"${relativePath}"` : relativePath
    let installed = false
    if (!args.includes("--no-install") && hasPnpm()) {
      execFileSync("pnpm", ["install"], { cwd: target, stdio: "inherit" })
      installed = true
    }
    console.log(`
Created ${where}.

  cd ${where}${installed ? "" : "\n  pnpm install            # this project uses pnpm"}
  pnpm dev                     # http://localhost:5174
  pnpm exec playwright install chromium   # once, for pnpm test:ui

Add pages in src/features/ and register them in src/app/workspace-modules.ts.
AGENTS.md holds the layout contract; pnpm lint and pnpm test:ui enforce it.`)
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    console.error(
      "Usage: npm create @marismoon/aries@next <directory> [--no-install]"
    )
    process.exitCode = 1
  }
}
