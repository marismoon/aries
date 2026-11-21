import { useMemo } from "react"
import { useTranslation } from "react-i18next"

/**
 * Translate a Chinese source string through the `ui` namespace.
 *
 * Navigation labels, aria-labels and other short UI text are keyed by their
 * Chinese source text, so Chinese keeps working without an entry and a missing
 * English entry falls back to the source text. Add English in `ui-en.ts`.
 * Interpolation uses `{{name}}` placeholders: `tl("共 {{count}} 条", { count })`.
 * Page titles and descriptions use dotted keys with `t()` instead.
 */
export function useUiText() {
  const { t } = useTranslation()
  // `t` changes with the language, so memo consumers can list `tl` as a dep.
  return useMemo(() => {
    const tl = (source: string, values?: Record<string, string | number>) =>
      t(source, {
        ns: "ui",
        keySeparator: false,
        nsSeparator: false,
        defaultValue: source,
        ...values,
      })
    /** Translate each part of a "标题 · 说明" style string on its own. */
    const parts = (source: string) =>
      source
        .split(" · ")
        .map((part) => tl(part))
        .join(" · ")
    return Object.assign(tl, { parts })
  }, [t])
}
