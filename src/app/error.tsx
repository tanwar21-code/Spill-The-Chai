'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4 text-center p-4">
      <div className="bg-destructive/10 p-4 rounded-full text-destructive">
          <AlertCircle className="h-12 w-12" />
      </div>
      <h2 className="text-2xl font-bold">Something went wrong!</h2>
      <p className="text-muted-foreground max-w-md">
        We encountered an unexpected error. Please try refreshing the page or try again later.
      </p>
      <div className="flex gap-4">
          <Button onClick={() => window.location.reload()} variant="outline">
            Reload Page
          </Button>
          <Button
            onClick={
              // Attempt to recover by trying to re-render the segment
              () => reset()
            }
          >
            Try again
          </Button>
      </div>
    </div>
  )
}
