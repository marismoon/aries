import { useEffect, useId, useRef, useState } from "react"

import { useUiText } from "@/lib/i18n/use-ui-text"
import { useDashboardDemo } from "@/features/overview/hooks/useDashboardDemo"
import {
  getCopilotQuestionId,
  getCopilotReply,
  type CopilotQuestionId,
} from "./copilot-demo"

export interface CopilotMessage {
  id: number
  role: "user" | "assistant"
  text: string
  questionId?: CopilotQuestionId
}

export function useCopilot() {
  const { attention } = useDashboardDemo()
  const tl = useUiText()
  const panelId = useId()
  const [open, setOpen] = useState(false)
  const [compact, setCompact] = useState(true)
  const [draft, setDraft] = useState("")
  const [messages, setMessages] = useState<CopilotMessage[]>([])
  const [pending, setPending] = useState(false)
  const [failedQuestion, setFailedQuestion] = useState<string | null>(null)
  const launcher = useRef<HTMLElement | null>(null)
  const isOpen = useRef(false)
  const timer = useRef<number | null>(null)
  const nextId = useRef(0)

  useEffect(() => {
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current)
    }
  }, [])

  function openFrom(element: HTMLElement | null) {
    if (isOpen.current) {
      document.getElementById(panelId)?.focus({ preventScroll: true })
      return
    }
    launcher.current = element
    isOpen.current = true
    setOpen(true)
  }

  function close() {
    const shouldRestore = document
      .getElementById(panelId)
      ?.contains(document.activeElement)
    isOpen.current = false
    setOpen(false)
    if (shouldRestore) restoreFocus()
  }

  function restoreFocus() {
    requestAnimationFrame(() => {
      if (isOpen.current) return
      const element = launcher.current
      const target =
        element?.isConnected && element.getClientRects().length
          ? element
          : document.querySelector<HTMLElement>("#main-content")
      target?.focus({ preventScroll: true })
    })
  }

  function addMessage(
    role: CopilotMessage["role"],
    text: string,
    questionId?: CopilotQuestionId
  ) {
    const id = nextId.current++
    setMessages((current) => [...current, { id, role, text, questionId }])
  }

  function requestReply(question: string) {
    setFailedQuestion(null)
    setPending(true)
    timer.current = window.setTimeout(() => {
      try {
        addMessage(
          "assistant",
          getCopilotReply(question, attention, tl),
          getCopilotQuestionId(question, tl)
        )
      } catch {
        setFailedQuestion(question)
      } finally {
        timer.current = null
        setPending(false)
      }
    }, 380)
  }

  function send(input: string) {
    const question = input.trim()
    if (!question || timer.current !== null) return

    setDraft("")
    setCompact(false)
    addMessage("user", question)
    requestReply(question)
  }

  function retry() {
    if (failedQuestion && timer.current === null) requestReply(failedQuestion)
  }

  function clear() {
    if (timer.current !== null) window.clearTimeout(timer.current)
    timer.current = null
    setDraft("")
    setCompact(true)
    setMessages([])
    setPending(false)
    setFailedQuestion(null)
  }

  return {
    panelId,
    open,
    compact,
    setCompact,
    openFrom,
    close,
    restoreFocus,
    draft,
    setDraft,
    messages,
    pending,
    failedQuestion,
    send,
    retry,
    clear,
  }
}
