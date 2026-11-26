import { useSyncExternalStore } from "react"

export type AnalyticsRange = "7d" | "30d" | "90d"
export type InsightStatus = "open" | "adopted" | "dismissed"
export type InsightDomain = "platform" | "backend" | "system" | "cost"

export interface TenantUsageRow {
  id: string
  name: string
  plan: string
  activeUsers: number
  seatLimit: number
  apiCallsK: number
  retentionPct: number
  status: "healthy" | "growing" | "risk"
  lastActiveAt: string
}

export interface ApiEndpointRow {
  id: string
  endpoint: string
  service: string
  qps: number
  p95Ms: number
  errorRatePct: number
  availabilityPct: number
  status: "healthy" | "degraded" | "critical"
}

export interface StorageNodeRow {
  id: string
  name: string
  engine: string
  usedGb: number
  capacityGb: number
  iops: number
  cacheHitPct: number
  slowQueries24h: number
  status: "healthy" | "warning"
}

export interface ClusterNodeRow {
  id: string
  cluster: string
  region: string
  cpuPct: number
  memoryPct: number
  gpuPct: number
  podCount: number
  status: "healthy" | "busy" | "warning"
}

export interface ServiceSlaRow {
  id: string
  service: string
  tier: string
  availabilityPct: number
  targetPct: number
  errorBudgetLeftPct: number
  mttrMin: number
  incidents30d: number
  status: "healthy" | "warning"
}

export interface CostAllocationRow {
  id: string
  department: string
  project: string
  provider: string
  monthlyCostWan: number
  budgetWan: number
  momDeltaPct: number
  idleRatioPct: number
  owner: string
}

export interface AiInsightItem {
  id: string
  domain: InsightDomain
  title: string
  impact: string
  summary: string
  recommendation: string
  confidencePct: number
  detectedAt: string
  status: InsightStatus
}

export interface CustomReportItem {
  id: string
  name: string
  domain: InsightDomain
  schedule: string
  format: "PDF" | "CSV" | "XLSX"
  recipients: string
  lastGeneratedAt: string
  enabled: boolean
}

export interface AnalyticsStoreState {
  insights: AiInsightItem[]
  reports: CustomReportItem[]
}

export const rangeDaysLabels: Record<AnalyticsRange, readonly string[]> = {
  "7d": ["11/20", "11/21", "11/22", "11/23", "11/24", "11/25", "11/26"],
  "30d": ["10/28", "11/02", "11/07", "11/12", "11/17", "11/22", "11/26"],
  "90d": ["09/01", "09/15", "10/01", "10/15", "11/01", "11/15", "11/26"],
}

export const platformDauSeries: Record<
  AnalyticsRange,
  readonly { id: string; label: string; values: readonly number[] }[]
> = {
  "7d": [
    {
      id: "dau",
      label: "日活用户（DAU）",
      values: [1840, 1920, 1760, 1690, 2120, 2280, 2390],
    },
    {
      id: "wau",
      label: "核心操作用户",
      values: [1120, 1180, 1090, 1040, 1340, 1460, 1520],
    },
  ],
  "30d": [
    {
      id: "dau",
      label: "日活用户（DAU）",
      values: [1480, 1590, 1680, 1810, 1960, 2180, 2390],
    },
    {
      id: "wau",
      label: "核心操作用户",
      values: [920, 980, 1050, 1140, 1260, 1390, 1520],
    },
  ],
  "90d": [
    {
      id: "dau",
      label: "日活用户（DAU）",
      values: [1120, 1280, 1410, 1620, 1890, 2140, 2390],
    },
    {
      id: "wau",
      label: "核心操作用户",
      values: [680, 790, 880, 1020, 1210, 1360, 1520],
    },
  ],
}

export const moduleUsageBars = [
  { label: "运营总览", value: 94 },
  { label: "月账单对账", value: 86 },
  { label: "告警通知", value: 78 },
  { label: "组织与权限", value: 64 },
  { label: "AI 智算助手", value: 71 },
] as const

