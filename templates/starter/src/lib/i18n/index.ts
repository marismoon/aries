import i18next from "i18next"
import { initReactI18next } from "react-i18next"
import { applyDocumentLanguage, getStoredLanguage } from "./language"
import { resources } from "./resources"
import { uiEn } from "./ui-en"

export const i18n = i18next.createInstance()
const initialLanguage = getStoredLanguage()

void i18n.use(initReactI18next).init({
  resources: {
    ...resources,
    en: { ...resources.en, ui: uiEn },
  },
  lng: initialLanguage,
  fallbackLng: "zh-CN",
  initAsync: false,
  interpolation: { escapeValue: false },
})

applyDocumentLanguage(initialLanguage)
