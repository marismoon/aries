import { useEffect } from "react"

/** Keeps `document.title` in sync with the current page, e.g.
 * `useDocumentTitle(\`${pageTitle} · Aries\`)`. Runs only in the browser. */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title
  }, [title])
}
