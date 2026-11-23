import {
  SolarLayoutGrid,
  SolarPalette,
  SolarReceiptText,
} from "@marismoon/ui/icons"
import type {
  CommandItem,
  ModuleCommands,
} from "@/components/layout/CommandPalette"
import {
  workspaceModules,
  type WorkspaceEntry,
  type WorkspaceModuleId,
} from "@/components/layout/workspace-modules"
import { workspacePages } from "./workspace-pages"
import { useUiText } from "@/lib/i18n/use-ui-text"

const pages = [
  {
    title: "运营总览",
    description: "查看出账与采集进度",
    keywords: "overview dashboard kpi",
    path: workspacePages.overview.path,
    icon: SolarLayoutGrid,
  },
  {
    title: "月账单",
    description: "搜索、筛选与查看账单明细",
    keywords: "bills billing invoices",
    path: workspacePages.bills.path,
    icon: SolarReceiptText,
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
      ["数据展示", "表格、图表", workspacePages["components-data"].path],
      ["对话与 AI", "气泡、标记、附件", workspacePages["components-ai"].path],
    ] as const
  ).map(([title, description, path]) => ({
    title: `组件预览 · ${title}`,
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
    title: `基础页面 · ${title}`,
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
    title: `动态效果 · ${title}`,
    description,
    keywords: "motion animation transition",
    path,
    icon: SolarPalette,
  })),
]

function getModuleItems(activeModule: WorkspaceModuleId) {
  const module = workspaceModules[activeModule]
  return module.entries.flatMap<CommandItem>((entry: WorkspaceEntry) => {
    if (entry.kind === "route") {
      return pages.filter(({ path }) => path === entry.to)
    }
    if (entry.kind === "folder") {
      return entry.children.flatMap<CommandItem>(({ label, to }) => {
        if (to) return pages.filter(({ path }) => path === to)
        if (activeModule === "overview") return []
        return [
          { title: label, description: "Demo 暂未开放", icon: entry.icon },
        ]
      })
    }
    return [
      { title: entry.label, description: "Demo 暂未开放", icon: entry.icon },
    ]
  })
}

export function useModuleCommands() {
  const tl = useUiText()
  return (id: WorkspaceModuleId): ModuleCommands => ({
    triggerLabel: tl("搜索页面、账单"),
    placeholder:
      id === "overview"
        ? tl("搜索运营总览、月账单…")
        : `${tl("搜索")} ${tl(workspaceModules[id].label)}…`,
    items: getModuleItems(id).map((item) => ({
      ...item,
      title: tl.parts(item.title),
      description: tl(item.description),
    })),
  })
}
