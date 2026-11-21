const wanFormat = new Intl.NumberFormat("zh-CN", {
  maximumFractionDigits: 2,
})

export function formatWan(value: number) {
  return wanFormat.format(value / 10_000)
}

export function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
  }).format(value)
}

const activityTimeFormat = new Intl.DateTimeFormat("zh-CN", {
  timeZone: "Asia/Shanghai",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
})

export function formatActivityTime(iso: string) {
  return activityTimeFormat.format(new Date(iso))
}