export const tenantUsageRows: readonly TenantUsageRow[] = [
  {
    id: "TN-01",
    name: "Aries 科技有限公司（总部）",
    plan: "企业旗舰版",
    activeUsers: 64,
    seatLimit: 80,
    apiCallsK: 428.5,
    retentionPct: 96.4,
    status: "healthy",
    lastActiveAt: "2026-11-26 04:12",
  },
  {
    id: "TN-02",
    name: "星河数智云（华东区）",
    plan: "企业旗舰版",
    activeUsers: 48,
    seatLimit: 50,
    apiCallsK: 312.0,
    retentionPct: 93.8,
    status: "growing",
    lastActiveAt: "2026-11-26 03:58",
  },
  {
    id: "TN-03",
    name: "云帆跨境电商集团",
    plan: "专业版",
    activeUsers: 31,
    seatLimit: 40,
    apiCallsK: 196.4,
    retentionPct: 88.2,
    status: "healthy",
    lastActiveAt: "2026-11-26 02:45",
  },
  {
    id: "TN-04",
    name: "明途生物计算研究院",
    plan: "企业旗舰版",
    activeUsers: 22,
    seatLimit: 50,
    apiCallsK: 142.8,
    retentionPct: 74.5,
    status: "risk",
    lastActiveAt: "2026-11-25 19:20",
  },
  {
    id: "TN-05",
    name: "青藤金融科技",
    plan: "专业版",
    activeUsers: 27,
    seatLimit: 30,
    apiCallsK: 264.1,
    retentionPct: 91.6,
    status: "growing",
    lastActiveAt: "2026-11-26 03:30",
  },
]

export const backendQpsSeries: Record<
  AnalyticsRange,
  readonly { id: string; label: string; values: readonly number[] }[]
> = {
  "7d": [
    {
      id: "qps",
      label: "网关 QPS",
      values: [1280, 1420, 1360, 1190, 1580, 1740, 1860],
    },
    {
      id: "jobs",
      label: "异步采集任务/分",
      values: [420, 460, 445, 390, 510, 580, 610],
    },
  ],
  "30d": [
    {
      id: "qps",
      label: "网关 QPS",
      values: [980, 1140, 1260, 1390, 1520, 1690, 1860],
    },
    {
      id: "jobs",
      label: "异步采集任务/分",
      values: [310, 360, 410, 455, 495, 550, 610],
    },
  ],
  "90d": [
    {
      id: "qps",
      label: "网关 QPS",
      values: [760, 910, 1080, 1240, 1460, 1650, 1860],
    },
    {
      id: "jobs",
      label: "异步采集任务/分",
      values: [240, 295, 340, 405, 480, 540, 610],
    },
  ],
}

export const apiEndpointRows: readonly ApiEndpointRow[] = [
  {
    id: "API-01",
    endpoint: "POST /api/v2/bills/aggregate",
    service: "billing-core",
    qps: 482,
    p95Ms: 118,
    errorRatePct: 0.04,
    availabilityPct: 99.98,
    status: "healthy",
  },
  {
    id: "API-02",
    endpoint: "GET /api/v2/collector/sync-status",
    service: "cloud-collector",
    qps: 365,
    p95Ms: 284,
    errorRatePct: 0.62,
    availabilityPct: 99.42,
    status: "degraded",
  },
  {
    id: "API-03",
    endpoint: "POST /api/v2/alerts/evaluate",
    service: "alert-engine",
    qps: 294,
    p95Ms: 64,
    errorRatePct: 0.01,
    availabilityPct: 99.99,
    status: "healthy",
  },
  {
    id: "API-04",
    endpoint: "POST /api/v2/copilot/stream",
    service: "ai-gateway",
    qps: 148,
    p95Ms: 412,
    errorRatePct: 1.18,
    availabilityPct: 98.91,
    status: "critical",
  },
  {
    id: "API-05",
    endpoint: "GET /api/v2/org/tree",
    service: "iam-service",
    qps: 571,
    p95Ms: 42,
    errorRatePct: 0.02,
    availabilityPct: 99.99,
    status: "healthy",
  },
]

