
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AuthModal } from '@/components/auth/auth-modal'
import { LogOut, User, Search, X } from 'lucide-react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


export function Header() {
  const { user, profile, signOut, isLoading } = useAuth()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false) // For mobile toggling if needed, or just show always 
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  
  // Update local state if URL changes (e.g. back button)
  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '')
  }, [searchParams])

  // Simple debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only push if it's different from current param
      const current = searchParams.get('q') || ''
      if (searchQuery !== current) {
          const params = new URLSearchParams(searchParams.toString())
          if (searchQuery) {
              params.set('q', searchQuery)
          } else {
              params.delete('q')
          }
          router.replace(`/?${params.toString()}`)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery, router, searchParams])

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center mr-4 shrink-0">
            <Image 
              src="/abcd.png" 
              alt="Spill The Chai" 
              width={200} 
              height={56} 
              className={`h-14 w-auto object-contain ${isSearchOpen ? 'hidden md:block' : 'block'}`}
              priority
            />
          </Link>

          {/* Search Bar - Responsive */}
          <div className={`flex-1 max-w-md mx-4 transition-all duration-200 ${isSearchOpen ? 'block absolute left-0 right-0 top-0 h-16 px-4 bg-background flex items-center z-50' : 'hidden md:block relative'}`}>
               <div className="relative w-full">
                   <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                   <Input
                      type="search"
                      placeholder="Search confessions..."
                      className="w-full bg-muted/50 pl-9 pr-8" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                   />
                   {searchQuery && (
                       <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute right-0 top-0 h-full w-9 hover:bg-transparent"
                          onClick={() => setSearchQuery('')}
                       >
                           <X className="h-4 w-4 text-muted-foreground" />
                       </Button>
                   )}
               </div>
               {isSearchOpen && (
                   <Button variant="ghost" size="sm" className="ml-2" onClick={() => setIsSearchOpen(false)}>
                       Cancel
                   </Button>
               )}
          </div>
          
          <nav className="flex items-center gap-2 md:gap-4 shrink-0">
            {/* Mobile Search Toggle */}
            <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden"
                onClick={() => setIsSearchOpen(true)}
            >
                <Search className="h-5 w-5" />
            </Button>

            {isLoading ? (
               <div className="h-9 w-20 animate-pulse rounded bg-muted"></div>
            ) : user && profile ? (
              <div className="flex items-center gap-2 md:gap-4">
                  <span className="hidden text-sm font-medium text-muted-foreground sm:inline-block">
                    @{profile.username}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                       <Button variant="ghost" size="icon" className="rounded-full">
                           <User className="h-5 w-5" />
                           <span className="sr-only">User menu</span>
                       </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem className="font-medium sm:hidden">
                            @{profile.username}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => signOut()} className="text-destructive focus:text-destructive">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
              </div>
            ) : (
              <Button onClick={() => setIsAuthModalOpen(true)} size="sm" id="login-trigger">
                Login
              </Button>
            )}
          </nav>
        </div>
      </header>
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </>
  )
}
