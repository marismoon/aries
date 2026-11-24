import { useEffect, type ReactNode } from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import { domAnimation, LazyMotion, MotionConfig } from "motion/react"
import { ThemeProvider } from "next-themes"

import { TooltipProvider } from "@marismoon/ui/ui/tooltip"
import { queryClient } from "../shared/query-client"

function ThemeColor() {
  useEffect(() => {
    const root = document.documentElement
    const meta = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]'
    )
    if (!meta) return

    const syncThemeColor = () => {
      meta.content = getComputedStyle(root)
        .getPropertyValue("--background")
        .trim()
    }

    const observer = new MutationObserver(syncThemeColor)
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["class", "data-palette"],
    })
    syncThemeColor()
    return () => observer.disconnect()
  }, [])

  return null
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        storageKey="aries-theme"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <ThemeColor />
        <LazyMotion features={domAnimation}>
          <MotionConfig reducedMotion="user">
            <TooltipProvider delayDuration={450}>{children}</TooltipProvider>
          </MotionConfig>
        </LazyMotion>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
