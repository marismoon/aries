export const demoPeriod = "2026-10"
export const demoPeriodLabel = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "long",
  timeZone: "UTC",
}).format(new Date(demoPeriod + "-01T00:00:00Z"))
