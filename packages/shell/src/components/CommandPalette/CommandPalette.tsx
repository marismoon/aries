import {
  createContext,
  Fragment,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react"
import {
  AppIcon,
  SolarSearch,
  type AppIconComponent,
} from "@marismoon/ui/icons"
import { Button } from "@marismoon/ui/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem as UiCommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@marismoon/ui/ui/command"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@marismoon/ui/ui/dialog"
import { useShellRouter } from "../../types/adapter"
import { useShellLabels } from "../../types/labels"

export type CommandItem = {
  title: string
  description: string
  group?: string
  shortcut?: string
  keywords?: string
  path?: string
  icon: AppIconComponent
}

export type ModuleCommands = {
  triggerLabel: string
  placeholder: string
  items: readonly CommandItem[]
}

const CommandContext = createContext<{
  triggerLabel: string
  dialogId: string
  open: boolean
  launch: (element: HTMLButtonElement, onNavigate?: () => void) => void
} | null>(null)

const noSubscription = () => () => {}

/** Reads the platform after hydration, so server and first client render
 * agree (both show "Ctrl K") and Apple devices switch to "⌘ K" afterwards. */
function useIsAppleDevice() {
  return useSyncExternalStore(
    noSubscription,
    () => /Macintosh|iPhone|iPad/.test(navigator.userAgent),
    () => false
  )
}

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
  const labels = useShellLabels()
  const command = useContext(CommandContext)
  const expanded = command?.open ?? false
  const isAppleDevice = useIsAppleDevice()

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      shape="workspace"
      className="command-trigger field-surface"
      data-command-trigger="sidebar"
      aria-label={labels.commandSearch}
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
      <span className="command-trigger-label">{command?.triggerLabel}</span>
      <kbd className="command-trigger-shortcut" aria-hidden="true">
        {isAppleDevice ? "⌘\u00a0K" : "Ctrl\u00a0K"}
      </kbd>
    </Button>
  )
}

export function CommandPaletteProvider({
  commands,
  children,
}: {
  commands: ModuleCommands
  children: ReactNode
}) {
  const labels = useShellLabels()
  const [open, setOpen] = useState(false)
  const [instant, setInstant] = useState(false)
  const [query, setQuery] = useState("")
  const returnFocus = useRef<HTMLElement>(null)
  const selectedRoute = useRef(false)
  const onLaunchNavigate = useRef<() => void>(undefined)
  const dialogId = useId()
  const { activePath, onNavigate } = useShellRouter()

  const groups = useMemo(() => {
    const map = new Map<string, CommandItem[]>()
    for (const item of commands.items) {
      const heading = item.group ?? labels.commandTitle
      const list = map.get(heading)
      if (list) list.push(item)
      else map.set(heading, [item])
    }
    return Array.from(map.entries())
  }, [commands.items, labels.commandTitle])

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
    const moved = path !== activePath || Boolean(onLaunchNavigate.current)
    try {
      if (onNavigate) await onNavigate(path)
      else window.location.assign(path)
      selectedRoute.current = moved
      onLaunchNavigate.current?.()
    } finally {
      setOpen(false)
    }
  }

  return (
    <CommandContext.Provider
      value={{ triggerLabel: commands.triggerLabel, dialogId, open, launch }}
    >
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          id={dialogId}
          className="top-1/3 translate-y-0 overflow-hidden rounded-3xl! p-0"
          showCloseButton={false}
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
          <DialogHeader className="sr-only">
            <DialogTitle>{labels.commandTitle}</DialogTitle>
            <DialogDescription>{labels.commandDescription}</DialogDescription>
          </DialogHeader>

          <div role="search">
            <Command
              vimBindings={false}
              filter={(value, search) =>
                Number(
                  value.toLowerCase().includes(search.trim().toLowerCase())
                )
              }
            >
              <CommandInput
                value={query}
                onValueChange={setQuery}
                placeholder={commands.placeholder}
                aria-label={labels.commandInput}
              />
              <CommandList label={labels.commandResults}>
                <CommandEmpty>{labels.commandEmpty}</CommandEmpty>
                {groups.map(([heading, items], groupIndex) => (
                  <Fragment key={heading}>
                    {groupIndex > 0 && <CommandSeparator />}
                    <CommandGroup heading={heading}>
                      {items.map((item, itemIndex) => (
                        <UiCommandItem
                          key={
                            item.path ?? `${heading}-${item.title}-${itemIndex}`
                          }
                          value={`${item.title} ${item.description} ${item.keywords ?? ""} ${heading}`}
                          disabled={!item.path}
                          data-checked={
                            item.path && item.path === activePath
                              ? "true"
                              : undefined
                          }
                          onSelect={() => {
                            if (item.path) void selectPage(item.path)
                          }}
                        >
                          <AppIcon
                            icon={item.icon}
                            size={16}
                            aria-hidden="true"
                          />
                          <span className="truncate">{item.title}</span>
                          {item.shortcut ? (
                            <CommandShortcut>{item.shortcut}</CommandShortcut>
                          ) : !item.path && item.description ? (
                            <CommandShortcut>
                              {item.description}
                            </CommandShortcut>
                          ) : null}
                        </UiCommandItem>
                      ))}
                    </CommandGroup>
                  </Fragment>
                ))}
              </CommandList>
            </Command>
          </div>
        </DialogContent>
      </Dialog>
    </CommandContext.Provider>
  )
}
