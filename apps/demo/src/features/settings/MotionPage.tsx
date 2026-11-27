import { useEffect, useState } from "react"
import { AnimatePresence, animate, useMotionValue } from "motion/react"
import * as m from "motion/react-m"

import { Badge } from "@marismoon/ui/ui/badge"
import { Switch } from "@marismoon/ui/ui/switch"
import { Button } from "@marismoon/ui/ui/button"
import {
  BklitAreaDemo,
  BklitBarDemo,
  BklitComposedDemo,
  BklitFunnelDemo,
  BklitHeatmapDemo,
  BklitLineDemo,
  BklitLiveLineDemo,
  BklitLollipopDemo,
  BklitPieDemo,
  BklitRadarDemo,
  BklitRingDemo,
  BklitSparklineDemo,
  BklitSparklineKpiCardsDemo,
  BklitStackedBarDemo,
} from "./bklit-chart-demos"
import {
  AnimatedTooltipDemo,
  BentoGridDemo,
  Card3DDemo,
  CardHoverEffectDemo,
  FlipWordsDemo,
  GlareCardDemo,
  HoverBorderGradientDemo,
  InfiniteCardsDemo,
  MeteorsDemo,
  MovingBorderDemo,
  PlaceholderInputDemo,
  TextGenerateDemo,
  TracingBeamDemo,
} from "./aceternity-demos"
import {
  FileUploadDemo,
  FloatingDockDemo,
  GlowingEffectDemo,
  MultiStepLoaderDemo,
  RowReorderDemo,
  SidebarCollapseDemo,
  SlideOverDemo,
  StatefulButtonDemo,
  StatusPulseDemo,
  VanishInputDemo,
} from "./interaction-demos"
import {
  CommandFilterDemo,
  CopyButtonDemo,
  OverlayFamilyDemo,
  ProgressDemo,
  SavedStateDemo,
  SkeletonDemo,
  TabGlideDemo,
  ThemeRevealDemo,
  TodoListDemo,
} from "./aries-motion-demos"
import { Demo, spring, useReplay } from "./motion-shared"
import {
  BorderBeamDemo,
  EasingDemo,
  MagneticDemo,
  MarqueeDemo,
  ParallaxDemo,
  ScrollRevealDemo,
  ScrollStoryDemo,
  ShimmerDemo,
  SpotlightDemo,
  TypewriterDemo,
} from "./motion-demos"

/* ---------- 组件动效 ---------- */

function PressDemo() {
  return (
    <>
      <m.button
        type="button"
        whileTap={{ scale: 0.94 }}
        whileHover={{ y: -2 }}
        transition={spring}
        className="rounded-full bg-primary px-4 py-1.5 text-[13px] font-medium text-primary-foreground shadow-(--field-shadow)"
      >
        按压回弹
      </m.button>
      <m.div
        whileHover={{ y: -4, scale: 1.02 }}
        transition={spring}
        className="surface rounded-(--radius-panel) px-4 py-3 text-[13px]"
      >
        悬浮上浮卡片
      </m.div>
    </>
  )
}

function StaggerDemo() {
  const [run, replay] = useReplay()
  return (
    <Demo
      title="列表交错进入"
      usage="父级 variants 控制 staggerChildren，子项只声明 hidden / show"
      onReplay={replay}
    >
      <m.ul
        key={run}
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.07 } } }}
        className="grid w-full gap-1.5"
      >
        {["阿里云", "腾讯云", "华为云", "Azure"].map((name) => (
          <m.li
            key={name}
            variants={{
              hidden: { opacity: 0, y: 8 },
              show: { opacity: 1, y: 0 },
            }}
            className="flex items-center justify-between rounded-full bg-(--field-surface) px-3 py-1.5 text-[13px] shadow-(--field-shadow)"
          >
            {name}
            <Badge variant="blue">已采集</Badge>
          </m.li>
        ))}
      </m.ul>
    </Demo>
  )
}

