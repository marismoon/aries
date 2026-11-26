import { useSyncExternalStore } from "react"

export type AlertSeverity = "critical" | "warning" | "info"
export type AlertStatus = "open" | "acknowledged" | "silenced" | "resolved"
export type AlertCategory = "cost" | "cloud" | "security" | "system"
export type DeliveryChannel = "inApp" | "email" | "feishu" | "wecom" | "webhook"
export type DeliveryStatus = "delivered" | "failed" | "throttled"

export interface AlertItem {
  id: string
  title: string
  summary: string
  severity: AlertSeverity
  status: AlertStatus
  category: AlertCategory
  source: string
  resource: string
  metric: string
  threshold: string
  currentValue: string
  assignee: string
  triggeredAt: string
  slaMinutesLeft: number
  aiDiagnosis: string
  suggestedAction: string
}

export interface AlertRuleItem {
  id: string
  name: string
  metric: string
  condition: string
  severity: AlertSeverity
  category: AlertCategory
  channels: readonly DeliveryChannel[]
  cooldownMin: number
  triggeredCount30d: number
  enabled: boolean
  owner: string
}

export interface SilenceWindow {
  id: string
  name: string
  matcher: string
  reason: string
  startsAt: string
  endsAt: string
  creator: string
  active: boolean
}

export interface OnCallShift {
  id: string
  tier: string
  roleLabel: string
  primary: string
  backup: string
  escalationDelayMin: number
  channel: string
}

export interface NotificationDeliveryLog {
  id: string
  alertId: string
  alertTitle: string
  channel: DeliveryChannel
  recipient: string
  status: DeliveryStatus
  latencyMs: number
  sentAt: string
  detail: string
}

export interface UserInboxNotification {
  id: string
  title: string
  body: string
  category: AlertCategory
  severity: AlertSeverity
  createdAt: string
  read: boolean
  targetPath: string
  recipientEmail?: string
}

export interface UserNotificationPreferences {
  costInApp: boolean
  costEmail: boolean
  cloudInApp: boolean
  cloudEmail: boolean
  securityInApp: boolean
  securityEmail: boolean
  systemInApp: boolean
  systemEmail: boolean
  desktopPush: boolean
  dailyDigest: boolean
  quietModeEnabled: boolean
  quietRange: string
}

export interface NotificationsStoreState {
  alerts: AlertItem[]
  rules: AlertRuleItem[]
  silences: SilenceWindow[]
  onCallShifts: OnCallShift[]
  deliveryLogs: NotificationDeliveryLog[]
  inbox: UserInboxNotification[]
  preferences: UserNotificationPreferences
}

const storageKey = "aries-demo-notifications-v1"
const changeEvent = "aries-demo-notifications-change"

