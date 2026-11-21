import { useState } from "react"

import "@/features/bills/bills.css"
import { FrostCard } from "@marismoon/ui/shared/FrostCard"
import { BillsTable } from "@/features/bills/components/BillsTable"
import { demoBills, initialBillFilters } from "@marismoon/core/mocks/bills"

const sampleBills = demoBills.slice(0, 40)
const sampleVendors = Array.from(new Set(sampleBills.map((b) => b.vendor)))

/** The bills register itself, so the preview is exactly the table template. */
export function DataTableDemo() {
  const [filters, setFilters] = useState(initialBillFilters)
  return (
    <div className="component-bare">
      <header>
        <h3>DataTable（表格模版）</h3>
        <p>shadcn Table + TanStack：所有业务表格的统一模版</p>
      </header>
      <FrostCard className="bills-register data-table-preview">
        <BillsTable
          rows={sampleBills}
          filters={filters}
          vendors={sampleVendors}
          onFilterChange={setFilters}
          onShowBill={() => undefined}
          onReset={() => setFilters(initialBillFilters)}
        />
      </FrostCard>
    </div>
  )
}
