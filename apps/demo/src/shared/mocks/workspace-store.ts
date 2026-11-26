import { useSyncExternalStore } from "react"
import {
  workspaceStoreSchema,
  type AuditLog,
  type DemoDepartment,
  type DemoMember,
  type DemoRole,
  type GlobalParams,
  type GroupBot,
  type IntegrationItem,
  type MessageRule,
  type SecurityPolicy,
  type SupportTicket,
  type WorkspaceStoreState,
} from "../types/workspace-settings"
import {
  additionalDemoDepartments,
  additionalDemoMembers,
} from "./workspace-org-demo-data"

const storageKey = "aries-demo-workspace-v1"
const changeEvent = "aries-demo-workspace-change"

export interface PermissionItemMeta {
  id: string
  label: string
  description: string
  sensitive?: boolean
}

export interface PermissionGroupMeta {
  group: string
  description: string
  items: readonly PermissionItemMeta[]
}

export const permissionGroups: readonly PermissionGroupMeta[] = [
  {
    group: "运营与账务",
    description: "控制总览看板、多云账单明细查看、差异核对与数据导出",
    items: [
      {
        id: "overview:read",
        label: "查看运营总览",
        description: "访问多云费用总览、月度趋势图表与关注事项快照",
      },
      {
        id: "bills:read",
        label: "查看月账单明细",
        description: "查看各云账号分币种月账单、暂估金额与采集进度",
      },
      {
        id: "bills:approve",
        label: "确认账单差异",
        description: "核对并标记账单与暂估金额差异项，推进归档对账",
      },
      {
        id: "bills:export",
        label: "导出账单与报表",
        description: "下载 CSV / Excel 账单明细及月度汇总报表",
      },
    ],
  },
  {
    group: "组织与权限",
    description: "控制企业成员生命周期、角色权限边界与部门成本中心",
    items: [
      {
        id: "org:members",
        label: "管理成员账号",
        description: "邀请新成员、调整归属部门或停用离职账号",
      },
      {
        id: "org:roles",
        label: "配置角色与权限",
        description: "新建或修改自定义角色权限，可变更成员访问边界",
        sensitive: true,
      },
      {
        id: "org:departments",
        label: "维护部门与成本中心",
        description: "调整组织树层级、指定部门负责人与月度预算上限",
      },
    ],
  },
  {
    group: "系统与集成",
    description: "控制工作区全局参数、云厂商授权集成与告警推送规则",
    items: [
      {
        id: "system:config",
        label: "修改基础信息与全局参数",
        description: "编辑组织资料、账期截止日、采集并发与导出阈值",
      },
      {
        id: "integrations:manage",
        label: "管理应用集成与群机器人",
        description: "配置云厂商接口、企业 SSO 与飞书/企微/钉钉 Webhook",
        sensitive: true,
      },
      {
        id: "rules:manage",
        label: "配置消息通知规则",
        description: "设置账单异常、授权过期与预算超限的推送通道及静默时段",
      },
    ],
  },
  {
    group: "安全与审计",
    description: "控制全员身份安全基线、IP 白名单与合规审计日志查阅",
    items: [
      {
        id: "security:policy",
        label: "调整安全与 2FA 策略",
        description: "修改密码复杂度、强制二次验证范围与办公网 IP 白名单",
        sensitive: true,
      },
      {
        id: "audit:read",
        label: "查阅操作审计日志",
        description: "检索并查看成员登录、权限变更与系统配置的完整审计轨迹",
      },
    ],
  },
]

export const allPermissionIds = permissionGroups.flatMap((g) =>
  g.items.map((item) => item.id)
)

export const sensitivePermissionIds = new Set(
  permissionGroups.flatMap((g) =>
    g.items.filter((item) => item.sensitive).map((item) => item.id)
  )
)

