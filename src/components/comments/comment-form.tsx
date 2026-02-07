'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Loader2, Send } from 'lucide-react'

interface CommentFormProps {
  confessionId: string
  parentId?: string | null
  onSuccess?: () => void
  onCancel?: () => void
  placeholder?: string
}

export function CommentForm({ confessionId, parentId = null, onSuccess, onCancel, placeholder = "Add a comment..." }: CommentFormProps) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuth()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim()) return

    if (!user) {
        toast.error('You must be logged in to comment.', {
             action: { label: 'Login', onClick: () => document.getElementById('login-trigger')?.click() }
        })
        return
    }

    setIsSubmitting(true)

    try {
        const { error } = await supabase
            .from('comments')
            .insert({
                confession_id: confessionId,
                parent_id: parentId,
                content: content.trim(),
                author_id: user.id 
            })

        if (error) throw error

        setContent('')
        toast.success(parentId ? 'Reply posted!' : 'Comment posted!')
        if (onSuccess) onSuccess()

    } catch (err) {
        console.error('Error posting comment:', err)
        toast.error('Failed to post comment.')
    } finally {
        setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            className="min-h-[80px] bg-muted/30 resize-none text-sm focus-visible:ring-1"
            maxLength={300}
        />
        <div className="flex justify-end gap-2">
            {onCancel && (
                <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
                    Cancel
                </Button>
            )}
            <Button type="submit" size="sm" disabled={isSubmitting || !content.trim()}>
                {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <>
                        <Send className="h-3 w-3 mr-2" />
                        Post
                    </>
                )}
            </Button>
        </div>
    </form>
  )
}
