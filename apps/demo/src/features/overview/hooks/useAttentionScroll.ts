import { useEffect, useRef, useState } from "react"

import type { AttentionItem } from "@/shared/types/overview"

/** Scroll speed of the looping list, in px per second (a calm 30). */
const speed = 30

/**
 * Continuous, seamless vertical loop for the attention list. The list is
 * rendered twice back to back and the track is translated by -50% (GPU
 * `translate3d`, linear, infinite), so the loop point has no jump. The loop
 * only runs when the list is taller than its viewport and the user has not
 * asked for reduced motion; otherwise the viewport scrolls natively.
 */
export function useAttentionScroll(items: readonly AttentionItem[] | null) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const [overflowing, setOverflowing] = useState(false)
  const [reduced, setReduced] = useState(false)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setReduced(media.matches)
    sync()
    media.addEventListener("change", sync)
    return () => media.removeEventListener("change", sync)
  }, [])

  useEffect(() => {
    const viewport = viewportRef.current
    const list = listRef.current
    if (!viewport || !list) return

    const measure = () => {
      const height = list.offsetHeight
      setOverflowing(height > viewport.clientHeight)
      setDuration(height / speed)
    }
    measure()
    const resize = new ResizeObserver(measure)
    resize.observe(viewport)
    resize.observe(list)
    return () => resize.disconnect()
  }, [items])

  return {
    viewportRef,
    listRef,
    marquee: overflowing && !reduced,
    duration,
  }
}
