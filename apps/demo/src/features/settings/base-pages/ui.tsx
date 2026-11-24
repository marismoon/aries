import { createContext, useContext, type ReactNode } from "react"

import {
  AppIcon,
  SolarCheck,
  SolarCopy,
  SolarHomeSmileAngle,
  SolarCircleAlert,
  type AppIconComponent,
} from "@aries/ui/icons"
import { Alert, AlertDescription } from "@aries/ui/ui/alert"
import { Avatar, AvatarFallback } from "@aries/ui/ui/avatar"
import { Button } from "@aries/ui/ui/button"
import { Card, CardContent } from "@aries/ui/ui/card"
import { Checkbox } from "@aries/ui/ui/checkbox"
import { EmptyMedia } from "@aries/ui/ui/empty"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@aries/ui/ui/item"
import { Field, FieldDescription, FieldLabel } from "@aries/ui/ui/field"
import { Input } from "@aries/ui/ui/input"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@aries/ui/ui/input-otp"
import { cn } from "@aries/ui/lib/utils"
import { useUiText } from "@/lib/i18n/use-ui-text"

/** Navigation inside the full-screen preview (the page itself is static). */
type ScreenNav = { go: (key: string) => void; close: () => void }
export const ScreenNavContext = createContext<ScreenNav>({
  go: () => undefined,
  close: () => undefined,
})
export const useScreenNav = () => useContext(ScreenNavContext)

export function ScreenCard({ children }: { children: ReactNode }) {
  return (
    <Card className="surface base-screen">
      <CardContent className="grid gap-4">{children}</CardContent>
    </Card>
  )
}

export function Brand() {
  const tl = useUiText()

  return (
    <div className="base-brand">
      <span className="base-brand-mark">
        <AppIcon icon={SolarHomeSmileAngle} size={20} aria-hidden="true" />
      </span>
      <div>
        <b>Aries</b>
        <small>{tl("运营管理平台")}</small>
      </div>
    </div>
  )
}

export function Heading({
  title,
  children,
}: {
  title: string
  children?: ReactNode
}) {
  return (
    <header className="base-heading">
      <h1>{title}</h1>
      {children && <p>{children}</p>}
    </header>
  )
}

const tones = {
  default: "bg-accent text-accent-foreground",
  warning: "bg-(--warning-bg) text-(--warning)",
  danger: "bg-(--danger-bg) text-(--danger)",
  success: "bg-(--success-bg) text-(--success)",
} as const

export function StatusIcon({
  icon,
  tone = "default",
}: {
  icon: AppIconComponent
  tone?: keyof typeof tones
}) {
  return (
    <EmptyMedia variant="icon" className={cn("mb-0", tones[tone])}>
      <AppIcon icon={icon} aria-hidden="true" />
    </EmptyMedia>
  )
}

export function ErrorCode({ children }: { children: ReactNode }) {
  return <div className="base-code">{children}</div>
}

export function TextField({
  label,
  hint,
  type = "text",
  placeholder,
  defaultValue,
}: {
  label: string
  hint?: string
  type?: string
  placeholder?: string
  defaultValue?: string
}) {
  const id = `base-${label}`
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        type={type}
        controlSize="default"
        placeholder={placeholder}
        defaultValue={defaultValue}
      />
      {hint && <FieldDescription>{hint}</FieldDescription>}
    </Field>
  )
}

export function OtpField({ label: labelProp }: { label?: string }) {
  const tl = useUiText()
  const label = labelProp ?? tl("动态口令")

  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <InputOTP
        maxLength={6}
        aria-label={label}
        containerClassName="justify-center"
      >
        <InputOTPGroup className="gap-2">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <InputOTPSlot key={index} index={index} />
          ))}
        </InputOTPGroup>
      </InputOTP>
    </Field>
  )
}

export function Remember({ children }: { children: ReactNode }) {
  return (
    <label className="base-check">
      <Checkbox defaultChecked />
      <span>{children}</span>
    </label>
  )
}

export function Steps({
  current,
  labels,
}: {
  current: number
  labels: readonly string[]
}) {
  return (
    <ol className="base-steps">
      {labels.map((label, index) => (
        <li
          key={label}
          data-state={
            index < current ? "done" : index === current ? "current" : "todo"
          }
        >
          <i>
            {index < current ? (
              <AppIcon icon={SolarCheck} size={12} aria-hidden="true" />
            ) : (
              index + 1
            )}
          </i>
          <span>{label}</span>
        </li>
      ))}
    </ol>
  )
}

