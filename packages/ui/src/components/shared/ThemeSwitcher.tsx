import { AnimatePresence } from "motion/react"
import { span as MotionSpan } from "motion/react-m"
import { useTheme } from "next-themes"
import { useState, useSyncExternalStore } from "react"

import { AppIcon, SolarMoon, SolarSun } from "../icons"
import { revealThemeChange } from "../motion/theme-transition"
import { Button } from "../ui/button"
import { cn } from "../../lib/utils"
import { useUiLabels } from "../../lib/ui-labels"

const iconEaseOut = [0.23, 1, 0.32, 1] as const
const reducedMotionQuery = "(prefers-reduced-motion: reduce)"

function subscribeToMotionPreference(onChange: () => void) {
  const media = window.matchMedia(reducedMotionQuery)
  media.addEventListener("change", onChange)
  return () => media.removeEventListener("change", onChange)
}

function prefersReducedMotion() {
  return window.matchMedia(reducedMotionQuery).matches
}

function resolvesDark(theme: string) {
  return theme === "system"
    ? window.matchMedia("(prefers-color-scheme: dark)").matches
    : theme === "dark"
}

/** Reveals the new theme from the button's centre when the page actually
 * changes colour; a no-op switch (e.g. to "system" that resolves to the
 * current theme) just applies. */
function changeTheme(button: HTMLElement, next: string, apply: () => void) {
  const isDark = document.documentElement.classList.contains("dark")
  if (resolvesDark(next) === isDark) {
    apply()
    return
  }
  const rect = button.getBoundingClientRect()
  revealThemeChange(
    { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
    apply
  )
}

export function ThemeSwitcher({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [iconReset, setIconReset] = useState(0)
  const reduceMotion = useSyncExternalStore(
    subscribeToMotionPreference,
    prefersReducedMotion,
    () => null
  )
  const labels = useUiLabels()
  const ready =
    reduceMotion !== null &&
    (resolvedTheme === "dark" || resolvedTheme === "light")
  const dark = resolvedTheme === "dark"
  const target = dark ? "light" : "dark"
  const label = ready
    ? target === "light"
      ? labels.themeToLight
      : labels.themeToDark
    : labels.themeLoading
  const icon = (
    <AppIcon icon={dark ? SolarMoon : SolarSun} size={20} aria-hidden="true" />
  )
  const hiddenIcon = { rotate: dark ? -90 : 90, scale: 0 }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn("workspace-mode-control", className)}
      aria-label={label}
      aria-description={labels.themeShiftHint}
      aria-keyshortcuts="Shift+Enter Shift+Space"
      title={ready ? labels.themeTitle(label) : label}
      disabled={!ready}
      onClick={(event) => {
        const resetIcon = event.detail === 0 || event.shiftKey
        const next = event.shiftKey ? "system" : target
        changeTheme(event.currentTarget, next, () => {
          if (resetIcon) setIconReset((current) => current + 1)
          setTheme(next)
        })
      }}
      onKeyDown={(event) => {
        if (event.shiftKey && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault()
          changeTheme(event.currentTarget, "system", () => {
            setIconReset((current) => current + 1)
            setTheme("system")
          })
        }
      }}
    >
      {ready &&
        (reduceMotion ? (
          icon
        ) : (
          <AnimatePresence key={iconReset} initial={false} mode="wait">
            <MotionSpan
              key={resolvedTheme}
              className="flex text-foreground"
              initial={hiddenIcon}
              animate={{ rotate: 0, scale: 1 }}
              exit={{
                ...hiddenIcon,
                transition: { duration: 0.085, ease: iconEaseOut },
              }}
              transition={{ duration: 0.115, ease: iconEaseOut }}
            >
              {icon}
            </MotionSpan>
          </AnimatePresence>
        ))}
    </Button>
  )
}
