import { useEffect, useRef, useState } from "react"
import {
  AnimatePresence,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react"
import * as m from "motion/react-m"

import { Button } from "@marismoon/ui/ui/button"
import { Input } from "@marismoon/ui/ui/input"
import { Demo, useReplay } from "./motion-shared"
import "./aceternity-demos.css"

/* Patterns follow Aceternity UI (motion + Tailwind), rewritten with the
   project's tokens and without layout animations (the app loads the lite
   motion feature set). */

/** Hover Border Gradient: the border lights up and rotates on hover. */
export function HoverBorderGradientDemo() {
  return (
    <Demo
      title="Hover Border Gradient 悬浮渐变边框"
      usage="主操作按钮外包 .glow-ring + data-on-hover，悬停时出现与 AI 输入框相同的流光边框"
    >
      <span className="glow-ring inline-block rounded-full" data-on-hover>
        <Button size="default" className="ace-hover-border-button">
          创建采集任务
        </Button>
      </span>
    </Demo>
  )
}

/** Moving Border: a light travels along the card edge. */
export function MovingBorderDemo() {
  return (
    <Demo
      title="Moving Border 移动边框"
      usage="重点卡片：offset-path 让光点沿圆角矩形匀速环绕，光点颜色取流光变量"
    >
      <div className="ace-moving-border w-full">
        <div className="ace-moving-border-body">
          <p className="text-[13px] font-medium">采集通道 API 运行正常</p>
          <p className="text-xs text-muted-foreground">最近同步 2 分钟前</p>
        </div>
      </div>
    </Demo>
  )
}

const features = [
  ["账单采集", "API / 邮件 / RPA 多通道汇集"],
  ["智能解析", "识别账期、币种与金额"],
  ["凭证归档", "凭证与发票自动关联"],
  ["成本分析", "按供应商与项目拆解"],
] as const

/** Card Hover Effect: a highlight slides between cards. */
export function CardHoverEffectDemo() {
  const [hovered, setHovered] = useState<number | null>(null)
  return (
    <Demo
      title="Card Hover Effect 卡片悬浮高亮"
      usage="容器记录悬停索引，高亮层用 AnimatePresence 淡入淡出（无需 layoutId）"
    >
      <div className="grid w-full grid-cols-2 gap-1">
        {features.map(([title, text], index) => (
          <div
            key={title}
            className="relative p-1"
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered(null)}
          >
            <AnimatePresence>
              {hovered === index && (
                <m.span
                  className="absolute inset-0 rounded-(--radius-control) bg-accent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { delay: 0.1 } }}
                  transition={{ duration: 0.15 }}
                />
              )}
            </AnimatePresence>
            <div className="relative p-2">
              <p className="text-[13px] font-semibold">{title}</p>
              <p className="text-xs text-muted-foreground">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </Demo>
  )
}

/** Text Generate Effect: words fade in from blur one by one. */
function Words({ text }: { text: string }) {
  return (
    <m.p
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.06 } } }}
      className="text-[13px] leading-relaxed"
    >
      {text.split("").map((char, index) => (
        <m.span
          key={index}
          variants={{
            hidden: { opacity: 0, filter: "blur(6px)" },
            show: { opacity: 1, filter: "blur(0px)" },
          }}
          transition={{ duration: 0.4 }}
        >
          {char}
        </m.span>
      ))}
    </m.p>
  )
}

export function TextGenerateDemo() {
  const [run, replay] = useReplay()
  return (
    <Demo
      title="Text Generate Effect 文字生成"
      usage="逐字 blur → 清晰，staggerChildren 控制节奏；适合 AI 回复"
      onReplay={replay}
    >
      <Words key={run} text="本期共 64 条账单，其中 5 条需要人工介入处理。" />
    </Demo>
  )
}

/** Flip Words: a word is replaced by the next with blur in and out. */
export function FlipWordsDemo() {
  const words = ["账单采集", "凭证归档", "发票核对", "成本分摊"]
  const [index, setIndex] = useState(0)
  useEffect(() => {
    // Reduced motion: no automatic rotation; the first word stays.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const timer = window.setInterval(
      () => setIndex((value) => (value + 1) % words.length),
      2200
    )
    return () => window.clearInterval(timer)
  }, [words.length])
  return (
    <Demo
      title="Flip Words 词语翻转"
      usage="AnimatePresence mode=wait，旧词上移模糊退出、新词下方进入"
    >
      <p className="text-lg font-semibold">
        自动化
        <span className="relative ms-1 inline-block min-w-24 text-primary">
          <AnimatePresence mode="wait" initial={false}>
            <m.span
              key={words[index]}
              className="inline-block"
              initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
              transition={{ duration: 0.3 }}
            >
              {words[index]}
            </m.span>
          </AnimatePresence>
        </span>
      </p>
    </Demo>
  )
}

