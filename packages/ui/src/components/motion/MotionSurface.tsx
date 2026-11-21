import type { ReactNode } from "react"
import { useReducedMotion } from "motion/react"
import { div as MotionDiv } from "motion/react-m"

import { routeEntry } from "./motion-tokens"

export function MotionSurface({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion()

  return (
    <MotionDiv
      data-motion-surface="route"
      {...routeEntry}
      initial={reduceMotion ? false : routeEntry.initial}
    >
      {children}
    </MotionDiv>
  )
}
