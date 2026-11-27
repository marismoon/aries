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
  {
    id: "TN-06",
    name: "云栖物流实验室",
    plan: "专业版",
    activeUsers: 38,
    seatLimit: 48,
    apiCallsK: 123.6,
    retentionPct: 92.1,
    status: "healthy",
    lastActiveAt: "2026-11-26 04:03",
  },
  {
    id: "TN-07",
    name: "远海能源运营中心",
    plan: "企业旗舰版",
    activeUsers: 53,
    seatLimit: 60,
    apiCallsK: 193.4,
    retentionPct: 94.7,
    status: "growing",
    lastActiveAt: "2026-11-26 03:46",
  },
  {
    id: "TN-08",
    name: "青屿数字出版",
    plan: "专业版",
    activeUsers: 17,
    seatLimit: 36,
    apiCallsK: 48.7,
    retentionPct: 71.2,
    status: "risk",
    lastActiveAt: "2026-11-26 00:18",
  },
  {
    id: "TN-09",
    name: "银杉工业视觉",
    plan: "企业旗舰版",
    activeUsers: 72,
    seatLimit: 90,
    apiCallsK: 285.4,
    retentionPct: 95.3,
    status: "healthy",
    lastActiveAt: "2026-11-26 03:12",
  },
  {
    id: "TN-10",
    name: "南桥协作空间",
    plan: "专业版",
    activeUsers: 24,
    seatLimit: 25,
    apiCallsK: 86.2,
    retentionPct: 96.8,
    status: "growing",
    lastActiveAt: "2026-11-26 02:54",
  },
  {
    id: "TN-11",
    name: "澄湖遥感实验室",
    plan: "企业旗舰版",
    activeUsers: 41,
    seatLimit: 50,
    apiCallsK: 168.8,
    retentionPct: 93.6,
    status: "healthy",
    lastActiveAt: "2026-11-26 03:37",
  },
  {
    id: "TN-12",
    name: "晨屿教育云",
    plan: "专业版",
    activeUsers: 19,
    seatLimit: 32,
    apiCallsK: 57.2,
    retentionPct: 82.4,
    status: "healthy",
    lastActiveAt: "2026-11-26 01:24",
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
  {
    id: "API-06",
    endpoint: "GET /api/v2/budgets/usage",
    service: "budget-service",
    qps: 124,
    p95Ms: 82,
    errorRatePct: 0.03,
    availabilityPct: 99.98,
    status: "healthy",
  },
  {
    id: "API-07",
    endpoint: "POST /api/v2/reports/run",
    service: "report-worker",
    qps: 38,
    p95Ms: 213,
    errorRatePct: 0.46,
    availabilityPct: 99.62,
    status: "degraded",
  },
  {
    id: "API-08",
    endpoint: "GET /api/v2/tenants/usage",
    service: "tenant-metering",
    qps: 109,
    p95Ms: 56,
    errorRatePct: 0.01,
    availabilityPct: 99.99,
    status: "healthy",
  },
  {
    id: "API-09",
    endpoint: "GET /api/v2/audit/events",
    service: "audit-index",
    qps: 77,
    p95Ms: 91,
    errorRatePct: 0.02,
    availabilityPct: 99.99,
    status: "healthy",
  },
  {
    id: "API-10",
    endpoint: "GET /api/v2/storage/quotas",
    service: "quota-service",
    qps: 61,
    p95Ms: 47,
    errorRatePct: 0.01,
    availabilityPct: 99.99,
    status: "healthy",
  },
  {
    id: "API-11",
    endpoint: "POST /api/v2/notifications/deliver",
    service: "notification-router",
    qps: 145,
    p95Ms: 127,
    errorRatePct: 0.07,
    availabilityPct: 99.96,
    status: "healthy",
  },
  {
    id: "API-12",
    endpoint: "GET /api/v2/insights/forecast",
    service: "forecast-service",
    qps: 22,
    p95Ms: 246,
    errorRatePct: 0.51,
    availabilityPct: 99.57,
    status: "degraded",
  },
]

