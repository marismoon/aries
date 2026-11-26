import type { WorkspacePageSlots } from "@marismoon/shell"

export interface WorkspacePageConfig {
  id: string
  moduleId: string
  path: string
  titleKey: string
  descriptionKey?: string
  breadcrumbs: readonly { label: string; path?: string }[]
  load: () => Promise<WorkspacePageSlots>
}

export const workspacePages = {
  overview: {
    id: "overview",
    moduleId: "overview",
    path: "/overview",
    titleKey: "overview.title",
    breadcrumbs: [{ label: "总览" }],
    load: async () => {
      const { OverviewPage, OverviewSubtitle } =
        await import("@/features/overview/OverviewPage")
      return { Content: OverviewPage, Subtitle: OverviewSubtitle }
    },
  },
  bills: {
    id: "bills",
    moduleId: "overview",
    path: "/bills",
    titleKey: "bills.title",
    breadcrumbs: [{ label: "账务" }],
    load: async () => {
      const { BillsPage, BillsTotals, BillsBreadcrumbDetail } =
        await import("@/features/bills/BillsPage")
      return {
        Content: BillsPage,
        Summary: BillsTotals,
        BreadcrumbDetail: BillsBreadcrumbDetail,
      }
    },
  },
  components: {
    id: "components",
    moduleId: "settings",
    path: "/settings/components",
    titleKey: "components.title",
    descriptionKey: "components.description",
    breadcrumbs: [{ label: "系统设置" }],
    load: async () => {
      const { ComponentsPage } =
        await import("@/features/settings/ComponentsPage")
      return { Content: ComponentsPage }
    },
  },
  "components-basic": {
    id: "components-basic",
    moduleId: "settings",
    path: "/settings/components/basic",
    titleKey: "components.basic",
    descriptionKey: "components.basicDescription",
    breadcrumbs: [{ label: "系统设置" }, { label: "组件预览" }],
    load: async () => {
      const { ComponentCategoryPage } =
        await import("@/features/settings/ComponentCategoryPage")
      return { Content: () => <ComponentCategoryPage slug="basic" /> }
    },
  },
  "components-form": {
    id: "components-form",
    moduleId: "settings",
    path: "/settings/components/form",
    titleKey: "components.form",
    descriptionKey: "components.formDescription",
    breadcrumbs: [{ label: "系统设置" }, { label: "组件预览" }],
    load: async () => {
      const { ComponentCategoryPage } =
        await import("@/features/settings/ComponentCategoryPage")
      return { Content: () => <ComponentCategoryPage slug="form" /> }
    },
  },
  "components-navigation": {
    id: "components-navigation",
    moduleId: "settings",
    path: "/settings/components/navigation",
    titleKey: "components.navigation",
    descriptionKey: "components.navigationDescription",
    breadcrumbs: [{ label: "系统设置" }, { label: "组件预览" }],
    load: async () => {
      const { ComponentCategoryPage } =
        await import("@/features/settings/ComponentCategoryPage")
      return { Content: () => <ComponentCategoryPage slug="navigation" /> }
    },
  },
  "components-overlay": {
    id: "components-overlay",
    moduleId: "settings",
    path: "/settings/components/overlay",
    titleKey: "components.overlay",
    descriptionKey: "components.overlayDescription",
    breadcrumbs: [{ label: "系统设置" }, { label: "组件预览" }],
    load: async () => {
      const { ComponentCategoryPage } =
        await import("@/features/settings/ComponentCategoryPage")
      return { Content: () => <ComponentCategoryPage slug="overlay" /> }
    },
  },
  "components-data": {
    id: "components-data",
    moduleId: "settings",
    path: "/settings/components/data",
    titleKey: "components.data",
    descriptionKey: "components.dataDescription",
    breadcrumbs: [{ label: "系统设置" }, { label: "组件预览" }],
    load: async () => {
      const { ComponentCategoryPage } =
        await import("@/features/settings/ComponentCategoryPage")
      return { Content: () => <ComponentCategoryPage slug="data" /> }
    },
  },
  "components-ai": {
    id: "components-ai",
    moduleId: "settings",
    path: "/settings/components/ai",
    titleKey: "components.ai",
    descriptionKey: "components.aiDescription",
    breadcrumbs: [{ label: "系统设置" }, { label: "组件预览" }],
    load: async () => {
      const { ComponentCategoryPage } =
        await import("@/features/settings/ComponentCategoryPage")
      return { Content: () => <ComponentCategoryPage slug="ai" /> }
    },
  },
  "motion-components": {
    id: "motion-components",
    moduleId: "settings",
    path: "/settings/motion/components",
    titleKey: "motion.components",
    descriptionKey: "motion.componentsDescription",
    breadcrumbs: [{ label: "系统设置" }, { label: "动态效果" }],
    load: async () => {
      const { MotionPage } = await import("@/features/settings/MotionPage")
      return { Content: () => <MotionPage slug="components" /> }
    },
  },
  "motion-text": {
    id: "motion-text",
    moduleId: "settings",
    path: "/settings/motion/text",
    titleKey: "motion.text",
    descriptionKey: "motion.textDescription",
    breadcrumbs: [{ label: "系统设置" }, { label: "动态效果" }],
    load: async () => {
      const { MotionPage } = await import("@/features/settings/MotionPage")
      return { Content: () => <MotionPage slug="text" /> }
    },
  },
  "motion-scroll": {
    id: "motion-scroll",
    moduleId: "settings",
    path: "/settings/motion/scroll",
    titleKey: "motion.scroll",
    descriptionKey: "motion.scrollDescription",
    breadcrumbs: [{ label: "系统设置" }, { label: "动态效果" }],
    load: async () => {
      const { MotionPage } = await import("@/features/settings/MotionPage")
      return { Content: () => <MotionPage slug="scroll" /> }
    },
  },
  "motion-aceternity": {
    id: "motion-aceternity",
    moduleId: "settings",
    path: "/settings/motion/aceternity",
    titleKey: "motion.aceternity",
    descriptionKey: "motion.aceternityDescription",
    breadcrumbs: [{ label: "系统设置" }, { label: "动态效果" }],
    load: async () => {
      const { MotionPage } = await import("@/features/settings/MotionPage")
      return { Content: () => <MotionPage slug="aceternity" /> }
    },
  },
  "motion-interaction": {
    id: "motion-interaction",
    moduleId: "settings",
    path: "/settings/motion/interaction",
    titleKey: "motion.interaction",
    descriptionKey: "motion.interactionDescription",
    breadcrumbs: [{ label: "系统设置" }, { label: "动态效果" }],
    load: async () => {
      const { MotionPage } = await import("@/features/settings/MotionPage")
      return { Content: () => <MotionPage slug="interaction" /> }
    },
  },
  "motion-charts": {
    id: "motion-charts",
    moduleId: "settings",
    path: "/settings/motion/charts",
    titleKey: "motion.charts",
    descriptionKey: "motion.chartsDescription",
    breadcrumbs: [{ label: "系统设置" }, { label: "动态效果" }],
    load: async () => {
      const { MotionPage } = await import("@/features/settings/MotionPage")
      return { Content: () => <MotionPage slug="charts" /> }
    },
  },
  "motion-transitions": {
    id: "motion-transitions",
    moduleId: "settings",
    path: "/settings/motion/transitions",
    titleKey: "motion.transitions",
    descriptionKey: "motion.transitionsDescription",
    breadcrumbs: [{ label: "系统设置" }, { label: "动态效果" }],
    load: async () => {
      const { MotionPage } = await import("@/features/settings/MotionPage")
      return { Content: () => <MotionPage slug="transitions" /> }
    },
  },
  "base-login": {
    id: "base-login",
    moduleId: "settings",
    path: "/settings/base/login",
    titleKey: "base.login",
    descriptionKey: "base.loginDescription",
    breadcrumbs: [{ label: "系统设置" }, { label: "基础页面" }],
    load: async () => {
      const { BasePagesPage } =
        await import("@/features/settings/base-pages/BasePagesPage")
      return { Content: () => <BasePagesPage slug="login" /> }
    },
  },
  "settings-org-members": {
    id: "settings-org-members",
    moduleId: "settings",
    path: "/settings/org/members",
    titleKey: "settingsOrg.membersTitle",
    breadcrumbs: [{ label: "系统设置" }, { label: "组织权限" }],
    load: async () => {
      const { MembersPage, MembersSummary } =
        await import("@/features/settings/org/MembersPage")
      return { Content: MembersPage, Summary: MembersSummary }
    },
  },
  "settings-org-roles": {
    id: "settings-org-roles",
    moduleId: "settings",
    path: "/settings/org/roles",
    titleKey: "settingsOrg.rolesTitle",
    breadcrumbs: [{ label: "系统设置" }, { label: "组织权限" }],
    load: async () => {
      const { RolesPage, RolesSummary } =
        await import("@/features/settings/org/RolesPage")
      return { Content: RolesPage, Summary: RolesSummary }
    },
  },
  "settings-org-departments": {
    id: "settings-org-departments",
    moduleId: "settings",
    path: "/settings/org/departments",
    titleKey: "settingsOrg.departmentsTitle",
    breadcrumbs: [{ label: "系统设置" }, { label: "组织权限" }],
    load: async () => {
      const { DepartmentsPage, DepartmentsSummary } =
        await import("@/features/settings/org/DepartmentsPage")
      return { Content: DepartmentsPage, Summary: DepartmentsSummary }
    },
  },
  "settings-basic": {
    id: "settings-basic",
    moduleId: "settings",
    path: "/settings/system/basic",
    titleKey: "settingsBasic.title",
    breadcrumbs: [{ label: "系统设置" }, { label: "系统配置" }],
    load: async () => {
      const { BasicInfoPage } =
        await import("@/features/settings/basic-info/BasicInfoPage")
      return { Content: BasicInfoPage }
    },
  },
  "settings-system-params": {
    id: "settings-system-params",
    moduleId: "settings",
    path: "/settings/system/params",
    titleKey: "settingsSystem.paramsTitle",
    breadcrumbs: [{ label: "系统设置" }, { label: "系统配置" }],
    load: async () => {
      const { GlobalParamsPage } =
        await import("@/features/settings/system/GlobalParamsPage")
      return { Content: GlobalParamsPage }
    },
  },
  "settings-integrations-apps": {
    id: "settings-integrations-apps",
    moduleId: "settings",
    path: "/settings/integrations/apps",
    titleKey: "settingsIntegrations.appsTitle",
    breadcrumbs: [{ label: "系统设置" }, { label: "集成通知" }],
    load: async () => {
      const { AppsIntegrationPage } =
        await import("@/features/settings/integrations/AppsIntegrationPage")
      return { Content: AppsIntegrationPage }
    },
  },
  "settings-integrations-bots": {
    id: "settings-integrations-bots",
    moduleId: "settings",
    path: "/settings/integrations/bots",
    titleKey: "settingsIntegrations.botsTitle",
    breadcrumbs: [{ label: "系统设置" }, { label: "集成通知" }],
    load: async () => {
      const { GroupBotsPage } =
        await import("@/features/settings/integrations/GroupBotsPage")
      return { Content: GroupBotsPage }
    },
  },
  "settings-integrations-rules": {
    id: "settings-integrations-rules",
    moduleId: "settings",
    path: "/settings/integrations/rules",
    titleKey: "settingsIntegrations.rulesTitle",
    breadcrumbs: [{ label: "系统设置" }, { label: "集成通知" }],
    load: async () => {
      const { MessageRulesPage, MessageRulesSummary } =
        await import("@/features/settings/integrations/MessageRulesPage")
      return { Content: MessageRulesPage, Summary: MessageRulesSummary }
    },
  },
  "settings-security-policy": {
    id: "settings-security-policy",
    moduleId: "settings",
    path: "/settings/security/policy",
    titleKey: "settingsSecurity.policyTitle",
    breadcrumbs: [{ label: "系统设置" }, { label: "安全审计" }],
    load: async () => {
      const { SecurityPolicyPage } =
        await import("@/features/settings/security/SecurityPolicyPage")
      return { Content: SecurityPolicyPage }
    },
  },
  "settings-security-audit": {
    id: "settings-security-audit",
    moduleId: "settings",
    path: "/settings/security/audit-log",
    titleKey: "settingsSecurity.auditTitle",
    breadcrumbs: [{ label: "系统设置" }, { label: "安全审计" }],
    load: async () => {
      const { AuditLogPage, AuditLogSummary } =
        await import("@/features/settings/security/AuditLogPage")
      return { Content: AuditLogPage, Summary: AuditLogSummary }
    },
  },
  "base-security": {
    id: "base-security",
    moduleId: "settings",
    path: "/settings/base/security",
    titleKey: "base.security",
    descriptionKey: "base.securityDescription",
    breadcrumbs: [{ label: "系统设置" }, { label: "基础页面" }],
    load: async () => {
      const { BasePagesPage } =
        await import("@/features/settings/base-pages/BasePagesPage")
      return { Content: () => <BasePagesPage slug="security" /> }
    },
  },
  "base-session": {
    id: "base-session",
    moduleId: "settings",
    path: "/settings/base/session",
    titleKey: "base.session",
    descriptionKey: "base.sessionDescription",
    breadcrumbs: [{ label: "系统设置" }, { label: "基础页面" }],
    load: async () => {
      const { BasePagesPage } =
        await import("@/features/settings/base-pages/BasePagesPage")
      return { Content: () => <BasePagesPage slug="session" /> }
    },
  },
  "notifications-center": {
    id: "notifications-center",
    moduleId: "notifications",
    path: "/notifications/center",
    titleKey: "notifications.centerTitle",
    breadcrumbs: [{ label: "告警通知" }, { label: "告警监控" }],
    load: async () => {
      const { AlertCenterPage, AlertCenterSummary } =
        await import("@/features/notifications/AlertCenterPage")
      return {
        Content: () => <AlertCenterPage preset="all" />,
        Summary: () => <AlertCenterSummary preset="all" />,
      }
    },
  },
  "notifications-pending": {
    id: "notifications-pending",
    moduleId: "notifications",
    path: "/notifications/pending",
    titleKey: "notifications.pendingTitle",
    breadcrumbs: [{ label: "告警通知" }, { label: "告警监控" }],
    load: async () => {
      const { AlertCenterPage, AlertCenterSummary } =
        await import("@/features/notifications/AlertCenterPage")
      return {
        Content: () => <AlertCenterPage preset="pending" />,
        Summary: () => <AlertCenterSummary preset="pending" />,
      }
    },
  },
  "notifications-rules": {
    id: "notifications-rules",
    moduleId: "notifications",
    path: "/notifications/rules",
    titleKey: "notifications.rulesTitle",
    breadcrumbs: [{ label: "告警通知" }, { label: "规则与值守" }],
    load: async () => {
      const { AlertRulesPage, AlertRulesSummary } =
        await import("@/features/notifications/AlertRulesPage")
      return { Content: AlertRulesPage, Summary: AlertRulesSummary }
    },
  },
  "notifications-silences": {
    id: "notifications-silences",
    moduleId: "notifications",
    path: "/notifications/silences",
    titleKey: "notifications.silencesTitle",
    breadcrumbs: [{ label: "告警通知" }, { label: "规则与值守" }],
    load: async () => {
      const { SilencesOnCallPage, SilencesSummary } =
        await import("@/features/notifications/SilencesOnCallPage")
      return { Content: SilencesOnCallPage, Summary: SilencesSummary }
    },
  },
  "notifications-logs": {
    id: "notifications-logs",
    moduleId: "notifications",
    path: "/notifications/logs",
    titleKey: "notifications.logsTitle",
    breadcrumbs: [{ label: "告警通知" }, { label: "通知管理" }],
    load: async () => {
      const { NotificationLogsPage, NotificationLogsSummary } =
        await import("@/features/notifications/NotificationLogsPage")
      return { Content: NotificationLogsPage, Summary: NotificationLogsSummary }
    },
  },
  "notifications-preferences": {
    id: "notifications-preferences",
    moduleId: "notifications",
    path: "/notifications/preferences",
    titleKey: "notifications.preferencesTitle",
    breadcrumbs: [{ label: "告警通知" }, { label: "通知管理" }],
    load: async () => {
      const { NotificationPreferencesPage } =
        await import("@/features/notifications/NotificationPreferencesPage")
      return { Content: NotificationPreferencesPage }
    },
  },
  "notifications-severity-critical": {
    id: "notifications-severity-critical",
    moduleId: "notifications",
    path: "/notifications/severity/critical",
    titleKey: "notifications.criticalTitle",
    breadcrumbs: [{ label: "告警通知" }, { label: "告警级别" }],
    load: async () => {
      const { AlertCenterPage, AlertCenterSummary } =
        await import("@/features/notifications/AlertCenterPage")
      return {
        Content: () => <AlertCenterPage preset="critical" />,
        Summary: () => <AlertCenterSummary preset="critical" />,
      }
    },
  },
  "notifications-severity-normal": {
    id: "notifications-severity-normal",
    moduleId: "notifications",
    path: "/notifications/severity/normal",
    titleKey: "notifications.normalTitle",
    breadcrumbs: [{ label: "告警通知" }, { label: "告警级别" }],
    load: async () => {
      const { AlertCenterPage, AlertCenterSummary } =
        await import("@/features/notifications/AlertCenterPage")
      return {
        Content: () => <AlertCenterPage preset="normal" />,
        Summary: () => <AlertCenterSummary preset="normal" />,
      }
    },
  },
  "analytics-platform-overview": {
    id: "analytics-platform-overview",
    moduleId: "analytics",
    path: "/analytics/platform-overview",
    titleKey: "analytics.platformOverviewTitle",
    breadcrumbs: [{ label: "数据分析" }, { label: "平台数据" }],
    load: async () => {
      const { PlatformOverviewPage, PlatformOverviewSummary } =
        await import("@/features/analytics/PlatformAnalyticsPages")
      return {
        Content: PlatformOverviewPage,
        Summary: PlatformOverviewSummary,
      }
    },
  },
  "analytics-platform-tenants": {
    id: "analytics-platform-tenants",
    moduleId: "analytics",
    path: "/analytics/platform-tenants",
    titleKey: "analytics.platformTenantsTitle",
    breadcrumbs: [{ label: "数据分析" }, { label: "平台数据" }],
    load: async () => {
      const { PlatformTenantsPage, PlatformTenantsSummary } =
        await import("@/features/analytics/PlatformAnalyticsPages")
      return {
        Content: PlatformTenantsPage,
        Summary: PlatformTenantsSummary,
      }
    },
  },
  "analytics-backend-api": {
    id: "analytics-backend-api",
    moduleId: "analytics",
    path: "/analytics/backend-api",
    titleKey: "analytics.backendApiTitle",
    breadcrumbs: [{ label: "数据分析" }, { label: "后台数据" }],
    load: async () => {
      const { BackendApiPage, BackendApiSummary } =
        await import("@/features/analytics/BackendAnalyticsPages")
      return {
        Content: BackendApiPage,
        Summary: BackendApiSummary,
      }
    },
  },
  "analytics-backend-storage": {
    id: "analytics-backend-storage",
    moduleId: "analytics",
    path: "/analytics/backend-storage",
    titleKey: "analytics.backendStorageTitle",
    breadcrumbs: [{ label: "数据分析" }, { label: "后台数据" }],
    load: async () => {
      const { BackendStoragePage, BackendStorageSummary } =
        await import("@/features/analytics/BackendAnalyticsPages")
      return {
        Content: BackendStoragePage,
        Summary: BackendStorageSummary,
      }
    },
  },
  "analytics-system-infra": {
    id: "analytics-system-infra",
    moduleId: "analytics",
    path: "/analytics/system-infra",
    titleKey: "analytics.systemInfraTitle",
    breadcrumbs: [{ label: "数据分析" }, { label: "系统数据" }],
    load: async () => {
      const { SystemInfraPage, SystemInfraSummary } =
        await import("@/features/analytics/SystemAnalyticsPages")
      return {
        Content: SystemInfraPage,
        Summary: SystemInfraSummary,
      }
    },
  },
  "analytics-system-sla": {
    id: "analytics-system-sla",
    moduleId: "analytics",
    path: "/analytics/system-sla",
    titleKey: "analytics.systemSlaTitle",
    breadcrumbs: [{ label: "数据分析" }, { label: "系统数据" }],
    load: async () => {
      const { SystemSlaPage, SystemSlaSummary } =
        await import("@/features/analytics/SystemAnalyticsPages")
      return {
        Content: SystemSlaPage,
        Summary: SystemSlaSummary,
      }
    },
  },
  "analytics-cost-overview": {
    id: "analytics-cost-overview",
    moduleId: "analytics",
    path: "/analytics/cost-overview",
    titleKey: "analytics.costOverviewTitle",
    breadcrumbs: [{ label: "数据分析" }, { label: "成本数据" }],
    load: async () => {
      const { CostOverviewPage, CostOverviewSummary } =
        await import("@/features/analytics/CostAnalyticsPages")
      return {
        Content: CostOverviewPage,
        Summary: CostOverviewSummary,
      }
    },
  },
  "analytics-cost-allocation": {
    id: "analytics-cost-allocation",
    moduleId: "analytics",
    path: "/analytics/cost-allocation",
    titleKey: "analytics.costAllocationTitle",
    breadcrumbs: [{ label: "数据分析" }, { label: "成本数据" }],
    load: async () => {
      const { CostAllocationPage, CostAllocationSummary } =
        await import("@/features/analytics/CostAnalyticsPages")
      return {
        Content: CostAllocationPage,
        Summary: CostAllocationSummary,
      }
    },
  },
  "analytics-insights-ai": {
    id: "analytics-insights-ai",
    moduleId: "analytics",
    path: "/analytics/insights-ai",
    titleKey: "analytics.aiInsightsTitle",
    breadcrumbs: [{ label: "数据分析" }, { label: "洞察报告" }],
    load: async () => {
      const { AiInsightsPage, AiInsightsSummary } =
        await import("@/features/analytics/InsightsReportsPages")
      return {
        Content: AiInsightsPage,
        Summary: AiInsightsSummary,
      }
    },
  },
  "analytics-insights-reports": {
    id: "analytics-insights-reports",
    moduleId: "analytics",
    path: "/analytics/insights-reports",
    titleKey: "analytics.customReportsTitle",
    breadcrumbs: [{ label: "数据分析" }, { label: "洞察报告" }],
    load: async () => {
      const { CustomReportsPage, CustomReportsSummary } =
        await import("@/features/analytics/InsightsReportsPages")
      return {
        Content: CustomReportsPage,
        Summary: CustomReportsSummary,
      }
    },
  },
} as const satisfies Record<string, WorkspacePageConfig>

export type WorkspacePagePath =
  (typeof workspacePages)[keyof typeof workspacePages]["path"]
