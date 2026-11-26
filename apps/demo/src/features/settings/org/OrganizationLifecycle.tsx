import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@marismoon/ui/ui/alert-dialog"
import { Button } from "@marismoon/ui/ui/button"
import { useUiText } from "@/lib/i18n/use-ui-text"

export function OrganizationLifecycleActions({
  disabled,
  onToggle,
  onDelete,
}: {
  disabled: boolean
  onToggle?: () => void
  onDelete?: () => void
}) {
  const tl = useUiText()

  return (
    <>
      {onToggle && (
        <Button type="button" variant="outline" onClick={onToggle}>
          {disabled ? tl("启用") : tl("停用")}
        </Button>
      )}
      {onDelete && (
        <Button type="button" variant="destructive" onClick={onDelete}>
          {tl("删除")}
        </Button>
      )}
    </>
  )
}

export function OrganizationDeleteDialog({
  name,
  onClose,
  onConfirm,
}: {
  name: string | null
  onClose: () => void
  onConfirm: () => void
}) {
  const tl = useUiText()

  return (
    <AlertDialog
      open={name !== null}
      onOpenChange={(open) => !open && onClose()}
    >
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {tl("删除「{{name}}」？", { name: name ?? "" })}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {tl("删除后无法恢复。")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{tl("取消")}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            {tl("删除")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
