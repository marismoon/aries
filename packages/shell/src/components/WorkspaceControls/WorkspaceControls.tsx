import { BrandPaletteControl } from "@aries/ui/shared/BrandPaletteControl"
import { DarkStyleControl } from "@aries/ui/shared/DarkStyleControl"
import { LanguageControl } from "../LanguageControl"
import { ThemeSwitcher } from "@aries/ui/shared/ThemeSwitcher"
import { useShellLanguageControl } from "../../types/labels"

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
