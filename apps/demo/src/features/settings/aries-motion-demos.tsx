/* Aries 内置动效：这些示例直接使用共享层的真实组件与令牌（CopyButton、
   Tabs、Skeleton、Progress、Dialog 族、ThemeSwitcher、contentEntry、
   motion.css 的 chart-in-* 工具类），页面上看到的就是业务里会出现的效果。 */
import { useState, type CSSProperties } from "react"
import { AnimatePresence } from "motion/react"
import * as m from "motion/react-m"

import { contentEntry } from "@marismoon/ui/motion/motion-tokens"
import { CopyButton } from "@marismoon/ui/shared/CopyButton"
import { StatusBadge } from "@marismoon/ui/shared/StatusBadge"
import { ThemeSwitcher } from "@marismoon/ui/shared/ThemeSwitcher"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@marismoon/ui/ui/alert-dialog"
import { Button } from "@marismoon/ui/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@marismoon/ui/ui/dialog"
import { Input } from "@marismoon/ui/ui/input"
import { Progress } from "@marismoon/ui/ui/progress"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@marismoon/ui/ui/sheet"
import { Skeleton } from "@marismoon/ui/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@marismoon/ui/ui/tabs"
import { Demo, useReplay } from "./motion-shared"
import "./aries-motion-demos.css"

const easeOut = [0.23, 1, 0.32, 1] as const

/* ---------- 组件动效 ---------- */

export function CopyButtonDemo() {
  return (
    <Demo
      title="复制确认"
      usage="CopyButton：复制图标交叉淡入为对勾、文案变为「已复制」，宽度不变，约 1.8s 后复原"
    >
      <CopyButton value="BL-2610-01" label="复制账单编号" size="sm" />
      <CopyButton
        value="JBSWY3DPEHPK3PXP"
        variant="ghost"
        size="icon-sm"
        aria-label="复制密钥"
      />
    </Demo>
  )
}

const skeletonRows = ["阿里云 · 生产账号", "腾讯云 · 分析", "华为云 · 采集"]

export function SkeletonDemo() {
  const [loading, setLoading] = useState(true)
  return (
    <Demo
      title="加载中的列表"
      usage="Skeleton 自带扫光；数据到达后用 contentEntry 淡入，减弱动效时扫光静止"
    >
      <div className="grid w-full gap-2">
        <Button
          variant="outline"
          className="justify-self-start"
          onClick={() => setLoading((value) => !value)}
        >
          {loading ? "模拟加载完成" : "重新加载"}
        </Button>
        <div className="grid min-h-28 gap-1.5">
          {loading
            ? skeletonRows.map((row) => (
                <div key={row} className="aries-skeleton-row">
                  <Skeleton className="size-8 rounded-full" />
                  <div className="grid flex-1 gap-1.5">
                    <Skeleton className="h-3 w-2/5 rounded-md" />
                    <Skeleton className="h-3 w-3/5 rounded-md" />
                  </div>
                </div>
              ))
            : skeletonRows.map((row, index) => (
                <m.div
                  key={row}
                  className="aries-skeleton-row aries-list-row"
                  {...contentEntry}
                  transition={{
                    ...contentEntry.transition,
                    delay: index * 0.04,
                  }}
                >
                  <span className="aries-avatar" aria-hidden="true">
                    {row.slice(0, 1)}
                  </span>
                  <span className="text-[13px]">{row}</span>
                </m.div>
              ))}
        </div>
      </div>
    </Demo>
  )
}

export function ProgressDemo() {
  const [value, setValue] = useState(25)
  return (
    <Demo
      title="进度与不确定加载"
      usage="Progress 数值变化 480ms 平滑过渡；不传 value 时为往返段落（indeterminate）"
    >
      <div className="grid w-full gap-3">
        <div className="grid gap-1.5">
          <span className="text-xs text-muted-foreground">
            采集进度 {value}%
          </span>
          <Progress value={value} aria-label="采集进度" />
        </div>
        <div className="grid gap-1.5">
          <span className="text-xs text-muted-foreground">正在解析账单…</span>
          <Progress value={null} aria-label="正在解析账单" />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setValue((current) => Math.max(current - 25, 0))}
          >
            -25%
          </Button>
          <Button
            variant="outline"
            onClick={() => setValue((current) => Math.min(current + 25, 100))}
          >
            +25%
          </Button>
        </div>
      </div>
    </Demo>
  )
}

