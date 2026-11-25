import { useRef, useState, useSyncExternalStore } from "react"

import { CopyButton } from "@marismoon/ui/shared/CopyButton"
import { StatusBadge } from "@marismoon/ui/shared/StatusBadge"
import { Button } from "@marismoon/ui/ui/button"
import { Field, FieldLabel } from "@marismoon/ui/ui/field"
import { Input } from "@marismoon/ui/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@marismoon/ui/ui/select"
import { Textarea } from "@marismoon/ui/ui/textarea"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@marismoon/ui/ui/drawer"
import { formatCurrency } from "@marismoon/ui/lib/format"
import { billStatusMeta } from "@/shared/mocks/bills"
import type { Bill, BillStatus } from "@/shared/types/billing"

import "./bill-drawer.css"
import { useUiText } from "@/lib/i18n/use-ui-text"

const channelLabels: Record<Bill["channel"], string> = {
  API: "API 接口",
  RPA: "RPA 自动化",
  EMAIL: "邮件",
  MANUAL: "人工采集",
}

type Stage = {
  label: string
  tone: "success" | "warning" | "neutral"
  text: string
  date: string
}

/** Demo collection stages for the bill, shaped by its status. */
/** Digits with at most one decimal point, so "1.2.3" can never be entered. */
function sanitizeAmount(value: string) {
  const cleaned = value.replace(/[^\d.]/g, "")
  const [whole = "", ...rest] = cleaned.split(".")
  return rest.length ? `${whole}.${rest.join("")}` : whole
}

/** A finite amount, or null when the field is empty or not a number. */
function parseAmount(value: string) {
  const amount = Number.parseFloat(value)
  return Number.isFinite(amount) ? amount : null
}

function collectionStages(status: BillStatus): Stage[] {
  const done = (label: string, date: string): Stage => ({
    label,
    tone: "success",
    text: "已完成",
    date,
  })
  const doing = (label: string, text = "进行中"): Stage => ({
    label,
    tone: "warning",
    text,
    date: "未验证",
  })
  const waiting = (label: string): Stage => ({
    label,
    tone: "neutral",
    text: "未开始",
    date: "—",
  })

  switch (status) {
    case "collecting":
      return [
        done("账单汇总", "2026-10-20"),
        doing("费用明细"),
        waiting("账单文件"),
        waiting("凭证文件"),
      ]
    case "auth-expired":
      return [
        done("账单汇总", "2026-10-18"),
        doing("费用明细", "授权逾期"),
        waiting("账单文件"),
        waiting("凭证文件"),
      ]
    case "evidence-missing":
      return [
        done("账单汇总", "2026-10-20"),
        done("费用明细", "2026-10-21"),
        done("账单文件", "2026-10-22"),
        doing("凭证文件", "待补传"),
      ]
    case "discrepancy":
      return [
        done("账单汇总", "2026-10-20"),
        done("费用明细", "2026-10-21"),
        doing("账单文件", "待核对"),
        waiting("凭证文件"),
      ]
    default:
      return [
        done("账单汇总", "2026-10-20"),
        done("费用明细", "2026-10-21"),
        done("账单文件", "2026-10-22"),
        done("凭证文件", "2026-10-23"),
      ]
  }
}

const mobileQuery = "(max-width: 700px)"

function subscribeToViewport(onChange: () => void) {
  const media = window.matchMedia(mobileQuery)
  media.addEventListener("change", onChange)
  return () => media.removeEventListener("change", onChange)
}

function isMobileViewport() {
  return window.matchMedia(mobileQuery).matches
}

interface BillEdits {
  accountName: string
  channel: Bill["channel"]
  estimatedAmount: string
  note: string
}

const editableDefaults = (bill: Bill): BillEdits => ({
  accountName: bill.accountName,
  channel: bill.channel,
  estimatedAmount:
    bill.estimatedAmount === null ? "" : String(bill.estimatedAmount),
  note: "",
})

