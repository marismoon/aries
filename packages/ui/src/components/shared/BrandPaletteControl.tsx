import { useState } from "react"

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

function getNextPalette(palette: Palette): Palette {
  return (
    paletteOrder[(paletteOrder.indexOf(palette) + 1) % paletteOrder.length] ??
    palette
  )
}

export function BrandPaletteControl() {
  const labels = useUiLabels()
  const [palette, setPalette] = useState(getActivePalette)
  const nextPalette = getNextPalette(palette)

  function cyclePalette() {
    const next = getNextPalette(getActivePalette())
    setStoredPalette(next)
    setPalette(next)
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
          <AppIcon icon={SolarPalette} size={20} aria-hidden="true" />
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
