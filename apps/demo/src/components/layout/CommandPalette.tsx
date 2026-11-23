import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { workspacePages } from "@/app/workspace-pages"
import { useUiText } from "@/lib/i18n/use-ui-text"
import {
  AppIcon,
  SolarArrowUpRight,
  SolarLayoutGrid,
  SolarPalette,
  SolarReceiptText,
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
import {
  workspaceModules,
  type WorkspaceEntry,
  type WorkspaceModuleId,
} from "./workspace-modules"

const pages = [
  {
    title: "运营总览",
    description: "查看出账与采集进度",
    keywords: "overview dashboard kpi",
    path: workspacePages.overview.path,
    icon: SolarLayoutGrid,
  },
  {
    title: "月账单",
    description: "搜索、筛选与查看账单明细",
    keywords: "bills billing invoices",
    path: workspacePages.bills.path,
    icon: SolarReceiptText,
  },
  ...(
    [
      ["组件规范", "尺寸、圆角、字号与色彩", workspacePages.components.path],
      [
        "基础组件",
        "按钮、徽标、卡片等",
        workspacePages["components-basic"].path,
      ],
      [
        "表单与输入",
        "输入、选择、开关等",
        workspacePages["components-form"].path,
      ],
      [
        "导航",
        "页签、面包屑、分页",
        workspacePages["components-navigation"].path,
      ],
      [
        "浮层与反馈",
        "对话框、抽屉、提示",
        workspacePages["components-overlay"].path,
      ],
      ["数据展示", "表格、图表", workspacePages["components-data"].path],
      ["对话与 AI", "气泡、标记、附件", workspacePages["components-ai"].path],
    ] as const
  ).map(([title, description, path]) => ({
    title: `组件预览 · ${title}`,
    description,
    keywords: "components shadcn ui preview design system",
    path,
    icon: SolarPalette,
  })),
  ...(
    [
      [
        "登录与账号",
        "登录、找回密码、动态口令、首次部署",
        workspacePages["base-login"].path,
      ],
      [
        "个人安全与二次验证",
        "动态口令启用、重绑、改密",
        workspacePages["base-security"].path,
      ],
      [
        "会话与异常",
        "未授权、过期、403/404/500、维护",
        workspacePages["base-session"].path,
      ],
    ] as const
  ).map(([title, description, path]) => ({
    title: `基础页面 · ${title}`,
    description,
    keywords: "login security error 404 403 500 password totp",
    path,
    icon: SolarPalette,
  })),
  ...(
    [
      [
        "组件动效",
        "按压、悬浮、交错与展开",
        workspacePages["motion-components"].path,
      ],
      ["文字动效", "打字机、扫光、跑马灯", workspacePages["motion-text"].path],
      [
        "滚动动效",
        "滚动显现、叙事与视差",
        workspacePages["motion-scroll"].path,
      ],
      [
        "业务场景动效",
        "悬浮边框、3D、文字生成、时间线",
        workspacePages["motion-aceternity"].path,
      ],
      [
        "业务交互动效",
        "微光、状态按钮、多步骤加载、上传",
        workspacePages["motion-interaction"].path,
      ],
      [
        "图表动效",
        "图表生长、进度与数字滚动",
        workspacePages["motion-charts"].path,
      ],
      [
        "切换动效",
        "分段指示器与页面切换",
        workspacePages["motion-transitions"].path,
      ],
    ] as const
  ).map(([title, description, path]) => ({
    title: `动态效果 · ${title}`,
    description,
    keywords: "motion animation transition",
    path,
    icon: SolarPalette,
  })),
]

type CommandResult = {
  title: string
  description: string
  keywords?: string
  path?: string
  icon: AppIconComponent
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
  children,
}: {
  activeModule: WorkspaceModuleId
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
  const module = workspaceModules[activeModule]
  const translate = (text: string) =>
    text
      .split(" · ")
      .map((part) => tl(part))
      .join(" · ")
  const matches = module.entries
    .flatMap<CommandResult>((entry: WorkspaceEntry) => {
      if (entry.kind === "route") {
        return pages.filter(({ path }) => path === entry.to)
      }
      if (entry.kind === "folder") {
        return entry.children.flatMap<CommandResult>(({ label, to }) => {
          if (to) return pages.filter(({ path }) => path === to)
          if (activeModule === "overview") return []
          return [
            { title: label, description: "Demo 暂未开放", icon: entry.icon },
          ]
        })
      }
      return [
        { title: entry.label, description: "Demo 暂未开放", icon: entry.icon },
      ]
    })
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
                  : `${tl("搜索")} ${tl(module.label)}…`
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