function Row({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}

/** One drawer for a bill, laid out like the Aries vendor drawer. */
export function BillDrawer({
  bill,
  open,
  onOpenChange,
  onCloseAutoFocus,
}: {
  bill: Bill | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onCloseAutoFocus: (event: Event) => void
}) {
  const tl = useUiText()

  const mobile = useSyncExternalStore(subscribeToViewport, isMobileViewport)
  const closeButton = useRef<HTMLButtonElement>(null)
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState<Record<string, BillEdits>>({})
  const [draft, setDraft] = useState<BillEdits | null>(null)

  const edits = bill ? (saved[bill.id] ?? editableDefaults(bill)) : null
  // Edits are demo-only: they change this drawer's view, not the register.
  const shown =
    bill && edits
      ? {
          ...bill,
          accountName: edits.accountName,
          channel: edits.channel,
          estimatedAmount: parseAmount(edits.estimatedAmount),
        }
      : null
  const status = shown && billStatusMeta[shown.status]

  function startEditing() {
    if (edits) setDraft(edits)
    setEditing(true)
  }

  function finishEditing(save: boolean) {
    if (save && bill && draft) setSaved((all) => ({ ...all, [bill.id]: draft }))
    setEditing(false)
    setDraft(null)
  }

  return (
    <Drawer
      direction={mobile ? "bottom" : "right"}
      noBodyStyles
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setEditing(false)
          setDraft(null)
        }
        onOpenChange(next)
      }}
    >
      {shown && status && (
        <DrawerContent
          onCloseAutoFocus={onCloseAutoFocus}
          onOpenAutoFocus={(event) => {
            event.preventDefault()
            closeButton.current?.focus({ preventScroll: true })
          }}
        >
          <DrawerHeader>
            <DrawerTitle>
              {editing ? tl("编辑账单") : tl.parts(shown.accountName)}
            </DrawerTitle>
            <DrawerDescription>
              {editing
                ? tl("{{id}} · 仅演示，不写入数据", { id: shown.id })
                : tl("{{vendor}} · {{period}} · 结算币种 {{currency}}", {
                    vendor: tl(shown.vendor),
                    period: shown.period,
                    currency: shown.currency,
                  })}
            </DrawerDescription>
          </DrawerHeader>

          <div
            className="bill-drawer-body min-h-0 flex-1 overflow-y-auto px-4"
            data-vaul-no-drag=""
            role="region"
            aria-label={tl("账单内容")}
            // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Keep overflow reachable by keyboard.
            tabIndex={0}
          >
            {editing && draft ? (
              <form
                id="bill-edit-form"
                className="bill-drawer-form"
                onSubmit={(event) => {
                  event.preventDefault()
                  finishEditing(true)
                }}
              >
                <Field>
                  <FieldLabel htmlFor="bill-edit-name">
                    {tl("账号名称")}
                  </FieldLabel>
                  <Input
                    id="bill-edit-name"
                    value={draft.accountName}
                    onChange={(event) =>
                      setDraft({ ...draft, accountName: event.target.value })
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="bill-edit-channel">
                    {tl("采集通道")}
                  </FieldLabel>
                  <Select
                    value={draft.channel}
                    onValueChange={(channel) =>
                      setDraft({
                        ...draft,
                        channel: channel as Bill["channel"],
                      })
                    }
                  >
                    <SelectTrigger
                      id="bill-edit-channel"
                      size="dense"
                      className="w-full"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper" align="start">
                      {(Object.keys(channelLabels) as Bill["channel"][]).map(
                        (channel) => (
                          <SelectItem key={channel} value={channel}>
                            {tl(channelLabels[channel])}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="bill-edit-estimate">
                    {tl("暂估金额（{{currency}}）", {
                      currency: shown.currency,
                    })}
                  </FieldLabel>
                  <Input
                    id="bill-edit-estimate"
                    inputMode="decimal"
                    placeholder={tl("无暂估")}
                    value={draft.estimatedAmount}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        estimatedAmount: sanitizeAmount(event.target.value),
                      })
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="bill-edit-note">{tl("备注")}</FieldLabel>
                  <Textarea
                    id="bill-edit-note"
                    placeholder={tl("例如：已与供应商核对差异")}
                    value={draft.note}
                    onChange={(event) =>
                      setDraft({ ...draft, note: event.target.value })
                    }
                  />
                </Field>
              </form>
            ) : (
              <>
                <section
                  className="bill-drawer-summary"
                  aria-label={tl("金额概览")}
                >
                  <div className="bill-drawer-summary-head">
                    <StatusBadge tone={status.tone}>
                      {tl(status.label)}
                    </StatusBadge>
                    <span
                      className="bill-drawer-id financial-number"
                      translate="no"
                    >
                      {shown.id}
                      <CopyButton
                        key={shown.id}
                        value={shown.id}
                        variant="ghost"
                        size="icon-xs"
                        aria-label={tl("复制账单编号")}
                      />
                    </span>
                  </div>
                  <dl className="bill-drawer-amounts financial-number">
                    <div>
                      <dt>{tl("原币出账金额")}</dt>
                      <dd>
                        {formatCurrency(shown.issuedAmount, shown.currency)}
                      </dd>
                    </div>
                    <div>
                      <dt>{tl("暂估金额")}</dt>
                      <dd>
                        {shown.estimatedAmount === null ? (
                          <>
                            <span aria-hidden="true">—</span>
                            <span className="sr-only">{tl("无暂估金额")}</span>
                          </>
                        ) : (
                          formatCurrency(shown.estimatedAmount, shown.currency)
                        )}
                      </dd>
                    </div>
                  </dl>
                </section>

                <section
                  className="bill-drawer-section"
                  aria-labelledby="bill-drawer-basic"
                >
                  <h3 id="bill-drawer-basic">{tl("基础信息")}</h3>
                  <dl className="bill-drawer-rows">
                    <Row label={tl("供应商")}>
                      <span className="bill-drawer-pill" translate="no">
                        {tl(shown.vendor)}
                      </span>
                    </Row>
                    <Row label={tl("账期")}>
                      <span className="financial-number">{shown.period}</span>
                    </Row>
                    <Row label={tl("结算币种")}>
                      <span className="bill-drawer-pill" translate="no">
                        {shown.currency}
                      </span>
                    </Row>
                    <Row label={tl("采集通道")}>
                      {tl(channelLabels[shown.channel])}
                    </Row>
                    {edits?.note && <Row label={tl("备注")}>{edits.note}</Row>}
                  </dl>
                </section>

                <section
                  className="bill-drawer-section"
                  aria-labelledby="bill-drawer-stages"
                >
                  <h3 id="bill-drawer-stages">
                    {tl("采集进度")}
                    <span>{tl("示例，上线前逐账号验证")}</span>
                  </h3>
                  <ul className="bill-drawer-stages">
                    {collectionStages(shown.status).map((stage) => (
                      <li key={stage.label}>
                        <span>{tl(stage.label)}</span>
                        <span className="bill-drawer-stage-state">
                          <StatusBadge tone={stage.tone}>
                            {tl(stage.text)}
                          </StatusBadge>
                          <span className="financial-number">
                            {tl(stage.date)}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section
                  className="bill-drawer-section"
                  aria-labelledby="bill-drawer-channel"
                >
                  <h3 id="bill-drawer-channel">{tl("推荐采集通道")}</h3>
                  <p className="bill-drawer-chain" translate="no">
                    <span>{shown.channel}</span>
                    <span aria-hidden="true">›</span>
                    <span>{tl("存储")}</span>
                    <span aria-hidden="true">›</span>
                    <span>{tl("解析")}</span>
                  </p>
                </section>
              </>
            )}
          </div>

          <DrawerFooter>
            {editing ? (
              <>
                <Button key="save" type="submit" form="bill-edit-form">
                  {tl("保存")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => finishEditing(false)}
                >
                  {tl("取消")}
                </Button>
              </>
            ) : (
              <>
                <Button key="edit" type="button" onClick={startEditing}>
                  {tl("编辑")}
                </Button>
                <DrawerClose asChild>
                  <Button ref={closeButton} type="button" variant="outline">
                    {tl("关闭")}
                  </Button>
                </DrawerClose>
              </>
            )}
          </DrawerFooter>
        </DrawerContent>
      )}
    </Drawer>
  )
}
