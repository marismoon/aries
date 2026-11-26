import { useState } from "react"
import { useReducedMotion } from "motion/react"
import { span as MotionSpan } from "motion/react-m"

import { AppIcon, SolarPalette } from "../icons"
import { Button } from "../ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import {
  getActivePalette,
  isPalette,
  paletteLabels,
  setStoredPalette,
} from "../../lib/storage"
import { useUiLabels } from "../../lib/ui-labels"

type Palette = keyof typeof paletteLabels

const paletteOrder = Object.keys(paletteLabels).filter(isPalette)
const iconEaseOut = [0.23, 1, 0.32, 1] as const

function getNextPalette(palette: Palette): Palette {
  return (
    paletteOrder[(paletteOrder.indexOf(palette) + 1) % paletteOrder.length] ??
    palette
  )
}

export function BrandPaletteControl() {
  const labels = useUiLabels()
  const reducedMotion = Boolean(useReducedMotion())
  const [palette, setPalette] = useState(getActivePalette)
  const [pulseCount, setPulseCount] = useState(0)
  const nextPalette = getNextPalette(palette)

  function cyclePalette() {
    const next = getNextPalette(getActivePalette())
    setStoredPalette(next)
    setPalette(next)
    setPulseCount((c) => c + 1)
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="workspace-mode-control"
          aria-label={labels.brandPalette}
          onClick={cyclePalette}
        >
          <MotionSpan
            key={pulseCount}
            className="inline-grid place-items-center"
            initial={
              reducedMotion || pulseCount === 0
                ? false
                : { rotate: -24, scale: 0.88 }
            }
            animate={{ rotate: 0, scale: 1 }}
            transition={
              reducedMotion
                ? { duration: 0 }
                : { duration: 0.24, ease: iconEaseOut }
            }
          >
            <AppIcon icon={SolarPalette} size={20} aria-hidden="true" />
          </MotionSpan>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={8}>
        {labels.brandTooltip(
          labels.paletteName(palette, paletteLabels[palette]),
          labels.paletteName(nextPalette, paletteLabels[nextPalette])
        )}
      </TooltipContent>
    </Tooltip>
  )
}
