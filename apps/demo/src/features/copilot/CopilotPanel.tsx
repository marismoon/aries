import { useLayoutEffect, useRef, useState } from "react"
import { AnimatePresence, useIsPresent, useReducedMotion } from "motion/react"
import {
  aside as MotionAside,
  button as MotionButton,
  li as MotionLi,
  span as MotionSpan,
} from "motion/react-m"

import {
  AppIcon,
  SolarArrowUpRight,
  SolarEllipsis,
  SolarEye,
  SolarMaximize2,
  SolarMinimize2,
  SolarPlain3,
  SolarPlus,
  SolarRotateCw,
  SolarSparkles,
} from "@marismoon/ui/icons"
import { dialogEntry } from "@marismoon/ui/motion/motion-tokens"
import { CopyButton } from "@marismoon/ui/shared/CopyButton"
import { Bubble, BubbleContent } from "@marismoon/ui/ui/bubble"
import { Button } from "@marismoon/ui/ui/button"
import { CloseButton } from "@marismoon/ui/ui/close-button"
import {
  Message,
  MessageContent,
  MessageFooter,
} from "@marismoon/ui/ui/message"
import { Textarea } from "@marismoon/ui/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@marismoon/ui/ui/tooltip"
import { CopilotSummary } from "./CopilotSummary"
import { recommendedQuestions } from "./copilot-demo"
import { type useCopilot } from "./useCopilot"
import "./copilot.css"
import { useUiText } from "@/lib/i18n/use-ui-text"

interface CopilotPanelProps {
  copilot: ReturnType<typeof useCopilot>
}

const panelTransition = {
  duration: 0.2,
  ease: [0.22, 1, 0.36, 1],
} as const

const collapsedPanel = { opacity: 0, y: 12, scale: 0.98 }

function inlineMarkdown(text: string) {
  return text
    .split(/(\*\*[^*]+\*\*)/)
    .map((part, index) =>
      index % 2 ? (
        <strong key={index}>{part.slice(2, -2)}</strong>
      ) : (
        <span key={index}>{part}</span>
      )
    )
}

