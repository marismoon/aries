import { BrandPaletteControl } from "@marismoon/ui/shared/BrandPaletteControl"
import { DarkStyleControl } from "@marismoon/ui/shared/DarkStyleControl"
import { LanguageControl } from "./LanguageControl"
import { ThemeSwitcher } from "@marismoon/ui/shared/ThemeSwitcher"

export function WorkspaceControls() {
  return (
    <div className="workspace-tools">
      <DarkStyleControl />
      <LanguageControl />
      <BrandPaletteControl />
      <ThemeSwitcher />
    </div>
  )
}
