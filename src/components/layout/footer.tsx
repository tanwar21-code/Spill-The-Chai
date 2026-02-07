'use client'

import Link from 'next/link'
import { RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Footer() {
  const handleReload = () => {
    window.location.reload()
  }

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
            onClick={handleReload}
        >
            <RotateCw className="h-3 w-3" />
            Reload Page
        </Button>
      </div>
    </footer>
  )
}
