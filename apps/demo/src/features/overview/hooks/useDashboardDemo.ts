import { createContext, useContext, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"

import { getDemoAttentionItems } from "@/shared/mocks/mock-service"
import { attentionDemoItems } from "@/shared/mocks/overview"
import type { ActivityEvent, AttentionItem } from "@/shared/types/overview"

const attentionQueryKey = ["attention"] as const

export const cardOptions = [
  { id: "issued", label: "本期已出账", initiallyVisible: true },
  { id: "estimated", label: "本期暂估", initiallyVisible: true },
  { id: "collection-kpi", label: "采集已完成", initiallyVisible: true },
  { id: "annual", label: "年累计已出账", initiallyVisible: true },
  { id: "attention", label: "需要关注", initiallyVisible: true },
  { id: "progress", label: "采集与归档进度", initiallyVisible: true },
  { id: "activity", label: "近期动态", initiallyVisible: true },
  {
    id: "chart-line",
    label: "折线图 · 供应商出账趋势",
    initiallyVisible: true,
  },
  { id: "chart-area", label: "面积图 · 年累计出账", initiallyVisible: true },
  {
    id: "chart-stack",
    label: "堆叠柱图 · 账单类型构成",
    initiallyVisible: true,
  },
  {
    id: "chart-donut",
    label: "环形图 · 供应商费用占比",
    initiallyVisible: true,
  },
  { id: "chart-bar", label: "条形图 · Top 5 云账号", initiallyVisible: true },
  { id: "chart-radar", label: "雷达图 · 采集质量", initiallyVisible: true },
  { id: "chart-heat", label: "热力图 · 采集任务", initiallyVisible: true },
  {
    id: "chart-scatter",
    label: "散点图 · 金额与解析耗时",
    initiallyVisible: true,
  },
  {
    id: "chart-gauge",
    label: "仪表盘 · 年度预算使用率",
    initiallyVisible: true,
  },
  { id: "estimate-share", label: "暂估占比", initiallyVisible: false },
  { id: "remaining", label: "未完成采集", initiallyVisible: false },
] as const

const initialCards = cardOptions
  .filter(({ initiallyVisible }) => initiallyVisible)
  .map(({ id }) => id)

export function useDashboardDemoState() {
  const [visible, setVisible] = useState<readonly string[]>(initialCards)
  const queryClient = useQueryClient()
  const { data } = useQuery({
    queryKey: attentionQueryKey,
    queryFn: getDemoAttentionItems,
  })
  const attention = data ?? null
  const [demoAttention, setDemoAttention] = useState(attentionDemoItems)
  const [activities, setActivities] = useState<readonly ActivityEvent[]>([])

  function resolveAttention(id: string) {
    const item = attention?.find((entry) => entry.id === id)
    if (!item) {
      setDemoAttention((items) => items.filter((entry) => entry.id !== id))
      return
    }
    queryClient.setQueryData<AttentionItem[]>(attentionQueryKey, (items) =>
      items?.filter((entry) => entry.id !== id)
    )
    setActivities((entries) => [
      {
        id: item.id,
        time: new Date().toISOString(),
        title: `已处理 · ${item.title}`,
        description: "演示待办状态已更新。",
        tone: "success",
      },
      ...entries,
    ])
  }

  function setCardVisibility(id: string, checked: boolean) {
    setVisible((cards) =>
      checked ? [...cards, id] : cards.filter((card) => card !== id)
    )
  }

  return {
    visible,
    attention,
    attentionCardItems: attention && [...attention, ...demoAttention],
    activities,
    setCardVisibility,
    resetCards: () => setVisible(initialCards),
    resolveAttention,
  }
}

export const DashboardDemoContext = createContext<ReturnType<
  typeof useDashboardDemoState
> | null>(null)

export function useDashboardDemo() {
  const demo = useContext(DashboardDemoContext)
  if (!demo) throw new Error("Marismoon demo provider is unavailable.")
  return demo
}