function CollapseDemo() {
  const [open, setOpen] = useState(true)
  return (
    <Demo
      title="展开 / 收起"
      usage="AnimatePresence + height: auto，退出时同样动画"
    >
      <div className="grid w-full gap-2">
        <Button variant="outline" onClick={() => setOpen((value) => !value)}>
          {open ? "收起详情" : "展开详情"}
        </Button>
        <AnimatePresence initial={false}>
          {open && (
            <m.div
              key="body"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <p className="rounded-(--radius-control) bg-(--recess) p-3 text-[13px]">
                本期共 64 条账单，其中 5 条待人工处理。
              </p>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </Demo>
  )
}

function ToggleDemo() {
  const [on, setOn] = useState(false)
  return (
    <Demo title="状态反馈" usage="状态变化驱动 animate，颜色与位移同步过渡">
      <Switch checked={on} onCheckedChange={setOn} aria-label="动效开关" />
      <m.span
        animate={{
          opacity: on ? 1 : 0.5,
          x: on ? 0 : -4,
        }}
        transition={spring}
        className="text-[13px]"
      >
        {on ? "已开启" : "已关闭"}
      </m.span>
    </Demo>
  )
}

/* ---------- 数字动效 ---------- */

function CountDemo() {
  const [run, replay] = useReplay()
  const value = useMotionValue(0)
  const [text, setText] = useState("0")

  useEffect(() => {
    value.set(0)
    const stop = value.on("change", (latest) =>
      setText(Math.round(latest).toLocaleString("en-US"))
    )
    const controls = animate(value, 128640, {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1],
    })
    return () => {
      stop()
      controls.stop()
    }
  }, [run, value])

  return (
    <Demo
      title="数字滚动"
      usage="useMotionValue + animate，订阅 change 更新文本"
      onReplay={replay}
    >
      <span className="text-3xl font-semibold tabular-nums">¥{text}</span>
    </Demo>
  )
}

/* ---------- 切换动效 ---------- */

const tabs = ["本月", "本季", "本年"] as const

function TabsDemo() {
  const [index, setIndex] = useState(0)
  return (
    <Demo
      title="分段切换指示器"
      usage="固定宽度的选项 + 指示器 animate x，内容用 AnimatePresence 淡入"
    >
      <div className="grid w-full gap-3">
        <div className="relative flex w-fit rounded-full bg-(--recess) p-[3px]">
          <m.span
            aria-hidden
            className="absolute inset-y-[3px] left-[3px] w-16 rounded-full bg-(--layout-control) shadow-(--field-shadow)"
            animate={{ x: index * 64 }}
            transition={spring}
          />
          {tabs.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => setIndex(i)}
              className="relative z-10 h-7 w-16 rounded-full text-xs font-[620] text-muted-foreground aria-pressed:text-foreground"
              aria-pressed={index === i}
            >
              {label}
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <m.p
            key={index}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16 }}
            className="text-[13px]"
          >
            {tabs[index]}已出账 ¥
            {[128640, 392100, 1097300][index]!.toLocaleString("en-US")}
          </m.p>
        </AnimatePresence>
      </div>
    </Demo>
  )
}