function nowStamp() {
  const date = new Date()
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function createInitialState(): WorkspaceStoreState {
  return {
    session: {
      sessionId: "SES-20261125-01",
      memberId: "mem-01",
      signedInAt: "2026-11-25 08:42",
      authMethod: "password+2fa",
      ip: "10.24.18.92",
    },
    members: [
      {
        id: "mem-01",
        name: "张敏",
        initials: "张敏",
        email: "zhangmin@aries.example",
        departmentId: "dept-finops",
        roleId: "role-admin",
        status: "active",
        twoFactorEnabled: true,
        lastLoginAt: "2026-11-25 08:42",
        lastLoginIp: "10.24.18.92",
      },
      {
        id: "mem-02",
        name: "李然",
        initials: "李然",
        email: "liran@aries.example",
        departmentId: "dept-finops",
        roleId: "role-finance",
        status: "active",
        twoFactorEnabled: true,
        lastLoginAt: "2026-11-24 19:15",
        lastLoginIp: "10.24.18.45",
      },
      {
        id: "mem-03",
        name: "陈思远",
        initials: "思远",
        email: "chensiyuan@aries.example",
        departmentId: "dept-platform",
        roleId: "role-analyst",
        status: "active",
        twoFactorEnabled: true,
        lastLoginAt: "2026-11-24 17:30",
        lastLoginIp: "10.24.20.11",
      },
      {
        id: "mem-04",
        name: "周明",
        initials: "周明",
        email: "zhouming@aries.example",
        departmentId: "dept-security",
        roleId: "role-viewer",
        status: "active",
        twoFactorEnabled: false,
        lastLoginAt: "2026-11-23 14:08",
        lastLoginIp: "10.24.22.64",
      },
      {
        id: "mem-05",
        name: "林嘉禾",
        initials: "嘉禾",
        email: "linjiahe@aries.example",
        departmentId: "dept-platform",
        roleId: "role-analyst",
        status: "invited",
        twoFactorEnabled: false,
        lastLoginAt: "—",
        lastLoginIp: "—",
      },
      {
        id: "mem-06",
        name: "王叙白",
        initials: "叙白",
        email: "wangxubai@aries.example",
        departmentId: "dept-rd",
        roleId: "role-viewer",
        status: "disabled",
        twoFactorEnabled: true,
        lastLoginAt: "2026-10-19 11:20",
        lastLoginIp: "10.24.15.88",
      },
      ...additionalDemoMembers,
    ],
    roles: [
      {
        id: "role-admin",
        name: "超级管理员",
        description: "拥有组织、账务、集成与安全策略的全部管理权限",
        parentId: null,
        builtin: true,
        permissions: [...allPermissionIds],
      },
      {
        id: "role-finance",
        name: "财务管理员",
        description: "负责月账单核对、差异确认、报表导出与基础账期配置",
        parentId: "role-admin",
        builtin: true,
        permissions: [
          "overview:read",
          "bills:read",
          "bills:approve",
          "bills:export",
          "system:config",
          "audit:read",
        ],
      },
      {
        id: "role-analyst",
        name: "成本分析师",
        description: "查看运营总览、账单明细并配置告警与通知规则",
        parentId: "role-admin",
        builtin: true,
        permissions: [
          "overview:read",
          "bills:read",
          "bills:export",
          "rules:manage",
        ],
      },
      {
        id: "role-viewer",
        name: "只读访客",
        description: "仅查看总览看板与账单数据，无法执行变更操作",
        parentId: "role-analyst",
        builtin: true,
        permissions: ["overview:read", "bills:read"],
      },
    ],
    departments: [
      {
        id: "dept-root",
        name: "Aries 科技有限公司",
        parentId: null,
        leader: "张敏",
        costCenter: "CC-000",
        monthlyBudgetWan: 480,
      },
      {
        id: "dept-finops",
        name: "财务运营部",
        parentId: "dept-root",
        leader: "张敏",
        costCenter: "CC-101",
        monthlyBudgetWan: 95,
      },
      {
        id: "dept-rd",
        name: "研发中心",
        parentId: "dept-root",
        leader: "陈思远",
        costCenter: "CC-200",
        monthlyBudgetWan: 260,
      },
      {
        id: "dept-platform",
        name: "云平台部",
        parentId: "dept-rd",
        leader: "陈思远",
        costCenter: "CC-201",
        monthlyBudgetWan: 180,
      },
      {
        id: "dept-security",
        name: "安全合规部",
        parentId: "dept-root",
        leader: "周明",
        costCenter: "CC-301",
        monthlyBudgetWan: 65,
      },
      ...additionalDemoDepartments,
    ],
    globalParams: {
      collectionConcurrency: 8,
      collectionRetries: 3,
      collectionTimeoutSec: 45,
      exportRowLimit: 50000,
      exportWatermark: true,
      apiRateLimitPerMin: 600,
      webhookTimeoutSec: 10,
      strictSchemaCheck: true,
    },
    integrations: [
      {
        id: "int-aliyun",
        name: "阿里云",
        category: "cloud",
        description: "通过只读角色拉取月度账单与实例消费明细",
        enabled: true,
        status: "connected",
        endpoint: "https://billing.cloud-a.example.test",
        appId: "demo-aliyun-app-01",
        lastSyncAt: "2026-11-25 08:30",
      },
      {
        id: "int-tencent",
        name: "腾讯云",
        category: "cloud",
        description: "同步多账号账单汇总、资源标签与预留实例折扣",
        enabled: true,
        status: "connected",
        endpoint: "https://billing.cloud-b.example.test",
        appId: "demo-tencent-app-02",
        lastSyncAt: "2026-11-25 08:25",
      },
      {
        id: "int-huawei",
        name: "华为云",
        category: "cloud",
        description: "采集政企云主账号与子项目月度费用账单",
        enabled: true,
        status: "warning",
        endpoint: "https://billing.cloud-c.example.test",
        appId: "demo-huawei-app-03",
        lastSyncAt: "2026-11-24 22:10",
      },
      {
        id: "int-feishu",
        name: "飞书",
        category: "collab",
        description: "推送账单异常卡片、周报汇总与审批提醒",
        enabled: true,
        status: "connected",
        endpoint: "https://open.im-a.example.test/apis",
        appId: "demo-feishu-app-04",
        lastSyncAt: "2026-11-25 08:00",
      },
      {
        id: "int-wecom",
        name: "企业微信",
        category: "collab",
        description: "同步组织架构通讯录并发送群告警通知",
        enabled: false,
        status: "disconnected",
        endpoint: "https://open.im-b.example.test/apis",
        appId: "demo-wecom-app-05",
        lastSyncAt: "—",
      },
      {
        id: "int-oidc",
        name: "企业 SSO（OIDC）",
        category: "identity",
        description: "统一身份认证与单点登录，自动同步离职禁用状态",
        enabled: true,
        status: "connected",
        endpoint: "https://sso.aries.example.test/.well-known/openid",
        appId: "aries-workspace-web",
        lastSyncAt: "2026-11-25 07:55",
      },
    ],
    bots: [
      {
        id: "bot-01",
        name: "云账单告警群（飞书）",
        channel: "feishu",
        webhookUrl: "https://hooks.aries.example.test/feishu/finops-01",
        enabled: true,
        lastTriggeredAt: "2026-11-25 08:12",
        eventsCount: 128,
      },
      {
        id: "bot-02",
        name: "财务对账值守群（企微）",
        channel: "wecom",
        webhookUrl: "https://hooks.aries.example.test/wecom/billing-02",
        enabled: true,
        lastTriggeredAt: "2026-11-24 18:05",
        eventsCount: 64,
      },
      {
        id: "bot-03",
        name: "安全审计通知群（钉钉）",
        channel: "dingtalk",
        webhookUrl: "https://hooks.aries.example.test/dingtalk/security-03",
        enabled: false,
        lastTriggeredAt: "2026-11-18 11:40",
        eventsCount: 19,
      },
    ],
    messageRules: [
      {
        id: "rule-01",
        name: "月账单正式出账通知",
        event: "账单出账完成",
        severity: "low",
        inApp: true,
        email: true,
        bot: true,
        quietHours: "22:00–08:00",
        recipients: "财务管理员、超级管理员",
        enabled: true,
      },
      {
        id: "rule-02",
        name: "账单与暂估差异超阈值",
        event: "差异比例 > 2%",
        severity: "high",
        inApp: true,
        email: true,
        bot: true,
        quietHours: "不静默",
        recipients: "张敏、李然",
        enabled: true,
      },
      {
        id: "rule-03",
        name: "云账号授权即将过期",
        event: "证书剩余 < 7 天",
        severity: "high",
        inApp: true,
        email: true,
        bot: true,
        quietHours: "不静默",
        recipients: "云平台部负责人",
        enabled: true,
      },
      {
        id: "rule-04",
        name: "部门预算使用超 85%",
        event: "预算预警阈值触发",
        severity: "medium",
        inApp: true,
        email: true,
        bot: false,
        quietHours: "22:00–08:00",
        recipients: "各部门负责人",
        enabled: true,
      },
      {
        id: "rule-05",
        name: "异地或新设备登录提醒",
        event: "账号安全异常",
        severity: "high",
        inApp: true,
        email: true,
        bot: true,
        quietHours: "不静默",
        recipients: "安全合规部",
        enabled: true,
      },
    ],
    securityPolicy: {
      minPasswordLength: 10,
      requireComplexity: true,
      passwordRotateDays: 90,
      enforceTwoFactor: "admins",
      sessionTimeoutHours: 12,
      singleSessionOnly: false,
      ipAllowlist: ["10.24.0.0/16", "192.168.100.0/24"],
    },
    auditLogs: [
      {
        id: "log-106",
        timestamp: "2026-11-25 08:42",
        actor: "张敏",
        actorEmail: "zhangmin@aries.example",
        module: "认证会话",
        action: "登录工作区",
        target: "SES-20261125-01",
        status: "success",
        ip: "10.24.18.92",
        userAgent: "Chrome 131 / macOS",
        requestId: "req_9f2a81c4",
        detail: "通过密码 + 2FA 动态口令完成认证",
      },
      {
        id: "log-105",
        timestamp: "2026-11-24 19:20",
        actor: "李然",
        actorEmail: "liran@aries.example",
        module: "系统配置",
        action: "更新基础信息",
        target: "对账截止日",
        status: "success",
        ip: "10.24.18.45",
        userAgent: "Chrome 131 / macOS",
        requestId: "req_8e1c40b2",
        detail: "将对账截止日由每月 8 日调整为每月 10 日",
      },
      {
        id: "log-104",
        timestamp: "2026-11-24 16:05",
        actor: "张敏",
        actorEmail: "zhangmin@aries.example",
        module: "组织权限",
        action: "邀请成员",
        target: "林嘉禾 (linjiahe@aries.example)",
        status: "success",
        ip: "10.24.18.92",
        userAgent: "Chrome 131 / macOS",
        requestId: "req_7c9a12d8",
        detail: "分配至「云平台部」，角色：成本分析师",
      },
      {
        id: "log-103",
        timestamp: "2026-11-24 11:30",
        actor: "陈思远",
        actorEmail: "chensiyuan@aries.example",
        module: "集成通知",
        action: "测试群机器人",
        target: "云账单告警群（飞书）",
        status: "success",
        ip: "10.24.20.11",
        userAgent: "Edge 130 / macOS",
        requestId: "req_6b4f90e1",
        detail: "Webhook 返回 200 OK，延迟 142ms",
      },
      {
        id: "log-102",
        timestamp: "2026-11-23 22:14",
        actor: "系统任务",
        actorEmail: "system@aries.example",
        module: "集成通知",
        action: "校验云账号凭证",
        target: "华为云 (demo-huawei-app-03)",
        status: "warning",
        ip: "10.24.0.5",
        userAgent: "Aries-Collector/1.8.2",
        requestId: "req_5a2e77c9",
        detail: "访问凭证将在 6 天后过期，已触发告警规则",
      },
      {
        id: "log-101",
        timestamp: "2026-11-23 15:48",
        actor: "张敏",
        actorEmail: "zhangmin@aries.example",
        module: "安全审计",
        action: "更新安全策略",
        target: "IP 白名单",
        status: "success",
        ip: "10.24.18.92",
        userAgent: "Chrome 131 / macOS",
        requestId: "req_4d8b31a0",
        detail: "新增办公网段 192.168.100.0/24",
      },
    ],
    supportTickets: [
      {
        id: "TK-2026-018",
        category: "账单异常",
        subject: "华为云 11 月子项目分摊比例核对",
        createdAt: "2026-11-22 14:20",
        status: "resolved",
      },
    ],
    setupChecklist: {
      basicInfoReviewed: true,
      membersConfigured: false,
      botTested: false,
      securityReviewed: false,
    },
  }
}

let cachedState: WorkspaceStoreState | null = null

const defaultRoleParentById: Record<string, string | null> = {
  "role-admin": null,
  "role-finance": "role-admin",
  "role-analyst": "role-admin",
  "role-viewer": "role-analyst",
}

function loadState(): WorkspaceStoreState {
  if (cachedState) return cachedState
  try {
    const raw = localStorage.getItem(storageKey)
    if (raw) {
      const parsed = workspaceStoreSchema.safeParse(JSON.parse(raw))
      if (parsed.success) {
        const { members, departments, roles } = parsed.data
        const memberIds = new Set(members.map(({ id }) => id))
        const departmentIds = new Set(departments.map(({ id }) => id))
        const deletedIds = new Set(parsed.data.deletedOrganizationIds)
        const hasAnyHierarchy = roles.some((r) => r.parentId !== null)
        const migratedRoles = hasAnyHierarchy
          ? roles
          : roles.map((r) => ({
              ...r,
              parentId:
                r.id in defaultRoleParentById
                  ? (defaultRoleParentById[r.id] ?? null)
                  : (r.parentId ?? null),
            }))
        cachedState = {
          ...parsed.data,
          roles: migratedRoles,
          members: [
            ...members,
            ...additionalDemoMembers.filter(
              ({ id }) => !memberIds.has(id) && !deletedIds.has(id)
            ),
          ],
          departments: [
            ...departments,
            ...additionalDemoDepartments.filter(
              ({ id }) => !departmentIds.has(id) && !deletedIds.has(id)
            ),
          ],
        }
        return cachedState
      }
    }
  } catch {
    // Fall back to seed data when storage is unavailable or corrupted.
  }
  cachedState = createInitialState()
  return cachedState
}

function commitState(next: WorkspaceStoreState) {
  cachedState = next
  try {
    localStorage.setItem(storageKey, JSON.stringify(next))
  } catch {
    // Keep in-memory state when storage quota is unavailable.
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(changeEvent))
  }
}

