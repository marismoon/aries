const paletteStorageKey = "aries-palette"
const defaultPalette = "telemedicine"

export const paletteLabels = {
  telemedicine: "远程医疗蓝",
  "mental-health": "静心雾蓝",
  "pet-adoption": "暖陶土",
  "health-wellness": "清新草绿",
  "amber-sand": "琥珀暖沙",
} as const

type Palette = keyof typeof paletteLabels

export function isPalette(value: string | null | undefined): value is Palette {
  return typeof value === "string" && Object.hasOwn(paletteLabels, value)
}

export function getStoredPalette(): Palette {
  try {
    const palette = localStorage.getItem(paletteStorageKey)

    if (isPalette(palette)) return palette
  } catch {
    // The default palette works when browser storage is unavailable.
  }

  return defaultPalette
}

export function applyStoredPalette() {
  document.documentElement.dataset.palette = getStoredPalette()
}

export function getActivePalette(): Palette {
  const palette = document.documentElement.dataset.palette
  return isPalette(palette) ? palette : getStoredPalette()
}

export function setStoredPalette(palette: Palette) {
  document.documentElement.dataset.palette = palette

  try {
    localStorage.setItem(paletteStorageKey, palette)
  } catch {
    // The palette still applies for the current page.
  }
}

const darkStyleStorageKey = "aries-dark-style"

export type DarkStyle = "glass" | "clean"

export function getActiveDarkStyle(): DarkStyle {
  return document.documentElement.dataset.darkStyle === "clean"
    ? "clean"
    : "glass"
}

export function applyStoredDarkStyle() {
  try {
    if (localStorage.getItem(darkStyleStorageKey) === "clean") {
      document.documentElement.dataset.darkStyle = "clean"
    }
  } catch {
    // The glass style works when browser storage is unavailable.
  }
}

export function setStoredDarkStyle(style: DarkStyle) {
  if (style === "clean") document.documentElement.dataset.darkStyle = "clean"
  else delete document.documentElement.dataset.darkStyle

  try {
    localStorage.setItem(darkStyleStorageKey, style)
  } catch {
    // The style still applies for the current page.
  }
}
