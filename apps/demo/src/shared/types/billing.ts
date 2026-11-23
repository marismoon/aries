import { z } from "zod"

export const currencySchema = z.enum(["CNY", "USD", "EUR"])
export const billStatusSchema = z.enum([
  "archived",
  "discrepancy",
  "auth-expired",
  "evidence-missing",
  "collecting",
])

export const billSchema = z.object({
  id: z.string(),
  accountName: z.string(),
  vendor: z.string(),
  period: z.string(),
  currency: currencySchema,
  issuedAmount: z.number(),
  estimatedAmount: z.number().nullable(),
  channel: z.enum(["API", "RPA", "EMAIL", "MANUAL"]),
  status: billStatusSchema,
})

export type Currency = z.infer<typeof currencySchema>
export type BillStatus = z.infer<typeof billStatusSchema>
export type Bill = z.infer<typeof billSchema>

export type BillFilters = {
  query: string
  vendor: string
  status: BillStatus | "all"
  currency: Currency | "all"
}