function nowStamp() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function createInitialState(): NotificationsStoreState {
  return {
    alerts: [
      {
        id: "ALT-2026-801",
        title: "研发中心 11 月云资源预算使用率突破 92%",
        summary:
          "GPU 推理集群近 6 小时扩容 12 台按量实例，预计月底超出月度预算 ¥18.4 万。",
        severity: "critical",
        status: "open",
        category: "cost",
        source: "阿里云",
        resource: "cn-shanghai / gpu-infer-prod",
        metric: "月度预算消耗比",
        threshold: "> 85%",
        currentValue: "92.4%",
        assignee: "陈思远",
        triggeredAt: "2026-11-26 03:24",
        slaMinutesLeft: 18,
        aiDiagnosis:
          "检测到定时批处理任务未配置自动缩容上限，导致 00:00–03:00 期间按量 GPU 节点持续保持满载。",
        suggestedAction:
          "建议切换至抢占式实例或将最大副本数限制为 8 台，可立即压降约 ¥6.2 万/月支出。",
      },
      {
        id: "ALT-2026-802",
        title: "华为云政企主账号访问凭证将在 4 天后过期",
        summary:
          "账单采集器校验 AK/SK 有效期不足 96 小时，过期后将中断 11 月末出账同步。",
        severity: "critical",
        status: "acknowledged",
        category: "cloud",
        source: "华为云",
        resource: "demo-huawei-app-03",
        metric: "凭证剩余有效期",
        threshold: "< 7 天",
        currentValue: "4 天",
        assignee: "周明",
        triggeredAt: "2026-11-26 01:15",
        slaMinutesLeft: 42,
        aiDiagnosis:
          "该凭证于 2026-08-29 签发（90 天轮换周期），当前尚未绑定新的只读托管角色。",
        suggestedAction:
          "前往「应用集成 → 华为云」完成凭证轮换并执行连通性测试。",
      },
      {
        id: "ALT-2026-803",
        title: "腾讯云 11 月账单与暂估金额差异超过 2.8%",
        summary: "CDN 跨境流量包抵扣规则变更，导致核算金额较暂估高出 ¥14,620。",
        severity: "warning",
        status: "open",
        category: "cost",
        source: "腾讯云",
        resource: "billing-cloud-b / CDN-Global",
        metric: "账单差异比例",
        threshold: "> 2.0%",
        currentValue: "2.84%",
        assignee: "李然",
        triggeredAt: "2026-11-25 22:40",
        slaMinutesLeft: 95,
        aiDiagnosis:
          "亚太区域回源流量在 11-24 出现峰值，超出预购流量包额度后按阶梯单价计费。",
        suggestedAction: "在「月账单」核对差异明细并确认是否增购 50TB 流量包。",
      },
      {
        id: "ALT-2026-804",
        title: "检测到非常用出口 IP 尝试登录高敏权限账号",
        summary:
          "账号 zhangmin@aries.example 于非办公网段触发 2FA 校验挑战并已拦截。",
        severity: "critical",
        status: "open",
        category: "security",
        source: "安全合规",
        resource: "SSO / OIDC Gateway",
        metric: "异常登录风险分",
        threshold: ">= 80",
        currentValue: "88",
        assignee: "周明",
        triggeredAt: "2026-11-25 21:08",
        slaMinutesLeft: 25,
        aiDiagnosis:
          "来源 IP 位于未登记的移动网络段，设备指纹与历史常用 macOS 终端一致，疑似差旅远程登录。",
        suggestedAction:
          "向本人核实登录行为，如确认异常请立即吊销会话并刷新令牌。",
      },
      {
        id: "ALT-2026-805",
        title: "七牛云对象存储账单采集任务重试 2 次",
        summary:
          "上游账单导出接口响应延迟超过 30s，已自动降级为分页拉取并恢复。",
        severity: "warning",
        status: "silenced",
        category: "cloud",
        source: "七牛云",
        resource: "collector-worker-04",
        metric: "采集接口耗时",
        threshold: "> 30s",
        currentValue: "34.2s",
        assignee: "陈思远",
        triggeredAt: "2026-11-25 18:50",
        slaMinutesLeft: 180,
        aiDiagnosis:
          "命中已配置的「月底账单高峰期静默窗口」，当前采集任务已通过自动重试完成。",
        suggestedAction: "持续观察下个周期采集耗时，必要时调高并发超时至 45s。",
      },
      {
        id: "ALT-2026-806",
        title: "财务运营部 11 月正式账单已完成自动对账归档",
        summary: "共核验 64 条多云账单记录，差异率为 0.12%，满足月度关账标准。",
        severity: "info",
        status: "resolved",
        category: "system",
        source: "账务引擎",
        resource: "reconcile-job-202611",
        metric: "对账差异率",
        threshold: "< 0.5%",
        currentValue: "0.12%",
        assignee: "李然",
        triggeredAt: "2026-11-25 14:10",
        slaMinutesLeft: 0,
        aiDiagnosis: "全量账单与财务总账科目匹配正常，无遗漏凭证。",
        suggestedAction: "无需人工干预，可按需导出归档报表。",
      },
      {
        id: "ALT-2026-807",
        title: "Cloudflare 海外节点带宽费用周环比上升 19%",
        summary: "欧美区 API 静态资源缓存命中率由 94% 降至 81%，回源流量增加。",
        severity: "warning",
        status: "acknowledged",
        category: "cost",
        source: "Cloudflare",
        resource: "edge-zone-global",
        metric: "周环比费用增幅",
        threshold: "> 15%",
        currentValue: "+19.3%",
        assignee: "陈思远",
        triggeredAt: "2026-11-25 11:30",
        slaMinutesLeft: 140,
        aiDiagnosis:
          "新版本构建产物未携带长效 Cache-Control 响应头，触发频繁回源。",
        suggestedAction:
          "补充静态资源 immutable 缓存头后预计 24 小时内回落至基线。",
      },
      {
        id: "ALT-2026-808",
        title: "3 位新成员尚未开启二次验证（2FA）",
        summary: "安全策略要求激活后 7 日内绑定动态口令，当前剩余宽限期 2 天。",
        severity: "info",
        status: "open",
        category: "security",
        source: "安全合规",
        resource: "org-security-baseline",
        metric: "2FA 覆盖率",
        threshold: "< 95%",
        currentValue: "89.2%",
        assignee: "张敏",
        triggeredAt: "2026-11-25 09:00",
        slaMinutesLeft: 320,
        aiDiagnosis:
          "林嘉禾等 3 位成员处于待激活或新入职状态，尚未完成首登 2FA 引导。",
        suggestedAction: "前往「成员管理」发送一键安全提醒。",
      },
    ],
    rules: [
      {
        id: "AR-01",
        name: "部门月度预算超阈值预警",
        metric: "budget.utilization_ratio",
        condition: "月度预算消耗 > 85% 持续 15 分钟",
        severity: "critical",
        category: "cost",
        channels: ["inApp", "email", "feishu"],
        cooldownMin: 60,
        triggeredCount30d: 4,
        enabled: true,
        owner: "张敏",
      },
      {
        id: "AR-02",
        name: "账单与暂估金额差异告警",
        metric: "billing.variance_pct",
        condition: "单账号账单差异比例 > 2.0%",
        severity: "warning",
        category: "cost",
        channels: ["inApp", "email", "wecom"],
        cooldownMin: 120,
        triggeredCount30d: 7,
        enabled: true,
        owner: "李然",
      },
      {
        id: "AR-03",
        name: "云账号凭证即将过期",
        metric: "cloud.credential_ttl_days",
        condition: "AK/SK 或证书剩余有效期 < 7 天",
        severity: "critical",
        category: "cloud",
        channels: ["inApp", "email", "feishu", "webhook"],
        cooldownMin: 720,
        triggeredCount30d: 2,
        enabled: true,
        owner: "周明",
      },
      {
        id: "AR-04",
        name: "异常登录与高敏权限变更",
        metric: "security.risk_score",
        condition: "风险评分 >= 80 或非常用网段登录",
        severity: "critical",
        category: "security",
        channels: ["inApp", "email", "feishu"],
        cooldownMin: 15,
        triggeredCount30d: 3,
        enabled: true,
        owner: "周明",
      },
      {
        id: "AR-05",
        name: "账单采集任务超时与失败",
        metric: "collector.job_duration_sec",
        condition: "采集耗时 > 30s 或连续失败 2 次",
        severity: "warning",
        category: "cloud",
        channels: ["inApp", "feishu"],
        cooldownMin: 30,
        triggeredCount30d: 9,
        enabled: true,
        owner: "陈思远",
      },
      {
        id: "AR-06",
        name: "周环比费用异常波动",
        metric: "cost.wow_delta_pct",
        condition: "单云厂商周环比费用增幅 > 15%",
        severity: "info",
        category: "cost",
        channels: ["inApp", "email"],
        cooldownMin: 1440,
        triggeredCount30d: 5,
        enabled: false,
        owner: "李然",
      },
    ],
    silences: [
      {
        id: "SIL-01",
        name: "月底账单采集高峰期静默",
        matcher: "category=cloud, severity=warning",
        reason:
          "每月 25 日–28 日上游账单导出接口存在常规波动，仅保留严重级别告警",
        startsAt: "2026-11-25 00:00",
        endsAt: "2026-11-28 23:59",
        creator: "陈思远",
        active: true,
      },
      {
        id: "SIL-02",
        name: "测试环境 GPU 压测维护窗口",
        matcher: "resource=~staging-gpu-*",
        reason: "研发中心模型压测期间临时屏蔽成本波动告警",
        startsAt: "2026-11-26 02:00",
        endsAt: "2026-11-26 12:00",
        creator: "张敏",
        active: true,
      },
      {
        id: "SIL-03",
        name: "财务关账日非关键提醒静默",
        matcher: "category=system, severity=info",
        reason: "关账窗口聚焦核心对账差异，暂缓常规系统播报",
        startsAt: "2026-11-20 09:00",
        endsAt: "2026-11-22 18:00",
        creator: "李然",
        active: false,
      },
    ],
    onCallShifts: [
      {
        id: "OC-L1",
        tier: "L1 · 一线值守",
        roleLabel: "云平台与采集运维",
        primary: "陈思远",
        backup: "林嘉禾",
        escalationDelayMin: 15,
        channel: "飞书 · 云账单告警群",
      },
      {
        id: "OC-L2",
        tier: "L2 · 财务与成本",
        roleLabel: "财务运营对账",
        primary: "李然",
        backup: "张敏",
        escalationDelayMin: 30,
        channel: "企微 · 财务对账值守群",
      },
      {
        id: "OC-L3",
        tier: "L3 · 安全与管理升级",
        roleLabel: "安全合规与管理员",
        primary: "周明",
        backup: "张敏",
        escalationDelayMin: 10,
        channel: "飞书 + 邮件直达",
      },
    ],
    deliveryLogs: [
      {
        id: "DLV-901",
        alertId: "ALT-2026-801",
        alertTitle: "研发中心 11 月云资源预算使用率突破 92%",
        channel: "feishu",
        recipient: "云账单告警群（飞书）",
        status: "delivered",
        latencyMs: 138,
        sentAt: "2026-11-26 03:24:02",
        detail: "HTTP 200 OK · 卡片消息已投递至 14 位群成员",
      },
      {
        id: "DLV-902",
        alertId: "ALT-2026-801",
        alertTitle: "研发中心 11 月云资源预算使用率突破 92%",
        channel: "email",
        recipient: "zhangmin@aries.example, chensiyuan@aries.example",
        status: "delivered",
        latencyMs: 412,
        sentAt: "2026-11-26 03:24:05",
        detail: "SMTP 250 Accepted · 附带成本明细摘要",
      },
      {
        id: "DLV-903",
        alertId: "ALT-2026-802",
        alertTitle: "华为云政企主账号访问凭证将在 4 天后过期",
        channel: "webhook",
        recipient: "https://hooks.aries.example.test/ops/credential-bot",
        status: "failed",
        latencyMs: 5004,
        sentAt: "2026-11-26 01:15:11",
        detail: "Timeout 504 · 目标回调服务未在 5s 内响应，等待人工重试",
      },
      {
        id: "DLV-904",
        alertId: "ALT-2026-803",
        alertTitle: "腾讯云 11 月账单与暂估金额差异超过 2.8%",
        channel: "wecom",
        recipient: "财务对账值守群（企微）",
        status: "delivered",
        latencyMs: 186,
        sentAt: "2026-11-25 22:40:03",
        detail: "HTTP 200 OK · Markdown 差异卡片已推送",
      },
      {
        id: "DLV-905",
        alertId: "ALT-2026-804",
        alertTitle: "检测到非常用出口 IP 尝试登录高敏权限账号",
        channel: "inApp",
        recipient: "张敏、周明",
        status: "delivered",
        latencyMs: 24,
        sentAt: "2026-11-25 21:08:01",
        detail: "站内实时通道推送成功，已写入右上角通知中心",
      },
      {
        id: "DLV-906",
        alertId: "ALT-2026-805",
        alertTitle: "七牛云对象存储账单采集任务重试 2 次",
        channel: "feishu",
        recipient: "云账单告警群（飞书）",
        status: "throttled",
        latencyMs: 12,
        sentAt: "2026-11-25 18:50:00",
        detail: "命中静默窗口 SIL-01「月底账单采集高峰期静默」，已抑制外发",
      },
    ],
    inbox: [
      {
        id: "NTF-101",
        title: "研发中心月度预算使用率突破 92%",
        body: "阿里云 GPU 推理集群按量实例激增，预计超出月度预算 ¥18.4 万，请及时核查。",
        category: "cost",
        severity: "critical",
        createdAt: "35 分钟前",
        read: false,
        targetPath: "/notifications/center",
      },
      {
        id: "NTF-102",
        title: "华为云访问凭证将于 4 天后过期",
        body: "demo-huawei-app-03 凭证即将失效，请尽快前往应用集成页面完成轮换。",
        category: "cloud",
        severity: "critical",
        createdAt: "2 小时前",
        read: false,
        targetPath: "/settings/integrations/apps",
      },
      {
        id: "NTF-103",
        title: "异常出口 IP 登录拦截提醒",
        body: "检测到非办公网段尝试登录您的高敏权限账号，已由 2FA 拦截并记录审计日志。",
        category: "security",
        severity: "critical",
        createdAt: "昨晚 21:08",
        read: false,
        targetPath: "/settings/security/audit-log",
      },
      {
        id: "NTF-104",
        title: "腾讯云 11 月账单差异待确认（+2.84%）",
        body: "CDN 跨境流量包超额 ¥14,620，李然已将其转交财务对账队列。",
        category: "cost",
        severity: "warning",
        createdAt: "昨晚 22:40",
        read: false,
        targetPath: "/bills",
      },
      {
        id: "NTF-105",
        title: "3 位新成员尚未开启二次验证",
        body: "宽限期剩余 2 天，建议在成员管理中发送安全合规提醒。",
        category: "security",
        severity: "info",
        createdAt: "昨天 09:00",
        read: true,
        targetPath: "/settings/org/members",
      },
      {
        id: "NTF-106",
        title: "11 月多云账单自动对账归档完成",
        body: "共核验 64 条账单记录，整体差异率 0.12%，月度报表已生成。",
        category: "system",
        severity: "info",
        createdAt: "昨天 14:10",
        read: true,
        targetPath: "/bills",
      },
    ],
    preferences: {
      costInApp: true,
      costEmail: true,
      cloudInApp: true,
      cloudEmail: true,
      securityInApp: true,
      securityEmail: true,
      systemInApp: true,
      systemEmail: false,
      desktopPush: true,
      dailyDigest: true,
      quietModeEnabled: true,
      quietRange: "22:00–08:00",
    },
  }
}