export const storageNodeRows: readonly StorageNodeRow[] = [
  {
    id: "DB-01",
    name: "pg-billing-primary",
    engine: "PostgreSQL 16",
    usedGb: 1420,
    capacityGb: 2048,
    iops: 12400,
    cacheHitPct: 98.6,
    slowQueries24h: 3,
    status: "healthy",
  },
  {
    id: "DB-02",
    name: "ch-analytics-cluster",
    engine: "ClickHouse 24",
    usedGb: 4680,
    capacityGb: 6144,
    iops: 24800,
    cacheHitPct: 94.2,
    slowQueries24h: 11,
    status: "warning",
  },
  {
    id: "DB-03",
    name: "redis-session-mesh",
    engine: "Redis 7.2",
    usedGb: 48,
    capacityGb: 128,
    iops: 68500,
    cacheHitPct: 99.4,
    slowQueries24h: 0,
    status: "healthy",
  },
  {
    id: "DB-04",
    name: "oss-bill-archive",
    engine: "Object Storage",
    usedGb: 8920,
    capacityGb: 16384,
    iops: 5100,
    cacheHitPct: 91.8,
    slowQueries24h: 0,
    status: "healthy",
  },
]

export const clusterNodeRows: readonly ClusterNodeRow[] = [
  {
    id: "CL-01",
    cluster: "prod-core-shanghai",
    region: "cn-shanghai",
    cpuPct: 62,
    memoryPct: 71,
    gpuPct: 24,
    podCount: 184,
    status: "healthy",
  },
  {
    id: "CL-02",
    cluster: "gpu-infer-shanghai",
    region: "cn-shanghai",
    cpuPct: 78,
    memoryPct: 84,
    gpuPct: 92,
    podCount: 64,
    status: "warning",
  },
  {
    id: "CL-03",
    cluster: "collector-beijing",
    region: "cn-beijing",
    cpuPct: 74,
    memoryPct: 68,
    gpuPct: 0,
    podCount: 112,
    status: "busy",
  },
  {
    id: "CL-04",
    cluster: "edge-global-sg",
    region: "ap-southeast-1",
    cpuPct: 48,
    memoryPct: 53,
    gpuPct: 0,
    podCount: 76,
    status: "healthy",
  },
]

export const systemLoadSeries: Record<
  AnalyticsRange,
  readonly { id: string; label: string; values: readonly number[] }[]
> = {
  "7d": [
    { id: "cpu", label: "平均 CPU (%)", values: [56, 61, 58, 54, 65, 68, 66] },
    { id: "mem", label: "平均内存 (%)", values: [64, 66, 65, 63, 70, 72, 71] },
    { id: "gpu", label: "GPU 负载 (%)", values: [48, 55, 62, 59, 78, 88, 92] },
  ],
  "30d": [
    { id: "cpu", label: "平均 CPU (%)", values: [51, 54, 57, 60, 62, 65, 66] },
    { id: "mem", label: "平均内存 (%)", values: [60, 62, 64, 66, 68, 70, 71] },
    { id: "gpu", label: "GPU 负载 (%)", values: [42, 48, 54, 63, 72, 84, 92] },
  ],
  "90d": [
    { id: "cpu", label: "平均 CPU (%)", values: [44, 49, 53, 58, 61, 64, 66] },
    { id: "mem", label: "平均内存 (%)", values: [55, 58, 61, 64, 67, 69, 71] },
    { id: "gpu", label: "GPU 负载 (%)", values: [30, 38, 46, 58, 69, 82, 92] },
  ],
}

export const serviceSlaRows: readonly ServiceSlaRow[] = [
  {
    id: "SLA-01",
    service: "工作区主站与身份认证",
    tier: "Tier 0",
    availabilityPct: 99.99,
    targetPct: 99.95,
    errorBudgetLeftPct: 86,
    mttrMin: 6,
    incidents30d: 0,
    status: "healthy",
  },
  {
    id: "SLA-02",
    service: "多云账单对账引擎",
    tier: "Tier 0",
    availabilityPct: 99.96,
    targetPct: 99.95,
    errorBudgetLeftPct: 68,
    mttrMin: 14,
    incidents30d: 1,
    status: "healthy",
  },
  {
    id: "SLA-03",
    service: "账单采集调度器",
    tier: "Tier 1",
    availabilityPct: 99.82,
    targetPct: 99.9,
    errorBudgetLeftPct: 34,
    mttrMin: 28,
    incidents30d: 2,
    status: "warning",
  },
  {
    id: "SLA-04",
    service: "AI 智算助手网关",
    tier: "Tier 1",
    availabilityPct: 99.78,
    targetPct: 99.9,
    errorBudgetLeftPct: 29,
    mttrMin: 22,
    incidents30d: 3,
    status: "warning",
  },
]

