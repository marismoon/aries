import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import { App } from "@/app/App"
import { applyStoredDarkStyle, applyStoredPalette } from "@aries/ui/lib/storage"
import "@/lib/i18n"

applyStoredPalette()
applyStoredDarkStyle()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