export const storageNodeRows: StorageNodeRow[] = [
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
  {
    id: "DB-05",
    name: "pg-tenant-replica",
    engine: "PostgreSQL 16",
    usedGb: 386,
    capacityGb: 1024,
    iops: 4200,
    cacheHitPct: 98.1,
    slowQueries24h: 1,
    status: "healthy",
  },
  {
    id: "DB-06",
    name: "redis-quota-cache",
    engine: "Redis 7.2",
    usedGb: 43,
    capacityGb: 64,
    iops: 21800,
    cacheHitPct: 99.3,
    slowQueries24h: 0,
    status: "healthy",
  },
  {
    id: "DB-07",
    name: "ch-audit-events",
    engine: "ClickHouse 24",
    usedGb: 1654,
    capacityGb: 2048,
    iops: 13400,
    cacheHitPct: 92.4,
    slowQueries24h: 7,
    status: "warning",
  },
  {
    id: "DB-08",
    name: "oss-report-exports",
    engine: "Object Storage",
    usedGb: 284,
    capacityGb: 1024,
    iops: 1830,
    cacheHitPct: 91.4,
    slowQueries24h: 0,
    status: "healthy",
  },
  {
    id: "DB-09",
    name: "pg-automation-jobs",
    engine: "PostgreSQL 16",
    usedGb: 360,
    capacityGb: 512,
    iops: 5600,
    cacheHitPct: 97.9,
    slowQueries24h: 2,
    status: "healthy",
  },
  {
    id: "DB-10",
    name: "redis-api-ratelimit",
    engine: "Redis 7.2",
    usedGb: 21,
    capacityGb: 32,
    iops: 31200,
    cacheHitPct: 99.6,
    slowQueries24h: 0,
    status: "healthy",
  },
  {
    id: "DB-11",
    name: "ch-metrics-hot",
    engine: "ClickHouse 24",
    usedGb: 1778,
    capacityGb: 2048,
    iops: 18600,
    cacheHitPct: 93.1,
    slowQueries24h: 8,
    status: "warning",
  },
  {
    id: "DB-12",
    name: "pg-notification-log",
    engine: "PostgreSQL 16",
    usedGb: 194,
    capacityGb: 512,
    iops: 3620,
    cacheHitPct: 98.4,
    slowQueries24h: 1,
    status: "healthy",
  },
]