export const costTrendSeries: Record<
  AnalyticsRange,
  readonly { id: string; label: string; values: readonly number[] }[]
> = {
  "7d": [
    {
      id: "compute",
      label: "计算与 GPU（万元）",
      values: [28, 30, 29, 31, 35, 38, 41],
    },
    {
      id: "storage",
      label: "存储与数据库（万元）",
      values: [14, 14, 15, 15, 16, 16, 17],
    },
    {
      id: "network",
      label: "网络与 CDN（万元）",
      values: [9, 10, 11, 10, 12, 13, 14],
    },
  ],
  "30d": [
    {
      id: "compute",
      label: "计算与 GPU（万元）",
      values: [195, 208, 215, 224, 236, 248, 262],
    },
    {
      id: "storage",
      label: "存储与数据库（万元）",
      values: [92, 95, 96, 98, 101, 104, 108],
    },
    {
      id: "network",
      label: "网络与 CDN（万元）",
      values: [58, 62, 65, 68, 72, 76, 82],
    },
  ],
  "90d": [
    {
      id: "compute",
      label: "计算与 GPU（万元）",
      values: [160, 178, 192, 210, 228, 245, 262],
    },
    {
      id: "storage",
      label: "存储与数据库（万元）",
      values: [84, 88, 92, 96, 100, 104, 108],
    },
    {
      id: "network",
      label: "网络与 CDN（万元）",
      values: [48, 52, 58, 63, 69, 75, 82],
    },
  ],
}

export const costAllocationRows: readonly CostAllocationRow[] = [
  {
    id: "CA-01",
    department: "研发中心",
    project: "AI 推理与基础架构",
    provider: "阿里云",
    monthlyCostWan: 240.2,
    budgetWan: 260,
    momDeltaPct: 14.8,
    idleRatioPct: 18.5,
    owner: "陈思远",
  },
  {
    id: "CA-02",
    department: "云平台部",
    project: "多云采集与数据湖",
    provider: "腾讯云",
    monthlyCostWan: 156.4,
    budgetWan: 180,
    momDeltaPct: 6.2,
    idleRatioPct: 11.2,
    owner: "陈思远",
  },
  {
    id: "CA-03",
    department: "财务运营部",
    project: "账务归档与对账集群",
    provider: "华为云",
    monthlyCostWan: 78.6,
    budgetWan: 95,
    momDeltaPct: -3.4,
    idleRatioPct: 6.8,
    owner: "李然",
  },
  {
    id: "CA-04",
    department: "安全合规部",
    project: "审计日志与零信任网关",
    provider: "Cloudflare",
    monthlyCostWan: 54.8,
    budgetWan: 65,
    momDeltaPct: 9.1,
    idleRatioPct: 8.4,
    owner: "周明",
  },
  {
    id: "CA-05",
    department: "产品管理部",
    project: "数据看板与客户门户",
    provider: "阿里云",
    monthlyCostWan: 42.1,
    budgetWan: 55,
    momDeltaPct: 2.5,
    idleRatioPct: 14.0,
    owner: "张敏",
  },
]

const storageKey = "aries-demo-analytics-v1"
const changeEvent = "aries-demo-analytics-change"

