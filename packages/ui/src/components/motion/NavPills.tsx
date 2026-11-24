import { AnimatePresence, useReducedMotion } from "motion/react"
import { span as MotionSpan } from "motion/react-m"

type PillRect = { x: number; y: number; width: number; height: number }

/** Matches `NavHighlightRects` from `@marismoon/shell`. */
export type NavPillsProps = {
  active: PillRect | null
  hover: PillRect | null
}

/** Critically damped (damping ≥ 2√stiffness): the pills glide without
 * overshoot, so neighbouring pills never overlap (AGENTS.md §6). */
export const navPillSpring = {
  type: "spring",
  stiffness: 420,
  damping: 42,
} as const

const instant = { duration: 0 } as const

/** Directory highlight: one pill glides to the selected route, one follows the
 * pointer. `@marismoon/shell` renders it by default behind its second column
 * (styles `.nav-pill*` live in the shell). Uses `m.*` components, so the host
 * must render inside `LazyMotion`, as for `MotionSurface`. */
export function NavPills({ active, hover }: NavPillsProps) {
  const reduced = useReducedMotion()
  const transition = reduced ? instant : navPillSpring

  return (
    <>
      <AnimatePresence initial={false}>
        {hover && (
          <MotionSpan
            key="hover"
            aria-hidden="true"
            className="nav-pill nav-pill--hover"
            initial={{ ...hover, opacity: 0 }}
            animate={{ ...hover, opacity: 1 }}
            exit={{
              opacity: 0,
              transition: reduced ? instant : { duration: 0.12 },
            }}
            transition={transition}
          />
        )}
      </AnimatePresence>
      {active && (
        <MotionSpan
          aria-hidden="true"
          className="nav-pill nav-pill--active"
          initial={false}
          animate={active}
          transition={transition}
        />
      )}
    </>
  )
}
