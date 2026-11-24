import type { ReactNode } from "react"
import { AnimatePresence, useReducedMotion } from "motion/react"
import { span as MotionSpan } from "motion/react-m"
import { NavHighlightContext, type NavHighlightRects } from "@aries/shell"

const slide = { type: "spring", stiffness: 420, damping: 40 } as const

export function NavHighlightProvider({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion()
  function renderHighlight({ active, hover }: NavHighlightRects) {
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
                transition: { duration: reduced ? 0 : 0.12 },
              }}
              transition={reduced ? { duration: 0 } : slide}
            />
          )}
        </AnimatePresence>
        {active && (
          <MotionSpan
            aria-hidden="true"
            className="nav-pill nav-pill--active"
            initial={false}
            animate={active}
            transition={reduced ? { duration: 0 } : slide}
          />
        )}
      </>
    )
  }
  return (
    <NavHighlightContext.Provider value={renderHighlight}>
      {children}
    </NavHighlightContext.Provider>
  )
}
