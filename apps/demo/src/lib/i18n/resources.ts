export const resources = {
  "zh-CN": {
    translation: {
      settingsBasic: {
        title: "基础信息",
        description: "组织资料、账期与币种、区域显示与数据保留。",
      },
      overview: {
        title: "运营总览",
        description: "跟踪本期出账、采集进度与待处理事项。",
        openBills: "查看月账单",
        billingSummary: "出账概况",
        accounts: "云账号",
        pending: "待人工处理",
      },
      bills: {
        title: "月账单",
        description: "按供应商、状态和币种核对本期云账单。",
        issuedByCurrency: "原币出账汇总",
        register: "账单明细",
      },
      components: {
        title: "组件规范",
        description: "尺寸、圆角、字号与色彩：新页面直接使用的唯一规范。",
        basic: "基础组件",
        basicDescription: "按钮、徽标、卡片、提示、加载与空状态等基础组件。",
        form: "表单与输入",
        formDescription: "输入、选择、开关、日期等表单控件。",
        navigation: "导航",
        navigationDescription: "页签、面包屑、分页、菜单与导航栏。",
        overlay: "浮层与反馈",
        overlayDescription: "对话框、抽屉、弹出层、菜单、提示与通知。",
        data: "数据展示",
        dataDescription: "表格、图表、轮播与可调整面板。",
        ai: "对话与 AI",
        aiDescription: "对话气泡、标记与附件。",
      },
      base: {
        login: "登录与账号",
        loginDescription: "登录、找回密码、动态口令、选择企业主体与首次部署。",
        security: "个人安全与二次验证",
        securityDescription: "动态口令的启用、重新绑定、关闭，以及自助改密。",
        session: "会话与异常",
        sessionDescription: "未授权、登录过期、权限不足与服务异常页面。",
      },
      motion: {
        components: "组件动效",
        componentsDescription:
          "悬浮上浮、流光边框、聚光、磁吸、交错、展开收起与状态反馈。",
        text: "文字动效",
        textDescription: "打字机、扫光、跑马灯与数字滚动。",
        scroll: "滚动动效",
        scrollDescription: "滚动显现、滚动叙事与视差。",
        aceternity: "业务场景动效",
        aceternityDescription:
          "参考 Aceternity UI：悬浮边框、卡片高亮、3D、文字生成、时间线等 SaaS 常用效果。",
        interaction: "业务交互动效",
        interactionDescription:
          "边缘微光、状态按钮、多步骤加载、上传、快捷栏、侧栏、侧滑面板与状态脉冲。",
        charts: "图表动效",
        chartsDescription: "折线、面积、柱状、堆叠、饼图、雷达与环形进度。",
        transitions: "切换动效",
        transitionsDescription: "分段指示器、方向感知的页面切换与缓动对比。",
      },
    },
  },
  en: {
    translation: {
      settingsBasic: {
        title: "Basics",
        description:
          "Organization profile, billing period and currency, regional display and data retention.",
      },
      overview: {
        title: "Operations overview",
        description:
          "Track billing, collection progress and items requiring attention.",
        openBills: "View monthly bills",
        billingSummary: "Billing at a glance",
        accounts: "Cloud accounts",
        pending: "Needs manual review",
      },
      bills: {
        title: "Monthly bills",
        description: "Review cloud bills by provider, status and currency.",
        issuedByCurrency: "Issued totals by currency",
        register: "Billing register",
      },
      components: {
        title: "Component standard",
        description:
          "Sizes, radii, type and colour: the one standard new pages use.",
        basic: "Basic components",
        basicDescription:
          "Buttons, badges, cards, alerts, loading and empty states.",
        form: "Forms and inputs",
        formDescription:
          "Inputs, selects, switches, dates and other form controls.",
        navigation: "Navigation",
        navigationDescription:
          "Tabs, breadcrumbs, pagination, menus and navigation bars.",
        overlay: "Overlays and feedback",
        overlayDescription:
          "Dialogs, drawers, popovers, menus, tooltips and toasts.",
        data: "Data display",
        dataDescription: "Tables, charts, carousels and resizable panels.",
        ai: "Chat and AI",
        aiDescription: "Chat bubbles, markers and attachments.",
      },
      base: {
        login: "Sign-in and account",
        loginDescription:
          "Sign in, password reset, one-time code, organization selection and first setup.",
        security: "Security and two-factor",
        securityDescription:
          "Enable, rebind and disable the one-time code, and change your password.",
        session: "Sessions and errors",
        sessionDescription:
          "Unauthorized, expired session, forbidden and server error pages.",
      },
      motion: {
        components: "Component motion",
        componentsDescription:
          "Hover lift, glowing borders, spotlight, magnet, stagger, expand and state feedback.",
        aceternity: "Scenario motion",
        aceternityDescription:
          "Aceternity-style SaaS effects: hover borders, card highlights, 3D, text generation and timelines.",
        interaction: "Interaction motion",
        interactionDescription:
          "Edge glow, status buttons, multi-step loading, upload, dock, sidebar, slide-over and status pulse.",
        text: "Text motion",
        textDescription: "Typewriter, shimmer, marquee and number roll.",
        scroll: "Scroll motion",
        scrollDescription: "Scroll reveal, scroll narrative and parallax.",
        charts: "Chart motion",
        chartsDescription:
          "Line, area, bar, stacked, pie, radar and ring progress.",
        transitions: "Transition motion",
        transitionsDescription:
          "Segment indicator, direction-aware page transitions and easing comparison.",
      },
    },
  },
} as const