export function Tip({ children }: { children: ReactNode }) {
  return (
    <Alert>
      <AppIcon icon={SolarCircleAlert} aria-hidden="true" />
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  )
}

export function KeyValue({
  rows,
}: {
  rows: readonly (readonly [string, string])[]
}) {
  return (
    <Item variant="muted" size="sm">
      <ItemContent>
        <dl className="base-kv">
          {rows.map(([key, value]) => (
            <div key={key}>
              <dt>{key}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </ItemContent>
    </Item>
  )
}

export function HelpList({
  items,
}: {
  items: readonly (readonly [string, string])[]
}) {
  return (
    <ItemGroup className="gap-2">
      {items.map(([title, text]) => (
        <Item key={title} variant="muted" size="sm">
          <ItemContent>
            <ItemTitle>{title}</ItemTitle>
            <ItemDescription className="line-clamp-none">
              {text}
            </ItemDescription>
          </ItemContent>
        </Item>
      ))}
    </ItemGroup>
  )
}

export function QrBlock() {
  const tl = useUiText()

  return (
    <div className="base-qr">
      <div className="base-qr-grid" role="img" aria-label={tl("二维码示意")}>
        {Array.from({ length: 81 }, (_, i) => (
          <i
            key={i}
            data-on={
              [
                0, 1, 2, 6, 7, 8, 9, 17, 18, 20, 23, 27, 29, 31, 33, 36, 38, 40,
                44, 47, 49, 52, 54, 57, 60, 62, 63, 64, 70, 72, 73, 74, 78, 79,
                80,
              ].includes(i) || undefined
            }
          />
        ))}
      </div>
      <div className="base-qr-key">
        <span>{tl("无法扫码？手动输入密钥")}</span>
        <code>JBSW Y3DP EHPK 3PXP</code>
        <Button type="button" variant="outline" size="sm">
          <AppIcon
            icon={SolarCopy}
            data-icon="inline-start"
            aria-hidden="true"
          />

          {tl("复制密钥")}
        </Button>
      </div>
    </div>
  )
}

export function Actions({ children }: { children: ReactNode }) {
  return <div className="base-actions">{children}</div>
}

/** A button that moves to another screen of the preview (or closes it). */
export function GoButton({
  to,
  primary,
  children,
}: {
  to: string
  primary?: boolean
  children: ReactNode
}) {
  const { go, close } = useScreenNav()
  return (
    <Button
      type="button"
      size="default"
      variant={primary ? "default" : "outline"}
      className="base-wide"
      onClick={() => (to === "close" ? close() : go(to))}
    >
      {children}
    </Button>
  )
}

export function Links({
  items,
}: {
  items: readonly (readonly [string, string])[]
}) {
  const { go, close } = useScreenNav()
  return (
    <div className="base-links">
      {items.map(([label, to]) => (
        <Button
          key={label}
          type="button"
          variant="link"
          onClick={() => (to === "close" ? close() : go(to))}
        >
          {label}
        </Button>
      ))}
    </div>
  )
}

export function Account() {
  const tl = useUiText()

  return (
    <Item variant="muted" size="sm">
      <Avatar>
        <AvatarFallback>{tl("陈")}</AvatarFallback>
      </Avatar>
      <ItemContent>
        <ItemTitle>{tl("陈**（系统管理员）")}</ItemTitle>
        <ItemDescription>{tl("星河科技 · ch***@example.test")}</ItemDescription>
      </ItemContent>
    </Item>
  )
}

/** The error number row of the 500 page. */
export function ErrorId({ id }: { id: string }) {
  const tl = useUiText()

  return (
    <Item variant="muted" size="sm">
      <ItemContent>
        <ItemDescription>{tl("错误编号")}</ItemDescription>
        <ItemTitle>
          <code className="base-mono">{id}</code>
        </ItemTitle>
      </ItemContent>
      <ItemActions>
        <Button type="button" variant="outline" size="sm">
          <AppIcon
            icon={SolarCopy}
            data-icon="inline-start"
            aria-hidden="true"
          />

          {tl("复制")}
        </Button>
      </ItemActions>
    </Item>
  )
}