export const clusterNodeRows: ClusterNodeRow[] = [
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
  {
    id: "CL-05",
    cluster: "billing-hangzhou",
    region: "cn-hangzhou",
    cpuPct: 63,
    memoryPct: 68,
    gpuPct: 0,
    podCount: 92,
    status: "healthy",
  },
  {
    id: "CL-06",
    cluster: "jobs-shenzhen",
    region: "cn-shenzhen",
    cpuPct: 76,
    memoryPct: 78,
    gpuPct: 0,
    podCount: 103,
    status: "busy",
  },
  {
    id: "CL-07",
    cluster: "reports-beijing",
    region: "cn-beijing",
    cpuPct: 48,
    memoryPct: 57,
    gpuPct: 0,
    podCount: 56,
    status: "healthy",
  },
  {
    id: "CL-08",
    cluster: "gpu-train-hangzhou",
    region: "cn-hangzhou",
    cpuPct: 72,
    memoryPct: 82,
    gpuPct: 89,
    podCount: 42,
    status: "warning",
  },
  {
    id: "CL-09",
    cluster: "ingress-hongkong",
    region: "cn-hongkong",
    cpuPct: 58,
    memoryPct: 54,
    gpuPct: 0,
    podCount: 67,
    status: "healthy",
  },
  {
    id: "CL-10",
    cluster: "backup-shanghai",
    region: "cn-shanghai",
    cpuPct: 32,
    memoryPct: 46,
    gpuPct: 0,
    podCount: 28,
    status: "healthy",
  },
  {
    id: "CL-11",
    cluster: "search-beijing",
    region: "cn-beijing",
    cpuPct: 71,
    memoryPct: 80,
    gpuPct: 0,
    podCount: 82,
    status: "busy",
  },
  {
    id: "CL-12",
    cluster: "inference-singapore",
    region: "ap-southeast-1",
    cpuPct: 54,
    memoryPct: 61,
    gpuPct: 72,
    podCount: 48,
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

export const serviceSlaRows: ServiceSlaRow[] = [
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
  {
    id: "SLA-05",
    service: "租户计量服务",
    tier: "Tier 1",
    availabilityPct: 99.98,
    targetPct: 99.9,
    errorBudgetLeftPct: 80,
    mttrMin: 8,
    incidents30d: 1,
    status: "healthy",
  },
  {
    id: "SLA-06",
    service: "成本预算告警",
    tier: "Tier 1",
    availabilityPct: 99.97,
    targetPct: 99.9,
    errorBudgetLeftPct: 70,
    mttrMin: 12,
    incidents30d: 1,
    status: "healthy",
  },
  {
    id: "SLA-07",
    service: "定时报表生成",
    tier: "Tier 2",
    availabilityPct: 99.42,
    targetPct: 99.5,
    errorBudgetLeftPct: 0,
    mttrMin: 42,
    incidents30d: 3,
    status: "warning",
  },
  {
    id: "SLA-08",
    service: "审计事件索引",
    tier: "Tier 1",
    availabilityPct: 99.95,
    targetPct: 99.9,
    errorBudgetLeftPct: 50,
    mttrMin: 16,
    incidents30d: 1,
    status: "healthy",
  },
  {
    id: "SLA-09",
    service: "消息投递服务",
    tier: "Tier 1",
    availabilityPct: 99.96,
    targetPct: 99.9,
    errorBudgetLeftPct: 60,
    mttrMin: 13,
    incidents30d: 1,
    status: "healthy",
  },
  {
    id: "SLA-10",
    service: "资源配额查询",
    tier: "Tier 0",
    availabilityPct: 99.99,
    targetPct: 99.95,
    errorBudgetLeftPct: 80,
    mttrMin: 5,
    incidents30d: 0,
    status: "healthy",
  },
  {
    id: "SLA-11",
    service: "数据归档导出",
    tier: "Tier 2",
    availabilityPct: 99.78,
    targetPct: 99.5,
    errorBudgetLeftPct: 56,
    mttrMin: 24,
    incidents30d: 2,
    status: "healthy",
  },
  {
    id: "SLA-12",
    service: "用量预测服务",
    tier: "Tier 2",
    availabilityPct: 99.46,
    targetPct: 99.5,
    errorBudgetLeftPct: 0,
    mttrMin: 38,
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
  {
    id: "CA-06",
    department: "商业分析部",
    project: "经营指标数据仓库",
    provider: "腾讯云",
    monthlyCostWan: 38.6,
    budgetWan: 45,
    momDeltaPct: 4.2,
    idleRatioPct: 8.4,
    owner: "张敏",
  },
  {
    id: "CA-07",
    department: "客户体验部",
    project: "工单检索与回访",
    provider: "阿里云",
    monthlyCostWan: 32.4,
    budgetWan: 36,
    momDeltaPct: 7.3,
    idleRatioPct: 6.1,
    owner: "周明",
  },
  {
    id: "CA-08",
    department: "质量工程部",
    project: "持续集成测试集群",
    provider: "华为云",
    monthlyCostWan: 26.8,
    budgetWan: 32,
    momDeltaPct: -5.6,
    idleRatioPct: 16.3,
    owner: "陈思远",
  },
  {
    id: "CA-09",
    department: "交付工程部",
    project: "区域部署流水线",
    provider: "阿里云",
    monthlyCostWan: 21.7,
    budgetWan: 26,
    momDeltaPct: 5.8,
    idleRatioPct: 11.2,
    owner: "陈思远",
  },
  {
    id: "CA-10",
    department: "渠道运营部",
    project: "合作伙伴数据交换",
    provider: "腾讯云",
    monthlyCostWan: 18.9,
    budgetWan: 22,
    momDeltaPct: 3.7,
    idleRatioPct: 9.5,
    owner: "李然",
  },
  {
    id: "CA-11",
    department: "数据治理部",
    project: "元数据目录与数据质量",
    provider: "华为云",
    monthlyCostWan: 16.2,
    budgetWan: 20,
    momDeltaPct: -2.8,
    idleRatioPct: 7.2,
    owner: "张敏",
  },
  {
    id: "CA-12",
    department: "技术文档部",
    project: "文档站点与静态分发",
    provider: "Cloudflare",
    monthlyCostWan: 8.4,
    budgetWan: 10,
    momDeltaPct: 1.6,
    idleRatioPct: 4.3,
    owner: "周明",
  },
]

const storageKey = "aries-demo-analytics-v1"
const changeEvent = "aries-demo-analytics-change"

function nowStamp() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const additionalReportSeeds: readonly CustomReportItem[] = [
  {
    id: "RPT-seat-capacity",
    name: "席位容量周报",
    domain: "platform",
    schedule: "每周一 09:00",
    format: "XLSX",
    recipients: "张敏",
    lastGeneratedAt: "2026-11-23 09:00",
    enabled: true,
  },
  {
    id: "RPT-api-errors",
    name: "接口错误日报",
    domain: "backend",
    schedule: "每日 08:00",
    format: "CSV",
    recipients: "陈思远",
    lastGeneratedAt: "2026-11-26 08:00",
    enabled: true,
  },
  {
    id: "RPT-storage-headroom",
    name: "存储容量月报",
    domain: "backend",
    schedule: "每月 1 日 08:30",
    format: "PDF",
    recipients: "陈思远",
    lastGeneratedAt: "2026-11-01 08:30",
    enabled: false,
  },
  {
    id: "RPT-gpu-load",
    name: "推理集群负载周报",
    domain: "system",
    schedule: "每周一 09:00",
    format: "XLSX",
    recipients: "周明",
    lastGeneratedAt: "2026-11-23 09:00",
    enabled: true,
  },
  {
    id: "RPT-recovery-time",
    name: "故障恢复时长月报",
    domain: "system",
    schedule: "每月 1 日 08:30",
    format: "CSV",
    recipients: "周明",
    lastGeneratedAt: "2026-11-01 08:30",
    enabled: true,
  },
  {
    id: "RPT-budget-variance",
    name: "部门预算偏差周报",
    domain: "cost",
    schedule: "每周一 09:00",
    format: "PDF",
    recipients: "李然",
    lastGeneratedAt: "2026-11-23 09:00",
    enabled: true,
  },
  {
    id: "RPT-idle-resources",
    name: "闲置资源明细日报",
    domain: "cost",
    schedule: "每日 08:00",
    format: "CSV",
    recipients: "李然",
    lastGeneratedAt: "2026-11-24 08:00",
    enabled: false,
  },
  {
    id: "RPT-tenant-retention",
    name: "租户留存月报",
    domain: "platform",
    schedule: "每月 1 日 08:30",
    format: "XLSX",
    recipients: "张敏",
    lastGeneratedAt: "2026-11-01 08:30",
    enabled: true,
  },
]

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
      ...additionalReportSeeds,
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
          const savedIds = new Set(parsed.reports.map((report) => report.id))
          cachedState = {
            insights: parsed.insights,
            reports: [
              ...parsed.reports,
              ...additionalReportSeeds.filter(
                (report) => !savedIds.has(report.id)
              ),
            ],
          }
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
