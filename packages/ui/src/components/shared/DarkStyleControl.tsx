import { useTheme } from "next-themes"
import { useState } from "react"
import { useReducedMotion } from "motion/react"
import { span as MotionSpan } from "motion/react-m"

import { AppIcon, SolarWindowFrame } from "../icons"
import { Button } from "../ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import {
  getActiveDarkStyle,
  setStoredDarkStyle,
  type DarkStyle,
} from "../../lib/storage"
import { useUiLabels } from "../../lib/ui-labels"

const iconEaseOut = [0.23, 1, 0.32, 1] as const

/** Header switch between the two dark looks, for comparing them. Dark mode
 * only: light mode shows exactly the controls it always did. */
export function DarkStyleControl() {
  const { resolvedTheme } = useTheme()
  const reducedMotion = Boolean(useReducedMotion())
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
          <MotionSpan
            key={style}
            className="inline-grid place-items-center"
            initial={reducedMotion ? false : { scale: 0.86, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={
              reducedMotion
                ? { duration: 0 }
                : { duration: 0.2, ease: iconEaseOut }
            }
          >
            <AppIcon icon={SolarWindowFrame} size={20} aria-hidden="true" />
          </MotionSpan>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={8}>
        {ui.darkTooltip(labels[style], labels[next])}
      </TooltipContent>
    </Tooltip>
  )
}
