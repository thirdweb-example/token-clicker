import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 4 * 1000, // Data is fresh for 4 seconds
      refetchInterval: 5 * 1000, // Auto-refetch every 5 seconds
      refetchIntervalInBackground: true,
      refetchOnWindowFocus: true,
      retry: 2,
    },
    mutations: {
      retry: 1,
    },
  },
}) 