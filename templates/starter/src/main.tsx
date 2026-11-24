import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./styles/index.css"
import { App } from "./app/App"
import {
  applyStoredDarkStyle,
  applyStoredPalette,
} from "@marismoon/ui/lib/storage"
import "./lib/i18n"

applyStoredPalette()
applyStoredDarkStyle()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
