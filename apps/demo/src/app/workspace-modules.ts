import { workspacePages, type WorkspacePagePath } from "./workspace-pages"
import {
  SolarBell,
  SolarChartNoAxesColumnIncreasing,
  SolarChartSquare,
  SolarClock3,
  SolarCloud,
  SolarCog,
  SolarCreditCard,
  SolarEye,
  SolarFileSearch,
  SolarFolder,
  SolarHomeSmileAngle,
  SolarLayoutGrid,
  SolarMail,
  SolarNotebookText,
  SolarPalette,
  SolarReceiptText,
  SolarRefreshCcw,
  SolarShieldAlert,
  type AppIconComponent,
} from "@marismoon/ui/icons"
import { demoBills } from "@/shared/mocks/bills"

interface WorkspaceLeaf {
  label: string
  count?: number
  to?: WorkspacePagePath
}

export type WorkspaceEntry = { label: string; icon: AppIconComponent } & (
  | { kind: "route"; to: WorkspacePagePath; count?: number }
  | { kind: "folder"; children: readonly WorkspaceLeaf[] }
  | { kind: "demo" }
)

interface WorkspaceModule {
  label: string
  icon: AppIconComponent
  entries: readonly WorkspaceEntry[]
}

export const workspaceModules = {
  overview: {
    label: "总览",
    icon: SolarHomeSmileAngle,
    entries: [
      {
        kind: "route",
        label: "运营总览",
        icon: SolarLayoutGrid,
        to: workspacePages.overview.path,
      },
      {
        kind: "folder",
        label: "供应商组合",
        icon: SolarFolder,
        children: [
          { label: "阿里云", count: 14 },
          { label: "腾讯云", count: 9 },
          { label: "华为云", count: 8 },
          { label: "七牛云", count: 6 },
          { label: "Cloudflare / 海外", count: 11 },
        ],
      },
      {
        kind: "folder",
        label: "关注监控",
        icon: SolarEye,
        children: [
          {
            label: "月账单",
            to: workspacePages.bills.path,
            count: demoBills.length,
          },
          { label: "授权即将过期", count: 6 },
          { label: "差异待确认", count: 12 },
          { label: "预算临近阈值", count: 9 },
        ],
      },
    ],
  },
  collection: {
    label: "接入与采集",
    icon: SolarCloud,
    entries: [
      { kind: "demo", label: "采集任务", icon: SolarNotebookText },
      { kind: "demo", label: "云账号管理", icon: SolarCloud },
      { kind: "demo", label: "采集规则", icon: SolarCog },
      { kind: "demo", label: "采集日志", icon: SolarFileSearch },
      {
        kind: "folder",
        label: "采集监控",
        icon: SolarEye,
        children: [{ label: "待执行任务" }, { label: "失败任务" }],
      },
    ],
  },
  contracts: {
    label: "商务与合同",
    icon: SolarRefreshCcw,
    entries: [
      { kind: "demo", label: "合同列表", icon: SolarNotebookText },
      { kind: "demo", label: "供应商合同", icon: SolarFolder },
      { kind: "demo", label: "合同审批", icon: SolarFileSearch },
      { kind: "demo", label: "续约提醒", icon: SolarClock3 },
      {
        kind: "folder",
        label: "合同状态",
        icon: SolarFolder,
        children: [{ label: "履约中" }, { label: "即将到期" }],
      },
    ],
  },
  invoices: {
    label: "凭证与发票",
    icon: SolarCreditCard,
    entries: [
      { kind: "demo", label: "发票管理", icon: SolarReceiptText },
      { kind: "demo", label: "账单凭证", icon: SolarFileSearch },
      { kind: "demo", label: "凭证归档", icon: SolarFolder },
      { kind: "demo", label: "开票申请", icon: SolarNotebookText },
      {
        kind: "folder",
        label: "发票分类",
        icon: SolarFolder,
        children: [{ label: "增值税专用发票" }, { label: "增值税普通发票" }],
      },
    ],
  },
  notifications: {
    label: "告警通知",
    icon: SolarBell,
    entries: [
      {
        kind: "folder",
        label: "告警监控",
        icon: SolarBell,
        children: [
          {
            label: "告警中心",
            to: workspacePages["notifications-center"].path,
          },
          {
            label: "待处理告警",
            to: workspacePages["notifications-pending"].path,
          },
        ],
      },
      {
        kind: "folder",
        label: "告警级别",
        icon: SolarShieldAlert,
        children: [
          {
            label: "严重告警",
            to: workspacePages["notifications-severity-critical"].path,
          },
          {
            label: "一般告警",
            to: workspacePages["notifications-severity-normal"].path,
          },
        ],
      },
      {
        kind: "folder",
        label: "规则与值守",
        icon: SolarCog,
        children: [
          {
            label: "告警规则",
            to: workspacePages["notifications-rules"].path,
          },
          {
            label: "静默与值守",
            to: workspacePages["notifications-silences"].path,
          },
        ],
      },
      {
        kind: "folder",
        label: "通知管理",
        icon: SolarMail,
        children: [
          {
            label: "通知记录",
            to: workspacePages["notifications-logs"].path,
          },
          {
            label: "通知偏好",
            to: workspacePages["notifications-preferences"].path,
          },
        ],
      },
    ],
  },
  analytics: {
    label: "数据分析",
    icon: SolarChartSquare,
    entries: [
      {
        kind: "folder",
        label: "平台数据",
        icon: SolarLayoutGrid,
        children: [
          {
            label: "平台总览",
            to: workspacePages["analytics-platform-overview"].path,
          },
          {
            label: "租户与用户分析",
            to: workspacePages["analytics-platform-tenants"].path,
          },
        ],
      },
      {
        kind: "folder",
        label: "后台数据",
        icon: SolarChartNoAxesColumnIncreasing,
        children: [
          {
            label: "API 与任务监控",
            to: workspacePages["analytics-backend-api"].path,
          },
          {
            label: "数据库与存储",
            to: workspacePages["analytics-backend-storage"].path,
          },
        ],
      },
      {
        kind: "folder",
        label: "系统数据",
        icon: SolarCog,
        children: [
          {
            label: "资源与节点性能",
            to: workspacePages["analytics-system-infra"].path,
          },
          {
            label: "稳定性与 SLA",
            to: workspacePages["analytics-system-sla"].path,
          },
        ],
      },
      {
        kind: "folder",
        label: "成本数据",
        icon: SolarReceiptText,
        children: [
          {
            label: "成本总览与趋势",
            to: workspacePages["analytics-cost-overview"].path,
          },
          {
            label: "预算与成本分摊",
            to: workspacePages["analytics-cost-allocation"].path,
          },
        ],
      },
      {
        kind: "folder",
        label: "洞察报告",
        icon: SolarChartSquare,
        children: [
          {
            label: "智能数据洞察",
            to: workspacePages["analytics-insights-ai"].path,
          },
          {
            label: "自定义报表",
            to: workspacePages["analytics-insights-reports"].path,
          },
        ],
      },
    ],
  },
  settings: {
    label: "系统设置",
    icon: SolarCog,
    entries: [
      {
        kind: "folder",
        label: "组件预览",
        icon: SolarPalette,
        children: [
          { label: "规范", to: workspacePages.components.path },
          { label: "基础组件", to: workspacePages["components-basic"].path },
          { label: "表单与输入", to: workspacePages["components-form"].path },
          { label: "导航", to: workspacePages["components-navigation"].path },
          {
            label: "浮层与反馈",
            to: workspacePages["components-overlay"].path,
          },
          { label: "数据展示", to: workspacePages["components-data"].path },
          { label: "对话与 AI", to: workspacePages["components-ai"].path },
        ],
      },
      {
        kind: "folder",
        label: "基础页面",
        icon: SolarFolder,
        children: [
          { label: "登录与账号", to: workspacePages["base-login"].path },
          {
            label: "个人安全与二次验证",
            to: workspacePages["base-security"].path,
          },
          { label: "会话与异常", to: workspacePages["base-session"].path },
        ],
      },
      {
        kind: "folder",
        label: "动态效果",
        icon: SolarFolder,
        children: [
          { label: "组件动效", to: workspacePages["motion-components"].path },
          { label: "文字动效", to: workspacePages["motion-text"].path },
          { label: "滚动动效", to: workspacePages["motion-scroll"].path },
          {
            label: "业务场景动效",
            to: workspacePages["motion-aceternity"].path,
          },
          {
            label: "业务交互动效",
            to: workspacePages["motion-interaction"].path,
          },
          { label: "图表动效", to: workspacePages["motion-charts"].path },
          {
            label: "切换动效",
            to: workspacePages["motion-transitions"].path,
          },
        ],
      },
      {
        kind: "folder",
        label: "组织权限",
        icon: SolarFolder,
        children: [
          {
            label: "成员管理",
            to: workspacePages["settings-org-members"].path,
          },
          {
            label: "角色权限",
            to: workspacePages["settings-org-roles"].path,
          },
          {
            label: "部门架构",
            to: workspacePages["settings-org-departments"].path,
          },
        ],
      },
      {
        kind: "folder",
        label: "系统配置",
        icon: SolarCog,
        children: [
          { label: "基础信息", to: workspacePages["settings-basic"].path },
          {
            label: "全局参数",
            to: workspacePages["settings-system-params"].path,
          },
        ],
      },
      {
        kind: "folder",
        label: "集成通知",
        icon: SolarBell,
        children: [
          {
            label: "应用集成",
            to: workspacePages["settings-integrations-apps"].path,
          },
          {
            label: "群机器人",
            to: workspacePages["settings-integrations-bots"].path,
          },
          {
            label: "消息规则",
            to: workspacePages["settings-integrations-rules"].path,
          },
        ],
      },
      {
        kind: "folder",
        label: "安全审计",
        icon: SolarShieldAlert,
        children: [
          {
            label: "安全策略",
            to: workspacePages["settings-security-policy"].path,
          },
          {
            label: "操作日志",
            to: workspacePages["settings-security-audit"].path,
          },
        ],
      },
    ],
  },
} satisfies Record<string, WorkspaceModule>

export type WorkspaceModuleId = keyof typeof workspaceModules

export const workspaceModuleIds = Object.keys(
  workspaceModules
) as WorkspaceModuleId[]