function nowStamp() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function createInitialState(): AnalyticsStoreState {
  return {
    insights: [
      {
        id: "INS-01",
        domain: "cost",
        title: "研发中心按量 GPU 夜间低谷闲置率达 18.5%",
        impact: "预计每月节省 ¥6.2 万",
        summary:
          "01:00–06:00 期间推理 QPS 下降 68%，但按量节点未触发自动缩容。",
        recommendation:
          "为 gpu-infer-shanghai 启用定时 HPA 下限（最小 4 节点）并混部抢占式实例。",
        confidencePct: 96,
        detectedAt: "2026-11-26 03:40",
        status: "open",
      },
      {
        id: "INS-02",
        domain: "backend",
        title: "ai-gateway 流式接口 P95 延迟上升至 412ms",
        impact: "影响 1.18% 助手会话响应",
        summary: "上游并发限流触发 2 次重试，导致尾延迟较上周增加 145ms。",
        recommendation: "开启边缘连接复用并将上游超时阈值与熔断窗口解耦。",
        confidencePct: 92,
        detectedAt: "2026-11-26 02:15",
        status: "open",
      },
      {
        id: "INS-03",
        domain: "platform",
        title: "企业租户「明途生物计算研究院」近 14 日留存下滑至 74.5%",
        impact: "28 个已购席位处于低活跃状态",
        summary:
          "该租户在成员权限配置完成后，月账单导出与告警订阅使用频次明显降低。",
        recommendation:
          "推送自动化月报配置引导，协助其绑定飞书告警群以提升日常触达。",
        confidencePct: 88,
        detectedAt: "2026-11-25 20:10",
        status: "open",
      },
      {
        id: "INS-04",
        domain: "system",
        title: "ClickHouse 分析集群近 24 小时出现 11 次慢查询",
        impact: "磁盘 IOPS 峰值触及 82%",
        summary: "多租户跨 90 天账单明细聚合未使用物化视图，导致全表扫描。",
        recommendation:
          "按租户 ID + 账期月建立预聚合物化视图，预计查询耗时下降 75%。",
        confidencePct: 94,
        detectedAt: "2026-11-25 17:30",
        status: "adopted",
      },
    ],
    reports: [
      {
        id: "RPT-01",
        name: "管理层每周全维经营与成本周报",
        domain: "cost",
        schedule: "每周一 09:00",
        format: "PDF",
        recipients: "张敏、李然、陈思远",
        lastGeneratedAt: "2026-11-25 09:00",
        enabled: true,
      },
      {
        id: "RPT-02",
        name: "平台租户活跃度与席位利用率月报",
        domain: "platform",
        schedule: "每月 1 日 08:30",
        format: "XLSX",
        recipients: "产品管理部、客户成功组",
        lastGeneratedAt: "2026-11-01 08:30",
        enabled: true,
      },
      {
        id: "RPT-03",
        name: "核心 API 与数据库性能健康日报",
        domain: "backend",
        schedule: "每日 08:00",
        format: "CSV",
        recipients: "云平台部值守群",
        lastGeneratedAt: "2026-11-26 08:00",
        enabled: true,
      },
      {
        id: "RPT-04",
        name: "集群稳定性与 SLA 错误预算审计表",
        domain: "system",
        schedule: "每周五 18:00",
        format: "PDF",
        recipients: "安全合规部、SRE 团队",
        lastGeneratedAt: "2026-11-22 18:00",
        enabled: false,
      },
    ],
  }
}

let cachedState: AnalyticsStoreState | null = null

function loadState(): AnalyticsStoreState {
  if (cachedState) return cachedState
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(storageKey)
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AnalyticsStoreState>
        if (Array.isArray(parsed.insights) && Array.isArray(parsed.reports)) {
          cachedState = { ...createInitialState(), ...parsed }
          return cachedState
        }
      }
    } catch {
      // Fall back to seed data if storage is unavailable.
    }
  }
  cachedState = createInitialState()
  return cachedState
}

function commit(next: AnalyticsStoreState) {
  cachedState = next
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next))
    } catch {
      // Keep in-memory state.
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

export function useAnalyticsStore() {
  return useSyncExternalStore(subscribe, loadState, () => serverSnapshot)
}

export const analyticsActions = {
  updateInsightStatus(id: string, status: InsightStatus) {
    const state = loadState()
    commit({
      ...state,
      insights: state.insights.map((item) =>
        item.id === id ? { ...item, status } : item
      ),
    })
  },

  toggleReport(id: string, enabled: boolean) {
    const state = loadState()
    commit({
      ...state,
      reports: state.reports.map((r) => (r.id === id ? { ...r, enabled } : r)),
    })
  },

  runReportNow(id: string) {
    const state = loadState()
    commit({
      ...state,
      reports: state.reports.map((r) =>
        r.id === id ? { ...r, lastGeneratedAt: nowStamp() } : r
      ),
    })
  },

  addReport(
    input: Pick<
      CustomReportItem,
      "name" | "domain" | "schedule" | "format" | "recipients"
    >
  ) {
    const state = loadState()
    const report: CustomReportItem = {
      id: `RPT-${String(state.reports.length + 1).padStart(2, "0")}`,
      ...input,
      lastGeneratedAt: nowStamp(),
      enabled: true,
    }
    commit({ ...state, reports: [report, ...state.reports] })
  },
}
