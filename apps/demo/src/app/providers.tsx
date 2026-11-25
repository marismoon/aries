import { useEffect, useState, type ReactNode } from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import { domAnimation, LazyMotion, MotionConfig } from "motion/react"
import { ThemeProvider } from "next-themes"

import { UiLabelsBridge } from "@/lib/i18n/UiLabelsBridge"
import { createQueryClient } from "@/lib/query-client"
import { TooltipProvider } from "@marismoon/ui/ui/tooltip"
import {
  BillsDemoContext,
  useBillsDemoState,
} from "@/features/bills/hooks/useBillsDemo"
import {
  DashboardDemoContext,
  useDashboardDemoState,
} from "@/features/overview/hooks/useDashboardDemo"

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

function DemoProviders({ children }: { children: ReactNode }) {
  const dashboard = useDashboardDemoState()
  const bills = useBillsDemoState()
  return (
    <DashboardDemoContext value={dashboard}>
      <BillsDemoContext value={bills}>{children}</BillsDemoContext>
    </DashboardDemoContext>
  )
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient)
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        storageKey="aries-theme"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        // index.html applies the theme before the first paint. next-themes'
        // own inline script only runs in server-rendered HTML; as a data
        // block it stays inert here and React does not warn about it.
        scriptProps={{ type: "application/json" }}
      >
        <ThemeColor />
        <LazyMotion features={domAnimation}>
          <MotionConfig reducedMotion="user">
            <TooltipProvider delayDuration={450}>
              <UiLabelsBridge>
                <DemoProviders>{children}</DemoProviders>
              </UiLabelsBridge>
            </TooltipProvider>
          </MotionConfig>
        </LazyMotion>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
