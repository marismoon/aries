import { sumBillsByCurrency } from "@/features/bills/hooks/useBillsDemo"
import { formatCurrency } from "@aries/ui/lib/format"
import { billStatusMeta, demoBills } from "@/shared/mocks/bills"
import {
  attentionItems,
  collectionStates,
  dashboardMetrics,
  issuedTrend,
} from "@/shared/mocks/overview"
import { demoPeriod, demoPeriodLabel } from "@/shared/mocks/period"
import type { BillStatus } from "@/shared/types/billing"
import type { AttentionItem } from "@/shared/types/overview"

export const recommendedQuestions = [
  { id: "anomalies", text: "本月有哪些账单异常？" },
  { id: "collection", text: "哪些云账号采集失败？" },
  { id: "growth", text: "10 月费用比上月增长多少？" },
  { id: "manual", text: "哪些账单需要人工处理？" },
  { id: "summary", text: "帮我总结本月云成本情况。" },
] as const

export type CopilotQuestionId = (typeof recommendedQuestions)[number]["id"]

const aliases = {
  anomalies: ["本月账单异常", "查询账单异常", "哪些账单有异常", "账单异常"],
  collection: [
    "采集失败",
    "采集失败的云账号",
    "有哪些账号采集失败",
    "哪些账号采集失败",
    "采集异常",
  ],
  growth: [
    "10月费用环比",
    "本月费用环比",
    "本月费用比上月增长多少",
    "十月费用比上月增长多少",
    "本月成本涨了多少",
  ],
  manual: [
    "待办",
    "待人工处理的账单",
    "需要关注的事项",
    "有哪些需要我处理的待办",
  ],
  summary: [
    "本月云成本总结",
    "本月云成本概况",
    "总结本月云成本",
    "本月费用概况",
    "帮我总结本月云成本",
  ],
} satisfies Record<CopilotQuestionId, string[]>

const periodBills = demoBills.filter(({ period }) => period === demoPeriod)
const anomalyStatuses = new Set<BillStatus>([
  "discrepancy",
  "auth-expired",
  "evidence-missing",
])
const percent = new Intl.NumberFormat("zh-CN", {
  style: "percent",
  maximumFractionDigits: 1,
  signDisplay: "exceptZero",
})

/** Translates a Chinese source string; `{{name}}` placeholders take `values`. */
export type Translate = ((
  source: string,
  values?: Record<string, string | number>
) => string) & {
  /** Translates each part of a "标题 · 说明" string on its own. */
  parts: (source: string) => string
}

/** Default translator: keeps the Chinese source and fills placeholders. */
export const sourceText: Translate = Object.assign(
  (source: string, values?: Record<string, string | number>) =>
    source.replace(/\{\{(\w+)\}\}/g, (_, name: string) =>
      String(values?.[name] ?? "")
    ),
  { parts: (source: string) => source }
)

function normalizeQuestion(value: string) {
  return value
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[？?!.。！]+$/u, "")
}

function summarizeAnomalies(tl: Translate) {
  const anomalies = periodBills.filter(({ status }) =>
    anomalyStatuses.has(status)
  )

  return [
    tl("## {{period}}账单异常", { period: tl(demoPeriodLabel) }),
    "",
    tl(
      "月账单的 {{total}} 条演示样例中有 **{{count}} 条**异常状态记录。以下为账期快照。",
      { total: periodBills.length, count: anomalies.length }
    ),
    "",
    ...anomalies.map(
      ({ id, accountName, currency, issuedAmount, estimatedAmount, status }) =>
        tl(
          "- **{{id}}** · {{account}} · **{{status}}**。出账 {{issued}}{{estimated}}。",
          {
            id,
            account: tl.parts(accountName),
            status: tl(billStatusMeta[status].label),
            issued: `${currency} ${formatCurrency(issuedAmount, currency)}`,
            estimated:
              estimatedAmount === null
                ? ""
                : tl("，暂估 {{amount}}", {
                    amount: `${currency} ${formatCurrency(estimatedAmount, currency)}`,
                  }),
          }
        )
    ),
  ].join("\n")
}

function summarizeCollection(tl: Translate) {
  const expired = periodBills.filter(({ status }) => status === "auth-expired")
  const collecting = periodBills.filter(({ status }) => status === "collecting")

  return [
    tl("## 云账号采集情况"),
    "",
    tl(
      "总览中 **{{completed}} / {{total}}** 个账号已完成采集，{{processing}} 个解析中，{{manual}} 个待介入。月账单样例提供可核对的授权阻塞与采集中记录。",
      {
        completed: dashboardMetrics.completed,
        total: dashboardMetrics.accountCount,
        processing: collectionStates.processing,
        manual: collectionStates.manual,
      }
    ),
    "",
    ...expired.map(({ id, accountName }) =>
      tl("- **授权已逾期** · {{account}}（{{id}}），需要核对采集授权。", {
        account: tl.parts(accountName),
        id,
      })
    ),
    ...collecting.map(({ id, accountName }) =>
      tl("- **采集中** · {{account}}（{{id}}），当前记录仍在采集流程中。", {
        account: tl.parts(accountName),
        id,
      })
    ),
    "",
    tl("完整的采集失败账号清单超出当前演示数据范围。"),
  ].join("\n")
}

