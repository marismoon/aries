import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  symlinkSync,
  writeFileSync,
} from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { test } from "node:test"

import { packageNameFor, scaffold } from "./index.mjs"

test("目录名转换为合法包名", () => {
  assert.equal(packageNameFor("My App"), "my-app")
  assert.equal(packageNameFor("/tmp/orders_console/"), "orders_console")
  assert.equal(packageNameFor("..."), "aries-app")
})

test("复制模板并以目录名命名包，拒绝非空目录", () => {
  const work = mkdtempSync(join(tmpdir(), "create-aries-"))
  const templateDir = join(work, "template")
  mkdirSync(join(templateDir, "src"), { recursive: true })
  writeFileSync(
    join(templateDir, "package.json"),
    JSON.stringify({ name: "aries-app", private: true })
  )
  writeFileSync(join(templateDir, "src", "main.tsx"), "export {}\n")

  const { target, name } = scaffold({
    directory: join(work, "Orders Console"),
    templateDir,
  })
  assert.equal(name, "orders-console")
  assert.equal(
    JSON.parse(readFileSync(join(target, "package.json"), "utf8")).name,
    "orders-console"
  )
  assert.equal(
    readFileSync(join(target, "src", "main.tsx"), "utf8"),
    "export {}\n"
  )
  assert.throws(() => scaffold({ directory: target, templateDir }), /not empty/)
})

test("经 node_modules/.bin 的符号链接调用时也会执行（npm create 的方式）", () => {
  const work = mkdtempSync(join(tmpdir(), "create-aries-bin-"))
  const bin = join(work, "create-aries")
  symlinkSync(fileURLToPath(new URL("./index.mjs", import.meta.url)), bin)
  writeFileSync(join(work, "occupied"), "")
  // A non-empty target makes the CLI exit with an error before copying, which
  // proves the command ran without needing the built template.
  let output = ""
  try {
    execFileSync(process.execPath, [bin, work, "--no-install"], {
      encoding: "utf8",
      stdio: "pipe",
    })
  } catch (error) {
    output = String(error.stderr)
  }
  assert.match(output, /not empty/)
})
