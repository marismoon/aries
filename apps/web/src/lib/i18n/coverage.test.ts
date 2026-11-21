import { describe, expect, it } from "vitest"

import { uiEn } from "./ui-en"
import { uiEnFeatures } from "./ui-en-features"

const cjk = /[\u4e00-\u9fff]/

// Raw source text of everything that renders user-facing copy.
const sources = import.meta.glob<string>(
  [
    "../../app/**/*.{ts,tsx}",
    "../../components/layout/**/*.{ts,tsx}",
    "../../features/{overview,bills,copilot}/**/*.{ts,tsx}",
    "../../features/settings/base-pages/**/*.{ts,tsx}",
    "!**/*.test.*",
  ],
  { query: "?raw", import: "default", eager: true }
)

describe("英文覆盖", () => {
  it("源码中以字面量传给 tl() / tl.parts() / UiTrans 的中文文案都有英文", () => {
    const dictionary = { ...uiEnFeatures, ...uiEn }
    const call = /\b(?:tl|tl\.parts)\(\s*"((?:[^"\\]|\\.)*)"/g
    const trans = /source="([^"]*)"/g
    const missing: string[] = []
    for (const [file, text] of Object.entries(sources)) {
      for (const match of [...text.matchAll(call), ...text.matchAll(trans)]) {
        const key = JSON.parse(`"${match[1] ?? ""}"`) as string
        if (cjk.test(key) && !(key in dictionary))
          missing.push(`${file}: ${key}`)
      }
    }
    expect(Object.keys(sources).length).toBeGreaterThan(20)
    expect(missing).toEqual([])
  })
})
