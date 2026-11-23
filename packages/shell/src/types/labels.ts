import { createContext, useContext } from "react"

export interface ShellLabels {
  openNavigation: string
  navigationTitle: string
  skipToContent: string
  collapseNavigation: string
  expandNavigation: string
  mainModules: string
  pageContent: string
  breadcrumb: string
  language: string
  commandSearch: string
  commandTitle: string
  commandDescription: string
  commandInput: string
  commandResults: string
  commandEmpty: string
  directory: string
  switchModule: string
  workspaceScope: string
  myTasks: string
  allData: string
  help: string
  setupGuide: string
  support: string
}

export interface LanguageControlProps {
  value: string
  options: readonly { value: string; label: string }[]
  onChange: (value: string) => void
}

const ShellTextContext = createContext<{
  labels: ShellLabels
  languageControl: LanguageControlProps
} | null>(null)

export const ShellLabelsProvider = ShellTextContext.Provider

function useShellText() {
  const text = useContext(ShellTextContext)
  if (!text) throw new Error("ShellLabelsProvider is required")
  return text
}

export function useShellLabels() {
  return useShellText().labels
}

export function useShellLanguageControl() {
  return useShellText().languageControl
}