const initialTodos = [
  { id: "t1", title: "确认阿里云 10 月差异" },
  { id: "t2", title: "补传腾讯云发票" },
  { id: "t3", title: "复核 Azure 暂估" },
]

/** Same exit as the overview attention list: fade and close the row. */
const rowExit = {
  opacity: 0,
  height: 0,
  paddingTop: 0,
  paddingBottom: 0,
  overflow: "hidden",
  transition: { duration: 0.22, ease: easeOut },
} as const

export function TodoListDemo() {
  const [todos, setTodos] = useState(initialTodos)
  const [next, setNext] = useState(1)
  return (
    <Demo
      title="待办完成与新增"
      usage="AnimatePresence + exit：完成后淡出并收起高度；新增条目以 contentEntry 进入（非 layout 动画）"
      onReplay={() => setTodos(initialTodos)}
    >
      <div className="grid w-full gap-2">
        <ul className="grid">
          <AnimatePresence initial={false}>
            {todos.map((todo) => (
              <m.li
                key={todo.id}
                className="aries-list-row aries-todo-row"
                initial={contentEntry.initial}
                animate={contentEntry.animate}
                transition={contentEntry.transition}
                exit={rowExit}
              >
                <span className="text-[13px]">{todo.title}</span>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() =>
                    setTodos((items) =>
                      items.filter((item) => item.id !== todo.id)
                    )
                  }
                >
                  完成
                </Button>
              </m.li>
            ))}
          </AnimatePresence>
        </ul>
        <Button
          variant="outline"
          className="justify-self-start"
          onClick={() => {
            setTodos((items) => [
              { id: `n${next}`, title: `新增待办 ${next}` },
              ...items,
            ])
            setNext((value) => value + 1)
          }}
        >
          新增待办
        </Button>
      </div>
    </Demo>
  )
}

/* ---------- 交互动效 ---------- */

const commands = [
  "运营总览",
  "月账单",
  "供应商账号",
  "采集任务",
  "基础信息",
  "安全设置",
]

