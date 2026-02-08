'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

type RefreshContextType = {
  refreshKey: number
  triggerRefresh: () => void
  hardRefresh: () => void
}

const RefreshContext = createContext<RefreshContextType | undefined>(undefined)

export function RefreshProvider({ children }: { children: ReactNode }) {
  const [refreshKey, setRefreshKey] = useState(0)

  const triggerRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1)
  }, [])

  const hardRefresh = useCallback(() => {
    // Remove listener to allow reload without prompt
    window.onbeforeunload = null
    window.location.reload()
  }, [])

  // Prevent accidental reloads and intercept shortcuts
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = '' 
      return '' 
    }
    
    // ... handleKeyDown ...
    const handleKeyDown = (e: KeyboardEvent) => {
        // Intercept F5 or Ctrl+R / Cmd+R
        if ((e.key === 'F5') || ((e.ctrlKey || e.metaKey) && e.key === 'r')) {
            // Check if Shift is also pressed -> Hard Refresh
            if (e.shiftKey) {
                // Let the browser do its native hard refresh (Ctrl+Shift+R)
                // We just need to NOT preventDefault. 
                // But wait, if we don't preventDefault, handleBeforeUnload might still catch it?
                // Actually, Ctrl+Shift+R usually bypasses cache. 
                // Let's explicitly trigger our hardRefresh if we want to force it.
                e.preventDefault()
                hardRefresh()
                return
            }

            e.preventDefault()
            triggerRefresh()
            console.log('Soft refresh triggered via shortcut')
        }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('keydown', handleKeyDown)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [triggerRefresh, hardRefresh])

  return (
    <RefreshContext.Provider value={{ refreshKey, triggerRefresh, hardRefresh }}>
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
