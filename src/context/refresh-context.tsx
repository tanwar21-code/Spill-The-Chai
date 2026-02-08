'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

type RefreshContextType = {
  refreshKey: number
  triggerRefresh: () => void
}

const RefreshContext = createContext<RefreshContextType | undefined>(undefined)

export function RefreshProvider({ children }: { children: ReactNode }) {
  const [refreshKey, setRefreshKey] = useState(0)

  const triggerRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1)
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
    <RefreshContext.Provider value={{ refreshKey, triggerRefresh }}>
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
