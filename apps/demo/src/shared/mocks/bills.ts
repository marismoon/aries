import type { Bill, BillFilters, BillStatus } from "../types/billing"
import { demoPeriod } from "./period"

export const billStatusMeta = {
  archived: { label: "已归档", tone: "success" },
  discrepancy: { label: "差异待确认", tone: "warning" },
  "auth-expired": { label: "授权已逾期", tone: "danger" },
  "evidence-missing": { label: "待补传凭证", tone: "warning" },
  collecting: { label: "采集中", tone: "info" },
} satisfies Record<
  BillStatus,
  { label: string; tone: "success" | "warning" | "danger" | "info" }
>

export const initialBillFilters: BillFilters = {
  query: "",
  vendor: "all",
  status: "all",
  currency: "all",
}

const handwrittenBills: Bill[] = [
  {
    id: "BL-2610-01",
    accountName: "阿里云 · 生产账号",
    vendor: "阿里云",
    period: demoPeriod,
    currency: "CNY",
    issuedAmount: 412_000,
    estimatedAmount: null,
    channel: "API",
    status: "discrepancy",
  },
  {
    id: "BL-2610-02",
    accountName: "AWS · 研发共享账号",
    vendor: "AWS",
    period: demoPeriod,
    currency: "USD",
    issuedAmount: 0,
    estimatedAmount: 4200,
    channel: "API",
    status: "auth-expired",
  },
  {
    id: "BL-2610-03",
    accountName: "腾讯云 · 数据分析账号",
    vendor: "腾讯云",
    period: demoPeriod,
    currency: "CNY",
    issuedAmount: 122_800,
    estimatedAmount: null,
    channel: "EMAIL",
    status: "evidence-missing",
  },
  {
    id: "BL-2610-04",
    accountName: "Azure · 欧洲生产账号",
    vendor: "Azure",
    period: demoPeriod,
    currency: "EUR",
    issuedAmount: 0,
    estimatedAmount: 8300,
    channel: "RPA",
    status: "collecting",
  },
  {
    id: "BL-2610-05",
    accountName: "华为云 · 核心网络",
    vendor: "华为云",
    period: demoPeriod,
    currency: "CNY",
    issuedAmount: 171_500,
    estimatedAmount: null,
    channel: "API",
    status: "archived",
  },
  {
    id: "BL-2610-06",
    accountName: "Cloudflare · 主账号",
    vendor: "Cloudflare",
    period: demoPeriod,
    currency: "USD",
    issuedAmount: 9800,
    estimatedAmount: null,
    channel: "API",
    status: "archived",
  },
  {
    id: "BL-2610-07",
    // Matches the overview's attention item for this bill number (腾讯云 ·
    // 内容分发账号, CNY, issued ¥2,400.00 above the estimate).
    accountName: "腾讯云 · 内容分发账号",
    vendor: "腾讯云",
    period: demoPeriod,
    currency: "CNY",
    issuedAmount: 58_400,
    estimatedAmount: 56_000,
    channel: "API",
    status: "discrepancy",
  },
  {
    id: "BL-2610-08",
    accountName: "腾讯云 · 华东跨区域平台与数据仓库联合成本中心生产主账号",
    vendor: "腾讯云",
    period: demoPeriod,
    currency: "CNY",
    issuedAmount: 86_500,
    estimatedAmount: null,
    channel: "EMAIL",
    status: "archived",
  },
  {
    id: "BL-2610-09",
    accountName: "Google Cloud · 欧洲研发环境",
    vendor: "Google Cloud",
    period: demoPeriod,
    currency: "EUR",
    issuedAmount: 5480,
    estimatedAmount: null,
    channel: "MANUAL",
    status: "archived",
  },
  {
    id: "BL-2610-10",
    accountName: "阿里云 · 测试资源池",
    vendor: "阿里云",
    period: demoPeriod,
    currency: "CNY",
    issuedAmount: 0,
    estimatedAmount: 68_000,
    channel: "RPA",
    status: "collecting",
  },
]

const generatedVendors = [
  { vendor: "阿里云", currencies: ["CNY"], channels: ["API", "API", "RPA"] },
  { vendor: "腾讯云", currencies: ["CNY"], channels: ["API", "EMAIL"] },
  { vendor: "华为云", currencies: ["CNY"], channels: ["API", "RPA"] },
  { vendor: "火山引擎", currencies: ["CNY"], channels: ["API", "EMAIL"] },
  { vendor: "AWS", currencies: ["USD"], channels: ["API", "RPA"] },
  { vendor: "Azure", currencies: ["EUR", "USD"], channels: ["RPA", "API"] },
  { vendor: "Cloudflare", currencies: ["USD"], channels: ["API"] },
  {
    vendor: "Google Cloud",
    currencies: ["EUR", "USD"],
    channels: ["MANUAL", "API"],
  },
] as const

const accountRoles = [
  "生产账号",
  "测试账号",
  "数据中台",
  "研发共享账号",
  "安全合规账号",
  "大数据平台",
  "边缘节点",
  "备份归档账号",
]

function generatedStatus(index: number): BillStatus {
  if (index % 17 === 8) return "auth-expired"
  if (index % 13 === 6) return "evidence-missing"
  if (index % 11 === 5) return "discrepancy"
  if (index % 7 === 3) return "collecting"
  return "archived"
}

/** Deterministic extra rows so the register can be paged, sorted and filtered. */
const generatedBills: Bill[] = Array.from({ length: 54 }, (_, offset) => {
  const index = offset + 11
  const { vendor, currencies, channels } =
    generatedVendors[index % generatedVendors.length]!
  const currency = currencies[index % currencies.length]!
  const status = generatedStatus(index)
  const scale = currency === "CNY" ? 1 : 0.14
  const amount = Math.round((3_200 + ((index * 7_919) % 96_000)) * scale)
  const pending = status === "collecting" || status === "auth-expired"

  return {
    id: `BL-2610-${String(index).padStart(2, "0")}`,
    accountName: `${vendor} · ${accountRoles[(index * 3) % accountRoles.length]}`,
    vendor,
    period: demoPeriod,
    currency,
    issuedAmount: pending ? 0 : amount,
    estimatedAmount: pending ? Math.round(amount * 0.9) : null,
    channel: channels[index % channels.length]!,
    status,
  }
})

export const demoBills: Bill[] = [...handwrittenBills, ...generatedBills]
