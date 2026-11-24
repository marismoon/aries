import { useCallback, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

import { FrostCard } from "@marismoon/ui/shared/FrostCard"
import { EmptyState } from "@marismoon/ui/shared/EmptyState"
import { MetricCard } from "@marismoon/ui/shared/MetricCard"
import { SolarCircleAlert } from "@marismoon/ui/icons"
import { Button } from "@marismoon/ui/ui/button"
import { Skeleton } from "@marismoon/ui/ui/skeleton"
import { formatCurrency } from "@marismoon/ui/lib/format"
import { demoPeriod, demoPeriodLabel } from "@/shared/mocks/period"
import type { Bill } from "@/shared/types/billing"
import { BillDrawer } from "./components/BillDrawer"
import { BillsTable } from "./components/BillsTable"
import { useBillsDemo } from "./hooks/useBillsDemo"
import "./bills.css"
import { useUiText } from "@/lib/i18n/use-ui-text"

export function BillsBreadcrumbDetail() {
  const tl = useUiText()

  return (
    <>
      <span aria-hidden="true">·</span>
      <time className="financial-number" dateTime={demoPeriod}>
        {tl("{{demoPeriodLabel}}账期", {
          demoPeriodLabel: tl(demoPeriodLabel),
        })}
      </time>
    </>
  )
}

export function BillsTotals() {
  const tl = useUiText()

  const { t } = useTranslation()
  const bills = useBillsDemo()

  return (
    <section
      className="bills-totals"
      aria-label={t("bills.issuedByCurrency")}
      aria-busy={bills.loading}
    >
      <MetricCard
        className="hero-surface"
        density="compact"
        featured
        label={tl("CNY 合计已出账")}
        value={
          bills.error ? (
            "—"
          ) : bills.loading ? (
            <Skeleton className="h-[1.65rem] w-32" />
          ) : (
            formatCurrency(bills.totals.CNY, "CNY")
          )
        }
        description={
          bills.loading || bills.error
            ? tl("全部演示样例")
            : tl("全部 {{count}} 条演示样例", { count: bills.count })
        }
      />
      <MetricCard
        density="compact"
        label={tl("外币已出账（单列）")}
        value={
          bills.error ? (
            "—"
          ) : bills.loading ? (
            <Skeleton className="h-[1.65rem] w-48 max-w-full" />
          ) : (
            <span className="bills-foreign-total">
              <span>
                <span className="bills-currency-code">USD</span>{" "}
                {formatCurrency(bills.totals.USD, "USD")}
              </span>
              <span aria-hidden="true" className="bills-total-divider" />
              <span>
                <span className="bills-currency-code">EUR</span>{" "}
                {formatCurrency(bills.totals.EUR, "EUR")}
              </span>
            </span>
          )
        }
        description={tl("不与 CNY 混算 · 筛选仅影响明细")}
      />
    </section>
  )
}

export function BillsPage() {
  const tl = useUiText()

  const { t } = useTranslation()
  const bills = useBillsDemo()
  const [selected, setSelected] = useState<Bill | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const panelTrigger = useRef<HTMLButtonElement>(null)

  // Stable, so the table's columns (and the row buttons) are not rebuilt.
  const showBill = useCallback((bill: Bill, trigger: HTMLButtonElement) => {
    panelTrigger.current = trigger
    setSelected(bill)
    setDrawerOpen(true)
  }, [])

  function restorePanelFocus(event: Event) {
    if (panelTrigger.current?.isConnected) {
      event.preventDefault()
      panelTrigger.current.focus({ preventScroll: true })
    }
  }

  return (
    <>
      <FrostCard
        className="bills-register"
        role="region"
        aria-labelledby="bills-register-heading"
      >
        <h2 id="bills-register-heading" className="sr-only">
          {t("bills.register")}
        </h2>
        {bills.error ? (
          <div role="alert">
            <EmptyState
              icon={SolarCircleAlert}
              title={tl("账单加载失败")}
              description={tl("请检查网络后重试。")}
              action={
                <Button variant="outline" onClick={bills.retry}>
                  {tl("重试")}
                </Button>
              }
            />
          </div>
        ) : bills.loading ? (
          <div
            className="bills-loading"
            role="status"
            aria-label={tl("正在加载账单")}
          >
            <Skeleton className="h-5 w-24 rounded-md" />
            <div className="bills-loading-filters">
              <Skeleton className="h-8 w-60 rounded-full" />
              <Skeleton className="h-8 w-28 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>
            <div className="bills-loading-rows">
              {Array.from({ length: 8 }, (_, row) => (
                <div key={row} className="bills-loading-row">
                  <Skeleton className="size-4 rounded-md" />
                  <div className="grid gap-1.5">
                    <Skeleton className="h-3.5 w-28 rounded-md" />
                    <Skeleton className="h-3 w-40 rounded-md" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-3.5 w-16 rounded-md" />
                  <Skeleton className="h-5 w-12 rounded-full" />
                  <Skeleton className="h-3.5 w-24 rounded-md" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <BillsTable
            rows={bills.rows}
            filters={bills.filters}
            vendors={bills.vendors}
            onFilterChange={bills.setFilters}
            onShowBill={showBill}
            onReset={bills.resetFilters}
          />
        )}
      </FrostCard>

      <BillDrawer
        bill={selected}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onCloseAutoFocus={restorePanelFocus}
      />
    </>
  )
}
