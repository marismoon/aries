// External consumer test: installs @marismoon/ui and @marismoon/shell from the
// tarballs `pnpm pack` produces, outside the workspace, and checks two hosts.
//
//   pnpm test:consumer            # Vite (exported starter) and Next.js
//   pnpm test:consumer -- --vite  # Vite only
//
// 1. Vite: scaffolds a project with the @marismoon/create-aries CLI (its
//    template built by scripts/export-starter.mjs), then runs its typecheck,
//    lint (incl. the layout guard), test, build and E2E (smoke and layout
//    contract), and requires its production CSS to be byte-identical to the
//    in-workspace starter build.
// 2. Next.js: builds a minimal App Router app that renders UI and Shell
//    components (server and client), and checks the prerendered HTML and CSS.
//
// Needs network access for the Next.js install and an installed Playwright
// Chromium for the starter smoke test.
import { execFileSync } from "node:child_process"
import {
  existsSync,
  globSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  symlinkSync,
  writeFileSync,
} from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { fileURLToPath } from "node:url"

import { readCatalogs } from "./export-starter.mjs"

const root = fileURLToPath(new URL("../", import.meta.url))
const NEXT_VERSION = "16.4.6"
const viteOnly = process.argv.includes("--vite")
const work = mkdtempSync(join(tmpdir(), "aries-consumer-"))
const tarballs = join(work, "tarballs")
const results = []

function run(command, args, cwd, env = {}) {
  console.log(`\n$ ${command} ${args.join(" ")}  (${cwd})`)
  execFileSync(command, args, {
    cwd,
    stdio: "inherit",
    env: { ...process.env, ...env },
  })
}

function step(label, fn) {
  fn()
  results.push(label)
  console.log(`✓ ${label}`)
}

function css(dir) {
  return globSync("**/*.css", { cwd: dir })
    .sort()
    .map((file) => readFileSync(join(dir, file), "utf8"))
    .join("")
}

mkdirSync(tarballs)
step("pack @marismoon/ui and @marismoon/shell", () => {
  for (const pkg of ["ui", "shell"]) {
    run(
      "pnpm",
      ["pack", "--pack-destination", tarballs],
      join(root, "packages", pkg)
    )
  }
})

// --- Vite host: a project created by @marismoon/create-aries ---------------
// Builds the create-aries template from the tarballs, then scaffolds with the
// CLI exactly as `npm create @marismoon/aries` would (install runs below).
const createAries = join(root, "packages", "create-aries")
step("create-aries: build template from tarballs", () =>
  run("node", ["build-template.mjs", "--tarballs", tarballs], createAries)
)
const starter = join(work, "aries-consumer-starter")
// npm and pnpm start the CLI through a symlink in node_modules/.bin; call it
// the same way, so an entry-point check that compares paths is exercised.
const bin = join(work, "node_modules", ".bin", "create-aries")
mkdirSync(join(work, "node_modules", ".bin"), { recursive: true })
symlinkSync(join(createAries, "index.mjs"), bin)
step("create-aries: scaffold a project through the bin symlink", () => {
  run("node", [bin, starter, "--no-install"], work)
  if (!existsSync(join(starter, "package.json")))
    throw new Error("create-aries did not create the project")
})
// Use a port of its own so it never reuses a dev server from the workspace.
const playwright = join(starter, "playwright.config.ts")
writeFileSync(
  playwright,
  readFileSync(playwright, "utf8").replaceAll("4174", "4176")
)

step("starter: install from tarballs", () =>
  run("pnpm", ["install", "--prefer-offline"], starter)
)
for (const script of ["typecheck", "lint", "test", "build"]) {
  step(`starter: ${script}`, () => run("pnpm", ["run", script], starter))
}
step("starter: smoke and layout E2E", () =>
  run("pnpm", ["run", "test:ui"], starter, { CI: "1" })
)
step("starter: production CSS matches the workspace build", () => {
  run("pnpm", ["--filter", "@marismoon/starter", "build"], root)
  const inside = css(join(root, "templates/starter/dist/assets"))
  const outside = css(join(starter, "dist/assets"))
  if (inside !== outside) {
    throw new Error(
      `Starter CSS differs: workspace ${inside.length} bytes, consumer ${outside.length} bytes`
    )
  }
})

