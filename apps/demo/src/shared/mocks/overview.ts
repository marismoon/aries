import type { ActivityEvent, AttentionItem } from "../types/overview"

export const dashboardMetrics = {
  accountCount: 49,
  pendingCount: 5,
  issued: 1_286_400,
  estimated: 362_100,
  completed: 42,
  annualIssued: 10_970_000,
}

export const issuedTrend = [
  { month: "5月", amount: 805_000 },
  { month: "6月", amount: 942_000 },
  { month: "7月", amount: 1_118_000 },
  { month: "8月", amount: 1_056_000 },
  { month: "9月", amount: 1_175_200 },
  { month: "10月", amount: dashboardMetrics.issued },
] as const

export const collectionChannels = [
  { currency: "CNY", completed: 31, total: 34 },
  { currency: "USD", completed: 8, total: 10 },
  { currency: "EUR", completed: 3, total: 5 },
] as const

export const collectionStates = {
  processing: 2,
  manual: 5,
  parseSuccess: 97.6,
}

export const attentionItems: readonly AttentionItem[] = [
  {
    id: "difference",
    kind: "difference",
    icon: "triangle-alert",
    title: "阿里云出账金额有差异",
    description: "生产账号 · BL-2610-01",
    label: "差异待确认",
    tone: "warning",
    action: "确认差异",
    details:
      "10 月生产账号的原币出账金额为 ¥412,000.00，较采集预估高 ¥12,800.00。请核对资源调整记录后确认。",
  },
  {
    id: "authorization",
    kind: "authorization",
    icon: "shield-alert",
    title: "AWS 授权已逾期",
    description: "研发共享账号 · 采集通道 API",
    label: "授权已逾期",
    tone: "danger",
    action: "查看授权",
    details:
      "该账号的采集授权已失效。此处可将演示事项标为已查看，账号授权仍由账号管理员处理。",
  },
  {
    id: "evidence",
    kind: "evidence",
    icon: "triangle-alert",
    title: "腾讯云缺少账单凭证",
    description: "数据分析账号 · 10 月账期",
    label: "待补传凭证",
    tone: "warning",
    action: "查看凭证",
    details:
      "样例账单已采集金额和账期信息，凭证字段为空。可在此将演示事项标为已查看。",
  },
  {
    id: "processing",
    kind: "collection",
    icon: "clock",
    title: "Azure 账单仍在解析",
    description: "欧洲生产账号 · EUR",
    label: "采集中",
    tone: "info",
    action: "查看进度",
    details:
      "欧洲生产账号的 EUR 样例文件已进入解析队列。采集进度展示的是固定账期快照。",
  },
]

export const attentionDemoItems: readonly AttentionItem[] = [
  {
    id: "huawei-collection-failed",
    kind: "collection",
    icon: "cloud",
    title: "华为云采集失败",
    description: "华南生产账号 · 10 月账期",
    label: "采集失败",
    tone: "danger",
    action: "查看失败",
    details:
      "演示采集任务未收到完整的账单文件。任务记录保留了失败原因和对应账期。",
  },
  {
    id: "qiniu-evidence-review",
    kind: "evidence",
    icon: "file-search",
    title: "七牛云凭证待核验",
    description: "对象存储账号 · 10 月账期",
    label: "待核验凭证",
    tone: "warning",
    action: "查看凭证",
    details: "演示凭证已上传，凭证上的账期和金额待人工核对。",
  },
  {
    id: "cloudflare-archive-pending",
    kind: "archive",
    icon: "folder",
    title: "Cloudflare 账单待归档",
    description: "边缘测试账号 · USD",
    label: "待归档",
    tone: "info",
    action: "查看账单",
    details: "边缘测试账号的 USD 演示账单已完成解析，正在等待归档。",
  },
  {
    id: "aliyun-authorization-expiring",
    kind: "authorization",
    icon: "shield-alert",
    title: "阿里云授权即将到期",
    description: "沙箱账号 · 采集通道 API",
    label: "授权即将到期",
    tone: "warning",
    action: "查看授权",
    details: "沙箱账号的演示采集授权距到期还有 7 天，续期由账号管理员处理。",
  },
  {
    id: "tencent-billing-difference",
    kind: "difference",
    icon: "triangle-alert",
    title: "腾讯云账单金额有差异",
    description: "内容分发账号 · BL-2610-07",
    label: "差异待确认",
    tone: "warning",
    action: "确认差异",
    details:
      "演示账单的 CNY 出账金额较采集预估高 ¥2,400.00，差额来自待核对的流量费用。",
  },
  {
    id: "aws-cost-anomaly",
    kind: "cost",
    icon: "chart",
    title: "AWS 成本异常波动",
    description: "北美生产账号 · USD",
    label: "成本待核查",
    tone: "warning",
    action: "查看异常",
    details: "演示成本记录中的网络费用较上期增加，需要核对用量变化。",
  },
  {
    id: "azure-evidence-missing",
    kind: "evidence",
    icon: "file-search",
    title: "Azure 缺少账单凭证",
    description: "亚太测试账号 · 10 月账期",
    label: "待补传凭证",
    tone: "warning",
    action: "查看凭证",
    details: "亚太测试账号的演示账单已完成金额采集，来源凭证仍待补齐。",
  },
  {
    id: "huawei-collection-timeout",
    kind: "collection",
    icon: "clock",
    title: "华为云采集任务超时",
    description: "灾备账号 · 定时采集",
    label: "采集超时",
    tone: "danger",
    action: "查看任务",
    details:
      "灾备账号的演示采集任务已超过预设执行时限，任务记录保留了最近一次运行状态。",
  },
]

export const defaultActivity: readonly ActivityEvent[] = [
  {
    id: "collection-finished",
    time: "2026-11-05T09:42:00+08:00",
    title: "Cloudflare 主账号已归档",
    description: "10 月 USD 账单已完成结构化解析与归档。",
    tone: "success",
  },
  {
    id: "billing-synced",
    time: "2026-11-04T16:18:00+08:00",
    title: "10 月出账快照已更新",
    description: "本期 CNY 已出账统计更新为 ¥128.64 万。",
    tone: "info",
  },
  {
    id: "variance-found",
    time: "2026-11-04T10:30:00+08:00",
    title: "阿里云生产账号触发差异提醒",
    description: "金额差异已加入待处理事项。",
    tone: "warning",
  },
]
