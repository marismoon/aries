import { createContext, useContext, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"

import { initialBillFilters } from "@/shared/mocks/bills"
import { getDemoBills } from "@/shared/mocks/mock-service"
import type { Bill, BillFilters, Currency } from "@/shared/types/billing"

export function matchesBillFilters(bill: Bill, filters: BillFilters) {
  const query = filters.query.trim().toLowerCase()
  return (
    (!query ||
      `${bill.id} ${bill.accountName} ${bill.vendor}`
        .toLowerCase()
        .includes(query)) &&
    (filters.vendor === "all" || bill.vendor === filters.vendor) &&
    (filters.status === "all" || bill.status === filters.status) &&
    (filters.currency === "all" || bill.currency === filters.currency)
  )
}

export function filterBills(bills: readonly Bill[], filters: BillFilters) {
  return bills.filter((bill) => matchesBillFilters(bill, filters))
}

export function sumBillsByCurrency(bills: readonly Bill[]) {
  const totals: Record<Currency, number> = { CNY: 0, USD: 0, EUR: 0 }
  for (const bill of bills) totals[bill.currency] += bill.issuedAmount
  return totals
}

export function useBillsDemoState() {
  const { data, isError, refetch } = useQuery({
    queryKey: ["bills"],
    queryFn: getDemoBills,
  })
  const bills = data ?? null
  const [filters, setFilters] = useState(initialBillFilters)

  const vendors = useMemo(
    () =>
      Array.from(new Set(bills?.map(({ vendor }) => vendor))).sort((a, b) =>
        a.localeCompare(b, "zh-CN")
      ),
    [bills]
  )
  const totals = useMemo(() => sumBillsByCurrency(bills ?? []), [bills])

  return {
    loading: bills === null && !isError,
    error: bills === null && isError,
    retry: () => void refetch(),
    count: bills?.length ?? 0,
    rows: bills ?? [],
    vendors,
    totals,
    filters,
    setFilters,
    resetFilters: () => setFilters(initialBillFilters),
  }
}

export const BillsDemoContext = createContext<ReturnType<
  typeof useBillsDemoState
> | null>(null)

export function useBillsDemo() {
  const demo = useContext(BillsDemoContext)
  if (!demo) throw new Error("Aries demo provider is unavailable.")
  return demo
}
