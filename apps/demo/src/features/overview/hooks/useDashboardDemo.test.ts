import { act, renderHook, waitFor } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import {
  collectionChannels,
  collectionStates,
  dashboardMetrics,
  issuedTrend,
} from "@/shared/mocks/overview"
import { createQueryWrapper } from "@/test/query-wrapper"
import { useDashboardDemoState } from "./useDashboardDemo"

describe("运营总览演示数据", () => {
  it("按币种的采集数、采集状态和本期趋势与 KPI 口径一致", () => {
    expect(
      collectionChannels.reduce((sum, channel) => sum + channel.total, 0)
    ).toBe(dashboardMetrics.accountCount)
    expect(
      collectionChannels.reduce((sum, channel) => sum + channel.completed, 0)
    ).toBe(dashboardMetrics.completed)
    expect(
      dashboardMetrics.completed +
        collectionStates.processing +
        collectionStates.manual
    ).toBe(dashboardMetrics.accountCount)
    expect(issuedTrend.at(-1)?.amount).toBe(dashboardMetrics.issued)
  })

  it("处理待办只更新当前会话，定制可以恢复", async () => {
    const { result } = renderHook(useDashboardDemoState, {
      wrapper: createQueryWrapper(),
    })
    expect(result.current.attention).toBeNull()
    await waitFor(() => expect(result.current.attention).toHaveLength(4))

    act(() => result.current.resolveAttention("difference"))
    expect(result.current.attention).toHaveLength(3)
    expect(result.current.activities[0]?.id).toBe("difference")

    act(() => {
      result.current.setCardVisibility("issued", false)
      result.current.setCardVisibility("estimate-share", true)
    })
    expect(result.current.visible).not.toContain("issued")
    expect(result.current.visible).toContain("estimate-share")

    act(result.current.resetCards)
    expect(result.current.visible).toContain("issued")
    expect(result.current.visible).not.toContain("estimate-share")
  })
})
