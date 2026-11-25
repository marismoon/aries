import type { MotionProps } from "motion/react"

const easeOut = [0.23, 1, 0.32, 1] as const

export const routeEntry = {
  initial: { opacity: 0.65 },
  animate: { opacity: 1 },
  transition: { duration: 0.21, ease: easeOut },
} satisfies MotionProps

/** Dialog panel: rises 8px and settles from 98% scale. The exit mirrors it in
 * CSS (`aries-dialog-content-exit` in motion.css), because Radix keeps the
 * closing node in the DOM only for CSS animations. */
export const dialogEntry = {
  initial: { opacity: 0, y: 8, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.2, ease: easeOut },
} satisfies MotionProps

/** A block that appears after a state change (loaded content, a new list
 * entry, a confirmation badge). */
export const contentEntry = {
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, transition: { duration: 0.12, ease: easeOut } },
  transition: { duration: 0.22, ease: easeOut },
} satisfies MotionProps

export const overlayEntry = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.16, ease: easeOut },
} satisfies MotionProps
