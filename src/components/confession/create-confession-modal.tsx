
'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from '@/context/auth-context'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2, PenLine } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function CreateConfessionModal() {
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const supabase = createClient()
  const router = useRouter()
  
  const maxLength = 500
  const minLength = 5

  const handleSubmit = async () => {
    if (!content.trim() || content.length < minLength) {
        toast.error(`Confession must be at least ${minLength} characters.`)
        return
    }
    
    setIsLoading(true)

    try {
        const { error } = await supabase
            .from('confessions')
            .insert({
                content: content,
                author_id: user?.id, 
            })

        if (error) {
            // Handle Rate Limit Error
            // "Database rejects the request" -> likely returns generic error or custom PG error.
            if (error.message.includes('rate limit') || error.code === 'P0001') { // Example code
                toast.error("Whoa there! You're spilling too much tea. Wait a bit.")
            } else {
                toast.error("Failed to post confession. Try again later.")
            }
            console.error(error)
        } else {
            toast.success("Spilled! Your confession is live.")
            setOpen(false)
            setContent('')
            router.refresh()
        }
    } catch (err) {
        console.error(err)
        toast.error("Something went wrong.")
    } finally {
        setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
            size="lg" 
            className="rounded-full shadow-lg gap-2 text-md font-semibold bg-primary hover:bg-primary/90"
            suppressHydrationWarning
        >
            <PenLine className="h-5 w-5" />
            Spill The Chai
        </Button>
      </DialogTrigger>
      {user ? (
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-xl">What's brewing? ☕</DialogTitle>
              <DialogDescription>
                Share your thoughts anonymously. Your identity will never be revealed.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Textarea
                placeholder="I think the library coffee is..."
                className="min-h-[150px] resize-none text-base"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={maxLength}
              />
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span className={content.length >= maxLength ? "text-destructive" : ""}>
                      {content.length}/{maxLength} characters
                  </span>
                  <span>Strictly anonymous.</span>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSubmit} disabled={isLoading || content.length < minLength}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Post Anonymously
              </Button>
            </DialogFooter>
          </DialogContent>
      ) : (
           <DialogContent className="sm:max-w-[425px]">
               <DialogHeader>
                   <DialogTitle>Join the party first!</DialogTitle>
                   <DialogDescription>
                       You need to be logged in to spill the chai. Don't worry, even logged in, your confessions are anonymous!
                   </DialogDescription>
               </DialogHeader>
               <div className="flex justify-end gap-2">
                   <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                   <Button onClick={() => {
                        setOpen(false);
                        // Trigger Auth Modal via global event or just direct user
                        // Ideally we pass a prop or context function to open auth modal.
                        // For now let's just close this and hope user clicks login in header.
                        // OR better:
                        document.getElementById('login-trigger')?.click() 
                   }}>Login / Signup</Button>
               </div>
           </DialogContent>
      )}
    </Dialog>
  )
}