let cachedState: NotificationsStoreState | null = null

function loadState(): NotificationsStoreState {
  if (cachedState) return cachedState
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(storageKey)
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<NotificationsStoreState>
        if (Array.isArray(parsed.alerts) && Array.isArray(parsed.inbox)) {
          cachedState = { ...createInitialState(), ...parsed }
          return cachedState
        }
      }
    } catch {
      // Fall back to seed data if storage is unavailable or corrupted.
    }
  }
  cachedState = createInitialState()
  return cachedState
}

function commit(next: NotificationsStoreState) {
  cachedState = next
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next))
    } catch {
      // Keep in-memory state if quota is exceeded.
    }
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

export function useNotificationsStore() {
  return useSyncExternalStore(subscribe, loadState, () => serverSnapshot)
}

export const notificationsActions = {
  updateAlertStatus(id: string, status: AlertStatus, assignee?: string) {
    const state = loadState()
    commit({
      ...state,
      alerts: state.alerts.map((a) =>
        a.id === id
          ? {
              ...a,
              status,
              assignee: assignee ?? a.assignee,
              slaMinutesLeft: status === "resolved" ? 0 : a.slaMinutesLeft,
            }
          : a
      ),
    })
  },

  toggleAlertRule(id: string, enabled: boolean) {
    const state = loadState()
    commit({
      ...state,
      rules: state.rules.map((r) => (r.id === id ? { ...r, enabled } : r)),
    })
  },

  addAlertRule(
    input: Pick<
      AlertRuleItem,
      "name" | "metric" | "condition" | "severity" | "category" | "owner"
    >
  ) {
    const state = loadState()
    const rule: AlertRuleItem = {
      id: `AR-${String(state.rules.length + 1).padStart(2, "0")}`,
      ...input,
      channels: ["inApp", "email", "feishu"],
      cooldownMin: 30,
      triggeredCount30d: 0,
      enabled: true,
    }
    commit({ ...state, rules: [rule, ...state.rules] })
  },

  updateAlertRule(
    id: string,
    patch: Partial<
      Pick<
        AlertRuleItem,
        "name" | "condition" | "severity" | "cooldownMin" | "owner"
      >
    >
  ) {
    const state = loadState()
    commit({
      ...state,
      rules: state.rules.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    })
  },

  addSilenceWindow(
    input: Pick<
      SilenceWindow,
      "name" | "matcher" | "reason" | "endsAt" | "creator"
    >
  ) {
    const state = loadState()
    const item: SilenceWindow = {
      id: `SIL-${String(state.silences.length + 1).padStart(2, "0")}`,
      startsAt: nowStamp(),
      active: true,
      ...input,
    }
    commit({ ...state, silences: [item, ...state.silences] })
  },

  toggleSilenceWindow(id: string, active: boolean) {
    const state = loadState()
    commit({
      ...state,
      silences: state.silences.map((s) => (s.id === id ? { ...s, active } : s)),
    })
  },

  updateOnCallPrimary(id: string, primary: string) {
    const state = loadState()
    commit({
      ...state,
      onCallShifts: state.onCallShifts.map((s) =>
        s.id === id ? { ...s, primary } : s
      ),
    })
  },

  retryDeliveryLog(id: string) {
    const state = loadState()
    commit({
      ...state,
      deliveryLogs: state.deliveryLogs.map((log) =>
        log.id === id
          ? {
              ...log,
              status: "delivered",
              latencyMs: 146,
              sentAt: `${nowStamp()}:04`,
              detail: "人工重试成功 · HTTP 200 OK",
            }
          : log
      ),
    })
  },

  markInboxRead(id: string) {
    const state = loadState()
    commit({
      ...state,
      inbox: state.inbox.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })
  },

  markAllInboxRead() {
    const state = loadState()
    commit({
      ...state,
      inbox: state.inbox.map((n) => ({ ...n, read: true })),
    })
  },

  updatePreferences(patch: Partial<UserNotificationPreferences>) {
    const state = loadState()
    commit({
      ...state,
      preferences: { ...state.preferences, ...patch },
    })
  },
}
