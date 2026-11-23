import { BrandPaletteControl } from "@marismoon/ui/shared/BrandPaletteControl"
import { DarkStyleControl } from "@marismoon/ui/shared/DarkStyleControl"
import { LanguageControl } from "./LanguageControl"
import { ThemeSwitcher } from "@marismoon/ui/shared/ThemeSwitcher"
import { useShellLanguageControl } from "./types/labels"

export function WorkspaceControls() {
  const language = useShellLanguageControl()
  return (
    <div className="workspace-tools">
      <DarkStyleControl />
      <LanguageControl {...language} />
      <BrandPaletteControl />
      <ThemeSwitcher />
    </div>
  )
}
