import { useSyncExternalStore } from "react"

import { AppIcon, SolarStar } from "@marismoon/ui/icons"
import { Button } from "@marismoon/ui/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@marismoon/ui/ui/tooltip"
import { useUiText } from "@/lib/i18n/use-ui-text"
import { AriesAntigravity } from "@marismoon/ui/shared/AriesAntigravity"
import { AriesLightfall } from "@marismoon/ui/shared/AriesLightfall"

const backdrops = ["magic-rings", "antigravity", "lightfall"] as const

export type GlassBackdrop = (typeof backdrops)[number]

const storageKey = "aries-demo-glass-backdrop"
const changeEvent = "aries-demo-glass-backdrop-change"

function isBackdrop(value: string | null): value is GlassBackdrop {
  return backdrops.some((backdrop) => backdrop === value)
}

function readBackdrop(): GlassBackdrop {
  try {
    const stored =
      localStorage.getItem(storageKey)?.replace(/^official-/, "") ?? null
    return isBackdrop(stored) ? stored : "magic-rings"
  } catch {
    return "magic-rings"
  }
}

function subscribeBackdrop(onChange: () => void) {
  window.addEventListener(changeEvent, onChange)
  window.addEventListener("storage", onChange)
  return () => {
    window.removeEventListener(changeEvent, onChange)
    window.removeEventListener("storage", onChange)
  }
}

export function useGlassBackdrop() {
  return useSyncExternalStore(
    subscribeBackdrop,
    readBackdrop,
    (): GlassBackdrop => "magic-rings"
  )
}

function setGlassBackdrop(value: GlassBackdrop) {
  try {
    localStorage.setItem(storageKey, value)
  } catch {
    // The choice simply does not persist without storage.
  }
  window.dispatchEvent(new Event(changeEvent))
}

/** Theme, dark material and palette, read from the root element. */
function readAppearance() {
  const root = document.documentElement
  return root.classList.contains("dark") && root.dataset.darkStyle !== "clean"
}

function subscribeAppearance(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class", "data-dark-style", "data-palette"],
  })
  return () => observer.disconnect()
}

export function GlassBackdropLayer({
  kind,
}: {
  kind: Exclude<GlassBackdrop, "magic-rings">
}) {
  const darkGlass = useSyncExternalStore(
    subscribeAppearance,
    readAppearance,
    () => false
  )
  if (!darkGlass) return null
  return kind === "antigravity" ? <AriesAntigravity /> : <AriesLightfall />
}

/** Header button cycling the glass backdrop. Dark glass only. */
export function GlassBackdropControl() {
  const tl = useUiText()
  const backdrop = useGlassBackdrop()
  const darkGlass = useSyncExternalStore(
    subscribeAppearance,
    readAppearance,
    () => false
  )
  if (!darkGlass) return null

  const labels: Record<GlassBackdrop, string> = {
    "magic-rings": "aries-Magic-Rings",
    lightfall: "aries-Lightfall",
    antigravity: "aries-Antigravity",
  }
  const next =
    backdrops[(backdrops.indexOf(backdrop) + 1) % backdrops.length] ??
    "magic-rings"

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="workspace-mode-control"
          aria-label={tl("玻璃背景")}
          onClick={() => setGlassBackdrop(next)}
        >
          <AppIcon icon={SolarStar} size={20} aria-hidden="true" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={8}>
        {tl("玻璃背景")} · {labels[backdrop]} → {labels[next]}
      </TooltipContent>
    </Tooltip>
  )
}
