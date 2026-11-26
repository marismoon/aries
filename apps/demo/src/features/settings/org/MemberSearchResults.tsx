import {
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
} from "@marismoon/ui/ui/combobox"
import { useUiText } from "@/lib/i18n/use-ui-text"
import type { DemoMember } from "@/shared/types/workspace-settings"

export function matchesMemberSearch(
  member: DemoMember,
  query: string,
  itemToString?: (member: DemoMember) => string
) {
  const search = query.trim().toLowerCase()
  return [member.name, itemToString?.(member) ?? "", member.email].some(
    (value) => value.toLowerCase().includes(search)
  )
}

export function MemberSearchResults() {
  const tl = useUiText()

  return (
    <>
      <ComboboxEmpty className="flex empty:p-0">
        {tl("没有匹配的成员")}
      </ComboboxEmpty>
      <ComboboxList className="max-h-40 pointer-coarse:max-h-48">
        {(member: DemoMember) => (
          <ComboboxItem
            key={member.id}
            value={member}
            className="pointer-coarse:min-h-(--control-size-dense)"
          >
            <span className="grid min-w-0 gap-0.5">
              <span>{tl(member.name)}</span>
              <span className="text-xs [overflow-wrap:anywhere] text-muted-foreground">
                {member.email}
              </span>
            </span>
          </ComboboxItem>
        )}
      </ComboboxList>
    </>
  )
}
