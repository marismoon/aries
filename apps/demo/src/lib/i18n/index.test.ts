import { afterEach, describe, expect, it } from "vitest"

import { workspacePages } from "@/app/workspace-pages"
import { workspaceModules } from "@/components/layout/workspace-modules"
import { i18n } from "./index"
import {
  applyDocumentLanguage,
  getStoredLanguage,
  setStoredLanguage,
} from "./language"
import { uiEn } from "./ui-en"

afterEach(() => {
  localStorage.clear()
})

describe("本地化文案", () => {
  it("提供中文默认文案及英文页面文案", () => {
    expect(i18n.t("overview.title")).toBe("运营总览")
    expect(i18n.getFixedT("en")("bills.title")).toBe("Monthly bills")
    expect(i18n.getFixedT("en")("overview.pending")).toBe("Needs manual review")
  })

  it("每个已注册页面的标题与副标题键在两种语言中都存在且英文已翻译", () => {
    const en = i18n.getFixedT("en")
    const zh = i18n.getFixedT("zh-CN")
    for (const page of Object.values(workspacePages)) {
      const keys = [
        page.titleKey,
        "descriptionKey" in page ? page.descriptionKey : undefined,
      ]
      for (const key of keys) {
        if (!key) continue
        expect(zh(key), key).not.toBe(key)
        expect(en(key), key).not.toBe(key)
        expect(en(key), key).not.toMatch(/[一-鿿]/)
      }
    }
  })

  it("导航标签、页面面包屑都有英文", () => {
    const labels = new Set<string>()
    for (const module of Object.values(workspaceModules)) {
      labels.add(module.label)
      for (const entry of module.entries) {
        labels.add(entry.label)
        if (entry.kind === "folder") {
          for (const { label } of entry.children) labels.add(label)
        }
      }
    }
    for (const page of Object.values(workspacePages)) {
      for (const { label } of page.breadcrumbs) labels.add(label)
    }
    const missing = [...labels].filter((label) => !(label in uiEn))
    expect(missing).toEqual([])
  })

  it("语言偏好可存取，未知值回退到中文，并同步 html lang", () => {
    expect(getStoredLanguage()).toBe("zh-CN")
    setStoredLanguage("en")
    expect(getStoredLanguage()).toBe("en")
    localStorage.setItem("marismoon-language", "xx")
    expect(getStoredLanguage()).toBe("zh-CN")
    applyDocumentLanguage("en")
    expect(document.documentElement.lang).toBe("en")
  })

  it("ui 命名空间：英文有译文，缺失时回退为中文原文", () => {
    const en = i18n.getFixedT("en", "ui", undefined)
    const options = { keySeparator: false, nsSeparator: false } as const
    expect(en("总览", options)).toBe("Overview")
    expect(
      en("尚未翻译的文案", { ...options, defaultValue: "尚未翻译的文案" })
    ).toBe("尚未翻译的文案")
  })
})
