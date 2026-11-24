import { useContext, useEffect, useState, type RefObject } from "react"
import {
  NavHighlightContext,
  type HighlightRect,
} from "../../context/nav-highlight"
import { NavPills } from "@marismoon/ui/motion/NavPills"

const ITEM = ".workspace-nav-item"

/** Two shared pills behind the directory items: one glides to the selected
 * route, one follows the pointer over the other items. Items keep their own
 * text and focus ring; only the backgrounds are drawn here. `NavPills` draws
 * them unless the host supplies a renderer through `NavHighlightContext`. */
export function NavHighlight({
  containerRef,
}: {
  containerRef: RefObject<HTMLElement | null>
}) {
  const renderHighlight = useContext(NavHighlightContext)
  const [active, setActive] = useState<HighlightRect | null>(null)
  const [hover, setHover] = useState<HighlightRect | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    let hovered: Element | null = null

    const measure = (item: Element | null): HighlightRect | null => {
      if (!(item instanceof HTMLElement) || item.offsetParent === null)
        return null
      const box = item.getBoundingClientRect()
      const host = container.getBoundingClientRect()
      // One pixel of air above and below, so pills of adjacent rows (a folder
      // and its first child) never touch.
      return {
        x: box.left - host.left,
        y: box.top - host.top + container.scrollTop + 1,
        width: box.width,
        height: box.height - 2,
      }
    }

    const sync = () => {
      const next = measure(
        container.querySelector(`${ITEM}[aria-current="page"]`)
      )
      setActive((current) =>
        current &&
        next &&
        current.x === next.x &&
        current.y === next.y &&
        current.width === next.width &&
        current.height === next.height
          ? current
          : next
      )
      setHover(hovered ? measure(hovered) : null)
    }

    const over = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return
      const item = (event.target as Element).closest(ITEM)
      hovered =
        item &&
        item.getAttribute("aria-current") !== "page" &&
        (item.classList.contains("nav-tree-leaf") ||
          !(item as HTMLButtonElement).disabled)
          ? item
          : null
      setHover(hovered ? measure(hovered) : null)
    }
    const leave = () => {
      hovered = null
      setHover(null)
    }

    sync()
    const resize = new ResizeObserver(sync)
    resize.observe(container)
    const list = container.querySelector("ul")
    if (list) resize.observe(list)
    const mutation = new MutationObserver(sync)
    mutation.observe(container, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["aria-current", "hidden", "aria-expanded"],
    })
    container.addEventListener("pointerover", over)
    container.addEventListener("pointerleave", leave)
    return () => {
      resize.disconnect()
      mutation.disconnect()
      container.removeEventListener("pointerover", over)
      container.removeEventListener("pointerleave", leave)
    }
  }, [containerRef])

  return renderHighlight ? (
    renderHighlight({ active, hover })
  ) : (
    <NavPills active={active} hover={hover} />
  )
}
