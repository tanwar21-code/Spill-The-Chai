'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

type RefreshContextType = {
  refreshKey: number
  triggerRefresh: () => void
  hardReset: () => void
}

const RefreshContext = createContext<RefreshContextType | undefined>(undefined)

export function RefreshProvider({ children }: { children: ReactNode }) {
  const [refreshKey, setRefreshKey] = useState(0)

  const triggerRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1)
  }, [])

  const hardReset = useCallback(async () => {
      try {
          // 1. Clear Local & Session Storage
          if (typeof window !== 'undefined') {
              window.localStorage.clear()
              window.sessionStorage.clear()
          }

          // 2. Clear Browser Cache (Service Workers, etc)
          if ('caches' in window) {
              const keys = await caches.keys()
              await Promise.all(keys.map(key => caches.delete(key)))
          }
          
          // 3. Unregister Service Workers
          if ('serviceWorker' in navigator) {
              const registrations = await navigator.serviceWorker.getRegistrations()
              for (const registration of registrations) {
                  await registration.unregister()
              }
          }

          console.log('App data reset complete.')
          
          // 4. Force Reload
          window.location.reload()
      } catch (error) {
          console.error("Reset failed:", error)
          window.location.reload() // Reload anyway
      }
  }, [])

  // Prevent accidental reloads and intercept shortcuts
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = '' 
      return '' 
    }
    
    const handleKeyDown = (e: KeyboardEvent) => {
        // Intercept F5 or Ctrl+R / Cmd+R
        if ((e.key === 'F5') || ((e.ctrlKey || e.metaKey) && e.key === 'r')) {
            e.preventDefault()
            triggerRefresh()
            // Optional: Show a toast or logs to indicate soft refresh happened
            console.log('Soft refresh triggered via shortcut')
        }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('keydown', handleKeyDown)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [triggerRefresh])

  return (
    <RefreshContext.Provider value={{ refreshKey, triggerRefresh, hardReset }}>
      {children}
    </RefreshContext.Provider>
  )
}

export function useRefresh() {
  const context = useContext(RefreshContext)
  if (context === undefined) {
    throw new Error('useRefresh must be used within a RefreshProvider')
  }
  return context
}
