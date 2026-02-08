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

  // Prevent accidental reloads
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = '' // Chrome requires returnValue to be set
      return '' // Most modern browsers ignore message but require return
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

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
