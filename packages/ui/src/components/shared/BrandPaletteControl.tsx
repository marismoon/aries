import { useState } from "react"
import { useTheme } from "next-themes"

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

// Palettes with no dark rendering (see DESIGN_SYSTEM §1): dark mode skips them.
const lightOnlyPalettes: ReadonlySet<Palette> = new Set(["marismoon-light"])

function getNextPalette(palette: Palette, dark: boolean): Palette {
  const order = dark
    ? paletteOrder.filter((item) => !lightOnlyPalettes.has(item))
    : paletteOrder
  return order[(order.indexOf(palette) + 1) % order.length] ?? palette
}

export function BrandPaletteControl() {
  const labels = useUiLabels()
  const [palette, setPalette] = useState(getActivePalette)
  const dark = useTheme().resolvedTheme === "dark"
  const nextPalette = getNextPalette(palette, dark)

  function cyclePalette() {
    const next = getNextPalette(getActivePalette(), dark)
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
