import { z } from "zod"

export const memberStatusSchema = z.enum(["active", "invited", "disabled"])
export type MemberStatus = z.infer<typeof memberStatusSchema>

export const demoMemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  initials: z.string(),
  email: z.string(),
  departmentId: z.string(),
  roleId: z.string(),
  status: memberStatusSchema,
  twoFactorEnabled: z.boolean(),
  lastLoginAt: z.string(),
  lastLoginIp: z.string(),
})
export type DemoMember = z.infer<typeof demoMemberSchema>

export const demoRoleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  parentId: z.string().nullable().default(null),
  builtin: z.boolean(),
  disabled: z.boolean().optional(),
  permissions: z.array(z.string()),
})
export type DemoRole = z.infer<typeof demoRoleSchema>

export const demoDepartmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  parentId: z.string().nullable(),
  leader: z.string(),
  costCenter: z.string(),
  monthlyBudgetWan: z.number(),
  disabled: z.boolean().optional(),
})
export type DemoDepartment = z.infer<typeof demoDepartmentSchema>

export const demoSessionSchema = z.object({
  sessionId: z.string(),
  memberId: z.string(),
  signedInAt: z.string(),
  authMethod: z.enum(["password", "password+2fa", "sso"]),
  ip: z.string(),
})
export type DemoSession = z.infer<typeof demoSessionSchema>

export const globalParamsSchema = z.object({
  collectionConcurrency: z.number(),
  collectionRetries: z.number(),
  collectionTimeoutSec: z.number(),
  exportRowLimit: z.number(),
  exportWatermark: z.boolean(),
  apiRateLimitPerMin: z.number(),
  webhookTimeoutSec: z.number(),
  strictSchemaCheck: z.boolean(),
})
export type GlobalParams = z.infer<typeof globalParamsSchema>

export const integrationItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum(["cloud", "collab", "identity"]),
  description: z.string(),
  enabled: z.boolean(),
  status: z.enum(["connected", "warning", "disconnected"]),
  endpoint: z.string(),
  appId: z.string(),
  lastSyncAt: z.string(),
})
export type IntegrationItem = z.infer<typeof integrationItemSchema>

export const groupBotSchema = z.object({
  id: z.string(),
  name: z.string(),
  channel: z.enum(["wecom", "feishu", "dingtalk", "webhook"]),
  webhookUrl: z.string(),
  enabled: z.boolean(),
  lastTriggeredAt: z.string(),
  eventsCount: z.number(),
})
export type GroupBot = z.infer<typeof groupBotSchema>

export const messageRuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  event: z.string(),
  severity: z.enum(["high", "medium", "low"]),
  inApp: z.boolean(),
  email: z.boolean(),
  bot: z.boolean(),
  quietHours: z.string(),
  recipients: z.string(),
  enabled: z.boolean(),
})
export type MessageRule = z.infer<typeof messageRuleSchema>

export const securityPolicySchema = z.object({
  minPasswordLength: z.number(),
  requireComplexity: z.boolean(),
  passwordRotateDays: z.number(),
  enforceTwoFactor: z.preprocess(
    (value) => (value === "off" ? "optional" : value),
    z.enum(["all", "admins", "optional"])
  ),
  sessionTimeoutHours: z.number(),
  singleSessionOnly: z.boolean(),
  ipAllowlist: z.array(z.string()),
})
export type SecurityPolicy = z.infer<typeof securityPolicySchema>

export const auditLogSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  actor: z.string(),
  actorEmail: z.string(),
  module: z.string(),
  action: z.string(),
  target: z.string(),
  status: z.enum(["success", "warning", "failed"]),
  ip: z.string(),
  userAgent: z.string(),
  requestId: z.string(),
  detail: z.string(),
})
export type AuditLog = z.infer<typeof auditLogSchema>

export const supportTicketSchema = z.object({
  id: z.string(),
  category: z.string(),
  subject: z.string(),
  details: z.string().optional(),
  createdAt: z.string(),
  status: z.enum(["open", "resolved"]),
})
export type SupportTicket = z.infer<typeof supportTicketSchema>

export const workspaceStoreSchema = z.object({
  session: demoSessionSchema.nullable(),
  members: z.array(demoMemberSchema),
  roles: z.array(demoRoleSchema),
  departments: z.array(demoDepartmentSchema),
  deletedOrganizationIds: z.array(z.string()).optional(),
  globalParams: globalParamsSchema,
  integrations: z.array(integrationItemSchema),
  bots: z.array(groupBotSchema),
  messageRules: z.array(messageRuleSchema),
  securityPolicy: securityPolicySchema,
  auditLogs: z.array(auditLogSchema),
  supportTickets: z.array(supportTicketSchema),
  setupChecklist: z.object({
    basicInfoReviewed: z.boolean(),
    membersConfigured: z.boolean(),
    botTested: z.boolean(),
    securityReviewed: z.boolean(),
  }),
})
export type WorkspaceStoreState = z.infer<typeof workspaceStoreSchema>