function SlideDemo() {
  const [page, setPage] = useState(0)
  const [direction, setDirection] = useState(1)
  const go = (next: number) => {
    setDirection(next > page ? 1 : -1)
    setPage(next)
  }
  return (
    <Demo
      title="方向感知的页面切换"
      usage="AnimatePresence custom 传入方向，进入与退出沿同一方向滑动"
    >
      <div className="grid w-full gap-3">
        <div className="relative h-16 overflow-hidden rounded-(--radius-control) bg-(--recess)">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <m.div
              key={page}
              custom={direction}
              variants={{
                enter: (dir: number) => ({ x: dir * 40, opacity: 0 }),
                center: { x: 0, opacity: 1 },
                exit: (dir: number) => ({ x: dir * -40, opacity: 0 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 grid place-items-center text-[13px]"
            >
              第 {page + 1} 步
            </m.div>
          </AnimatePresence>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={page === 0}
            onClick={() => go(page - 1)}
          >
            上一步
          </Button>
          <Button disabled={page === 2} onClick={() => go(page + 1)}>
            下一步
          </Button>
        </div>
      </div>
    </Demo>
  )
}

const sections = {
  components: {
    demos: [
      <Demo
        key="press"
        title="Hover Lift 与按压"
        usage="whileHover 上浮、whileTap 回弹，搭配统一的 spring 参数"
      >
        <PressDemo />
      </Demo>,
      <BorderBeamDemo key="beam" />,
      <SpotlightDemo key="spot" />,
      <MagneticDemo key="magnetic" />,
      <StaggerDemo key="stagger" />,
      <CollapseDemo key="collapse" />,
      <ToggleDemo key="toggle" />,
      <CopyButtonDemo key="copy" />,
      <TodoListDemo key="todo" />,
      <SkeletonDemo key="skeleton" />,
      <ProgressDemo key="progress" />,
    ],
  },
  text: {
    demos: [
      <TypewriterDemo key="type" />,
      <ShimmerDemo key="shimmer" />,
      <MarqueeDemo key="marquee" />,
      <CountDemo key="count" />,
    ],
  },
  scroll: {
    demos: [
      <ScrollRevealDemo key="reveal" />,
      <ScrollStoryDemo key="story" />,
      <ParallaxDemo key="parallax" />,
    ],
  },
  aceternity: {
    demos: [
      <HoverBorderGradientDemo key="hbg" />,
      <MovingBorderDemo key="mb" />,
      <CardHoverEffectDemo key="che" />,
      <BentoGridDemo key="bento" />,
      <Card3DDemo key="3d" />,
      <GlareCardDemo key="glare" />,
      <AnimatedTooltipDemo key="tip" />,
      <TextGenerateDemo key="tg" />,
      <FlipWordsDemo key="flip" />,
      <PlaceholderInputDemo key="ph" />,
      <InfiniteCardsDemo key="inf" />,
      <TracingBeamDemo key="trace" />,
      <MeteorsDemo key="meteors" />,
    ],
  },
  interaction: {
    demos: [
      <GlowingEffectDemo key="glow" />,
      <StatefulButtonDemo key="stateful" />,
      <MultiStepLoaderDemo key="steps" />,
      <FileUploadDemo key="upload" />,
      <FloatingDockDemo key="dock" />,
      <SidebarCollapseDemo key="sidebar" />,
      <SlideOverDemo key="slide" />,
      <RowReorderDemo key="rows" />,
      <StatusPulseDemo key="pulse" />,
      <VanishInputDemo key="vanish" />,
      <CommandFilterDemo key="command" />,
    ],
  },
  charts: {
    demos: [
      <BklitLineDemo key="line" />,
      <BklitAreaDemo key="area" />,
      <BklitBarDemo key="bar" />,
      <BklitStackedBarDemo key="stacked" />,
      <BklitComposedDemo key="composed" />,
      <BklitPieDemo key="pie" />,
      <BklitRingDemo key="ring" />,
      <BklitRadarDemo key="radar" />,
      <BklitFunnelDemo key="funnel" />,
      <BklitLollipopDemo key="lollipop" />,
      <BklitHeatmapDemo key="heatmap" />,
      <BklitSparklineDemo key="sparkline" />,
      <BklitSparklineKpiCardsDemo key="sparkline-kpi" />,
      <BklitLiveLineDemo key="live-line" />,
    ],
  },
  transitions: {
    demos: [
      <TabsDemo key="tabs" />,
      <SlideDemo key="slide" />,
      <EasingDemo key="easing" />,
      <ThemeRevealDemo key="theme" />,
      <OverlayFamilyDemo key="overlays" />,
      <TabGlideDemo key="tab-glide" />,
      <SavedStateDemo key="saved" />,
    ],
  },
} as const

export type MotionSlug = keyof typeof sections

/** One 动态效果 page. Motion respects the user's reduced-motion setting through
 * the app-level MotionConfig, so every demo degrades to instant changes. */
export function MotionPage({ slug }: { slug: MotionSlug }) {
  const section = sections[slug]
  return (
    <div className="components-page">
      <div className="components-grid">{section.demos}</div>
    </div>
  )
}
