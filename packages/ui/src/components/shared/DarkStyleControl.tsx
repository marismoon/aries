import { useTheme } from "next-themes"
import { useState } from "react"

import { AppIcon, SolarWindowFrame } from "../icons"
import { Button } from "../ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import {
  getActiveDarkStyle,
  setStoredDarkStyle,
  type DarkStyle,
} from "../../lib/storage"
import { useUiLabels } from "../../lib/ui-labels"

/** Header switch between the two dark looks, for comparing them. Dark mode
 * only: light mode shows exactly the controls it always did. */
export function DarkStyleControl() {
  const { resolvedTheme } = useTheme()
  const ui = useUiLabels()
  const labels: Record<DarkStyle, string> = {
    glass: ui.darkGlass,
    clean: ui.darkClean,
  }
  const [style, setStyle] = useState<DarkStyle>(getActiveDarkStyle)

  if (resolvedTheme !== "dark") return null

  const next: DarkStyle = style === "glass" ? "clean" : "glass"

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="workspace-mode-control"
          aria-label={ui.darkStyle}
          aria-pressed={style === "clean"}
          onClick={() => {
            setStoredDarkStyle(next)
            setStyle(next)
          }}
        >
          <AppIcon icon={SolarWindowFrame} size={20} aria-hidden="true" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={8}>
        {ui.darkTooltip(labels[style], labels[next])}
      </TooltipContent>
    </Tooltip>
  )
}
