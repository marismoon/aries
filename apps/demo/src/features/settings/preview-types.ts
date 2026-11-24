import type { ReactNode } from "react"

export interface PreviewItem {
  id: string
  title: string
  description: string
  /** Lay the card across both columns. */
  wide?: boolean
  /** Render without the surrounding card (the demo is itself a card). */
  bare?: boolean
  /** Stack the demo vertically instead of wrapping inline. */
  stack?: boolean
  /** One-line usage, copied as-is by pages (the defaults are the standard). */
  usage?: string
  node: ReactNode
}
