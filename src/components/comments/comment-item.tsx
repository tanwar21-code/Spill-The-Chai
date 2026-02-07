'use client'

import { useState } from 'react'
import { Comment } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'
import { CommentForm } from './comment-form'
import { cn } from '@/lib/utils'

// Extend Comment to include children
export type CommentNode = Comment & {
    children?: CommentNode[]
}

interface CommentItemProps {
  comment: CommentNode
  confessionId: string
  depth?: number
  refreshComments: () => void
}

export function CommentItem({ comment, confessionId, depth = 0, refreshComments }: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false)

  return (
    <div className={cn("group", depth > 0 && "ml-3 md:ml-6 pl-3 md:pl-4 border-l-2 border-muted")}>
      <div className="py-2">
        <div className="flex items-center justify-between">
             <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-bold text-primary">Anonymous</span>
                <span className="text-[10px]">•</span>
                <span>{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
             </div>
        </div>

        <p className="text-sm text-foreground/90 whitespace-pre-wrap mt-1 leading-relaxed">{comment.content}</p>

        <div className="flex items-center gap-2 mt-1">
            <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2 text-xs text-muted-foreground hover:text-primary gap-1 -ml-2"
                onClick={() => setIsReplying(!isReplying)}
            >
                <MessageCircle className="h-3 w-3" />
                Reply
            </Button>
        </div>
      </div>

      {isReplying && (
          <div className="pl-0 pb-4 pt-2">
               <CommentForm 
                    confessionId={confessionId}
                    parentId={comment.id}
                    onSuccess={() => {
                        setIsReplying(false)
                        refreshComments() // In a real app with optimistic updates, we'd handle this better
                    }}
                    onCancel={() => setIsReplying(false)}
                    placeholder="Write a reply..."
               />
          </div>
      )}

      {comment.children && comment.children.length > 0 && (
          <div className="space-y-0 mt-1">
              {comment.children.map(child => (
                  <CommentItem 
                        key={child.id} 
                        comment={child} 
                        confessionId={confessionId}
                        depth={depth + 1}
                        refreshComments={refreshComments}
                   />
              ))}
          </div>
      )}
    </div>
  )
}
