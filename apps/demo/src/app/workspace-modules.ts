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
} from "@aries/ui/icons"
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
      { kind: "demo", label: "告警中心", icon: SolarBell },
      { kind: "demo", label: "待处理告警", icon: SolarClock3 },
      { kind: "demo", label: "告警规则", icon: SolarShieldAlert },
      { kind: "demo", label: "通知记录", icon: SolarMail },
      {
        kind: "folder",
        label: "告警级别",
        icon: SolarFolder,
        children: [{ label: "严重告警" }, { label: "一般告警" }],
      },
    ],
  },
  analytics: {
    label: "成本分析",
    icon: SolarChartSquare,
    entries: [
      { kind: "demo", label: "成本总览", icon: SolarLayoutGrid },
      {
        kind: "demo",
        label: "成本趋势",
        icon: SolarChartNoAxesColumnIncreasing,
      },
      { kind: "demo", label: "预算管理", icon: SolarReceiptText },
      { kind: "demo", label: "成本分摊", icon: SolarCreditCard },
      {
        kind: "folder",
        label: "分析维度",
        icon: SolarFolder,
        children: [{ label: "按供应商" }, { label: "按项目" }],
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
          { label: "成员管理" },
          { label: "角色权限" },
          { label: "部门架构" },
        ],
      },
      {
        kind: "folder",
        label: "系统配置",
        icon: SolarCog,
        children: [
          { label: "基础信息", to: workspacePages["settings-basic"].path },
          { label: "全局参数" },
        ],
      },
      {
        kind: "folder",
        label: "集成通知",
        icon: SolarBell,
        children: [
          { label: "应用集成" },
          { label: "群机器人" },
          { label: "消息规则" },
        ],
      },
      {
        kind: "folder",
        label: "安全审计",
        icon: SolarShieldAlert,
        children: [{ label: "安全策略" }, { label: "操作日志" }],
      },
    ],
  },
} satisfies Record<string, WorkspaceModule>

export type WorkspaceModuleId = keyof typeof workspaceModules

export const workspaceModuleIds = Object.keys(
  workspaceModules
) as WorkspaceModuleId[]
