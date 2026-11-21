import { z } from "zod"

export const attentionItemSchema = z.object({
  id: z.string(),
  kind: z.enum([
    "difference",
    "authorization",
    "evidence",
    "collection",
    "archive",
    "cost",
  ]),
  icon: z.enum([
    "triangle-alert",
    "shield-alert",
    "clock",
    "file-search",
    "cloud",
    "folder",
    "chart",
  ]),
  title: z.string(),
  description: z.string(),
  label: z.string(),
  tone: z.enum(["warning", "danger", "info"]),
  action: z.string(),
  details: z.string(),
})

export type AttentionItem = z.infer<typeof attentionItemSchema>

export type ActivityEvent = {
  id: string
  time: string
  title: string
  description: string
  tone: "success" | "info" | "warning"
}
