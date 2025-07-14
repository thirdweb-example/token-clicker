'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/query-client'
import { SoundProvider } from '@/lib/contexts/sound-context'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SoundProvider>
        {children}
      </SoundProvider>
    </QueryClientProvider>
  )
} 