import { chartSpring, chartSprings } from "./chart-springs"
import type { Transition } from "motion/react"
import { DEFAULT_CHART_ENTER_TRANSITION } from "./animation"

export function transitionWithDelay(
  transition: Transition | undefined,
  delaySeconds: number,
  fallback: Transition = DEFAULT_CHART_ENTER_TRANSITION
): Transition {
  const base = transition ?? fallback
  return { ...base, delay: delaySeconds }
}

export interface SpringOptions {
  stiffness: number
  damping: number
  mass?: number
}

export function springOptionsFromTransition(
  transition?: Transition,
  fallback: SpringOptions = chartSprings.fallback
): SpringOptions {
  if (!transition) {
    return chartSpring(fallback.stiffness, fallback.damping, fallback.mass)
  }
  if (transition.type === "spring") {
    const bounce =
      typeof transition.bounce === "number" ? transition.bounce : undefined
    const baseStiffness =
      typeof transition.stiffness === "number"
        ? transition.stiffness
        : fallback.stiffness
    const baseDamping =
      typeof transition.damping === "number"
        ? transition.damping
        : fallback.damping
    const stiffness =
      bounce == null
        ? baseStiffness
        : Math.min(400, Math.max(80, baseStiffness * (1 + bounce * 0.35)))
    const damping =
      bounce == null
        ? baseDamping
        : Math.max(8, baseDamping * (1 - bounce * 0.25))
    return chartSpring(
      stiffness,
      damping,
      typeof transition.mass === "number" ? transition.mass : fallback.mass
    )
  }
  const duration =
    "duration" in transition && typeof transition.duration === "number"
      ? transition.duration
      : 0.8
  return chartSpring(
    Math.min(500, Math.max(40, 280 / duration)),
    Math.min(40, Math.max(12, 18 + duration * 4))
  )
}
