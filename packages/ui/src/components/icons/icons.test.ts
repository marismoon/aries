import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

const dir = join(import.meta.dirname, "solar")
const files = readdirSync(dir).filter((name) => name.endsWith(".tsx"))
const variants = readFileSync(
  join(import.meta.dirname, "icon-variants.ts"),
  "utf8"
)
const bold = files.filter((name) => name.endsWith("-bold.tsx"))

describe("Solar 图标规范", () => {
  it("只使用 Linear 与 Bold 两种变体", () => {
    const others = files.filter(
      (name) => !name.endsWith("-linear.tsx") && !name.endsWith("-bold.tsx")
    )
    expect(others).toEqual([])
  })

  it("每个 Bold 都有同名 Linear 底图，并登记在 icon-variants.ts", () => {
    expect(bold.length).toBeGreaterThan(0)
    for (const name of bold) {
      const base = name.replace(/-bold\.tsx$/, "")
      expect(files, `${name} 缺少 ${base}-linear.tsx`).toContain(
        `${base}-linear.tsx`
      )
      expect(variants, `${name} 未登记`).toContain(`./solar/${base}-bold`)
      expect(variants, `${base}-linear 未登记`).toContain(
        `./solar/${base}-linear`
      )
    }
  })

  it("所有图标使用 24×24 网格，颜色只来自 currentColor", () => {
    for (const name of files) {
      const source = readFileSync(join(dir, name), "utf8")
      expect(source, name).toContain('viewBox="0 0 24 24"')
      expect(source, name).toContain('width="24"')
      expect(source, name).toContain('height="24"')
      // Mask definitions may use #fff; no other literal colors.
      expect(source.replaceAll('"#fff"', ""), name).not.toMatch(
        /#[0-9a-fA-F]{3,8}\b|rgb\(|hsl\(/
      )
    }
  })

  it("Bold 为实心（填充）绘制，Linear 使用 currentColor 描边或轮廓", () => {
    for (const name of files) {
      const source = readFileSync(join(dir, name), "utf8")
      if (name.endsWith("-bold.tsx"))
        expect(source, name).toContain('fill="currentColor"')
      else expect(source, name).toContain("currentColor")
    }
  })
})
