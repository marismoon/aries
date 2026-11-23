import { QueryClient } from "@tanstack/react-query"

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Demo data is static for the session; a real API should tune this.
        staleTime: Infinity,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  })
}
