import { describe, expect, it } from "vitest"

import { demoBills, initialBillFilters } from "@/shared/mocks/bills"
import { filterBills, sumBillsByCurrency } from "./useBillsDemo"

describe("月账单样例口径", () => {
  it("按原币独立合计样例出账金额", () => {
    expect(demoBills).toHaveLength(64)
    const expected = { CNY: 0, USD: 0, EUR: 0 }
    for (const { currency, issuedAmount } of demoBills) {
      expected[currency] += issuedAmount
    }
    expect(sumBillsByCurrency(demoBills)).toEqual(expected)
  })

  it("叠加关键字、供应商、状态与币种筛选", () => {
    const filters = {
      ...initialBillFilters,
      query: " awS ",
      vendor: "AWS",
      currency: "USD",
      status: "archived",
    } as const
    const expected = demoBills
      .filter(
        ({ vendor, currency, status }) =>
          vendor === "AWS" && currency === "USD" && status === "archived"
      )
      .map(({ id }) => id)
    expect(expected.length).toBeGreaterThan(0)
    expect(filterBills(demoBills, filters).map(({ id }) => id)).toEqual(
      expected
    )
    expect(filterBills(demoBills, { ...filters, currency: "EUR" })).toEqual([])
    expect(filterBills(demoBills, initialBillFilters)).toEqual(demoBills)
  })

  it("可按账单编号和未截断的账号名称搜索", () => {
    expect(
      filterBills(demoBills, { ...initialBillFilters, query: "bl-2610-06" })[0]
        ?.vendor
    ).toBe("Cloudflare")
    expect(
      filterBills(demoBills, {
        ...initialBillFilters,
        query: "联合成本中心",
      })[0]?.id
    ).toBe("BL-2610-08")
  })
})
