import { useTranslation } from "react-i18next"

export function useUiText() {
  const { t } = useTranslation("ui")
  return (source: string, values?: Record<string, string | number>) =>
    t(source, {
      keySeparator: false,
      nsSeparator: false,
      defaultValue: source,
      ...values,
    })
}
