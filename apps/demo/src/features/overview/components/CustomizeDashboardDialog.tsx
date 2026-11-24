import { Button } from "@marismoon/ui/ui/button"
import { Checkbox } from "@marismoon/ui/ui/checkbox"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@marismoon/ui/ui/dialog"
import { cardOptions } from "../hooks/useDashboardDemo"
import { useUiText } from "@/lib/i18n/use-ui-text"

export function CustomizeDashboardDialog({
  visible,
  onChange,
  onReset,
}: {
  visible: readonly string[]
  onChange: (id: string, checked: boolean) => void
  onReset: () => void
}) {
  const tl = useUiText()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" shape="workspace">
          {tl("定制卡片")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tl("定制卡片")}</DialogTitle>
          <DialogDescription>
            {tl("选择在总览显示的卡片，刷新后恢复默认。")}
          </DialogDescription>
        </DialogHeader>

        <fieldset className="dashboard-preferences">
          <legend className="sr-only">{tl("选择总览卡片")}</legend>
          {cardOptions.map(({ id, label, initiallyVisible }) => (
            <label key={id} className="dashboard-preference">
              <Checkbox
                name={id}
                checked={visible.includes(id)}
                onCheckedChange={(checked) => onChange(id, checked === true)}
              />
              <span>{tl(label)}</span>
              {!initiallyVisible && (
                <span className="dashboard-preference-hint">{tl("示例")}</span>
              )}
            </label>
          ))}
        </fieldset>

        <DialogFooter>
          <Button variant="outline" onClick={onReset}>
            {tl("恢复默认")}
          </Button>
          <DialogClose asChild>
            <Button>{tl("完成")}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
