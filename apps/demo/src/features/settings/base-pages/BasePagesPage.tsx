import { useState } from "react"
import { Dialog as DialogPrimitive } from "radix-ui"

import { AppIcon, SolarX } from "@aries/ui/icons"
import { Button } from "@aries/ui/ui/button"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@aries/ui/ui/item"
import { screenGroups, screens } from "./screens"
import { ScreenNavContext } from "./ui"
import "../components-preview.css"
import "./base-pages.css"
import { useUiText } from "@/lib/i18n/use-ui-text"

/** One 基础页面 category: a grid of the full-screen pages, each opened as a
 * clickable preview. The pages themselves are static (no real sign-in). */
export function BasePagesPage({ slug }: { slug: string }) {
  const tl = useUiText()

  const group = screenGroups.find((item) => item.slug === slug)
  const [current, setCurrent] = useState<string | null>(null)
  if (!group) return null

  const screen = current ? screens[current] : undefined
  const Screen = screen?.Component

  return (
    <div className="components-page">
      <p className="base-intro">
        {tl(
          "{{description}} 点击卡片查看全屏预览，预览里的按钮可以在各页面之间跳转。",
          { description: tl(group.description) }
        )}
      </p>
      <ul className="components-grid base-grid" aria-label={tl(group.title)}>
        {group.keys.map((key) => {
          const item = screens[key]
          if (!item) return null
          return (
            <li key={key}>
              <Item asChild variant="outline" className="surface base-card">
                <button
                  type="button"
                  aria-haspopup="dialog"
                  onClick={() => setCurrent(key)}
                >
                  <ItemMedia variant="icon" className="base-card-icon">
                    <AppIcon icon={item.icon} aria-hidden="true" />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>{tl(item.title)}</ItemTitle>
                    <ItemDescription>{tl(item.summary)}</ItemDescription>
                  </ItemContent>
                </button>
              </Item>
            </li>
          )
        })}
      </ul>

      <DialogPrimitive.Root
        open={Boolean(current)}
        onOpenChange={(open) => !open && setCurrent(null)}
      >
        <DialogPrimitive.Portal>
          <DialogPrimitive.Content
            className="base-preview"
            aria-describedby={undefined}
          >
            <DialogPrimitive.Title className="sr-only">
              {screen ? tl(screen.title) : tl("页面预览")}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="base-preview-close"
                aria-label={tl("关闭预览")}
              >
                <AppIcon icon={SolarX} size={18} aria-hidden="true" />
              </Button>
            </DialogPrimitive.Close>
            <ScreenNavContext.Provider
              value={{
                go: (key) => screens[key] && setCurrent(key),
                close: () => setCurrent(null),
              }}
            >
              <div className="base-preview-stage" key={current}>
                {Screen && <Screen />}
              </div>
            </ScreenNavContext.Provider>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </div>
  )
}