function summarizeGrowth(tl: Translate) {
  const [previous, current] = issuedTrend.slice(-2)
  if (!previous || !current) return tl("暂无已出账趋势数据。")
  const difference = current.amount - previous.amount
  const change = difference / previous.amount

  return [
    tl("## 10 月已出账环比"),
    "",
    tl(
      "按总览的 CNY 已出账口径，{{current}}较{{previous}}增加 **{{difference}}**（**{{change}}**）。",
      {
        current: tl(current.month),
        previous: tl(previous.month),
        difference: formatCurrency(difference, "CNY"),
        change: percent.format(change),
      }
    ),
    "",
    `- **${tl(current.month)}** · CNY ${formatCurrency(current.amount, "CNY")}`,
    `- **${tl(previous.month)}** · CNY ${formatCurrency(previous.amount, "CNY")}`,
  ].join("\n")
}

function summarizeManual(
  pendingAttention: readonly AttentionItem[] | null,
  tl: Translate
) {
  const heading = tl("## 当前需要人工关注的事项")
  if (pendingAttention === null) {
    return `${heading}\n\n${tl("总览待办正在加载。你可以稍后重新查询。")}`
  }

  const reviewed = attentionItems.length - pendingAttention.length
  const pendingCount = dashboardMetrics.pendingCount - reviewed
  const scope = tl(
    "总览当前计入 **{{pending}} 项**待人工处理，其中可查看的关注记录有 **{{viewable}} 项**。",
    { pending: pendingCount, viewable: pendingAttention.length }
  )

  if (pendingAttention.length === 0) {
    return `${heading}\n\n${scope} ${tl("本次会话中的可查看事项已处理完毕。")}`
  }

  return [
    heading,
    "",
    scope,
    "",
    ...pendingAttention.map(
      ({ title, label, description }) =>
        `- **${tl.parts(title)}** · ${tl(label)} · ${tl.parts(description)}`
    ),
  ].join("\n")
}

function summarizeCosts(tl: Translate) {
  const totals = sumBillsByCurrency(periodBills)

  return [
    tl("## {{period}}云成本总结", { period: tl(demoPeriodLabel) }),
    "",
    tl("### 运营总览 · 全量演示快照"),
    "",
    tl("- CNY 已出账 **{{amount}}**", {
      amount: formatCurrency(dashboardMetrics.issued, "CNY"),
    }),
    tl("- CNY 暂估单列 **{{amount}}**", {
      amount: formatCurrency(dashboardMetrics.estimated, "CNY"),
    }),
    tl("- 采集完成 **{{completed}} / {{total}} 个云账号**", {
      completed: dashboardMetrics.completed,
      total: dashboardMetrics.accountCount,
    }),
    "",
    tl("### 月账单 · {{total}} 条演示样例", { total: periodBills.length }),
    "",
    ...Object.entries(totals).map(([currency, amount]) =>
      tl("- {{currency}} 已出账 **{{amount}}**", {
        currency,
        amount: formatCurrency(amount, currency),
      })
    ),
    "",
    tl("样例出账按原币分别汇总，暂估另行列示。"),
  ].join("\n")
}

export function getCopilotQuestionId(
  question: string,
  tl: Translate = sourceText
) {
  const normalizedQuestion = normalizeQuestion(question)
  return recommendedQuestions.find(({ id, text }) =>
    [text, tl(text), ...aliases[id]].some(
      (candidate) => normalizeQuestion(candidate) === normalizedQuestion
    )
  )?.id
}

export function getCopilotReply(
  question: string,
  pendingAttention: readonly AttentionItem[] | null,
  tl: Translate = sourceText
): string {
  switch (getCopilotQuestionId(question, tl)) {
    case "anomalies":
      return summarizeAnomalies(tl)
    case "collection":
      return summarizeCollection(tl)
    case "growth":
      return summarizeGrowth(tl)
    case "manual":
      return summarizeManual(pendingAttention, tl)
    case "summary":
      return summarizeCosts(tl)
    default:
      return tl(
        "当前 Demo 支持查询账单异常、采集情况、费用环比、人工待办和本月云成本。请从推荐问题中选择一项，或输入相关问题。"
      )
  }
}