function subscribe(onChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === storageKey) {
      cachedState = null
      onChange()
    }
  }
  window.addEventListener(changeEvent, onChange)
  window.addEventListener("storage", handleStorage)
  return () => {
    window.removeEventListener(changeEvent, onChange)
    window.removeEventListener("storage", handleStorage)
  }
}

const serverSnapshot = createInitialState()

export function useWorkspaceStore() {
  return useSyncExternalStore(subscribe, loadState, () => serverSnapshot)
}

export function getCurrentMember(
  state: WorkspaceStoreState
): DemoMember | null {
  if (!state.session) return null
  return (
    state.members.find((m) => m.id === state.session?.memberId) ??
    state.members[0] ??
    null
  )
}

function buildAuditLog(
  state: WorkspaceStoreState,
  entry: Pick<AuditLog, "module" | "action" | "target" | "detail"> & {
    status?: AuditLog["status"]
    actorOverride?: { name: string; email: string }
  }
): AuditLog {
  const member = getCurrentMember(state)
  return {
    id: `log-${Date.now().toString(36)}`,
    timestamp: nowStamp(),
    actor: entry.actorOverride?.name ?? member?.name ?? "访客",
    actorEmail:
      entry.actorOverride?.email ?? member?.email ?? "guest@aries.example",
    module: entry.module,
    action: entry.action,
    target: entry.target,
    status: entry.status ?? "success",
    ip: state.session?.ip ?? "10.24.18.92",
    userAgent:
      typeof navigator !== "undefined"
        ? navigator.userAgent.slice(0, 48)
        : "Browser",
    requestId: `req_${Math.random().toString(16).slice(2, 10)}`,
    detail: entry.detail,
  }
}

