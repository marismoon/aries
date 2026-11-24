import { expect, it } from "vitest"
import { paletteLabels } from "@marismoon/ui/lib/storage"
import shellBridge from "./ShellLabelsBridge.tsx?raw"
import uiBridge from "./UiLabelsBridge.tsx?raw"
import { resources } from "./resources"
import { uiEn } from "./ui-en"

it("covers both pages, navigation, and all translated shell and UI labels in English", () => {
  const { translation: zh } = resources["zh-CN"]
  const { translation: en } = resources.en
  expect(Object.keys(en).sort()).toEqual(Object.keys(zh).sort())
  for (const group of Object.keys(zh) as (keyof typeof zh)[]) {
    expect(Object.keys(en[group]).sort()).toEqual(Object.keys(zh[group]).sort())
    for (const value of Object.values(en[group])) {
      expect(value.trim()).not.toBe("")
      expect(value).not.toMatch(/[一-鿿]/)
    }
  }

  const calls = (shellBridge + uiBridge).matchAll(/\btl\(\s*"([^"]+)"/g)
  const sourceStrings = [
    ...Array.from(calls, ([, text]) => text ?? ""),
    ...Object.values(paletteLabels),
  ]
  for (const text of sourceStrings.filter((value) => /[一-鿿]/.test(value))) {
    expect(uiEn[text], text).toBeTruthy()
    expect(uiEn[text], text).not.toMatch(/[一-鿿]/)
  }
})
