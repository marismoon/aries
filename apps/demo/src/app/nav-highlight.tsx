import type { ReactNode } from "react"
import { AnimatePresence } from "motion/react"
import { span as MotionSpan } from "motion/react-m"
import {
  NavHighlightContext,
  type NavHighlightRects,
} from "@/components/layout/context/nav-highlight"

// Critically damped: no overshoot, so neighbouring pills never overlap.
const slide = { type: "spring", stiffness: 420, damping: 40 } as const

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
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
            transition={slide}
          />
        )}
      </AnimatePresence>
      {active && (
        <MotionSpan
          aria-hidden="true"
          className="nav-pill nav-pill--active"
          initial={false}
          animate={active}
          transition={slide}
        />
      )}
    </>
  )
}

export function DemoNavHighlightProvider({
  children,
}: {
  children: ReactNode
}) {
  return (
    <NavHighlightContext.Provider value={renderHighlight}>
      {children}
    </NavHighlightContext.Provider>
  )
}
