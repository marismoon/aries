import { useRef, useState, type CSSProperties } from "react"
import { Link } from "react-router"

import {
  AppIcon,
  SolarChartSquare,
  SolarChevronRight,
  SolarCircleCheck,
  SolarClock3,
  SolarCloud,
  SolarFileSearch,
  SolarFolder,
  SolarShieldAlert,
  SolarSparkles,
  SolarTriangleAlert,
} from "@marismoon/ui/icons"
import { EmptyState } from "@marismoon/ui/shared/EmptyState"
import { FrostCard } from "@marismoon/ui/shared/FrostCard"
import { StatusBadge } from "@marismoon/ui/shared/StatusBadge"
import { Button } from "@marismoon/ui/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@marismoon/ui/ui/dialog"
import { Skeleton } from "@marismoon/ui/ui/skeleton"
import { dashboardMetrics } from "@/shared/mocks/overview"
import type { AttentionItem } from "@/shared/types/overview"
import { useAttentionScroll } from "../hooks/useAttentionScroll"

import "./overview-workflow.css"
import { useUiText } from "@/lib/i18n/use-ui-text"

const attentionIcons = {
  "shield-alert": SolarShieldAlert,
  "triangle-alert": SolarTriangleAlert,
  clock: SolarClock3,
  cloud: SolarCloud,
  "file-search": SolarFileSearch,
  folder: SolarFolder,
  chart: SolarChartSquare,
}

export function AttentionList({
  items,
  onResolve,
}: {
  items: readonly AttentionItem[] | null
  onResolve: (id: string) => void
}) {
  const tl = useUiText()

  const [selected, setSelected] = useState<AttentionItem | null>(null)
  const [open, setOpen] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const { viewportRef, listRef, marquee, duration } = useAttentionScroll(items)
  const orderedItems = items

  function renderList(copy: boolean) {
    return (
      <ul
        className="attention-list"
        aria-label={copy ? undefined : tl("关注事项")}
        aria-hidden={copy || undefined}
        ref={copy ? undefined : listRef}
      >
        {orderedItems?.map((item) => {
          const Icon = attentionIcons[item.icon]
          return (
            <li
              className="attention-row"
              key={item.id}
              data-attention-id={copy ? undefined : item.id}
            >
              <div className="attention-item">
                <span
                  aria-hidden="true"
                  className="workflow-icon"
                  data-tone={item.tone}
                >
                  <AppIcon icon={Icon} size={20} />
                </span>
                <div className="attention-copy">
                  <h3>{tl.parts(item.title)}</h3>
                  <p>{tl.parts(item.description)}</p>
                </div>
              </div>
              <StatusBadge className="attention-badge" tone={item.tone}>
                {tl(item.label)}
              </StatusBadge>
              <Button
                aria-haspopup="dialog"
                className="attention-action"
                tabIndex={copy ? -1 : undefined}
                onClick={(event) => {
                  triggerRef.current = event.currentTarget
                  setSelected(item)
                  setOpen(true)
                }}
                size="dense"
                shape="workspace"
                type="button"
                variant="outline"
              >
                {tl(item.action)}
              </Button>
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <FrostCard
      className="workflow-card attention-card"
      id="attention"
      role="region"
      aria-labelledby="attention-heading"
    >
      <header className="workflow-header">
        <div>
          <div className="attention-heading">
            <AppIcon icon={SolarSparkles} size={15} />
            <h2 id="attention-heading" ref={headingRef} tabIndex={-1}>
              {tl("需要关注")}
            </h2>
            {items && (
              <span
                className="attention-count financial-number"
                role="status"
                aria-label={tl("{{length}} 项需要关注", {
                  length: items.length,
                })}
              >
                {items.length}
              </span>
            )}
          </div>
          <p>
            {tl("巡检 {{accountCount}} 个云账号 · 待人工介入事项", {
              accountCount: dashboardMetrics.accountCount,
            })}
          </p>
        </div>
        <Link className="workflow-link" to="/bills">
          {tl("月账单")} <AppIcon icon={SolarChevronRight} size={16} />
        </Link>
      </header>

      <div className="attention-body">
        {orderedItems === null ? (
          <div
            className="grid gap-3 px-2.5"
            role="status"
            aria-label={tl("正在加载待办")}
          >
            {Array.from({ length: 6 }, (_, row) => (
              <div key={row} className="attention-skeleton-row">
                <Skeleton className="size-9 rounded-xl" />
                <div className="grid gap-1.5">
                  <Skeleton className="h-3.5 w-3/5 rounded-md" />
                  <Skeleton className="h-3 w-2/5 rounded-md" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-8 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : orderedItems.length ? (
          <div
            ref={viewportRef}
            className="attention-viewport"
            role="region"
            aria-label={tl("关注事项列表")}
            // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- The scroll viewport needs keyboard access.
            tabIndex={0}
          >
            <div
              className="attention-track"
              data-marquee={marquee || undefined}
              data-paused={open || undefined}
              style={
                marquee
                  ? ({
                      "--attention-duration": `${duration}s`,
                    } as CSSProperties)
                  : undefined
              }
            >
              {renderList(false)}
              {marquee && renderList(true)}
            </div>
          </div>
        ) : (
          <EmptyState
            icon={SolarCircleCheck}
            title={tl("关注事项已处理")}
            description={tl("本期演示事项已全部标记为已处理。")}
          />
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            const trigger = triggerRef.current
            const target = trigger?.isConnected ? trigger : headingRef.current
            target?.focus({ preventScroll: true })
          }}
        >
          {selected && (
            <>
              <DialogHeader className="pr-8">
                <DialogTitle>{tl.parts(selected.title)}</DialogTitle>
                <DialogDescription>{tl(selected.details)}</DialogDescription>
                <p className="text-xs text-muted-foreground">
                  {tl("处理结果在本次演示会话内保留。月账单展示原始采集快照。")}
                </p>
              </DialogHeader>
              <div className="attention-dialog-context">
                <span>{tl.parts(selected.description)}</span>
                <StatusBadge tone={selected.tone}>
                  {tl(selected.label)}
                </StatusBadge>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    {tl("取消")}
                  </Button>
                </DialogClose>
                <Button
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    onResolve(selected.id)
                  }}
                >
                  {tl("标记为已处理")}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </FrostCard>
  )
}