function ReplyMarkdown({ text }: { text: string }) {
  return text
    .trim()
    .split(/\n\s*\n/)
    .map((block, index) => {
      const heading = block.match(/^(#{2,3})\s+([^\n]+)$/)
      if (heading?.[1] && heading[2]) {
        const Heading = heading[1].length === 2 ? "h3" : "h4"
        return <Heading key={index}>{inlineMarkdown(heading[2])}</Heading>
      }

      const lines = block.split("\n")
      if (lines.every((line) => /^[-*] /.test(line))) {
        return (
          <ul key={index}>
            {lines.map((line, lineIndex) => (
              <li key={lineIndex}>{inlineMarkdown(line.slice(2))}</li>
            ))}
          </ul>
        )
      }
      return <p key={index}>{inlineMarkdown(block)}</p>
    })
}

function CopilotPrompts({
  compact = false,
  pending,
  onSelect,
}: {
  compact?: boolean
  pending: boolean
  onSelect: (question: string) => void
}) {
  const tl = useUiText()

  const reduceMotion = useReducedMotion()
  const questions = compact
    ? recommendedQuestions.slice(0, 3)
    : recommendedQuestions

  return (
    <ul
      className={compact ? "copilot-chips" : "copilot-suggestions"}
      aria-label={tl("推荐问题")}
    >
      {questions.map(({ id, text }) => (
        <li key={id}>
          <Button
            size="default"
            variant="outline"
            className={compact ? "copilot-chip" : "copilot-suggestion"}
            disabled={pending}
            asChild
          >
            <MotionButton
              type="button"
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              transition={panelTransition}
              onClick={() => onSelect(tl(text))}
            >
              {tl(text)}
              {!compact && (
                <AppIcon
                  icon={SolarArrowUpRight}
                  size={16}
                  aria-hidden="true"
                />
              )}
            </MotionButton>
          </Button>
        </li>
      ))}
    </ul>
  )
}

function OpenCopilotPanel({ copilot }: CopilotPanelProps) {
  const tl = useUiText()

  const reduceMotion = useReducedMotion()
  const present = useIsPresent()
  const panel = useRef<HTMLElement>(null)
  const composer = useRef<HTMLTextAreaElement>(null)
  const scrollArea = useRef<HTMLDivElement>(null)
  const followLatest = useRef(true)
  const [copyNotice, setCopyNotice] = useState("")
  const [transparent, setTransparent] = useState(false)
  const titleId = `${copilot.panelId}-title`
  const historyId = `${copilot.panelId}-history`
  const inputHintId = `${copilot.panelId}-input-hint`
  const hasMessages = copilot.messages.length > 0

  useLayoutEffect(() => {
    panel.current?.focus({ preventScroll: true })
  }, [])

  useLayoutEffect(() => {
    const scroller = scrollArea.current
    if (scroller && followLatest.current && !copilot.compact && hasMessages) {
      scroller.scrollTop = scroller.scrollHeight
    }
  }, [
    copilot.compact,
    copilot.messages,
    copilot.pending,
    copilot.failedQuestion,
    hasMessages,
  ])

  function send(question: string) {
    followLatest.current = true
    setCopyNotice("")
    copilot.send(question)
    composer.current?.focus({ preventScroll: true })
  }

  return (
    <MotionAside
      ref={panel}
      id={copilot.panelId}
      aria-labelledby={titleId}
      className="copilot-panel"
      data-compact={copilot.compact || undefined}
      data-transparent={transparent || undefined}
      inert={!present}
      tabIndex={-1}
      initial={reduceMotion ? false : collapsedPanel}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduceMotion ? undefined : collapsedPanel}
      transition={reduceMotion ? { duration: 0 } : panelTransition}
      onKeyDown={(event) => {
        if (event.key === "Escape" && !event.nativeEvent.isComposing) {
          event.stopPropagation()
          copilot.close()
        }
      }}
    >
      <header className="copilot-header">
        <span className="copilot-mark">
          <AppIcon icon={SolarSparkles} size={16} aria-hidden="true" />
        </span>
        <h2 className="copilot-title" id={titleId}>
          {tl("AI 助手")}
        </h2>
        <span className="copilot-beta">Beta</span>
        <div className="copilot-header-actions">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="copilot-icon-button copilot-transparency-button"
                aria-label={tl("透明模式")}
                aria-pressed={transparent}
                onClick={() => setTransparent((enabled) => !enabled)}
              >
                <AppIcon icon={SolarEye} size={16} aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={6}>
              {transparent ? tl("恢复玻璃模式") : tl("启用透明模式")}
            </TooltipContent>
          </Tooltip>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="copilot-icon-button"
            aria-label={tl("新对话")}
            title={tl("新对话")}
            disabled={!hasMessages && !copilot.draft.trim()}
            onClick={() => {
              followLatest.current = true
              setCopyNotice("")
              copilot.clear()
              composer.current?.focus({ preventScroll: true })
            }}
          >
            <AppIcon icon={SolarPlus} size={16} aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="copilot-icon-button"
            aria-label={copilot.compact ? tl("展开对话") : tl("收起对话")}
            title={copilot.compact ? tl("展开对话") : tl("收起对话")}
            aria-expanded={!copilot.compact}
            aria-controls={historyId}
            onClick={() => copilot.setCompact(!copilot.compact)}
          >
            <AppIcon
              icon={copilot.compact ? SolarMaximize2 : SolarMinimize2}
              size={16}
              aria-hidden="true"
            />
          </Button>
          <CloseButton
            className="copilot-icon-button"
            aria-label={tl("关闭智算助手")}
            title={tl("关闭智算助手")}
            onClick={copilot.close}
          />
        </div>
      </header>

      <div
        id={historyId}
        className="copilot-history"
        hidden={copilot.compact}
        ref={scrollArea}
        onScroll={(event) => {
          const { scrollHeight, scrollTop, clientHeight } = event.currentTarget
          followLatest.current = scrollHeight - scrollTop - clientHeight < 64
        }}
      >
        {hasMessages ? (
          <div role="log" aria-label={tl("对话记录")} aria-relevant="additions">
            <ol className="copilot-messages">
              {copilot.messages.map(({ id, role, text, questionId }) => (
                <MotionLi
                  key={id}
                  className="copilot-message"
                  data-role={role}
                  initial={reduceMotion ? false : { opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={dialogEntry.transition}
                >
                  <span className="sr-only">
                    {role === "user" ? tl("你") : tl("AI 助手")}
                  </span>
                  <Message
                    align={role === "user" ? "end" : "start"}
                    className="copilot-message-row"
                  >
                    <MessageContent className="gap-1">
                      {role === "user" ? (
                        <Bubble variant="secondary" className="max-w-[88%]">
                          <BubbleContent className="copilot-question">
                            {text}
                          </BubbleContent>
                        </Bubble>
                      ) : (
                        <>
                          <Bubble variant="ghost">
                            <BubbleContent className="copilot-reply">
                              <ReplyMarkdown text={text} />
                              <CopilotSummary questionId={questionId} />
                            </BubbleContent>
                          </Bubble>
                          <MessageFooter className="px-0">
                            <CopyButton
                              value={text}
                              label={tl("复制回复")}
                              variant="ghost"
                              size="xs"
                              className="copilot-copy"
                              announce={false}
                              onCopied={() => setCopyNotice(tl("已复制回复"))}
                              onError={() =>
                                setCopyNotice(
                                  tl("复制失败，请选中文本后手动复制。")
                                )
                              }
                            />
                          </MessageFooter>
                        </>
                      )}
                    </MessageContent>
                  </Message>
                </MotionLi>
              ))}
            </ol>
          </div>
        ) : (
          <div className="copilot-welcome">
            <span className="copilot-welcome-mark">
              <AppIcon icon={SolarSparkles} aria-hidden="true" />
            </span>
            <h3>{tl("想核对哪项云成本？")}</h3>
            <p>{tl("使用演示数据")}</p>
            {copilot.compact || (
              <CopilotPrompts pending={copilot.pending} onSelect={send} />
            )}
          </div>
        )}

        <MotionSpan
          className={copilot.pending ? "copilot-loading" : "sr-only"}
          role="status"
          initial={false}
          animate={{ opacity: copilot.pending ? 1 : 0 }}
          transition={reduceMotion ? { duration: 0 } : dialogEntry.transition}
        >
          {copilot.pending && <>{tl("正在整理演示数据…")}</>}
        </MotionSpan>

        {copilot.failedQuestion && (
          <div className="copilot-error">
            <p role="alert">{tl("暂时无法生成回复，你可以重试。")}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                followLatest.current = true
                copilot.retry()
                composer.current?.focus({ preventScroll: true })
              }}
            >
              <AppIcon icon={SolarRotateCw} size={16} aria-hidden="true" />{" "}
              {tl("重试回答")}
            </Button>
          </div>
        )}
      </div>

      {copilot.compact && (
        <CopilotPrompts compact pending={copilot.pending} onSelect={send} />
      )}
      <footer className="copilot-footer">
        <p
          className={copyNotice ? "copilot-copy-notice" : "sr-only"}
          role="status"
        >
          {copyNotice}
        </p>
        <div
          className="copilot-glow"
          data-active={copilot.pending || undefined}
        >
          <form
            className="copilot-composer field-surface"
            onSubmit={(event) => {
              event.preventDefault()
              send(copilot.draft)
            }}
          >
            <Textarea
              embedded
              ref={composer}
              rows={1}
              aria-label={tl("向智算助手提问")}
              aria-describedby={inputHintId}
              placeholder={tl("问我怎么操作或查数据…")}
              value={copilot.draft}
              onChange={(event) => copilot.setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (
                  event.key !== "Enter" ||
                  event.shiftKey ||
                  event.nativeEvent.isComposing ||
                  event.nativeEvent.keyCode === 229
                )
                  return
                event.preventDefault()
                if (!copilot.pending && copilot.draft.trim())
                  send(copilot.draft)
              }}
            />
            <div className="copilot-composer-actions">
              <Button
                type="submit"
                size="icon-sm"
                className="copilot-send"
                aria-label={tl("发送问题")}
                title={tl("发送问题")}
                disabled={copilot.pending || !copilot.draft.trim()}
              >
                <MotionSpan
                  key={copilot.pending ? "waiting" : "ready"}
                  initial={reduceMotion ? false : { opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                  transition={dialogEntry.transition}
                >
                  <AppIcon
                    icon={copilot.pending ? SolarEllipsis : SolarPlain3}
                    size={16}
                    stateful
                    aria-hidden="true"
                  />
                </MotionSpan>
              </Button>
            </div>
            <p className="sr-only" id={inputHintId}>
              {tl("Enter 发送 · Shift + Enter 换行")}
            </p>
          </form>
        </div>
      </footer>
    </MotionAside>
  )
}

export function CopilotPanel({
  open,
  copilot,
}: CopilotPanelProps & { open: boolean }) {
  return (
    <AnimatePresence>
      {open && <OpenCopilotPanel key="copilot" copilot={copilot} />}
    </AnimatePresence>
  )
}