const people = ["陈雨", "李明", "王芳", "赵磊"]

/** Animated Tooltip: avatar tooltips tilt with the pointer. */
function PersonTip({ name, index }: { name: string; index: number }) {
  const [open, setOpen] = useState(false)
  const x = useMotionValue(0)
  const rotate = useSpring(useTransform(x, [-50, 50], [-12, 12]), {
    stiffness: 100,
    damping: 15,
  })
  const shift = useSpring(useTransform(x, [-50, 50], [-14, 14]), {
    stiffness: 100,
    damping: 15,
  })
  return (
    <div
      className="relative -ms-2 first:ms-0"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onMouseMove={(event) =>
        x.set(event.nativeEvent.offsetX - event.currentTarget.offsetWidth / 2)
      }
    >
      <AnimatePresence>
        {open && (
          <m.span
            initial={{ opacity: 0, y: 12, scale: 0.7 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              transition: { type: "spring", stiffness: 260, damping: 12 },
            }}
            exit={{ opacity: 0, y: 12, scale: 0.7 }}
            style={{ x: shift, rotate }}
            className="absolute -top-9 left-1/2 z-10 -translate-x-1/2 rounded-full bg-foreground px-3 py-1 text-xs whitespace-nowrap text-background shadow-(--floating-shadow)"
          >
            {name}
          </m.span>
        )}
      </AnimatePresence>
      <m.span
        whileHover={{ scale: 1.12, zIndex: 5 }}
        className="grid size-9 place-items-center rounded-full border-2 border-popover bg-(--layout-control) text-xs font-semibold shadow-(--field-shadow)"
        style={{ color: `var(--chart-soft-${index + 1})` }}
      >
        {name[0]}
      </m.span>
    </div>
  )
}

export function AnimatedTooltipDemo() {
  return (
    <Demo
      title="Animated Tooltip 动态提示"
      usage="成员头像组：useSpring + useTransform 让提示随指针位置倾斜"
    >
      <div className="flex pt-8">
        {people.map((name, index) => (
          <PersonTip key={name} name={name} index={index} />
        ))}
      </div>
    </Demo>
  )
}

/** 3D Card Effect: the card tilts toward the pointer. */
export function Card3DDemo() {
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const srx = useSpring(rx, { stiffness: 200, damping: 20 })
  const sry = useSpring(ry, { stiffness: 200, damping: 20 })
  return (
    <Demo
      title="3D Card Effect 3D 倾斜卡片"
      usage="指针偏移映射为 rotateX / rotateY，父级 perspective，离开时归零"
    >
      <div
        className="w-full [perspective:800px]"
        onPointerMove={(event) => {
          const box = event.currentTarget.getBoundingClientRect()
          ry.set(((event.clientX - box.left) / box.width - 0.5) * 16)
          rx.set(-((event.clientY - box.top) / box.height - 0.5) * 16)
        }}
        onPointerLeave={() => {
          rx.set(0)
          ry.set(0)
        }}
      >
        <m.div
          style={{ rotateX: srx, rotateY: sry, transformStyle: "preserve-3d" }}
          className="ace-card3d"
        >
          <p className="[transform:translateZ(20px)] text-xs text-muted-foreground">
            本期已出账
          </p>
          <p className="[transform:translateZ(40px)] text-2xl font-semibold">
            ¥128.64万
          </p>
        </m.div>
      </div>
    </Demo>
  )
}

/** Glare Card: a specular glare follows the pointer. */
export function GlareCardDemo() {
  return (
    <Demo
      title="Glare Card 反光卡片"
      usage="onPointerMove 写入 --gx / --gy，radial-gradient 白光叠加，混合模式 overlay"
    >
      <div
        className="ace-glare w-full"
        onPointerMove={(event) => {
          const box = event.currentTarget.getBoundingClientRect()
          event.currentTarget.style.setProperty(
            "--gx",
            `${((event.clientX - box.left) / box.width) * 100}%`
          )
          event.currentTarget.style.setProperty(
            "--gy",
            `${((event.clientY - box.top) / box.height) * 100}%`
          )
        }}
      >
        <p className="relative text-sm font-semibold">企业版订阅</p>
        <p className="relative text-xs opacity-80">64 个云账号 · 12 位成员</p>
      </div>
    </Demo>
  )
}

const notices = [
  ["AWS 授权即将到期", "7 天后"],
  ["腾讯云账单金额有差异", "待确认"],
  ["华为云采集失败", "请重试"],
  ["Azure 账单解析中", "进行中"],
] as const

