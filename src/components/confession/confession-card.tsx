
'use client'

import { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowBigUp, ArrowBigDown, Clock, Flag } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Confession } from '@/types'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/auth-context'
import { toast } from 'sonner' 
import { ReportModal } from '@/components/moderation/report-modal' 

interface ConfessionCardProps {
  confession: Confession
  userVote?: 1 | -1 | null
}

export function ConfessionCard({ confession, userVote: initialUserVote }: ConfessionCardProps) {
  const [upvotes, setUpvotes] = useState(confession.upvotes)
  const [downvotes, setDownvotes] = useState(confession.downvotes)
  const [userVote, setUserVote] = useState<1 | -1 | null>(initialUserVote || null)
  const [isVoting, setIsVoting] = useState(false)
  const { user } = useAuth()
  const supabase = createClient()

  const handleVote = async (type: 1 | -1) => {
    if (!user) {
      toast.error('Login to vote!', { action: { label: 'Login', onClick: () => document.getElementById('login-trigger')?.click() } }) // ideally use a better trigger
      return
    }
    if (isVoting) return

    setIsVoting(true)
    
    // Optimistic Update
    const prevUpvotes = upvotes
    const prevDownvotes = downvotes
    const prevUserVote = userVote

    let newUpvotes = upvotes
    let newDownvotes = downvotes
    let newUserVote: 1 | -1 | null = type

    if (userVote === type) {
        // Toggle off (if allowed, but schema says "Users cannot delete votes")
        // Design: "Voted: Highlighted arrow... click to change/remove"
        // Let's assume removing calls DELETE on votes table.
        // If DB strictly forbids DELETE, we might fail here.
        // But let's try to implement toggle off.
        newUserVote = null
        if (type === 1) newUpvotes--
        else newDownvotes--
    } else {
        // Switching or adding
        if (userVote === 1) newUpvotes--; // remove old upvote
        if (userVote === -1) newDownvotes--; // remove old downvote
        
        if (type === 1) newUpvotes++;
        else newDownvotes++;
    }

    setUpvotes(newUpvotes)
    setDownvotes(newDownvotes)
    setUserVote(newUserVote)

    try {
        if (userVote === type) {
            // Trying to delete vote
             const { error } = await supabase
                .from('votes')
                .delete()
                .eq('confession_id', confession.id)
                .eq('user_id', user.id)
            
            if (error) throw error
        } else {
            // Upsert vote
            const { error } = await supabase
                .from('votes')
                .upsert({
                    confession_id: confession.id,
                    user_id: user.id,
                    vote_type: type
                }, { onConflict: 'user_id, confession_id' })

            if (error) throw error
        }
    } catch (error) {
        console.error('Vote error:', error)
        toast.error('Failed to vote')
        // Revert
        setUpvotes(prevUpvotes)
        setDownvotes(prevDownvotes)
        setUserVote(prevUserVote)
    } finally {
        setIsVoting(false)
    }
  }

  const [isReportOpen, setIsReportOpen] = useState(false)

  return (
    <>
      <Card className="w-full transition-all hover:shadow-md border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
           <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{formatDistanceToNow(new Date(confession.created_at), { addSuffix: true })}</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-muted-foreground hover:text-destructive"
            onClick={() => setIsReportOpen(true)}
          >
            <Flag className="h-3 w-3" />
            <span className="sr-only">Report</span>
          </Button>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="whitespace-pre-wrap text-base leading-relaxed text-foreground/90 font-medium">
            {confession.content}
          </p>
        </CardContent>
        <CardFooter className="p-4 pt-2 flex items-center justify-between border-t bg-muted/20">
           <div className="flex items-center gap-1">
               <Button
                  variant="ghost" 
                  size="sm" 
                  className={cn("h-8 px-2 rounded-full gap-1 hover:bg-green-100 hover:text-green-700 dark:hover:bg-green-900/30 transition-colors", userVote === 1 && "bg-green-100 text-green-700 dark:bg-green-900/30")}
                  onClick={() => handleVote(1)}
               >
                   <ArrowBigUp className={cn("h-6 w-6", userVote === 1 && "fill-current")} />
                   <span className="font-bold text-sm">{upvotes}</span>
               </Button>
  
               <Button
                  variant="ghost" 
                  size="sm" 
                  className={cn("h-8 px-2 rounded-full gap-1 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/30 transition-colors", userVote === -1 && "bg-red-100 text-red-700 dark:bg-red-900/30")}
                  onClick={() => handleVote(-1)}
               >
                   <ArrowBigDown className={cn("h-6 w-6", userVote === -1 && "fill-current")} />
                   <span className="font-bold text-sm">{downvotes}</span>
               </Button>
           </div>
           
        </CardFooter>
      </Card>
      
      <ReportModal 
         isOpen={isReportOpen}
         onClose={() => setIsReportOpen(false)}
         confessionId={confession.id}
      />
    </>
  )
}
