import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import { App } from "@/app/App"
import {
  applyStoredDarkStyle,
  applyStoredPalette,
} from "@marismoon/ui/lib/storage"
import "@/lib/i18n"
import "./index.css"

applyStoredPalette()
applyStoredDarkStyle()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