export function CommandFilterDemo() {
  const [query, setQuery] = useState("")
  const [run, replay] = useReplay()
  const matches = commands.filter((item) => item.includes(query.trim()))
  return (
    <Demo
      title="命令面板结果"
      usage="结果行错开 20ms 入场，保留的行不重播，只有新匹配的行进入；空结果淡入（外壳命令面板 ⌘K 同款）"
      onReplay={replay}
    >
      <div className="grid w-full gap-2">
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="输入「账」或「设置」筛选"
          aria-label="筛选命令"
        />
        <div key={run} className="min-h-40">
          {matches.length ? (
            <ul className="aries-command-results">
              {matches.map((item) => (
                <li key={item} className="aries-list-row">
                  <span className="text-[13px]">{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="aries-command-empty text-xs text-muted-foreground">
              没有匹配的页面
            </p>
          )}
        </div>
      </div>
    </Demo>
  )
}

/* ---------- 图表动效 ---------- */

const bars = [42, 58, 36, 71, 64, 88]
const at = (index: number) => ({ "--chart-index": index }) as CSSProperties

export function SvgChartEntranceDemo() {
  const [run, replay] = useReplay()
  const x = (index: number) => 24 + index * 46
  const y = (value: number) => 120 - value
  const line = bars.map((value, index) => `${x(index)},${y(value) - 6}`)
  return (
    <Demo
      title="纯 SVG 图表入场"
      usage="motion.css 的 chart-in-grow-y / chart-in-draw（pathLength=1）/ chart-in-pop，--chart-index 错开；悬停时其余标记降到 0.35 透明度"
      onReplay={replay}
    >
      <svg
        key={run}
        viewBox="0 0 280 132"
        className="aries-chart-demo w-full"
        role="img"
        aria-label="近 6 月出账柱图与趋势线"
      >
        {bars.map((value, index) => (
          <rect
            key={index}
            className="chart-in-grow-y"
            data-chart-mark=""
            style={at(index)}
            x={x(index) - 12}
            y={y(value)}
            width="24"
            height={value}
            rx="4"
            fill="var(--chart-2)"
          />
        ))}
        <polyline
          className="chart-in-draw"
          pathLength={1}
          points={line.join(" ")}
          fill="none"
          stroke="var(--chart-1)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          style={at(2)}
        />
        {bars.map((value, index) => (
          <circle
            key={index}
            className="chart-in-pop"
            style={at(index)}
            cx={x(index)}
            cy={y(value) - 6}
            r="3"
            fill="var(--chart-1)"
            stroke="var(--card)"
            strokeWidth="1.2"
          />
        ))}
      </svg>
    </Demo>
  )
}

/* ---------- 转场动效 ---------- */

export function ThemeRevealDemo() {
  return (
    <Demo
      title="亮 / 暗切换揭示"
      usage="ThemeSwitcher：View Transitions 从按钮中心圆形揭示新主题（460ms）；不支持或减弱动效时直接切换。Shift+点击跟随系统"
    >
      <ThemeSwitcher />
      <span className="text-xs text-muted-foreground">
        点击左侧按钮，观察整页从按钮处展开
      </span>
    </Demo>
  )
}

export function OverlayFamilyDemo() {
  return (
    <Demo
      title="弹窗族入场与退出"
      usage="Dialog：y 8→0、scale 0.98→1（200ms），退出 145ms；AlertDialog 同一曲线；Sheet 入场 240ms、退出 180ms"
    >
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">对话框</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认差异</DialogTitle>
            <DialogDescription>
              阿里云 10 月账单与入账金额相差 ¥1,280.00。
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline">警示对话框</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除这条账单？</AlertDialogTitle>
            <AlertDialogDescription>删除后无法恢复。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction>删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">侧边面板</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>账单详情</SheetTitle>
            <SheetDescription>BL-2610-01 · 阿里云 · 2026-10</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </Demo>
  )
}

export function TabGlideDemo() {
  return (
    <Demo
      title="Tab 选中滑块"
      usage="Tabs 默认变体：选中底板从旧 Tab 滑到新 Tab（220ms），静止时保持原样式；面板淡入上移 4px"
    >
      <Tabs defaultValue="month" className="w-full">
        <TabsList aria-label="统计周期">
          <TabsTrigger value="month">本月</TabsTrigger>
          <TabsTrigger value="quarter">本季</TabsTrigger>
          <TabsTrigger value="year">本年度</TabsTrigger>
        </TabsList>
        <TabsContent value="month" className="text-[13px]">
          本月已出账 ¥128.6 万
        </TabsContent>
        <TabsContent value="quarter" className="text-[13px]">
          本季已出账 ¥372.4 万
        </TabsContent>
        <TabsContent value="year" className="text-[13px]">
          本年度已出账 ¥1,097 万
        </TabsContent>
      </Tabs>
    </Demo>
  )
}

export function SavedStateDemo() {
  const [saved, setSaved] = useState(false)
  return (
    <Demo
      title="状态确认出现"
      usage="AnimatePresence + contentEntry：「已保存」淡入上移 4px，再次编辑时 120ms 淡出（基础信息页同款）"
    >
      <div className="flex items-center gap-2">
        <AnimatePresence initial={false}>
          {saved && (
            <m.span key="saved" className="flex" {...contentEntry}>
              <StatusBadge tone="success">已保存</StatusBadge>
            </m.span>
          )}
        </AnimatePresence>
        <Button
          variant="outline"
          disabled={!saved}
          onClick={() => setSaved(false)}
        >
          编辑
        </Button>
        <Button disabled={saved} onClick={() => setSaved(true)}>
          保存
        </Button>
      </div>
    </Demo>
  )
}
