import { useTranslation } from "react-i18next"

export function SettingsPage() {
  const { t } = useTranslation()
  return <p className="text-muted-foreground">{t("settings.body")}</p>
}
