'use client'

import { ThemeProvider } from '@/components/theme-provider'
import { useAuthSync } from '@/lib/hooks/use-auth'

/**
 * Root providers wrapper.
 * Handles global state synchronization like authentication.
 */
function AuthSyncProvider({ children }: { children: React.ReactNode }) {
  useAuthSync()
  return <>{children}</>
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthSyncProvider>{children}</AuthSyncProvider>
    </ThemeProvider>
  )
}