function update(
  mutator: (draft: WorkspaceStoreState) => WorkspaceStoreState,
  audit?: Pick<AuditLog, "module" | "action" | "target" | "detail"> & {
    status?: AuditLog["status"]
    actorOverride?: { name: string; email: string }
  }
) {
  const current = loadState()
  const next = mutator(current)
  if (audit) {
    const log = buildAuditLog(next, audit)
    commitState({
      ...next,
      auditLogs: [log, ...next.auditLogs].slice(0, 100),
    })
  } else {
    commitState(next)
  }
}

export const workspaceActions = {
  signIn(params: {
    memberId?: string
    email?: string
    authMethod?: "password" | "password+2fa" | "sso"
  }) {
    const current = loadState()
    const matched = params.memberId
      ? current.members.find((member) => member.id === params.memberId)
      : params.email
        ? current.members.find(
            (member) =>
              member.email.toLowerCase() === params.email?.trim().toLowerCase()
          )
        : current.members[0]
    if (!matched) return "missing"
    if (matched.status === "disabled") return "disabled"
    const stamp = nowStamp()
    const sessionId = `SES-${Date.now().toString().slice(-6)}`
    const authMethod = params.authMethod ?? "password+2fa"
    update(
      (state) => ({
        ...state,
        session: {
          sessionId,
          memberId: matched.id,
          signedInAt: stamp,
          authMethod,
          ip: "10.24.18.92",
        },
        members: state.members.map((m) =>
          m.id === matched.id
            ? { ...m, lastLoginAt: stamp, lastLoginIp: "10.24.18.92" }
            : m
        ),
      }),
      {
        module: "认证会话",
        action: "登录工作区",
        target: sessionId,
        detail: `账号 ${matched.email} 通过 ${authMethod} 完成登录`,
        actorOverride: { name: matched.name, email: matched.email },
      }
    )
    return "signed-in"
  },

  switchAccount(memberId: string) {
    const current = loadState()
    const matched = current.members.find((m) => m.id === memberId)
    if (!matched || matched.status === "disabled") return
    const stamp = nowStamp()
    const sessionId = `SES-${Date.now().toString().slice(-6)}`
    update(
      (state) => ({
        ...state,
        session: {
          sessionId,
          memberId: matched.id,
          signedInAt: stamp,
          authMethod: matched.twoFactorEnabled ? "password+2fa" : "password",
          ip: "10.24.18.92",
        },
      }),
      {
        module: "认证会话",
        action: "切换演示账号",
        target: `${matched.name} (${matched.email})`,
        detail: `切换当前演示身份为 ${matched.name}`,
        actorOverride: { name: matched.name, email: matched.email },
      }
    )
  },

  signOut() {
    const current = loadState()
    const member = getCurrentMember(current)
    const sessionId = current.session?.sessionId ?? "SES-DEMO"
    update(
      (state) => ({
        ...state,
        session: null,
      }),
      {
        module: "认证会话",
        action: "退出登录",
        target: sessionId,
        detail: `账号 ${member?.email ?? "unknown"} 主动结束当前会话`,
        actorOverride: member
          ? { name: member.name, email: member.email }
          : undefined,
      }
    )
  },

  resetDemoData() {
    commitState(createInitialState())
  },

  recordBasicInfoSave(sectionTitle: string) {
    update(
      (state) => ({
        ...state,
        setupChecklist: { ...state.setupChecklist, basicInfoReviewed: true },
      }),
      {
        module: "系统配置",
        action: "更新基础信息",
        target: sectionTitle,
        detail: `保存了「${sectionTitle}」卡片配置`,
      }
    )
  },

  addMember(
    input: Pick<DemoMember, "name" | "email" | "departmentId" | "roleId">
  ) {
    const current = loadState()
    if (
      !current.departments.some(
        (department) =>
          department.id === input.departmentId && !department.disabled
      ) ||
      !current.roles.some((role) => role.id === input.roleId && !role.disabled)
    )
      return false
    const id = `mem-${Date.now().toString(36)}`
    const member: DemoMember = {
      id,
      name: input.name,
      initials: input.name.slice(-2),
      email: input.email,
      departmentId: input.departmentId,
      roleId: input.roleId,
      status: "invited",
      twoFactorEnabled: false,
      lastLoginAt: "—",
      lastLoginIp: "—",
    }
    update(
      (state) => ({
        ...state,
        members: [member, ...state.members],
        setupChecklist: { ...state.setupChecklist, membersConfigured: true },
      }),
      {
        module: "组织权限",
        action: "邀请成员",
        target: `${member.name} (${member.email})`,
        detail: "已保存本地邀请记录",
      }
    )
    return true
  },

  updateMember(
    memberId: string,
    patch: Partial<
      Pick<
        DemoMember,
        "roleId" | "departmentId" | "status" | "twoFactorEnabled"
      >
    >
  ) {
    const current = loadState()
    const target = current.members.find((m) => m.id === memberId)
    if (
      !target ||
      (patch.status === "disabled" && current.session?.memberId === memberId)
    )
      return false
    if (
      patch.roleId &&
      patch.roleId !== target.roleId &&
      !current.roles.some((role) => role.id === patch.roleId && !role.disabled)
    )
      return false
    if (
      patch.departmentId &&
      patch.departmentId !== target.departmentId &&
      !current.departments.some(
        (department) =>
          department.id === patch.departmentId && !department.disabled
      )
    )
      return false
    update(
      (state) => ({
        ...state,
        members: state.members.map((m) =>
          m.id === memberId ? { ...m, ...patch } : m
        ),
        setupChecklist: { ...state.setupChecklist, membersConfigured: true },
      }),
      {
        module: "组织权限",
        action: "更新成员属性",
        target: `${target.name} (${target.email})`,
        detail: `更新字段：${Object.keys(patch).join(", ")}`,
      }
    )
    return true
  },

  deleteMember(memberId: string) {
    const current = loadState()
    const target = current.members.find((member) => member.id === memberId)
    if (!target || current.session?.memberId === memberId) return "blocked"
    if (
      current.departments.some(
        (department) => department.leader === target.name
      )
    )
      return "in-use"

    update(
      (state) => ({
        ...state,
        members: state.members.filter((member) => member.id !== memberId),
        deletedOrganizationIds: [
          ...(state.deletedOrganizationIds ?? []),
          memberId,
        ],
      }),
      {
        module: "组织权限",
        action: "删除成员",
        target: `${target.name} (${target.email})`,
        detail: "已删除成员",
      }
    )
    return "deleted"
  },

  assignMembersToRole(memberIds: readonly string[], roleId: string) {
    const current = loadState()
    const role = current.roles.find((entry) => entry.id === roleId)
    if (!role || role.disabled) return 0

    const requested = new Set(memberIds)
    const members = current.members.filter(
      (member) => requested.has(member.id) && member.roleId !== roleId
    )
    if (members.length === 0) return 0

    update(
      (state) => ({
        ...state,
        members: state.members.map((member) =>
          requested.has(member.id) && member.roleId !== roleId
            ? { ...member, roleId }
            : member
        ),
        setupChecklist: { ...state.setupChecklist, membersConfigured: true },
      }),
      {
        module: "组织权限",
        action: "分配成员角色",
        target: role.name,
        detail: members
          .map((member) => `${member.name} (${member.email})`)
          .join(", "),
      }
    )
    return members.length
  },

  addRole(
    input: Pick<DemoRole, "name" | "description"> & {
      parentId?: string | null
      permissions?: string[]
    }
  ) {
    const current = loadState()
    const parent = input.parentId
      ? current.roles.find((r) => r.id === input.parentId)
      : undefined
    const inheritedPerms = input.permissions
      ? [...input.permissions]
      : parent
        ? [...parent.permissions]
        : ["overview:read", "bills:read"]
    const role: DemoRole = {
      id: `role-${Date.now().toString(36)}`,
      name: input.name,
      description: input.description,
      parentId: parent?.id ?? null,
      builtin: false,
      permissions: inheritedPerms,
    }
    update((state) => ({ ...state, roles: [...state.roles, role] }), {
      module: "组织权限",
      action: parent ? "新建子角色" : "新建角色",
      target: role.name,
      detail: parent
        ? `挂靠在「${parent.name}」下，默认继承 ${role.permissions.length} 项权限`
        : `授予 ${role.permissions.length} 项权限`,
    })
    return role.id
  },

  updateRolePermissions(roleId: string, permissions: string[]) {
    const current = loadState()
    const target = current.roles.find((r) => r.id === roleId)
    if (!target || target.id === "role-admin") return
    update(
      (state) => ({
        ...state,
        roles: state.roles.map((r) =>
          r.id === roleId ? { ...r, permissions } : r
        ),
      }),
      {
        module: "组织权限",
        action: "调整角色权限",
        target: target.name,
        detail: `当前权限数量：${permissions.length}`,
      }
    )
  },

  updateRoleMeta(roleId: string, patch: { name: string; description: string }) {
    const current = loadState()
    const target = current.roles.find((r) => r.id === roleId)
    const trimmedName = patch.name.trim()
    if (!target || target.id === "role-admin" || !trimmedName) return
    update(
      (state) => ({
        ...state,
        roles: state.roles.map((r) =>
          r.id === roleId
            ? {
                ...r,
                name: trimmedName,
                description: patch.description.trim() || r.description,
              }
            : r
        ),
      }),
      {
        module: "组织权限",
        action: "编辑角色信息",
        target: trimmedName,
        detail: `更新角色「${target.name}」的名称或职责说明`,
      }
    )
  },

  duplicateRole(sourceRoleId: string, copyName: string) {
    const current = loadState()
    const source = current.roles.find((r) => r.id === sourceRoleId)
    if (!source) return null
    const role: DemoRole = {
      id: `role-${Date.now().toString(36)}`,
      name: copyName,
      description: source.description,
      parentId: source.parentId,
      builtin: false,
      permissions: [...source.permissions],
    }
    update((state) => ({ ...state, roles: [...state.roles, role] }), {
      module: "组织权限",
      action: "复制角色",
      target: role.name,
      detail: `基于「${source.name}」复制，继承 ${role.permissions.length} 项权限`,
    })
    return role.id
  },

  deleteRole(roleId: string): boolean {
    const current = loadState()
    const target = current.roles.find((r) => r.id === roleId)
    if (!target || target.builtin) return false
    const hasChildren = current.roles.some((r) => r.parentId === roleId)
    if (hasChildren) return false
    const inUse = current.members.some((m) => m.roleId === roleId)
    if (inUse) return false
    update(
      (state) => ({
        ...state,
        roles: state.roles.filter((r) => r.id !== roleId),
      }),
      {
        module: "组织权限",
        action: "删除角色",
        target: target.name,
        detail: `删除自定义角色「${target.name}」`,
      }
    )
    return true
  },

  setRoleDisabled(roleId: string, disabled: boolean) {
    const current = loadState()
    const target = current.roles.find((role) => role.id === roleId)
    if (
      !target ||
      roleId === "role-admin" ||
      (disabled && getCurrentMember(current)?.roleId === roleId)
    )
      return false

    update(
      (state) => ({
        ...state,
        roles: state.roles.map((role) =>
          role.id === roleId ? { ...role, disabled } : role
        ),
      }),
      {
        module: "组织权限",
        action: disabled ? "停用角色" : "启用角色",
        target: target.name,
        detail: disabled ? "已停用" : "已启用",
      }
    )
    return true
  },

  addDepartment(input: Omit<DemoDepartment, "id">) {
    if (
      input.parentId &&
      !loadState().departments.some(
        (department) => department.id === input.parentId && !department.disabled
      )
    )
      return null
    const dept: DemoDepartment = {
      id: `dept-${Date.now().toString(36)}`,
      ...input,
    }
    update(
      (state) => ({ ...state, departments: [...state.departments, dept] }),
      {
        module: "组织权限",
        action: "新增部门",
        target: `${dept.name} (${dept.costCenter})`,
        detail: `负责人：${dept.leader}，月度预算 ¥${dept.monthlyBudgetWan} 万`,
      }
    )
    return dept.id
  },

  setDepartmentDisabled(departmentId: string, disabled: boolean) {
    const target = loadState().departments.find(
      (department) => department.id === departmentId
    )
    if (!target?.parentId) return false
    update(
      (state) => ({
        ...state,
        departments: state.departments.map((department) =>
          department.id === departmentId
            ? { ...department, disabled }
            : department
        ),
      }),
      {
        module: "组织权限",
        action: disabled ? "停用部门" : "启用部门",
        target: target.name,
        detail: disabled ? "已停用" : "已启用",
      }
    )
    return true
  },

  deleteDepartment(departmentId: string) {
    const current = loadState()
    const target = current.departments.find(
      (department) => department.id === departmentId
    )
    if (!target?.parentId) return "blocked"
    if (
      current.departments.some(
        (department) => department.parentId === departmentId
      ) ||
      current.members.some((member) => member.departmentId === departmentId)
    )
      return "in-use"
    update(
      (state) => ({
        ...state,
        departments: state.departments.filter(
          (department) => department.id !== departmentId
        ),
        deletedOrganizationIds: [
          ...(state.deletedOrganizationIds ?? []),
          departmentId,
        ],
      }),
      {
        module: "组织权限",
        action: "删除部门",
        target: target.name,
        detail: "已删除部门",
      }
    )
    return "deleted"
  },

  updateDepartment(deptId: string, patch: Partial<Omit<DemoDepartment, "id">>) {
    const current = loadState()
    const target = current.departments.find((d) => d.id === deptId)
    if (!target?.parentId) return
    update(
      (state) => ({
        ...state,
        departments: state.departments.map((d) =>
          d.id === deptId ? { ...d, ...patch } : d
        ),
      }),
      {
        module: "组织权限",
        action: "更新部门信息",
        target: patch.name ?? target.name,
        detail: "已保存部门负责人与预算归属变更",
      }
    )
  },

  renameDepartment(deptId: string, name: string) {
    const trimmed = name.trim()
    if (!trimmed) return
    const current = loadState()
    const target = current.departments.find((d) => d.id === deptId)
    if (!target?.parentId || target.name === trimmed) return
    update(
      (state) => ({
        ...state,
        departments: state.departments.map((d) =>
          d.id === deptId ? { ...d, name: trimmed } : d
        ),
      }),
      {
        module: "组织权限",
        action: "修改部门名称",
        target: `${target.name} → ${trimmed}`,
        detail: `将部门名称由「${target.name}」修改为「${trimmed}」`,
      }
    )
  },

  reorderDepartment(deptId: string, direction: "up" | "down") {
    const current = loadState()
    const target = current.departments.find((d) => d.id === deptId)
    if (!target?.parentId) return
    const siblingIndices = current.departments
      .map((d, idx) => (d.parentId === target.parentId ? idx : -1))
      .filter((idx) => idx >= 0)
    const pos = siblingIndices.indexOf(
      current.departments.findIndex((d) => d.id === deptId)
    )
    const swapPos = direction === "up" ? pos - 1 : pos + 1
    if (pos < 0 || swapPos < 0 || swapPos >= siblingIndices.length) return
    const idxA = siblingIndices[pos]
    const idxB = siblingIndices[swapPos]
    if (idxA === undefined || idxB === undefined) return
    update(
      (state) => {
        const next = [...state.departments]
        const itemA = next[idxA]
        const itemB = next[idxB]
        if (!itemA || !itemB) return state
        next[idxA] = itemB
        next[idxB] = itemA
        return { ...state, departments: next }
      },
      {
        module: "组织权限",
        action: "调整部门排序",
        target: target.name,
        detail:
          direction === "up" ? "在同级部门中上移一位" : "在同级部门中下移一位",
      }
    )
  },

  moveDepartment(deptId: string, newParentId: string): boolean {
    const current = loadState()
    const target = current.departments.find((d) => d.id === deptId)
    const nextParent = current.departments.find((d) => d.id === newParentId)
    if (!target || !nextParent || nextParent.disabled || !target.parentId)
      return false
    if (deptId === newParentId || target.parentId === newParentId) return false

    let cursor: DemoDepartment | undefined = nextParent
    while (cursor) {
      if (cursor.id === deptId) return false
      cursor = current.departments.find((d) => d.id === cursor?.parentId)
    }

    update(
      (state) => ({
        ...state,
        departments: state.departments.map((d) =>
          d.id === deptId ? { ...d, parentId: newParentId } : d
        ),
      }),
      {
        module: "组织权限",
        action: "调整部门归属",
        target: `${target.name} → ${nextParent.name}`,
        detail: `将「${target.name}」移至「${nextParent.name}」下级`,
      }
    )
    return true
  },

  saveGlobalParams(patch: Partial<GlobalParams>, section: string) {
    update(
      (state) => ({
        ...state,
        globalParams: { ...state.globalParams, ...patch },
      }),
      {
        module: "系统配置",
        action: "修改全局参数",
        target: section,
        detail: `更新参数：${Object.keys(patch).join(", ")}`,
      }
    )
  },

  updateIntegration(
    id: string,
    patch: Partial<
      Pick<
        IntegrationItem,
        "enabled" | "status" | "endpoint" | "appId" | "lastSyncAt"
      >
    >
  ) {
    const current = loadState()
    const target = current.integrations.find((item) => item.id === id)
    if (!target) return
    update(
      (state) => ({
        ...state,
        integrations: state.integrations.map((item) =>
          item.id === id ? { ...item, ...patch } : item
        ),
      }),
      {
        module: "集成通知",
        action: "更新应用集成",
        target: target.name,
        detail: patch.status
          ? `连接状态更新为 ${patch.status}`
          : `已保存 ${target.name} 集成配置`,
      }
    )
  },

  addBot(input: Pick<GroupBot, "name" | "channel" | "webhookUrl">) {
    const bot: GroupBot = {
      id: `bot-${Date.now().toString(36)}`,
      name: input.name,
      channel: input.channel,
      webhookUrl: input.webhookUrl,
      enabled: true,
      lastTriggeredAt: "—",
      eventsCount: 0,
    }
    update((state) => ({ ...state, bots: [bot, ...state.bots] }), {
      module: "集成通知",
      action: "新增群机器人",
      target: bot.name,
      detail: `渠道：${bot.channel}`,
    })
  },

  toggleBot(id: string, enabled: boolean) {
    const current = loadState()
    const target = current.bots.find((b) => b.id === id)
    if (!target) return
    update(
      (state) => ({
        ...state,
        bots: state.bots.map((b) => (b.id === id ? { ...b, enabled } : b)),
      }),
      {
        module: "集成通知",
        action: enabled ? "启用群机器人" : "停用群机器人",
        target: target.name,
        detail: `${target.name} 状态变更为 ${enabled ? "启用" : "停用"}`,
      }
    )
  },

  testBot(id: string) {
    const current = loadState()
    const target = current.bots.find((b) => b.id === id)
    if (!target) return
    const stamp = nowStamp()
    update(
      (state) => ({
        ...state,
        bots: state.bots.map((b) =>
          b.id === id
            ? { ...b, lastTriggeredAt: stamp, eventsCount: b.eventsCount + 1 }
            : b
        ),
        setupChecklist: { ...state.setupChecklist, botTested: true },
      }),
      {
        module: "集成通知",
        action: "模拟发送测试消息",
        target: target.name,
        detail: "已记录模拟推送结果",
      }
    )
  },

  removeBot(id: string) {
    const current = loadState()
    const target = current.bots.find((b) => b.id === id)
    if (!target) return
    update(
      (state) => ({ ...state, bots: state.bots.filter((b) => b.id !== id) }),
      {
        module: "集成通知",
        action: "删除群机器人",
        target: target.name,
        detail: "已移除 Webhook 配置",
      }
    )
  },

  updateMessageRule(id: string, patch: Partial<Omit<MessageRule, "id">>) {
    const current = loadState()
    const target = current.messageRules.find((r) => r.id === id)
    if (!target) return
    update(
      (state) => ({
        ...state,
        messageRules: state.messageRules.map((r) =>
          r.id === id ? { ...r, ...patch } : r
        ),
      }),
      {
        module: "集成通知",
        action: "更新消息规则",
        target: target.name,
        detail: "更新通知渠道或触发策略",
      }
    )
  },

  saveSecurityPolicy(patch: Partial<SecurityPolicy>, section: string) {
    update(
      (state) => ({
        ...state,
        securityPolicy: { ...state.securityPolicy, ...patch },
        setupChecklist: { ...state.setupChecklist, securityReviewed: true },
      }),
      {
        module: "安全审计",
        action: "更新安全策略",
        target: section,
        detail: `已更新「${section}」配置`,
      }
    )
  },

  submitSupportTicket(
    input: Pick<SupportTicket, "category" | "subject" | "details">
  ) {
    const ticket: SupportTicket = {
      id: `TK-2026-${String(Math.floor(100 + Math.random() * 899))}`,
      category: input.category,
      subject: input.subject,
      details: input.details?.trim() || undefined,
      createdAt: nowStamp(),
      status: "open",
    }
    update(
      (state) => ({
        ...state,
        supportTickets: [ticket, ...state.supportTickets],
      }),
      {
        module: "技术支持",
        action: "保存演示工单",
        target: ticket.id,
        detail: `[${ticket.category}] ${ticket.subject}`,
      }
    )
    return ticket
  },
}
