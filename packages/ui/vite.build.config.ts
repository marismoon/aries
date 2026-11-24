import { globSync } from "node:fs"
import { relative, resolve } from "node:path"
import { defineConfig } from "vite"

const root = import.meta.dirname
const sources = globSync("src/**/*.{ts,tsx}", { cwd: root }).filter(
  (file) => !/\.test\.tsx?$/.test(file)
)

export default defineConfig({
  oxc: { jsx: { runtime: "automatic" } },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    minify: false,
    copyPublicDir: false,
    lib: {
      entry: Object.fromEntries(
        sources.map((file) => [
          relative("src", file).replace(/\.tsx?$/, ""),
          resolve(root, file),
        ])
      ),
      formats: ["es"],
    },
    rolldownOptions: {
      // "use client" stays on the first line of each module; preserved modules
      // keep their directives, so the bundler warning is noise here.
      onLog(level, log, handler) {
        if (log.code === "MODULE_LEVEL_DIRECTIVE") return
        handler(level, log)
      },
      // Package imports stay bare; CSS side-effect imports stay as written and
      // are copied next to the output by the build script.
      external: (id) =>
        id.endsWith(".css") || !(id.startsWith(".") || id.startsWith("/")),
      output: {
        preserveModules: true,
        preserveModulesRoot: "src",
        entryFileNames: "[name].js",
      },
    },
  },
})
