'use client'

import { queryConfig } from '@/hooks/use-cache'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import dynamic from 'next/dynamic'
import { useState } from 'react'
import { TelegramDataProvider } from './providers/telegram-data-provider'
import { TWAProvider } from './providers/twa-provider'
import { SuppressWarnings } from './suppress-warnings'
import { TelegramInit } from './telegram-init'
import { TelegramProvider } from './telegram-provider'

// Load eruda only on client and in development
const ErudaInit = dynamic(() => import('./utils/eruda-init').then(m => m.ErudaInit), {
  ssr: false,
  loading: () => null,
})

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient(queryConfig)
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange
      >
        <SuppressWarnings />
        {process.env.NODE_ENV === 'development' ? <ErudaInit /> : null}
        <TelegramInit>
          <TWAProvider>
            <TelegramProvider>
              <TelegramDataProvider>
                {children}
              </TelegramDataProvider>
            </TelegramProvider>
          </TWAProvider>
        </TelegramInit>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
