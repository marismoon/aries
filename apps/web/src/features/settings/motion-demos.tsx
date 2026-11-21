import { useEffect, useRef, useState } from "react"
import {
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
} from "motion/react"
import * as m from "motion/react-m"

import { Demo, useReplay } from "./motion-shared"
import "./motion-demos.css"

/** Border Beam: a light that travels around the card edge (CSS only). */
export function BorderBeamDemo() {
  return (
    <Demo
      title="Border Beam 流光边框"
      usage="外层加 .glow-ring，与 AI 助手输入框同一套流光（--glow-300/500/700）；内容区用不透明底色"
    >
      <div className="glow-ring w-full rounded-(--radius-control)">
        <div className="beam-card">
          <p className="text-[13px] font-medium">本月采集完成率 85.7%</p>
          <p className="text-xs text-muted-foreground">
            适合 AI 输入框、重点指标卡与主操作区域。
          </p>
        </div>
      </div>
    </Demo>
  )
}

/** Spotlight: a soft light follows the pointer inside a card. */
export function SpotlightDemo() {
  return (
    <Demo
      title="Spotlight 聚光"
      usage="onPointerMove 写入 --x / --y，radial-gradient 跟随，离开后淡出"
    >
      <div
        className="spotlight-card w-full"
        onPointerMove={(event) => {
          const box = event.currentTarget.getBoundingClientRect()
          event.currentTarget.style.setProperty(
            "--x",
            `${event.clientX - box.left}px`
          )
          event.currentTarget.style.setProperty(
            "--y",
            `${event.clientY - box.top}px`
          )
        }}
      >
        <span className="relative text-[13px]">移动鼠标查看聚光</span>
      </div>
    </Demo>
  )
}

/** Magnetic: the button is pulled toward the pointer with a spring. */
export function MagneticDemo() {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 220, damping: 16 })
  const sy = useSpring(y, { stiffness: 220, damping: 16 })
  return (
    <Demo
      title="Magnetic 磁吸"
      usage="useMotionValue 记录指针偏移，useSpring 平滑，离开时归零"
    >
      <div
        className="grid h-24 w-full place-items-center"
        onPointerMove={(event) => {
          const box = event.currentTarget.getBoundingClientRect()
          x.set((event.clientX - (box.left + box.width / 2)) * 0.25)
          y.set((event.clientY - (box.top + box.height / 2)) * 0.25)
        }}
        onPointerLeave={() => {
          x.set(0)
          y.set(0)
        }}
      >
        <m.button
          type="button"
          style={{ x: sx, y: sy }}
          className="rounded-full bg-primary px-5 py-2 text-[13px] font-medium text-primary-foreground shadow-(--field-shadow)"
        >
          靠近我
        </m.button>
      </div>
    </Demo>
  )
}

/** Shimmer: a highlight sweeping across loading blocks and text. */
export function ShimmerDemo() {
  return (
    <Demo
      title="Shimmer 扫光"
      usage="给文字加 .shimmer-text、给占位块加 .shimmer-block，纯 CSS 背景位移"
    >
      <div className="grid w-full gap-2">
        <span className="shimmer-text text-sm font-semibold">
          正在解析账单…
        </span>
        <div className="shimmer-block h-3 w-3/4 rounded-full" />
        <div className="shimmer-block h-3 w-1/2 rounded-full" />
      </div>
    </Demo>
  )
}

const typewriterText = "本期共 64 条账单，5 条待人工处理。"

function Typing() {
  // Reduced motion: show the whole line at once instead of typing it.
  const [count, setCount] = useState(() =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? typewriterText.length
      : 0
  )

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCount((value) => Math.min(value + 1, typewriterText.length))
    }, 60)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <p className="text-[13px]" aria-label={typewriterText}>
      <span aria-hidden>{typewriterText.slice(0, count)}</span>
      <span aria-hidden className="typewriter-caret" />
    </p>
  )
}

/** Typewriter: text typed out with a blinking caret. */
export function TypewriterDemo() {
  const [run, replay] = useReplay()
  return (
    <Demo
      title="Typewriter 打字机"
      usage="定时器逐字递增 slice；光标用 CSS 闪烁，aria-label 保留完整文本；重播换 key 重新挂载"
      onReplay={replay}
    >
      <Typing key={run} />
    </Demo>
  )
}

