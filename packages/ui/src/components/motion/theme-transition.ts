import { flushSync } from "react-dom"

/** Mirrors `theme-reveal` in motion.css: a large surface, so the upper end of
 * the 150-500 ms range, decelerating, no overshoot (AGENTS.md §6). */
export const themeReveal = {
  duration: 460,
  easing: "cubic-bezier(0.23, 1, 0.32, 1)",
} as const

export type RevealOrigin = { x: number; y: number }

/** Radius that covers the viewport from `origin`. */
export function revealRadius(
  origin: RevealOrigin,
  viewport: { width: number; height: number }
) {
  return Math.hypot(
    Math.max(origin.x, viewport.width - origin.x),
    Math.max(origin.y, viewport.height - origin.y)
  )
}

/** Custom properties read by the `theme-reveal` keyframes in motion.css. */
export function revealProperties(origin: RevealOrigin, radius: number) {
  return {
    "--theme-reveal-x": `${origin.x}px`,
    "--theme-reveal-y": `${origin.y}px`,
    "--theme-reveal-r": `${Math.ceil(radius)}px`,
  }
}

function canReveal() {
  return (
    typeof document.startViewTransition === "function" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
}

let active: ViewTransition | null = null

/**
 * Applies a theme change and, where the View Transitions API exists and the
 * user has not asked for reduced motion, reveals the new theme as a circle
 * growing from `origin`. `apply` runs inside `flushSync` so the new theme
 * class is on <html> before the browser takes the "after" snapshot.
 *
 * The circle is a CSS animation on `::view-transition-new(root)` positioned by
 * custom properties. Animating the pseudo-element from script
 * (`element.animate` with `pseudoElement`) crashed Chromium renderers when
 * switches followed each other quickly.
 */
export function revealThemeChange(origin: RevealOrigin, apply: () => void) {
  // A second switch while one is still revealing lands at once.
  if (active) {
    active.skipTransition()
    apply()
    return
  }
  if (!canReveal()) {
    apply()
    return
  }

  const root = document.documentElement
  const properties = revealProperties(
    origin,
    revealRadius(origin, {
      width: window.innerWidth,
      height: window.innerHeight,
    })
  )
  for (const [name, value] of Object.entries(properties)) {
    root.style.setProperty(name, value)
  }
  root.dataset.themeTransition = ""

  const transition = document.startViewTransition(() => flushSync(apply))
  active = transition
  const cleanup = () => {
    if (active === transition) active = null
    delete root.dataset.themeTransition
    for (const name of Object.keys(properties)) {
      root.style.removeProperty(name)
    }
  }
  transition.finished.then(cleanup, cleanup)
}
