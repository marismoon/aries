/** Supported UI languages. The key is the i18next language code. */
export const languages = {
  "zh-CN": "中文",
  en: "English",
} as const

export type Language = keyof typeof languages

export const defaultLanguage: Language = "zh-CN"
const languageStorageKey = "marismoon-language"

export function isLanguage(
  value: string | null | undefined
): value is Language {
  return typeof value === "string" && Object.hasOwn(languages, value)
}

export function getStoredLanguage(): Language {
  try {
    const stored = localStorage.getItem(languageStorageKey)
    if (isLanguage(stored)) return stored
  } catch {
    // Browser storage can be unavailable; the default language still works.
  }
  return defaultLanguage
}

export function setStoredLanguage(language: Language) {
  try {
    localStorage.setItem(languageStorageKey, language)
  } catch {
    // The choice just won't persist across reloads.
  }
}

/** Keep `<html lang>` in step with the UI language (screen readers, hyphenation). */
export function applyDocumentLanguage(language: string) {
  document.documentElement.lang = language
}