/** Marquee: an endless horizontal ticker that pauses on hover. */
export function MarqueeDemo() {
  const items = ["阿里云", "腾讯云", "华为云", "AWS", "Azure", "Cloudflare"]
  return (
    <Demo
      title="Marquee 跑马灯"
      usage="内容复制两份，轨道 translateX 0 → -50% 无缝循环；悬停暂停"
    >
      <div className="marquee w-full">
        <div className="marquee-track">
          {[...items, ...items].map((name, index) => (
            <span key={index} className="marquee-item" aria-hidden={index >= 6}>
              {name}
            </span>
          ))}
        </div>
      </div>
    </Demo>
  )
}

/** Scroll Reveal: items fade in as they enter the scroll area. */
export function ScrollRevealDemo() {
  const root = useRef<HTMLDivElement>(null)
  return (
    <Demo
      title="Scroll Reveal 滚动显现"
      usage="whileInView + viewport.root 指向滚动容器；once 保证只播放一次"
    >
      <div ref={root} className="motion-scroll w-full">
        {Array.from({ length: 8 }, (_, index) => (
          <m.div
            key={index}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ root, once: true, amount: 0.6 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="motion-row"
          >
            第 {index + 1} 条记录
          </m.div>
        ))}
      </div>
    </Demo>
  )
}

/** Scroll Storytelling: a pinned panel whose content follows scroll progress. */
export function ScrollStoryDemo() {
  const container = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ container })
  const [step, setStep] = useState(0)
  const steps = [
    ["采集", "从云厂商 API、邮件与 RPA 汇集账单"],
    ["解析", "识别账期、币种与金额并核对差异"],
    ["归档", "生成凭证与发票并同步到财务系统"],
  ]
  useMotionValueEvent(scrollYProgress, "change", (value) =>
    setStep(Math.min(steps.length - 1, Math.floor(value * steps.length)))
  )
  return (
    <Demo
      title="Scroll Storytelling 滚动叙事"
      usage="useScroll({ container }) 取进度，固定面板随进度切换步骤并驱动进度条"
    >
      <div ref={container} className="motion-scroll w-full">
        <div className="h-[300%]">
          <div className="sticky top-0 grid gap-2 p-3">
            <m.div
              className="h-1 origin-left rounded-full bg-primary"
              style={{ scaleX: scrollYProgress }}
            />
            <m.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <p className="text-sm font-semibold">
                {step + 1}. {steps[step]![0]}
              </p>
              <p className="text-xs text-muted-foreground">{steps[step]![1]}</p>
            </m.div>
          </div>
        </div>
      </div>
    </Demo>
  )
}

/** Parallax: layers move at different speeds while scrolling. */
export function ParallaxDemo() {
  const container = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ container })
  const far = useTransform(scrollYProgress, [0, 1], [0, -40])
  const mid = useTransform(scrollYProgress, [0, 1], [0, -110])
  const near = useTransform(scrollYProgress, [0, 1], [0, -220])
  return (
    <Demo
      title="Parallax 视差"
      usage="useTransform 把滚动进度映射为不同位移，远处慢、近处快"
    >
      <div ref={container} className="motion-scroll w-full">
        <div className="relative h-[260%]">
          <div className="sticky top-0 h-32 overflow-hidden">
            <m.div
              style={{ y: far }}
              className="absolute top-16 left-6 size-16 rounded-full bg-primary/20"
            />
            <m.div
              style={{ y: mid }}
              className="absolute top-24 left-1/3 size-12 rounded-full bg-primary/40"
            />
            <m.div
              style={{ y: near }}
              className="absolute top-32 right-8 size-10 rounded-full bg-primary"
            />
          </div>
        </div>
      </div>
    </Demo>
  )
}

const easings = [
  ["linear", "linear"],
  ["easeOut", "easeOut"],
  ["easeInOut", "easeInOut"],
  ["spring", undefined],
  ["backOut", "backOut"],
] as const

/** Easing: the same move with different curves, side by side. */
export function EasingDemo() {
  const [run, replay] = useReplay()
  return (
    <Demo
      title="Easing 缓动对比"
      usage="transition.ease 取 linear / easeOut / easeInOut / backOut；弹性用 type: spring"
      onReplay={replay}
    >
      <div className="grid w-full gap-2" key={run}>
        {easings.map(([label, ease]) => (
          <div key={label} className="flex items-center gap-3">
            <span className="w-16 text-xs text-muted-foreground">{label}</span>
            <div className="relative h-5 flex-1 rounded-full bg-(--recess)">
              <m.span
                initial={{ left: "0%" }}
                animate={{ left: "93%" }}
                transition={
                  ease
                    ? { duration: 1.2, ease }
                    : { type: "spring", stiffness: 120, damping: 12 }
                }
                className="absolute inset-y-0 size-5 rounded-full bg-primary"
              />
            </div>
          </div>
        ))}
      </div>
    </Demo>
  )
}
