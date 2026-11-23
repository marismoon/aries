import { describe, expect, it } from "vitest"

import { getDemoAttentionItems, getDemoBills } from "./mock-service"

describe("mock service", () => {
  it("returns data that satisfies the API schemas", async () => {
    expect((await getDemoBills()).length).toBeGreaterThan(0)
    expect((await getDemoAttentionItems()).length).toBeGreaterThan(0)
  })
})
