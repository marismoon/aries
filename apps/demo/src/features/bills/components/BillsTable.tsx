import { useMemo } from "react"

import { AppIcon, SolarEye, SolarFileSearch } from "@aries/ui/icons"
import { DataTable } from "@aries/ui/shared/DataTable"
import { EmptyState } from "@aries/ui/shared/EmptyState"
import { StatusBadge } from "@aries/ui/shared/StatusBadge"
import {
  createDataTableColumns,
  useDataTable,
} from "@aries/ui/shared/use-data-table"
import { Button } from "@aries/ui/ui/button"
import { formatCurrency } from "@aries/ui/lib/format"
import { billStatusMeta } from "@/shared/mocks/bills"
import type { Bill, BillFilters } from "@/shared/types/billing"
import { matchesBillFilters } from "../hooks/useBillsDemo"
import { BillsToolbar } from "./BillsToolbar"

import "./bills-table.css"
import { useUiText } from "@/lib/i18n/use-ui-text"

const column = createDataTableColumns<Bill>()

// Money and the row action are end-aligned; everything else starts at the edge.
const columnAlign = {
  issuedAmount: "end",
  estimatedAmount: "end",
  actions: "end",
} as const

interface BillsTableProps {
  rows: Bill[]
  filters: BillFilters
  vendors: readonly string[]
  onFilterChange: (filters: BillFilters) => void
  onShowBill: (bill: Bill, trigger: HTMLButtonElement) => void
  onReset: () => void
}

export function BillsTable({
  rows,
  filters,
  vendors,
  onFilterChange,
  onShowBill,
  onReset,
}: BillsTableProps) {
  const tl = useUiText()

  const columns = useMemo(
    () =>
      column.columns([
        column.display({ id: "selection" }),
        column.accessor("id", {
          header: tl("账单编号 / 云账号"),
          cell: ({ row }) => (
            <>
              <span className="bill-row-id" translate="no">
                {row.original.id}
              </span>
              <span
                className="bill-row-account"
                title={tl.parts(row.original.accountName)}
              >
                {tl.parts(row.original.accountName)}
              </span>
            </>
          ),
        }),
        column.accessor("vendor", {
          header: tl("供应商"),
          cell: ({ getValue }) => (
            <span
              className="bill-row-pill"
              title={tl(getValue())}
              translate="no"
            >
              {tl(getValue())}
            </span>
          ),
        }),
        column.accessor("period", { header: tl("账期") }),
        column.accessor("currency", {
          header: tl("币种"),
          cell: ({ getValue }) => (
            <span className="bill-row-pill" translate="no">
              {getValue()}
            </span>
          ),
        }),
        column.accessor("issuedAmount", {
          header: tl("已出账金额（原币）"),
          cell: ({ row, getValue }) =>
            formatCurrency(getValue(), row.original.currency),
        }),
        column.accessor("estimatedAmount", {
          header: tl("暂估（单列）"),
          cell: ({ row, getValue }) => {
            const amount = getValue()
            return amount === null ? (
              <>
                <span aria-hidden="true">—</span>
                <span className="sr-only">{tl("无暂估金额")}</span>
              </>
            ) : (
              formatCurrency(amount, row.original.currency)
            )
          },
        }),
        column.accessor("channel", { header: tl("采集通道") }),
        column.accessor("status", {
          header: tl("状态"),
          cell: ({ getValue }) => {
            const { label, tone } = billStatusMeta[getValue()]
            return (
              <StatusBadge tone={tone} pulse={getValue() === "collecting"}>
                {tl(label)}
              </StatusBadge>
            )
          },
        }),
        column.display({
          id: "actions",
          header: tl("操作"),
          cell: ({ row }) => (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="bill-detail-action"
              aria-label={tl("查看账单 {{id}}", { id: row.original.id })}
              title={tl("查看账单")}
              onClick={(event) => onShowBill(row.original, event.currentTarget)}
            >
              <AppIcon icon={SolarEye} size={18} />
            </Button>
          ),
        }),
      ]),
    [onShowBill, tl]
  )

  const table = useDataTable({
    columns,
    data: rows,
    getRowId: (bill) => bill.id,
    state: { globalFilter: filters },
    // The filter matches the whole bill, so TanStack only needs to run it once per row.
    getColumnCanGlobalFilter: (candidate) => candidate.id === "id",
    globalFilterFn: (row, _columnId, value: BillFilters) =>
      matchesBillFilters(row.original, value),
    initialState: { pagination: { pageIndex: 0, pageSize: 10 } },
  })

  return (
    <>
      <BillsToolbar
        filters={filters}
        vendors={vendors}
        onChange={(next) => {
          table.firstPage()
          onFilterChange(next)
        }}
        onReset={onReset}
      />
      <DataTable
        table={table}
        caption={tl("账单表格")}
        columnAlign={columnAlign}
        rowHeaderColumn="id"
        selectAllLabel={tl("选择本页所有账单")}
        selectRowLabel={(bill) => tl("选择账单 {{id}}", { id: bill.id })}
        paginationLabel={tl("账单分页")}
        scrollHint={tl("横向滚动查看金额、状态和明细")}
        empty={
          <EmptyState
            icon={SolarFileSearch}
            title={tl("没有匹配的账单")}
            description={tl("尝试更改搜索词或清除筛选条件。")}
            action={
              <Button variant="outline" onClick={onReset}>
                {tl("清除全部筛选")}
              </Button>
            }
          />
        }
      />
    </>
  )
}
