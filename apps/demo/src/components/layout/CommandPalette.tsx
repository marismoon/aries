import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { useUiText } from "@/lib/i18n/use-ui-text"
import {
  AppIcon,
  SolarArrowUpRight,
  SolarSearch,
  type AppIconComponent,
} from "@marismoon/ui/icons"
import { Link, useLocation, useNavigate } from "react-router"
import { Button } from "@marismoon/ui/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@marismoon/ui/ui/dialog"
import { Input } from "@marismoon/ui/ui/input"
import type { WorkspaceModuleId } from "./workspace-modules"

export type CommandItem = {
  title: string
  description: string
  keywords?: string
  path?: string
  icon: AppIconComponent
}

export type ModuleCommands = {
  label: string
  items: readonly CommandItem[]
}

const CommandContext = createContext<{
  dialogId: string
  open: boolean
  launch: (element: HTMLButtonElement, onNavigate?: () => void) => void
} | null>(null)

const isAppleDevice = /Macintosh|iPhone|iPad/.test(navigator.userAgent)

function getFocusFallback() {
  for (const selector of [
    '[data-command-trigger="sidebar"]',
    ".rail-desktop-toggle, .mobile-directory-trigger",
    "#main-content",
  ]) {
    const visible = Array.from(
      document.querySelectorAll<HTMLElement>(selector)
    ).find((element) => element.getClientRects().length > 0)
    if (visible) return visible
  }
}

export function CommandPalette({ onNavigate }: { onNavigate?: () => void }) {
  const tl = useUiText()
  const command = useContext(CommandContext)
  const expanded = command?.open ?? false

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      shape="workspace"
      className="command-trigger field-surface"
      data-command-trigger="sidebar"
      aria-label={tl("导航搜索")}
      aria-haspopup="dialog"
      aria-expanded={expanded}
      aria-controls={expanded ? command?.dialogId : undefined}
      aria-keyshortcuts="Meta+K Control+K"
      onClick={(event) => command?.launch(event.currentTarget, onNavigate)}
    >
      <AppIcon
        icon={SolarSearch}
        size={16}
        className="command-search-icon"
        aria-hidden="true"
      />
      <span className="command-trigger-label">{tl("搜索页面、账单")}</span>
      <kbd className="command-trigger-shortcut" aria-hidden="true">
        {isAppleDevice ? "⌘\u00a0K" : "Ctrl\u00a0K"}
      </kbd>
    </Button>
  )
}

export function CommandPaletteProvider({
  activeModule,
  commands,
  children,
}: {
  activeModule: WorkspaceModuleId
  commands: ModuleCommands
  children: ReactNode
}) {
  const tl = useUiText()
  const [open, setOpen] = useState(false)
  const [instant, setInstant] = useState(false)
  const [query, setQuery] = useState("")
  const returnFocus = useRef<HTMLElement>(null)
  const selectedRoute = useRef(false)
  const onLaunchNavigate = useRef<() => void>(undefined)
  const dialogId = useId()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const search = query.trim().toLowerCase()
  const translate = (text: string) =>
    text
      .split(" · ")
      .map((part) => tl(part))
      .join(" · ")
  const matches = commands.items
    .map((result) => ({
      ...result,
      title: translate(result.title),
      description: tl(result.description),
    }))
    .filter(({ title, description, keywords }) =>
      `${title} ${description} ${keywords ?? ""}`.toLowerCase().includes(search)
    )

  function launch(element: HTMLButtonElement, onNavigate?: () => void) {
    onLaunchNavigate.current = onNavigate
    returnFocus.current = element
    setInstant(false)
    setQuery("")
    setOpen(true)
  }

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if (
        event.defaultPrevented ||
        event.isComposing ||
        event.repeat ||
        (!event.metaKey && !event.ctrlKey) ||
        event.altKey ||
        event.shiftKey ||
        event.key.toLowerCase() !== "k"
      )
        return

      if (!open && document.querySelector('[role="dialog"][data-state="open"]'))
        return

      event.preventDefault()
      setInstant(true)
      if (open) {
        setOpen(false)
      } else {
        onLaunchNavigate.current = undefined
        const focused = document.activeElement
        returnFocus.current =
          focused instanceof HTMLElement && focused !== document.body
            ? focused
            : (getFocusFallback() ?? null)
        setQuery("")
        setOpen(true)
      }
    }

    window.addEventListener("keydown", handleShortcut)
    return () => window.removeEventListener("keydown", handleShortcut)
  }, [open])

  async function selectPage(path: string) {
    selectedRoute.current =
      path !== pathname || Boolean(onLaunchNavigate.current)
    await navigate(path)
    onLaunchNavigate.current?.()
    setOpen(false)
  }

  return (
    <CommandContext.Provider value={{ dialogId, open, launch }}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          id={dialogId}
          className="command-panel"
          instant={instant}
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            const launcher = selectedRoute.current ? null : returnFocus.current
            selectedRoute.current = false
            requestAnimationFrame(() => {
              const target =
                launcher?.isConnected && launcher.getClientRects().length > 0
                  ? launcher
                  : getFocusFallback()
              target?.focus({ preventScroll: true })
            })
          }}
        >
          <DialogHeader>
            <DialogTitle>{tl("搜索页面")}</DialogTitle>
            <DialogDescription>
              {tl("输入页面名称，或按 Tab 浏览结果。")}
            </DialogDescription>
          </DialogHeader>

          <form
            role="search"
            className="command-search field-surface"
            onSubmit={(event) => {
              event.preventDefault()
              const path = matches[0]?.path
              if (path) void selectPage(path)
            }}
          >
            <AppIcon icon={SolarSearch} size={16} aria-hidden="true" />
            <Input
              controlSize="default"
              embedded
              type="search"
              name="page-query"
              autoComplete="off"
              spellCheck={false}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={
                activeModule === "overview"
                  ? tl("搜索运营总览、月账单…")
                  : `${tl("搜索")} ${tl(commands.label)}…`
              }
              aria-label={tl("输入页面名称")}
            />
          </form>

          {matches.length ? (
            <ul className="command-results" aria-label={tl("搜索结果")}>
              {matches.map(({ title, description, path, icon: Icon }) => {
                const content = (
                  <>
                    <span className="command-result-icon">
                      <AppIcon icon={Icon} size={16} aria-hidden="true" />
                    </span>
                    <span className="command-result-text">
                      <strong>{title}</strong>
                      <small>{description}</small>
                    </span>
                    <AppIcon
                      icon={SolarArrowUpRight}
                      size={16}
                      className="command-result-arrow"
                      aria-hidden="true"
                    />
                  </>
                )
                return (
                  <li key={path ?? title}>
                    {path ? (
                      <Link
                        to={path}
                        className="command-result"
                        onClick={(event) => {
                          if (
                            event.metaKey ||
                            event.ctrlKey ||
                            event.shiftKey ||
                            event.altKey
                          )
                            return
                          event.preventDefault()
                          void selectPage(path)
                        }}
                      >
                        {content}
                      </Link>
                    ) : (
                      <button type="button" className="command-result" disabled>
                        {content}
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="command-empty" role="status">
              {tl("未找到匹配的页面。")}
            </p>
          )}
        </DialogContent>
      </Dialog>
    </CommandContext.Provider>
  )
}
