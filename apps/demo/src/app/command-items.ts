import {
  SolarBell,
  SolarBuildings2,
  SolarCog,
  SolarFileSearch,
  SolarLayoutGrid,
  SolarMail,
  SolarPalette,
  SolarReceiptText,
  SolarShieldAlert,
  SolarUsersGroupRounded,
  SolarVerifiedCheck,
} from "@marismoon/ui/icons"
import type { CommandItem, ModuleCommands } from "@marismoon/shell"
import {
  workspaceModules,
  type WorkspaceEntry,
  type WorkspaceModuleId,
} from "./workspace-modules"
import { workspacePages } from "./workspace-pages"
import type { useUiText } from "@/lib/i18n/use-ui-text"

const pages: readonly CommandItem[] = [
  {
    group: "总览",
    title: "运营总览",
    description: "查看出账与采集进度",
    keywords: "overview dashboard kpi",
    path: workspacePages.overview.path,
    icon: SolarLayoutGrid,
  },
  {
    group: "总览",
    title: "月账单",
    description: "搜索、筛选与查看账单明细",
    keywords: "bills billing invoices",
    path: workspacePages.bills.path,
    icon: SolarReceiptText,
  },
  {
    group: "告警通知",
    title: "告警中心",
    description: "查看全部活跃告警、智能诊断与处置记录",
    keywords: "alerts notifications center incidents",
    path: workspacePages["notifications-center"].path,
    icon: SolarBell,
  },
  {
    group: "告警通知",
    title: "待处理告警",
    description: "集中处置待认领与处理中的高优先级告警",
    keywords: "pending open alerts triage sla",
    path: workspacePages["notifications-pending"].path,
    icon: SolarBell,
  },
  {
    group: "告警通知",
    title: "告警规则",
    description: "配置预算、云凭证、采集与安全监控阈值规则",
    keywords: "alert rules monitor threshold",
    path: workspacePages["notifications-rules"].path,
    icon: SolarShieldAlert,
  },
  {
    group: "告警通知",
    title: "静默与值守",
    description: "维护期静默窗口与多级值守升级排班",
    keywords: "silences maintenance oncall escalation",
    path: workspacePages["notifications-silences"].path,
    icon: SolarCog,
  },
  {
    group: "告警通知",
    title: "通知记录",
    description: "检索各通道通知投递回执与失败重试",
    keywords: "notification delivery logs webhook",
    path: workspacePages["notifications-logs"].path,
    icon: SolarMail,
  },
  {
    group: "告警通知",
    title: "通知偏好",
    description: "设置当前登录用户的订阅频道与免打扰时段",
    keywords: "notification preferences quiet hours",
    path: workspacePages["notifications-preferences"].path,
    icon: SolarBell,
  },
  {
    group: "数据分析",
    title: "平台总览",
    description: "查看平台日活趋势、模块渗透率与租户活跃度",
    keywords: "platform analytics dau mau usage",
    path: workspacePages["analytics-platform-overview"].path,
    icon: SolarLayoutGrid,
  },
  {
    group: "数据分析",
    title: "租户与用户分析",
    description: "分析企业租户席位利用率、调用量与 30 日留存",
    keywords: "tenants users retention seats",
    path: workspacePages["analytics-platform-tenants"].path,
    icon: SolarUsersGroupRounded,
  },
  {
    group: "数据分析",
    title: "API 与任务监控",
    description: "监控网关 QPS、P95 延迟、错误率与异步采集吞吐",
    keywords: "backend api qps latency apm",
    path: workspacePages["analytics-backend-api"].path,
    icon: SolarLayoutGrid,
  },
  {
    group: "数据分析",
    title: "数据库与存储",
    description: "分析主从库、ClickHouse、Redis 与对象存储负载",
    keywords: "database storage iops cache slow query",
    path: workspacePages["analytics-backend-storage"].path,
    icon: SolarCog,
  },
  {
    group: "数据分析",
    title: "资源与节点性能",
    description: "查看集群 CPU、内存、GPU 水位与 Pod 分布",
    keywords: "system infra cpu memory gpu cluster",
    path: workspacePages["analytics-system-infra"].path,
    icon: SolarCog,
  },
  {
    group: "数据分析",
    title: "稳定性与 SLA",
    description: "追踪核心服务可用性、错误预算与 MTTR",
    keywords: "sla reliability uptime mttr error budget",
    path: workspacePages["analytics-system-sla"].path,
    icon: SolarShieldAlert,
  },
  {
    group: "数据分析",
    title: "成本总览与趋势",
    description: "追踪计算、存储、网络多云费用趋势与部门排行",
    keywords: "cost overview trend cloud spend",
    path: workspacePages["analytics-cost-overview"].path,
    icon: SolarReceiptText,
  },
  {
    group: "数据分析",
    title: "预算与成本分摊",
    description: "核算部门与项目成本分摊、预算执行率与闲置率",
    keywords: "cost allocation budget idle",
    path: workspacePages["analytics-cost-allocation"].path,
    icon: SolarReceiptText,
  },
  {
    group: "数据分析",
    title: "智能数据洞察",
    description: "跨平台、后台、系统与成本的异常归因与优化建议",
    keywords: "ai insights anomaly optimization",
    path: workspacePages["analytics-insights-ai"].path,
    icon: SolarLayoutGrid,
  },
  {
    group: "数据分析",
    title: "自定义报表",
    description: "配置定时推送报表模板并一键生成最新快照",
    keywords: "custom reports export pdf csv xlsx",
    path: workspacePages["analytics-insights-reports"].path,
    icon: SolarFileSearch,
  },
  {
    group: "组织权限",
    title: "成员管理",
    description: "管理企业成员账号、所属部门与二次验证",
    keywords: "members users staff org",
    path: workspacePages["settings-org-members"].path,
    icon: SolarUsersGroupRounded,
  },
  {
    group: "组织权限",
    title: "角色权限",
    description: "配置角色目录、权限边界与权限矩阵",
    keywords: "roles permissions rbac matrix",
    path: workspacePages["settings-org-roles"].path,
    icon: SolarVerifiedCheck,
  },
  {
    group: "组织权限",
    title: "部门架构",
    description: "维护组织树层级、负责人与成本中心",
    keywords: "departments org tree cost center",
    path: workspacePages["settings-org-departments"].path,
    icon: SolarBuildings2,
  },
  {
    group: "系统配置",
    title: "基础信息",
    description: "维护组织资料、账期截止日与界面偏好",
    keywords: "basic info settings organization",
    path: workspacePages["settings-basic"].path,
    icon: SolarCog,
  },
  {
    group: "系统配置",
    title: "全局参数",
    description: "配置采集并发、重试策略与导出限额",
    keywords: "global params system config",
    path: workspacePages["settings-system-params"].path,
    icon: SolarCog,
  },
  {
    group: "集成通知",
    title: "应用集成",
    description: "管理云厂商账号接入、协作应用与 SSO",
    keywords: "integrations cloud sso oidc",
    path: workspacePages["settings-integrations-apps"].path,
    icon: SolarLayoutGrid,
  },
  {
    group: "集成通知",
    title: "群机器人",
    description: "配置飞书、企微、钉钉 Webhook 推送机器人",
    keywords: "bots webhook feishu wecom dingtalk",
    path: workspacePages["settings-integrations-bots"].path,
    icon: SolarBell,
  },
  {
    group: "集成通知",
    title: "消息规则",
    description: "设置账单异常与预算预警的通知渠道",
    keywords: "message rules alerts notifications",
    path: workspacePages["settings-integrations-rules"].path,
    icon: SolarMail,
  },
  {
    group: "安全审计",
    title: "安全策略",
    description: "管理密码强度、2FA 强制策略与 IP 白名单",
    keywords: "security policy 2fa ip allowlist",
    path: workspacePages["settings-security-policy"].path,
    icon: SolarShieldAlert,
  },
  {
    group: "安全审计",
    title: "操作日志",
    description: "检索登录会话、权限变更与配置审计记录",
    keywords: "audit logs history security",
    path: workspacePages["settings-security-audit"].path,
    icon: SolarFileSearch,
  },
  ...(
    [
      ["组件规范", "尺寸、圆角、字号与色彩", workspacePages.components.path],
      [
        "基础组件",
        "按钮、徽标、卡片等",
        workspacePages["components-basic"].path,
      ],
      [
        "表单与输入",
        "输入、选择、开关等",
        workspacePages["components-form"].path,
      ],
      [
        "导航",
        "页签、面包屑、分页",
        workspacePages["components-navigation"].path,
      ],
      [
        "浮层与反馈",
        "对话框、抽屉、提示",
        workspacePages["components-overlay"].path,
      ],
      [
        "数据展示",
        "表格、轮播、可调整面板",
        workspacePages["components-data"].path,
      ],
      [
        "图表汇总",
        "折线、面积、柱状、饼图、雷达",
        workspacePages["components-charts"].path,
      ],
      ["对话与 AI", "气泡、标记、附件", workspacePages["components-ai"].path],
    ] as const
  ).map(([title, description, path]) => ({
    group: "组件预览",
    title,
    description,
    keywords: "components shadcn ui preview design system",
    path,
    icon: SolarPalette,
  })),
  ...(
    [
      [
        "登录与账号",
        "登录、找回密码、动态口令、首次部署",
        workspacePages["base-login"].path,
      ],
      [
        "个人安全与二次验证",
        "动态口令启用、重绑、改密",
        workspacePages["base-security"].path,
      ],
      [
        "会话与异常",
        "未授权、过期、403/404/500、维护",
        workspacePages["base-session"].path,
      ],
    ] as const
  ).map(([title, description, path]) => ({
    group: "基础页面",
    title,
    description,
    keywords: "login security error 404 403 500 password totp",
    path,
    icon: SolarPalette,
  })),
  ...(
    [
      [
        "组件动效",
        "按压、悬浮、交错与展开",
        workspacePages["motion-components"].path,
      ],
      ["文字动效", "打字机、扫光、跑马灯", workspacePages["motion-text"].path],
      [
        "滚动动效",
        "滚动显现、叙事与视差",
        workspacePages["motion-scroll"].path,
      ],
      [
        "业务场景动效",
        "悬浮边框、3D、文字生成、时间线",
        workspacePages["motion-aceternity"].path,
      ],
      [
        "业务交互动效",
        "微光、状态按钮、多步骤加载、上传",
        workspacePages["motion-interaction"].path,
      ],
      [
        "图表动效",
        "图表生长、进度与数字滚动",
        workspacePages["motion-charts"].path,
      ],
      [
        "切换动效",
        "分段指示器与页面切换",
        workspacePages["motion-transitions"].path,
      ],
    ] as const
  ).map(([title, description, path]) => ({
    group: "动态效果",
    title,
    description,
    keywords: "motion animation transition",
    path,
    icon: SolarPalette,
  })),
]

