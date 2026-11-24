import { AppIcon, SolarGlobal } from "@aries/ui/icons"
import { Button } from "@aries/ui/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@aries/ui/ui/tooltip"

import { useShellLabels, type LanguageControlProps } from "../../types/labels"

/** Header switch that cycles the UI language, like the brand palette control. */
export function LanguageControl({
  value,
  options,
  onChange,
}: LanguageControlProps) {
  const labels = useShellLabels()
  const index = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  )
  const current = options[index]
  const next = options[(index + 1) % options.length]
  if (!current || !next) return null

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="workspace-mode-control"
          aria-label={labels.language}
          onClick={() => onChange(next.value)}
        >
          <AppIcon icon={SolarGlobal} size={20} aria-hidden="true" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={8}>
        {current.label} → {next.label}
      </TooltipContent>
    </Tooltip>
  )
}
