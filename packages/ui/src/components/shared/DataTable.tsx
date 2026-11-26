import { useUiLabels } from "../../lib/ui-labels"
import {
  useEffect,
  useId,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react"
import type { RowData } from "@tanstack/react-table"

import { AppIcon, SolarChevronsLeftRight } from "../icons"
import { Button } from "../ui/button"
import { Checkbox } from "../ui/checkbox"
import {
  getPaginationRange,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table"

import type { DataTableInstance } from "./use-data-table"
import "./data-table.css"

type Align = "start" | "end" | "center"

export interface DataTableProps<TData extends RowData> {
  table: DataTableInstance<TData>
  /** Screen-reader caption and the label of the scroll region. */
  caption: string
  /** Alignment per column id: shared by the header and every cell below it. */
  columnAlign?: Readonly<Record<string, Align>>
  /** Column rendered as the row header (`th scope="row"`). */
  rowHeaderColumn: string
  selectAllLabel: string
  selectRowLabel: (row: TData) => string
  paginationLabel: string
  pageSizes?: readonly number[]
  /** Shown instead of the rows when nothing matches. */
  empty: ReactNode
  /** Shown when the rendered table overflows its scroll region horizontally. */
  scrollHint?: string
  /** Shows shimmering skeleton rows (same row height) instead of the data. */
  loading?: boolean
}

/**
 * The Aries table template: shadcn Table + TanStack Table, a quiet sticky
 * header, per-column alignment, row selection and a footer with the row range
 * and round pagination. Features pass columns and cell content only.
 */
export function DataTable<TData extends RowData>({
  table,
  caption,
  columnAlign = {},
  rowHeaderColumn,
  selectAllLabel,
  selectRowLabel,
  paginationLabel,
  pageSizes = [10, 20, 50],
  empty,
  scrollHint,
  loading = false,
}: DataTableProps<TData>) {
  const labels = useUiLabels()
  const count = table.getFilteredRowModel().rows.length
  const selectedCount = table.getSelectedRowIds().length
  const visibleRows = table.getRowModel().rows
  const { pageIndex, pageSize } = table.state.pagination
  const first = pageIndex * pageSize + 1
  const last = first + visibleRows.length - 1
  const pageItems = getPaginationRange(pageIndex + 1, table.getPageCount())
  const hintId = useId()
  const [scrollRegion, setScrollRegion] = useState<HTMLDivElement | null>(null)
  const [hasHorizontalOverflow, setHasHorizontalOverflow] = useState(false)

  useEffect(() => {
    if (!scrollRegion) return
    const observer = new ResizeObserver(() =>
      setHasHorizontalOverflow(
        scrollRegion.scrollWidth > scrollRegion.clientWidth
      )
    )
    observer.observe(scrollRegion)
    const tableElement = scrollRegion.querySelector("table")
    if (tableElement) observer.observe(tableElement)
    return () => observer.disconnect()
  }, [scrollRegion])

  const showHint = scrollHint && !loading && count > 0 && hasHorizontalOverflow

  return (
    <>
      {showHint && (
        <p id={hintId} className="data-table-hint">
          <AppIcon icon={SolarChevronsLeftRight} size={15} />
          {scrollHint}
        </p>
      )}
      {loading ? (
        <div
          className="data-table-empty data-table-skeleton"
          role="status"
          aria-label={labels.loading}
        >
          {Array.from({ length: 6 }, (_, row) => (
            <div key={row} className="data-table-skeleton-row">
              <span className="shimmer-block" />
              <span className="shimmer-block" />
              <span className="shimmer-block" />
            </div>
          ))}
        </div>
      ) : count === 0 ? (
        <div className="data-table-empty">{empty}</div>
      ) : (
        <Table
          className="data-table"
          containerProps={{
            ref: scrollHint ? setScrollRegion : undefined,
            className: "data-table-scroll",
            role: "region",
            "aria-label": caption,
            "aria-describedby": showHint ? hintId : undefined,
            tabIndex: 0,
          }}
        >
          <TableCaption className="sr-only">{caption}</TableCaption>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => {
                  const id = header.column.id
                  return (
                    <TableHead
                      key={header.id}
                      data-column={id}
                      data-align={columnAlign[id]}
                      scope="col"
                    >
                      {id === "selection" ? (
                        <Checkbox
                          aria-label={selectAllLabel}
                          checked={
                            table.getIsAllPageRowsSelected() ||
                            (table.getIsSomePageRowsSelected() &&
                              "indeterminate")
                          }
                          onCheckedChange={(value) =>
                            table.toggleAllPageRowsSelected(value === true)
                          }
                        />
                      ) : (
                        <table.FlexRender header={header} />
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {visibleRows.map((row, index) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() ? "selected" : undefined}
                style={{ "--row-index": index } as CSSProperties}
              >
                {row.getAllCells().map((cell) => {
                  const id = cell.column.id
                  const Cell = id === rowHeaderColumn ? TableHead : TableCell
                  return (
                    <Cell
                      key={cell.id}
                      className={id === rowHeaderColumn ? undefined : "py-0"}
                      scope={id === rowHeaderColumn ? "row" : undefined}
                      data-column={id}
                      data-align={columnAlign[id]}
                    >
                      {id === "selection" ? (
                        <Checkbox
                          aria-label={selectRowLabel(row.original)}
                          checked={row.getIsSelected()}
                          onCheckedChange={(value) =>
                            row.toggleSelected(value === true)
                          }
                        />
                      ) : (
                        <table.FlexRender cell={cell} />
                      )}
                    </Cell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <div className="data-table-footer">
        <div className="data-table-summary">
          <p aria-live="polite">
            {count ? labels.tableRange(first, last, count) : labels.tableEmpty}
          </p>
          <span
            role="status"
            className={selectedCount === 0 ? "sr-only" : undefined}
          >
            {labels.selectedCount(selectedCount)}
          </span>
          {selectedCount > 0 && (
            <Button
              type="button"
              variant="link"
              size="xs"
              className="px-0"
              onClick={() => table.resetRowSelection()}
            >
              {labels.clearSelection}
            </Button>
          )}
        </div>
        <div className="data-table-pagination">
          <Select
            value={String(pageSize)}
            onValueChange={(value) =>
              table.setPagination({ pageIndex: 0, pageSize: Number(value) })
            }
          >
            <SelectTrigger
              className="h-(--pagination-control-size)"
              aria-label={labels.pageSize}
              size="dense"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" align="start">
              {pageSizes.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Pagination className="mx-0 w-auto" aria-label={paginationLabel}>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  className="h-7 rounded-full px-2.5 text-xs pointer-coarse:h-10"
                  disabled={!count || !table.getCanPreviousPage()}
                  onClick={() => table.previousPage()}
                  aria-label={labels.previousPage}
                  title={labels.previousPage}
                >
                  {labels.previousPage}
                </PaginationPrevious>
              </PaginationItem>
              {pageItems.map((item, index) => (
                <PaginationItem
                  key={item === "ellipsis" ? `ellipsis-${index}` : item}
                  className="max-sm:hidden"
                >
                  {item === "ellipsis" ? (
                    <PaginationEllipsis className="size-7 pointer-coarse:size-10" />
                  ) : (
                    <PaginationLink
                      className="size-7 rounded-full text-xs pointer-coarse:size-10"
                      isActive={item === pageIndex + 1}
                      aria-label={labels.pageN(item)}
                      onClick={() => table.setPageIndex(item - 1)}
                    >
                      {item}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  className="h-7 rounded-full px-2.5 text-xs pointer-coarse:h-10"
                  disabled={!count || !table.getCanNextPage()}
                  onClick={() => table.nextPage()}
                  aria-label={labels.nextPage}
                  title={labels.nextPage}
                >
                  {labels.nextPage}
                </PaginationNext>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </>
  )
}
