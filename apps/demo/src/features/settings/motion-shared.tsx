import { useState, type ReactNode } from "react"

import { SolarRefreshCcw } from "@aries/ui/icons"
import { Button } from "@aries/ui/ui/button"
import { Card, CardContent, CardTitle } from "@aries/ui/ui/card"
import "./components-preview.css"

export const spring = { type: "spring", stiffness: 380, damping: 30 } as const

export function Demo({
  title,
  usage,
  onReplay,
  children,
}: {
  title: string
  usage: string
  onReplay?: () => void
  children: ReactNode
}) {
  return (
    <Card className="surface component-card">
      <div className="flex items-center justify-between gap-2">
        <CardTitle className="text-sm">{title}</CardTitle>
        {onReplay && (
          <Button variant="outline" size="sm" onClick={onReplay}>
            <SolarRefreshCcw data-icon="inline-start" />
            重播
          </Button>
        )}
      </div>
      <CardContent className="grid grid-cols-[minmax(0,1fr)] gap-3 p-0">
        <div className="flex min-h-28 min-w-0 flex-wrap items-center gap-3">
          {children}
        </div>
        <p className="text-xs text-muted-foreground">用法：{usage}</p>
      </CardContent>
    </Card>
  )
}

export function useReplay() {
  const [run, setRun] = useState(0)
  return [run, () => setRun((value) => value + 1)] as const
}
