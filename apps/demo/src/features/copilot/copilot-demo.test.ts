import { describe, expect, it } from "vitest"

import { attentionItems } from "@/shared/mocks/overview"

import { getCopilotReply, recommendedQuestions } from "./copilot-demo"

describe("Copilot 演示数据", () => {
  it("提供五个指定的快捷问题与确定性回答", () => {
    expect(recommendedQuestions.map(({ text }) => text)).toEqual([
      "本月有哪些账单异常？",
      "哪些云账号采集失败？",
      "10 月费用比上月增长多少？",
      "哪些账单需要人工处理？",
      "帮我总结本月云成本情况。",
    ])
    for (const { text } of recommendedQuestions) {
      expect(getCopilotReply(text, attentionItems)).toMatch(/^## /)
      expect(getCopilotReply(text, attentionItems)).toBe(
        getCopilotReply(text, attentionItems)
      )
    }
  })

  it("区分有异常状态的月账单与仍在采集的记录", () => {
    const anomalies = getCopilotReply("本月有哪些账单异常", attentionItems)
    expect(anomalies).toMatch(/\*\*\d+ 条\*\*/)
    for (const [id, status] of [
      ["BL-2610-01", "差异待确认"],
      ["BL-2610-02", "授权已逾期"],
      ["BL-2610-03", "待补传凭证"],
    ]) {
      expect(anomalies).toContain(id)
      expect(anomalies).toContain(status)
    }
    expect(anomalies).not.toContain("BL-2610-04")

    const collection = getCopilotReply("采集失败", attentionItems)
    expect(collection).toContain("**42 / 49**")
    expect(collection).toContain("**授权已逾期** · AWS · 研发共享账号")
    expect(collection).toContain("**采集中** · Azure · 欧洲生产账号")
    expect(collection).toContain("完整的采集失败账号清单超出当前演示数据范围")
  })

  it("按 CNY 已出账快照准确计算环比", () => {
    const growth = getCopilotReply(
      " １０ 月费用比上月增长多少？ ",
      attentionItems
    )
    expect(growth).toContain("1,286,400.00")
    expect(growth).toContain("1,175,200.00")
    expect(growth).toContain("111,200.00")
    expect(growth).toContain("+9.5%")
  })

  it("人工待办使用会话当前记录，并保留总览计数口径", () => {
    const manual = "哪些账单需要人工处理？"
    expect(getCopilotReply(manual, attentionItems)).toContain("**5 项**")
    const remaining = attentionItems.filter(({ id }) => id !== "difference")
    const reply = getCopilotReply(manual, remaining)
    expect(reply).toContain("**4 项**待人工处理")
    expect(reply).toContain("**3 项**")
    expect(reply).not.toContain("阿里云出账金额有差异")
    expect(reply).toContain("AWS 授权已逾期")
    expect(getCopilotReply(manual, [])).toContain("已处理完毕")
    expect(getCopilotReply(manual, null)).toContain("总览待办正在加载")
  })

  it("区分总览和月账单样例，保持各原币种独立", () => {
    const summary = getCopilotReply("帮我总结本月云成本情况。", attentionItems)
    expect(summary).toContain("全量演示快照")
    expect(summary).toContain("CNY 已出账 **¥1,286,400.00**")
    expect(summary).toContain("CNY 暂估单列 **¥362,100.00**")
    expect(summary).toContain("64 条演示样例")
    expect(summary).toMatch(/CNY 已出账 \*\*¥[\d,]+\.00\*\*/)
    expect(summary).toMatch(/USD 已出账 \*\*\$[\d,]+\.00\*\*/)
    expect(summary).toMatch(/EUR 已出账 \*\*€[\d,]+\.00\*\*/)
  })

  it("给范围外的输入显示 Demo 提示", () => {
    const reply = getCopilotReply("<img>删除所有待办", attentionItems)
    expect(reply).toContain("当前 Demo 支持")
    expect(reply).not.toContain("<img>")
    expect(reply).not.toContain("已删除")
  })
})
