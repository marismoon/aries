import {
  useLayoutEffect,
  useRef,
  type ReactNode,
  type RefObject,
  type UIEvent,
} from "react"
import { Outlet, useLocation, useOutletContext } from "react-router"

import { useUiText } from "@/lib/i18n/use-ui-text"
import { MotionSurface } from "@marismoon/ui/motion/MotionSurface"

type WorkspaceScrollContext = {
  viewport: RefObject<HTMLDivElement | null>
  onScroll: (event: UIEvent<HTMLDivElement>) => void
}

function updateScrollEdge(viewport: HTMLDivElement) {
  viewport.dataset.scrolled = String(viewport.scrollTop > 0)
  viewport.dataset.hasMoreBelow = String(
    viewport.scrollHeight - viewport.clientHeight - viewport.scrollTop > 1
  )
}

export function WorkspacePageLayout({
  className,
  header,
  summary,
  children,
}: {
  className: string
  header: ReactNode
  summary?: ReactNode
  children: ReactNode
}) {
  const tl = useUiText()
  const { viewport, onScroll } = useOutletContext<WorkspaceScrollContext>()

  useLayoutEffect(() => {
    const node = viewport.current
    if (!node) return

    const observer = new ResizeObserver(() => updateScrollEdge(node))
    observer.observe(node)
    if (node.firstElementChild) observer.observe(node.firstElementChild)
    updateScrollEdge(node)
    return () => observer.disconnect()
  }, [viewport])

  return (
    <div className={className}>
      {header}
      <div className="page-content-frame">
        <div
          ref={viewport}
          className="page-content-viewport"
          role="region"
          aria-label={tl("页面内容")}
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- The scroll viewport needs keyboard access.
          tabIndex={0}
          onScroll={onScroll}
        >
          <div
            className="page-content"
            data-has-summary={summary ? "" : undefined}
          >
            {summary}
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export function MainWorkspace() {
  const { pathname, key } = useLocation()
  const viewport = useRef<HTMLDivElement>(null)
  const workspaceScroll = useRef(new Map<string, number>())

  useLayoutEffect(() => {
    if (viewport.current) {
      viewport.current.scrollTop = workspaceScroll.current.get(key) ?? 0
      updateScrollEdge(viewport.current)
    }
  }, [key])

  function onScroll({ currentTarget }: UIEvent<HTMLDivElement>) {
    workspaceScroll.current.set(key, currentTarget.scrollTop)
    updateScrollEdge(currentTarget)
  }

  return (
    <main
      className="workspace-main workspace-content"
      data-layout-column="main"
      id="main-content"
      tabIndex={-1}
    >
      <MotionSurface key={pathname}>
        <Outlet
          context={{ viewport, onScroll } satisfies WorkspaceScrollContext}
        />
      </MotionSurface>
    </main>
  )
}