// --- Next.js host -----------------------------------------------------------
if (!viteOnly) {
  const app = join(work, "next")
  const { "": catalog } = readCatalogs()
  const tarball = (name) =>
    `file:${globSync(`${name}-*.tgz`, { cwd: tarballs }).map((f) => join(tarballs, f))[0]}`
  const files = {
    "package.json": JSON.stringify(
      {
        name: "aries-consumer-next",
        private: true,
        type: "module",
        scripts: { build: "next build" },
        dependencies: {
          "@marismoon/shell": tarball("marismoon-shell"),
          "@marismoon/ui": tarball("marismoon-ui"),
          next: NEXT_VERSION,
          react: catalog.react,
          "react-dom": catalog["react-dom"],
        },
        devDependencies: {
          "@tailwindcss/postcss": catalog.tailwindcss,
          "@types/node": catalog["@types/node"],
          "@types/react": catalog["@types/react"],
          "@types/react-dom": catalog["@types/react-dom"],
          tailwindcss: catalog.tailwindcss,
          typescript: catalog.typescript,
        },
      },
      null,
      2
    ),
    "pnpm-workspace.yaml": `packages: []\nallowBuilds:\n  sharp: false\n  "@tailwindcss/oxide": true\noverrides:\n  "@marismoon/ui": "${tarball("marismoon-ui")}"\n`,
    "postcss.config.mjs": `export default { plugins: { "@tailwindcss/postcss": {} } }\n`,
    "next.config.mjs": `export default {}\n`,
    "tsconfig.json": JSON.stringify(
      {
        compilerOptions: {
          target: "ES2024",
          lib: ["ES2024", "DOM", "DOM.Iterable"],
          module: "esnext",
          moduleResolution: "bundler",
          jsx: "react-jsx",
          strict: true,
          noEmit: true,
          esModuleInterop: true,
          isolatedModules: true,
          resolveJsonModule: true,
          incremental: true,
          plugins: [{ name: "next" }],
        },
        include: [
          "next-env.d.ts",
          "app/**/*.ts",
          "app/**/*.tsx",
          ".next/types/**/*.ts",
        ],
      },
      null,
      2
    ),
    "app/globals.css": `@import "@marismoon/ui/styles/globals.css";\n@import "@marismoon/ui/styles/fonts.css";\n@import "@marismoon/shell/styles";\n@source "./";\n`,
    "app/layout.tsx": `import "./globals.css"
import type { ReactNode } from "react"

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
`,
    "app/page.tsx": `import { Button } from "@marismoon/ui/ui/button"
import { ShellPreview } from "./shell-preview"

export default function Page() {
  return (
    <main>
      <Button>服务端按钮</Button>
      <ShellPreview />
    </main>
  )
}
`,
    "app/shell-preview.tsx": `"use client"

import {
  AppShell,
  LanguageControl,
  NavTree,
  ShellLabelsProvider,
  ShellLink,
  ShellRouterProvider,
  type ShellLabels,
  type WorkspaceNavigation,
} from "@marismoon/shell"
import { Input } from "@marismoon/ui/ui/input"
import { TooltipProvider } from "@marismoon/ui/ui/tooltip"
import { useState } from "react"

const labels = new Proxy({} as ShellLabels, { get: (_, key) => String(key) })
const options = [
  { value: "zh-CN", label: "简体中文" },
  { value: "en", label: "English" },
]
const navigation: WorkspaceNavigation = {
  modules: [
    {
      id: "bills",
      label: "账单",
      icon: null,
      railPosition: "main",
      visibleOnMobile: true,
      items: [{ id: "list", label: "账单列表", path: "/bills" }],
      commands: { triggerLabel: "搜索账单", placeholder: "搜索", items: [] },
    },
  ],
  directoryDescription: "目录",
  createLabel: "新建",
  unavailableLabel: "暂不可用",
  brandLabel: "Aries",
  brandPath: "/",
  brandMark: null,
  userLabel: "示例用户",
  avatarSrc: "",
  avatarFallback: "A",
}

export function ShellPreview() {
  const [language, setLanguage] = useState("zh-CN")
  const languageControl = { value: language, options, onChange: setLanguage }
  return (
    <ShellRouterProvider value={{ activePath: "/bills" }}>
      <ShellLabelsProvider value={{ labels, languageControl }}>
        <TooltipProvider>
          <AppShell navigation={navigation} routeModule="bills">
            <ul>
              <NavTree label="工作区" icon={null}>
                <li>
                  <ShellLink to="/bills" end>
                    账单
                  </ShellLink>
                </li>
              </NavTree>
            </ul>
            <LanguageControl {...languageControl} />
            <Input aria-label="搜索" />
          </AppShell>
        </TooltipProvider>
      </ShellLabelsProvider>
    </ShellRouterProvider>
  )
}
`,
  }
  for (const [file, text] of Object.entries(files)) {
    mkdirSync(join(app, file, ".."), { recursive: true })
    writeFileSync(join(app, file), text)
  }
  step("next: install from tarballs", () =>
    run("pnpm", ["install", "--prefer-offline"], app)
  )
  step("next: build (type-checks and prerenders the page)", () =>
    run("pnpm", ["run", "build"], app, { NEXT_TELEMETRY_DISABLED: "1" })
  )
  step("next: prerendered HTML and CSS contain UI and Shell output", () => {
    const html = readFileSync(join(app, ".next/server/app/index.html"), "utf8")
    for (const text of [
      "服务端按钮",
      "账单列表",
      'aria-current="page"',
      'data-slot="button"',
    ]) {
      if (!html.includes(text))
        throw new Error(`Prerendered HTML is missing ${text}`)
    }
    const styles = css(join(app, ".next/static"))
    for (const selector of [
      ".workspace-nav-item",
      ".workspace-mode-control",
      "--glass",
      "@font-face",
    ]) {
      if (!styles.includes(selector))
        throw new Error(`Next.js CSS is missing ${selector}`)
    }
  })
}

console.log(`\nConsumer test passed (${results.length} checks) in ${work}`)
