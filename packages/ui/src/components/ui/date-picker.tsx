"use client"

import * as React from "react"
import { format } from "date-fns"
import { cn } from "cn"

import { AppIcon, SolarCalendar, SolarClock3 } from "../icons"
import { Button } from "./button"
import { Calendar } from "./calendar"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { useUiLabels } from "../../lib/ui-labels"

/**
 * Themed replacements for the browser's native date and time pickers (whose
 * popups cannot be styled): a field-style trigger that opens Marismoon's own
 * Calendar or time list inside a glass popover.
 */
function DatePicker({
  id,
  defaultValue,
  placeholder = "yyyy/mm/dd",
  className,
}: {
  id?: string
  defaultValue?: Date
  placeholder?: string
  className?: string
}) {
  const [date, setDate] = React.useState<Date | undefined>(defaultValue)
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-start font-normal data-[empty=true]:text-muted-foreground",
            className
          )}
          data-empty={!date}
        >
          <AppIcon icon={SolarCalendar} data-icon="inline-start" />
          {date ? format(date, "yyyy/MM/dd") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-1" align="start">
        <Calendar
          mode="single"
          selected={date}
          defaultMonth={date}
          onSelect={(next) => {
            setDate(next)
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"))
const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"))

function TimeColumn({
  label,
  values,
  value,
  onSelect,
}: {
  label: string
  values: string[]
  value: string
  onSelect: (value: string) => void
}) {
  return (
    <div
      role="listbox"
      aria-label={label}
      className="grid max-h-48 w-14 content-start gap-0.5 overflow-y-auto p-0.5"
    >
      {values.map((item) => (
        <button
          key={item}
          type="button"
          role="option"
          aria-selected={item === value}
          onClick={() => onSelect(item)}
          className={cn(
            "h-7 rounded-full text-[0.8125rem] font-medium tabular-nums transition-colors hover:bg-(--sidebar-item-hover)",
            item === value &&
              "bg-primary text-primary-foreground shadow-(--field-shadow) hover:bg-primary"
          )}
        >
          {item}
        </button>
      ))}
    </div>
  )
}

function TimePicker({
  id,
  defaultValue = "10:30",
  className,
}: {
  id?: string
  /** "HH:mm" */
  defaultValue?: string
  className?: string
}) {
  const [value, setValue] = React.useState(defaultValue)
  const [hour = "00", minute = "00"] = value.split(":")
  const labels = useUiLabels()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-start font-normal tabular-nums",
            className
          )}
        >
          <AppIcon icon={SolarClock3} data-icon="inline-start" />
          {hour}:{minute}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex w-auto gap-1 p-1" align="start">
        <TimeColumn
          label={labels.hour}
          values={hours}
          value={hour}
          onSelect={(h) => setValue(`${h}:${minute}`)}
        />
        <TimeColumn
          label={labels.minute}
          values={minutes}
          value={minute}
          onSelect={(m) => setValue(`${hour}:${m}`)}
        />
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker, TimePicker }
