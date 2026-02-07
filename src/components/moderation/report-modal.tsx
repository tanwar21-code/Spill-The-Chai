'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/auth-context'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  confessionId: string
}

export function ReportModal({ isOpen, onClose, confessionId }: ReportModalProps) {
  const [reason, setReason] = useState<string>('spam')
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const supabase = createClient()

  const handleSubmit = async () => {
    if (!user) {
        toast.error('You must be logged in to report.')
        return
    }
    
    setIsLoading(true)
    
    try {
        const { error } = await supabase
            .from('reports')
            .insert({
                confession_id: confessionId,
                reporter_id: user.id,
                reason: reason
            })

        if (error) {
            if (error.code === '23505') { // Unique violation
                toast.error('You have already reported this confession.')
            } else {
                toast.error('Failed to submit report. Please try again.')
                console.error(error)
            }
        } else {
            toast.success('Report submitted. Thank you for helping keep the community safe.')
            onClose()
        }
    } catch (err) {
        console.error(err)
        toast.error('An unexpected error occurred.')
    } finally {
        setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Report Confession</DialogTitle>
          <DialogDescription>
            Why are you reporting this confession? This is anonymous.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <RadioGroup value={reason} onValueChange={setReason} className="gap-3">
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="spam" id="spam" />
                    <Label htmlFor="spam">Spam or unwanted commercial content</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="harassment" id="harassment" />
                    <Label htmlFor="harassment">Harassment or bullying</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hate_speech" id="hate_speech" />
                    <Label htmlFor="hate_speech">Hate speech or symbols</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="inappropriate" id="inappropriate" />
                    <Label htmlFor="inappropriate">Nudity or sexual activity</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other">Other</Label>
                </div>
            </RadioGroup>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isLoading} variant="destructive">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
