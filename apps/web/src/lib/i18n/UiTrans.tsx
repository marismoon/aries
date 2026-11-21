import type { ReactElement } from "react"
import { Trans } from "react-i18next"

/**
 * Translate a sentence that contains inline elements. The source is the Chinese
 * text with numbered tags (`<0>…</0>`) that map to `components` by index, and
 * `{{name}}` placeholders filled from `values`.
 */
export function UiTrans({
  source,
  components,
  values,
}: {
  source: string
  components: readonly ReactElement[]
  values?: Record<string, string | number>
}) {
  return (
    <Trans
      i18nKey={source}
      defaults={source}
      ns="ui"
      tOptions={{ keySeparator: false, nsSeparator: false }}
      components={[...components]}
      values={values}
    />
  )
}
