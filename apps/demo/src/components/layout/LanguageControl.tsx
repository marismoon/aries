import { useState } from "react"
import { useTranslation } from "react-i18next"

import { i18n } from "@/lib/i18n"
import {
  isLanguage,
  languages,
  setStoredLanguage,
  applyDocumentLanguage,
  type Language,
} from "@/lib/i18n/language"
import { useUiText } from "@/lib/i18n/use-ui-text"
import { AppIcon, SolarGlobal } from "@marismoon/ui/icons"
import { Button } from "@marismoon/ui/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@marismoon/ui/ui/tooltip"

const order = Object.keys(languages).filter(isLanguage)

/** Header switch that cycles the UI language, like the brand palette control. */
export function LanguageControl() {
  const tl = useUiText()
  const { i18n: active } = useTranslation()
  const current = isLanguage(active.language) ? active.language : order[0]!
  const [, setTick] = useState(0)
  const next: Language = order[(order.indexOf(current) + 1) % order.length]!

  function cycle() {
    setStoredLanguage(next)
    applyDocumentLanguage(next)
    void i18n.changeLanguage(next).then(() => setTick((n) => n + 1))
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="workspace-mode-control"
          aria-label={tl("语言")}
          onClick={cycle}
        >
          <AppIcon icon={SolarGlobal} size={20} aria-hidden="true" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={8}>
        {languages[current]} → {languages[next]}
      </TooltipContent>
    </Tooltip>
  )
}
