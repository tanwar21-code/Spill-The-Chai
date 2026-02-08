'use client'

import Link from 'next/link'
import { RotateCw, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

import { useRefresh } from '@/context/refresh-context'

export function Footer() {
  const { triggerRefresh, hardReset } = useRefresh()

  return (
    <footer className="py-6 border-t text-center text-sm text-muted-foreground bg-muted/30 flex flex-col items-center gap-3">
      <p>© 2026 Spill The Chai. Brewed with ❤️</p>
      
      <div className="flex items-center gap-4">
        <Link href="/policy" className="hover:underline text-xs">
          Website Policies
        </Link>
        
        <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 text-xs gap-1 text-muted-foreground hover:text-foreground"
            onClick={triggerRefresh}
        >
            <RotateCw className="h-3 w-3" />
            Refresh Page
        </Button>

        <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 text-xs gap-1 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
            onClick={() => {
                if (confirm("This will clear all local data and reload the page. Continue?")) {
                    hardReset()
                }
            }}
        >
            <Trash2 className="h-3 w-3" />
            Reset App
        </Button>
      </div>
    </footer>
  )
}
