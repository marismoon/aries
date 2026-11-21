import type { MotionProps } from "motion/react"

const easeOut = [0.23, 1, 0.32, 1] as const

export const routeEntry = {
  initial: { opacity: 0.65 },
  animate: { opacity: 1 },
  transition: { duration: 0.21, ease: easeOut },
} satisfies MotionProps

export const dialogEntry = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.18, ease: easeOut },
} satisfies MotionProps

export const overlayEntry = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.16, ease: easeOut },
} satisfies MotionProps
