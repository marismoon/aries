import { createContext, type ReactNode } from "react"

export type HighlightRect = {
  x: number
  y: number
  width: number
  height: number
}

export interface NavHighlightRects {
  active: HighlightRect | null
  hover: HighlightRect | null
}

export const NavHighlightContext = createContext<
  ((rects: NavHighlightRects) => ReactNode) | null
>(null)
