'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Comment } from '@/types'
import { CommentItem, CommentNode } from './comment-item'
import { CommentForm } from './comment-form'
import { Loader2, MessageSquare } from 'lucide-react'

interface CommentListProps {
  confessionId: string
}

export function CommentList({ confessionId }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetchComments = async () => {
    const { data, error } = await supabase
        .from('comments_public')
        .select('*')
        .eq('confession_id', confessionId)
        .order('created_at', { ascending: true })

    if (!error && data) {
        setComments(data)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchComments()

    const channel = supabase
        .channel(`comments:${confessionId}`)
        .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'comments',
            filter: `confession_id=eq.${confessionId}`
        }, () => {
             fetchComments() 
        })
        .subscribe()

    return () => {
        supabase.removeChannel(channel)
    }
  }, [confessionId, supabase])

  // Build tree structure
  const commentTree = useMemo(() => {
      const map = new Map<string, CommentNode>()
      const roots: CommentNode[] = []

      // First pass: create nodes
      comments.forEach(c => {
          map.set(c.id, { ...c, children: [] })
      })

      // Second pass: link parents
      comments.forEach(c => {
          const node = map.get(c.id)!
          if (c.parent_id && map.has(c.parent_id)) {
              map.get(c.parent_id)!.children!.push(node)
          } else if (!c.parent_id) {
              roots.push(node)
          }
      })

      return roots
  }, [comments])


  return (
    <div className="space-y-4 pt-4 border-t mt-4">
        <h3 className="text-sm font-semibold flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Comments ({comments.length})
        </h3>
        
        <CommentForm confessionId={confessionId} onSuccess={fetchComments} />

        {isLoading ? (
            <div className="flex justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        ) : (
             <div className="space-y-1 mt-4">
                 {commentTree.map(node => (
                     <CommentItem 
                        key={node.id} 
                        comment={node} 
                        confessionId={confessionId}
                        refreshComments={fetchComments}
                     />
                 ))}
             </div>
        )}
    </div>
  )
}
