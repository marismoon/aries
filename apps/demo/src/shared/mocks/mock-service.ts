import { z } from "zod"

import { billSchema } from "../types/billing"
import { attentionItemSchema } from "../types/overview"
import { demoBills } from "./bills"
import { attentionItems } from "./overview"

// Responses are parsed with the same schemas a real API client would use.
export async function getDemoAttentionItems() {
  await new Promise<void>((resolve) => setTimeout(resolve, 160))
  return z.array(attentionItemSchema).parse(structuredClone(attentionItems))
}

export async function getDemoBills() {
  await new Promise<void>((resolve) => setTimeout(resolve, 180))
  return z.array(billSchema).parse(structuredClone(demoBills))
}
