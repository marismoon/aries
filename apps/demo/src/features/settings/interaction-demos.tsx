import { useEffect, useRef, useState } from "react"
import {
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react"
import * as m from "motion/react-m"

import {
  AppIcon,
  SolarCheck,
  SolarCopy,
  SolarEye,
  SolarPlus,
  SolarSparkles,
  SolarX,
} from "@marismoon/ui/icons"
import { Button } from "@marismoon/ui/ui/button"
import { Input } from "@marismoon/ui/ui/input"
import { Demo, spring, useReplay } from "./motion-shared"
import "./interaction-demos.css"

/** Glowing Effect: a glow on the card border that follows the pointer. */
export function GlowingEffectDemo() {
  return (
    <Demo
      title="Glowing Effect 边缘微光"
      usage="卡片边框的光斑跟随指针（--gx / --gy + 渐变边框 mask），适合统计与功能入口卡"
    >
      <div className="grid w-full grid-cols-2 gap-2">
        {["采集通道", "凭证归档"].map((name) => (
          <div
            key={name}
            className="glow-card"
            onPointerMove={(event) => {
              const box = event.currentTarget.getBoundingClientRect()
              event.currentTarget.style.setProperty(
                "--gx",
                `${event.clientX - box.left}px`
              )
              event.currentTarget.style.setProperty(
                "--gy",
                `${event.clientY - box.top}px`
              )
            }}
          >
            <p className="relative text-[13px] font-semibold">{name}</p>
            <p className="relative text-xs text-muted-foreground">
              移动鼠标查看边缘微光
            </p>
          </div>
        ))}
      </div>
    </Demo>
  )
}

/** Floating Dock: icons magnify with distance to the pointer. */
function DockIcon({
  x,
  label,
  icon,
}: {
  x: ReturnType<typeof useMotionValue<number>>
  label: string
  icon: typeof SolarEye
}) {
  const ref = useRef<HTMLButtonElement>(null)
  const distance = useTransform(x, (value) => {
    const box = ref.current?.getBoundingClientRect()
    return box ? value - (box.left + box.width / 2) : 999
  })
  const size = useSpring(useTransform(distance, [-90, 0, 90], [36, 56, 36]), {
    stiffness: 260,
    damping: 20,
  })
  return (
    <m.button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      style={{ width: size, height: size }}
      className="grid place-items-center rounded-full bg-(--field-surface) text-foreground shadow-(--field-shadow)"
    >
      <AppIcon icon={icon} size={18} />
    </m.button>
  )
}

export function FloatingDockDemo() {
  const x = useMotionValue(Infinity)
  return (
    <Demo
      title="Floating Dock 悬浮快捷栏"
      usage="useMotionValue 记录指针 x，useTransform 按距离放大图标，useSpring 平滑"
    >
      <div
        className="dock-bar mx-auto flex h-16 items-end gap-2 rounded-full px-3 pb-2"
        onPointerMove={(event) => x.set(event.clientX)}
        onPointerLeave={() => x.set(Infinity)}
      >
        <DockIcon x={x} label="新建" icon={SolarPlus} />
        <DockIcon x={x} label="查看" icon={SolarEye} />
        <DockIcon x={x} label="复制" icon={SolarCopy} />
        <DockIcon x={x} label="智能" icon={SolarSparkles} />
      </div>
    </Demo>
  )
}

/** File Upload: a drop zone whose state change is animated. */
export function FileUploadDemo() {
  const [files, setFiles] = useState<string[]>([])
  const [over, setOver] = useState(false)
  const add = (list: FileList | null) =>
    list &&
    setFiles((current) => [...current, ...Array.from(list, (f) => f.name)])
  return (
    <Demo
      title="File Upload 文件上传"
      usage="拖入时边框与背景过渡，文件逐条进入；也可点击选择，适合账单与凭证导入"
    >
      <div className="grid w-full gap-2">
        <label
          className="upload-zone"
          data-over={over || undefined}
          onDragOver={(event) => {
            event.preventDefault()
            setOver(true)
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(event) => {
            event.preventDefault()
            setOver(false)
            add(event.dataTransfer.files)
          }}
        >
          <input
            type="file"
            multiple
            className="sr-only"
            onChange={(event) => add(event.target.files)}
          />
          <m.span animate={{ y: over ? -4 : 0 }} transition={spring}>
            拖拽文件到此处，或点击选择
          </m.span>
        </label>
        <ul className="grid gap-1">
          <AnimatePresence initial={false}>
            {files.map((name, index) => (
              <m.li
                key={`${name}-${index}`}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="motion-bleed"
              >
                <span className="flex items-center justify-between rounded-full bg-(--field-surface) px-3 py-1 text-xs shadow-(--field-shadow)">
                  {name}
                  <button
                    type="button"
                    aria-label={`移除 ${name}`}
                    onClick={() =>
                      setFiles((current) =>
                        current.filter((_, i) => i !== index)
                      )
                    }
                  >
                    <AppIcon icon={SolarX} size={12} />
                  </button>
                </span>
              </m.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
    </Demo>
  )
}

const steps = ["校验配置", "备份当前版本", "发布到节点", "健康检查"]

/** Multi Step Loader: steps tick through with a moving highlight. */
export function MultiStepLoaderDemo() {
  const [run, replay] = useReplay()
  const [current, setCurrent] = useState(0)
  useEffect(() => {
    const timer = window.setInterval(
      () => setCurrent((value) => Math.min(value + 1, steps.length)),
      900
    )
    return () => window.clearInterval(timer)
  }, [run])
  return (
    <Demo
      title="Multi Step Loader 多步骤加载"
      usage="当前步骤高亮并带转圈，已完成步骤打勾；适合发布、导出、重启流程"
      onReplay={() => {
        setCurrent(0)
        replay()
      }}
    >
      <ol className="grid w-full gap-1.5">
        {steps.map((label, index) => {
          const done = index < current
          const active = index === current
          return (
            <m.li
              key={label}
              animate={{
                opacity: done || active ? 1 : 0.45,
                x: active ? 4 : 0,
              }}
              transition={spring}
              className="flex items-center gap-2 text-[13px]"
            >
              <span
                className="grid size-5 place-items-center rounded-full text-[10px]"
                data-state={done ? "done" : active ? "active" : "todo"}
                style={{
                  background: done ? "var(--chart-soft-2)" : "var(--recess)",
                  color: done ? "white" : "inherit",
                }}
              >
                {done ? (
                  <AppIcon icon={SolarCheck} size={12} />
                ) : active ? (
                  <span className="step-spinner" />
                ) : (
                  index + 1
                )}
              </span>
              {label}
            </m.li>
          )
        })}
      </ol>
    </Demo>
  )
}

/** Stateful Button: idle → loading → success with a swapped label. */
export function StatefulButtonDemo() {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle")
  useEffect(() => {
    if (state === "loading") {
      const timer = window.setTimeout(() => setState("done"), 1200)
      return () => window.clearTimeout(timer)
    }
    if (state === "done") {
      const timer = window.setTimeout(() => setState("idle"), 1600)
      return () => window.clearTimeout(timer)
    }
  }, [state])
  return (
    <Demo
      title="Stateful Button 多状态按钮"
      usage="idle / loading / done 三态，AnimatePresence 切换内容；保存、启停、提交通用"
    >
      <Button
        size="default"
        disabled={state === "loading"}
        onClick={() => setState("loading")}
        className="min-w-28"
      >
        <AnimatePresence mode="wait" initial={false}>
          <m.span
            key={state}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="inline-flex items-center gap-1.5"
          >
            {state === "loading" && <span className="step-spinner" />}
            {state === "done" && <AppIcon icon={SolarCheck} size={14} />}
            {state === "idle"
              ? "保存配置"
              : state === "loading"
                ? "保存中"
                : "已保存"}
          </m.span>
        </AnimatePresence>
      </Button>
    </Demo>
  )
}

/** Row Reorder: rows enter and leave with a height transition. */
export function RowReorderDemo() {
  const [rows, setRows] = useState([1, 2, 3])
  const [next, setNext] = useState(4)
  return (
    <Demo
      title="Row Reorder 行增删过渡"
      usage="AnimatePresence + height: auto 实现行的增删；新行插在最前，删除时折叠"
    >
      <div className="grid w-full gap-2">
        <Button
          variant="outline"
          onClick={() => {
            setRows((current) => [next, ...current])
            setNext((value) => value + 1)
          }}
        >
          <SolarPlus data-icon="inline-start" />
          新增一行
        </Button>
        <ul className="grid">
          <AnimatePresence initial={false}>
            {rows.map((id) => (
              <m.li
                key={id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="motion-bleed"
              >
                <div className="flex items-center justify-between rounded-full bg-(--field-surface) px-3 py-1.5 text-[13px] shadow-(--field-shadow)">
                  BL-2610-{String(id).padStart(2, "0")}
                  <button
                    type="button"
                    aria-label={`删除 ${id}`}
                    onClick={() =>
                      setRows((current) => current.filter((r) => r !== id))
                    }
                  >
                    <AppIcon icon={SolarX} size={12} />
                  </button>
                </div>
              </m.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
    </Demo>
  )
}

/** Slide-over: a detail panel sliding in from the right. */
export function SlideOverDemo() {
  const [open, setOpen] = useState(false)
  return (
    <Demo
      title="Slide-over 侧滑面板"
      usage="面板 x: 100% → 0，遮罩淡入；与账单详情抽屉同一节奏（仅示例，业务请用 Drawer）"
    >
      <div className="motion-stage h-40 w-full p-1">
        <Button className="m-3" variant="outline" onClick={() => setOpen(true)}>
          打开面板
        </Button>
        <AnimatePresence>
          {open && (
            <>
              <m.div
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setOpen(false)}
              />
              <m.div
                className="absolute inset-y-1 right-1 grid w-2/3 content-start gap-1 rounded-(--radius-control) bg-popover p-3 shadow-(--floating-shadow)"
                initial={{ x: "110%" }}
                animate={{ x: 0 }}
                exit={{ x: "110%" }}
                transition={{ type: "spring", stiffness: 340, damping: 34 }}
              >
                <p className="text-[13px] font-semibold">BL-2610-01</p>
                <p className="text-xs text-muted-foreground">
                  阿里云 · 生产账号
                </p>
                <Button
                  size="sm"
                  className="mt-2 w-fit"
                  onClick={() => setOpen(false)}
                >
                  关闭
                </Button>
              </m.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </Demo>
  )
}

/** Status Pulse: breathing dots for live states. */
export function StatusPulseDemo() {
  const items = [
    ["在线", "var(--chart-soft-2)"],
    ["告警", "var(--chart-soft-3)"],
    ["失败", "var(--chart-soft-6)"],
    ["执行中", "var(--chart-soft-1)"],
  ] as const
  return (
    <Demo
      title="Status Pulse 状态脉冲"
      usage=".status-dot 带 --tone；外圈 ping 动画表示实时状态，减少动态时静止"
    >
      <ul className="flex flex-wrap gap-2">
        {items.map(([label, tone]) => (
          <li
            key={label}
            className="inline-flex items-center gap-2 rounded-full bg-(--field-surface) px-3 py-1 text-xs shadow-(--field-shadow)"
          >
            <span
              className="status-dot"
              style={{ "--tone": tone } as React.CSSProperties}
            />
            {label}
          </li>
        ))}
      </ul>
    </Demo>
  )
}

/** Collapsible sidebar: width and labels animate together. */
export function SidebarCollapseDemo() {
  const [open, setOpen] = useState(true)
  const items = ["总览", "账单", "凭证"]
  return (
    <Demo
      title="Sidebar 折叠侧栏"
      usage="宽度 animate，文字用 AnimatePresence 淡出，图标位置不动"
    >
      <div className="motion-stage flex h-36 w-full gap-3 p-2">
        <m.nav
          animate={{ width: open ? 132 : 48 }}
          transition={spring}
          className="motion-sidebar grid content-start gap-1 rounded-(--radius-control) bg-popover p-1.5 shadow-(--field-shadow)"
        >
          {items.map((label, index) => (
            <span
              key={label}
              className="flex h-8 items-center gap-2 rounded-full bg-(--field-surface) ps-2 text-xs shadow-(--field-shadow)"
            >
              <span
                className="size-4 shrink-0 rounded-full"
                style={{ background: `var(--chart-soft-${index + 1})` }}
              />
              <AnimatePresence initial={false}>
                {open && (
                  <m.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="whitespace-nowrap"
                  >
                    {label}
                  </m.span>
                )}
              </AnimatePresence>
            </span>
          ))}
        </m.nav>
        <Button variant="outline" size="sm" onClick={() => setOpen((v) => !v)}>
          {open ? "收起" : "展开"}
        </Button>
      </div>
    </Demo>
  )
}

/** Vanish Input: submitted text blurs and dissolves. */
export function VanishInputDemo() {
  const [value, setValue] = useState("")
  const [sent, setSent] = useState<string | null>(null)
  return (
    <Demo
      title="Vanish Input 消散输入"
      usage="提交后文字模糊、上浮并淡出，输入框清空；适合日志检索与指令输入"
    >
      <form
        className="relative w-full"
        onSubmit={(event) => {
          event.preventDefault()
          if (!value.trim()) return
          setSent(value)
          setValue("")
          window.setTimeout(() => setSent(null), 700)
        }}
      >
        <div className="relative">
          <Input
            aria-label="检索"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="输入后按 Enter"
          />
          <AnimatePresence>
            {sent && (
              <m.span
                aria-hidden
                initial={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                animate={{ opacity: 0, y: -14, filter: "blur(8px)" }}
                transition={{ duration: 0.6 }}
                className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-[13px]"
              >
                {sent}
              </m.span>
            )}
          </AnimatePresence>
        </div>
      </form>
    </Demo>
  )
}
