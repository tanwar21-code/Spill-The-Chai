
'use client'

import { AuthProvider } from '@/context/auth-context'
import { Toaster } from 'sonner'

import { RefreshProvider } from '@/context/refresh-context'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <RefreshProvider>
      <AuthProvider>
        {children}
        <Toaster />
      </AuthProvider>
    </RefreshProvider>
  )
}
