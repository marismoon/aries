import type { WorkspacePageSlots } from "@/components/layout/WorkspacePage"

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
    descriptionKey: "bills.description",
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
} as const satisfies Record<string, WorkspacePageConfig>

export type WorkspacePagePath =
  (typeof workspacePages)[keyof typeof workspacePages]["path"]
