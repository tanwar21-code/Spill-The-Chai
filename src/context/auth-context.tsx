
'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Session } from '@supabase/supabase-js'
import { UserProfile } from '@/types'
import { useRouter } from 'next/navigation'

type AuthContextType = {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  isLoading: boolean
  authReady: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
      } else {
        setProfile(data)
      }
    } catch (error) {
      console.error('Unexpected error fetching profile:', error)
    }
  }

  /* 
    FIX: Separate "auth ready" from "loading". 
    loading = initial profile fetch
    authReady = session determined (logged in or guest)
  */
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    let mounted = true

    const init = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
           console.error('Error restoring session:', error)
        }

        if (mounted) {
           if (session) {
             setSession(session)
             setUser(session.user)
             await fetchProfile(session.user.id)
           }
           setAuthReady(true)
           setIsLoading(false)
        }
      } catch (err) {
         console.error('Unexpected error in restoreSession:', err)
         if (mounted) {
             setAuthReady(true)
             setIsLoading(false)
         }
      }
    }

    init()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      // FIX: Never overwrite valid session with null unless SIGNED_OUT
      if (event === 'SIGNED_OUT') {
        setSession(null)
        setUser(null)
        setProfile(null)
        // router.refresh() // Optional: force refresh on logout
        return
      }

      if (session) {
        setSession(session)
        setUser(session.user)
        
        // Refresh profile if user changed or just to be safe
        if (session.user.id !== user?.id) {
            await fetchProfile(session.user.id)
        }
      }
      
      setAuthReady(true)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        authReady,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
