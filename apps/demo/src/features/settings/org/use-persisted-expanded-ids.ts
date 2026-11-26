import { useCallback, useState } from "react"

/**
 * Persists a directory tree's expanded node IDs in localStorage so collapsing
 * or expanding survives both route navigation and browser reloads.
 * An empty array `[]` is preserved as an explicit "all collapsed" state.
 */
export function usePersistedExpandedIds(
  storageKey: string | undefined,
  defaultIds: readonly string[]
) {
  const [expandedIds, setExpandedIdsState] = useState<Set<string>>(() => {
    if (storageKey && typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(storageKey)
        if (raw !== null) {
          const parsed: unknown = JSON.parse(raw)
          if (
            Array.isArray(parsed) &&
            parsed.every((item): item is string => typeof item === "string")
          ) {
            return new Set(parsed)
          }
        }
      } catch {
        // Ignore storage read errors and fall back to defaults.
      }
    }
    return new Set(defaultIds)
  })

  const setExpandedIds = useCallback(
    (next: Set<string> | ((prev: Set<string>) => Set<string>)) => {
      setExpandedIdsState((prev) => {
        const resolved = typeof next === "function" ? next(prev) : next
        if (storageKey && typeof window !== "undefined") {
          try {
            window.localStorage.setItem(
              storageKey,
              JSON.stringify([...resolved])
            )
          } catch {
            // Ignore storage quota errors and keep in-memory state.
          }
        }
        return resolved
      })
    },
    [storageKey]
  )

  return [expandedIds, setExpandedIds] as const
}