/** Infinite Moving Cards: a looping row of cards that pauses on hover. */
export function InfiniteCardsDemo() {
  return (
    <Demo
      title="Infinite Moving Cards 无限滚动卡片"
      usage="卡片列表复制一份，轨道无缝循环；悬停暂停，两端渐隐"
    >
      <div className="marquee w-full">
        <div className="marquee-track" style={{ animationDuration: "22s" }}>
          {[...notices, ...notices].map(([title, note], index) => (
            <div key={index} className="ace-notice" aria-hidden={index >= 4}>
              <p className="text-[13px] font-medium">{title}</p>
              <p className="text-xs text-muted-foreground">{note}</p>
            </div>
          ))}
        </div>
      </div>
    </Demo>
  )
}

const timeline = [
  ["11-05 09:42", "Cloudflare 主账单已归档"],
  ["11-04 16:18", "华为云账单更新"],
  ["11-04 10:30", "阿里云采集完成"],
  ["11-03 18:05", "腾讯云差异待确认"],
  ["11-03 09:12", "AWS 授权提醒"],
] as const

/** Tracing Beam: a line fills along a timeline while scrolling. */
export function TracingBeamDemo() {
  const container = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ container })
  const height = useSpring(
    useTransform(scrollYProgress, [0, 1], ["0%", "100%"]),
    {
      stiffness: 120,
      damping: 24,
    }
  )
  return (
    <Demo
      title="Tracing Beam 追踪光束"
      usage="useScroll 进度驱动竖线高度，节点随之点亮；适合动态时间线"
    >
      <div ref={container} className="motion-scroll w-full">
        <div className="relative px-4 py-3">
          <span className="absolute inset-y-3 left-[22px] w-px bg-border" />
          <m.span
            style={{ height }}
            className="absolute top-3 left-[21px] w-0.5 rounded-full bg-primary"
          />
          <ol className="grid gap-6 ps-8">
            {timeline.concat(timeline).map(([time, text], index) => (
              <li key={index} className="relative">
                <span className="absolute -start-[22px] top-1.5 size-2 rounded-full bg-primary" />
                <p className="text-xs text-muted-foreground">{time}</p>
                <p className="text-[13px]">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Demo>
  )
}

/** Meteors: streaks falling across a card. */
export function MeteorsDemo() {
  return (
    <Demo
      title="Meteors 流星"
      usage="随机延迟与时长的斜向光束，纯 CSS keyframes；适合空状态与欢迎卡"
    >
      <div className="ace-meteors w-full">
        {Array.from({ length: 10 }, (_, index) => (
          <span
            key={index}
            className="ace-meteor"
            style={{
              left: `${index * 11}%`,
              animationDelay: `${(index * 0.37) % 2.4}s`,
              animationDuration: `${2.2 + (index % 4) * 0.6}s`,
            }}
          />
        ))}
        <p className="relative text-[13px] font-medium">暂无待处理告警</p>
      </div>
    </Demo>
  )
}

const placeholders = ["搜索账单编号", "搜索供应商", "搜索云账号", "搜索凭证"]

/** Placeholders And Vanish Input: placeholder text cycles up and down. */
export function PlaceholderInputDemo() {
  const [index, setIndex] = useState(0)
  const [value, setValue] = useState("")
  useEffect(() => {
    // Reduced motion: the placeholder stays on the first line.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % placeholders.length),
      2600
    )
    return () => window.clearInterval(timer)
  }, [])
  return (
    <Demo
      title="Placeholders 轮播占位符"
      usage="输入为空时占位文字循环上滚，输入后立即隐藏；aria-label 保留固定名称"
    >
      <div className="relative w-full">
        <Input
          aria-label="搜索"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        {!value && (
          <AnimatePresence mode="wait" initial={false}>
            <m.span
              key={index}
              aria-hidden
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-[13px] text-muted-foreground"
            >
              {placeholders[index]}
            </m.span>
          </AnimatePresence>
        )}
      </div>
    </Demo>
  )
}

const bento = [
  ["本月出账", "¥128.64万", "col-span-2"],
  ["待处理", "5", ""],
  ["采集完成", "85.7%", ""],
  ["账号总数", "49 个云账号，覆盖 6 家供应商", "col-span-2"],
] as const

/** Bento Grid: tiles lift and glow on hover. */
export function BentoGridDemo() {
  return (
    <Demo
      title="Bento Grid 便当网格"
      usage="不同跨度的 Tile 组成仪表盘；悬停时位移 + 阴影增强"
    >
      <div className="grid w-full grid-cols-3 gap-2">
        {bento.map(([label, value, span]) => (
          <m.div
            key={label}
            whileHover={{ y: -3 }}
            transition={{ type: "spring", stiffness: 380, damping: 26 }}
            className={`ace-tile ${span}`}
          >
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-[15px] font-semibold">{value}</p>
          </m.div>
        ))}
      </div>
    </Demo>
  )
}