function getModuleItems(activeModule: WorkspaceModuleId): CommandItem[] {
  const module = workspaceModules[activeModule]
  const seenPaths = new Set<string>()
  const primary: CommandItem[] = module.entries.flatMap<CommandItem>(
    (entry: WorkspaceEntry) => {
      if (entry.kind === "route") {
        return pages
          .filter(({ path }) => path === entry.to)
          .map((item) => {
            if (item.path) seenPaths.add(item.path)
            return item
          })
      }
      if (entry.kind === "folder") {
        return entry.children.flatMap<CommandItem>(({ label, to }) => {
          if (to) {
            return pages
              .filter(({ path }) => path === to)
              .map((item) => {
                if (item.path) seenPaths.add(item.path)
                return { ...item, group: entry.label }
              })
          }
          if (activeModule === "overview") return []
          return [
            {
              group: entry.label,
              title: label,
              description: "Demo 暂未开放",
              icon: entry.icon,
            },
          ]
        })
      }
      return [
        {
          group: module.label,
          title: entry.label,
          description: "Demo 暂未开放",
          icon: entry.icon,
        },
      ]
    }
  )

  const others = pages.filter((item) => !item.path || !seenPaths.has(item.path))
  return [...primary, ...others]
}

export function getModuleCommands(
  id: WorkspaceModuleId,
  tl: ReturnType<typeof useUiText>
): ModuleCommands {
  return {
    triggerLabel: tl("搜索页面、账单"),
    placeholder:
      id === "overview"
        ? tl("搜索运营总览、月账单…")
        : `${tl("搜索")} ${tl(workspaceModules[id].label)}…`,
    items: getModuleItems(id).map((item) => ({
      ...item,
      group: item.group ? tl(item.group) : undefined,
      title: tl.parts(item.title),
      description: tl(item.description),
    })),
  }
}
