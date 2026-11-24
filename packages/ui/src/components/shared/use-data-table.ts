import {
  columnFilteringFeature,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  tableFeatures,
  useTable,
  type ReactTable,
  type RowData,
} from "@tanstack/react-table"

/** The one TanStack feature set every Aries table is built on. */
export const dataTableFeatures = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
})

export type DataTableInstance<TData extends RowData> = ReactTable<
  typeof dataTableFeatures,
  TData
>

export function createDataTableColumns<TData extends RowData>() {
  return createColumnHelper<typeof dataTableFeatures, TData>()
}

type DataTableOptions<TData extends RowData> = Omit<
  Parameters<typeof useTable<typeof dataTableFeatures, TData>>[0],
  "features"
>

export function useDataTable<TData extends RowData>(
  options: DataTableOptions<TData>
): DataTableInstance<TData> {
  return useTable({ features: dataTableFeatures, ...options })
}
