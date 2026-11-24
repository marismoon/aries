import { useId, useRef } from "react"

import { AppIcon, SolarSearch } from "@aries/ui/icons"
import { Button } from "@aries/ui/ui/button"
import { Input } from "@aries/ui/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@aries/ui/ui/select"
import { billStatusMeta, initialBillFilters } from "@/shared/mocks/bills"
import type { BillFilters, BillStatus, Currency } from "@/shared/types/billing"

import "./bills-controls.css"
import { useUiText } from "@/lib/i18n/use-ui-text"

const currencyOptions = ["CNY", "USD", "EUR"] as const

export function BillsToolbar({
  filters,
  vendors,
  onChange,
  onReset,
}: {
  filters: BillFilters
  vendors: readonly string[]
  onChange: (next: BillFilters) => void
  onReset: () => void
}) {
  const tl = useUiText()

  const searchId = useId()
  const searchRef = useRef<HTMLInputElement>(null)
  const hasFilters =
    filters.query !== initialBillFilters.query ||
    filters.vendor !== initialBillFilters.vendor ||
    filters.status !== initialBillFilters.status ||
    filters.currency !== initialBillFilters.currency

  return (
    <div className="bills-toolbar">
      <div className="bills-toolbar-head">
        <span className="bills-toolbar-title" aria-hidden="true">
          {tl("账单明细")}
        </span>
      </div>
      <div
        className="bills-toolbar-fields"
        role="search"
        aria-label={tl("账单搜索与筛选")}
      >
        <div className="bills-search field-surface" data-field-focus="quiet">
          <label className="sr-only" htmlFor={searchId}>
            {tl("搜索账单")}
          </label>
          <AppIcon icon={SolarSearch} size={16} />
          <Input
            embedded
            className="bills-search-input"
            controlSize="dense"
            id={searchId}
            ref={searchRef}
            type="search"
            name="bill-query"
            spellCheck={false}
            autoComplete="off"
            placeholder={tl("搜索账号、供应商或账单编号…")}
            value={filters.query}
            onChange={(event) =>
              onChange({ ...filters, query: event.currentTarget.value })
            }
          />
        </div>

        <div className="bills-selects">
          <Select
            name="vendor"
            value={filters.vendor}
            onValueChange={(vendor) => onChange({ ...filters, vendor })}
          >
            <SelectTrigger
              size="dense"
              aria-label={tl("供应商")}
              className="data-table-filter"
              data-active={filters.vendor !== "all" || undefined}
            >
              <span className="bill-filter-label" aria-hidden="true">
                {tl("供应商：")}
              </span>
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" align="start">
              <SelectItem value="all">{tl("全部")}</SelectItem>
              {vendors.map((vendor) => (
                <SelectItem key={vendor} value={vendor}>
                  {tl(vendor)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            name="status"
            value={filters.status}
            onValueChange={(status) =>
              onChange({ ...filters, status: status as BillStatus | "all" })
            }
          >
            <SelectTrigger
              size="dense"
              aria-label={tl("状态")}
              className="data-table-filter"
              data-active={filters.status !== "all" || undefined}
            >
              <span className="bill-filter-label" aria-hidden="true">
                {tl("状态：")}
              </span>
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" align="start">
              <SelectItem value="all">{tl("全部")}</SelectItem>
              {Object.entries(billStatusMeta).map(([status, { label }]) => (
                <SelectItem key={status} value={status}>
                  {tl(label)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            name="currency"
            value={filters.currency}
            onValueChange={(currency) =>
              onChange({ ...filters, currency: currency as Currency | "all" })
            }
          >
            <SelectTrigger
              size="dense"
              aria-label={tl("币种")}
              className="data-table-filter"
              data-active={filters.currency !== "all" || undefined}
            >
              <span className="bill-filter-label" aria-hidden="true">
                {tl("币种：")}
              </span>
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" align="start">
              <SelectItem value="all">{tl("全部")}</SelectItem>
              {currencyOptions.map((currency) => (
                <SelectItem key={currency} value={currency}>
                  {currency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {hasFilters && (
          <Button
            className="bills-reset"
            onClick={() => {
              onReset()
              searchRef.current?.focus()
            }}
            type="button"
            variant="outline"
            size="dense"
            shape="workspace"
          >
            {tl("清除筛选")}
          </Button>
        )}
      </div>
    </div>
  )
}
