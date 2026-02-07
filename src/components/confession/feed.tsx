'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Confession } from '@/types'
import { ConfessionCard } from '@/components/confession/confession-card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { AlertCircle, SearchX } from 'lucide-react'
import { useAuth } from '@/context/auth-context'
import { useSearchParams } from 'next/navigation'

export function Feed() {
  const [confessions, setConfessions] = useState<Confession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const [userVotes, setUserVotes] = useState<Record<string, 1 | -1>>({})
  const [sortMethod, setSortMethod] = useState<'latest' | 'trending'>('latest')
  
  const supabase = createClient()
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get('q') // Read search query
  
  const PAGE_SIZE = 10

  // Toggle sort method
  const handleSortChange = (method: 'latest' | 'trending') => {
      if (sortMethod === method) return
      setSortMethod(method)
      setPage(0)
      setConfessions([]) // Clear current list
      setHasMore(true)
      setIsLoading(true)
  }

  const fetchConfessions = useCallback(async (pageNumber: number, isNewSearch = false) => {
    try {
      const from = pageNumber * PAGE_SIZE
      const to = from + PAGE_SIZE - 1
      
      let query = supabase
        .from('confessions')
        .select('*', { count: 'exact' })
      
      // Apply sort
      if (sortMethod === 'trending') {
          query = query.order('upvotes', { ascending: false })
      } else {
          query = query.order('created_at', { ascending: false })
      }
      
      query = query.range(from, to)

      // Apply search filter if exists
      if (searchQuery) {
          query = query.ilike('content', `%${searchQuery}%`)
      }

      const { data, error, count } = await query

      if (error) throw error

      if (data) {
        if (pageNumber === 0 || isNewSearch) {
           setConfessions(data)
        } else {
           setConfessions(prev => [...prev, ...data])
        }
        
        if (data.length < PAGE_SIZE || (count !== null && (isNewSearch ? data.length : confessions.length + data.length) >= count)) {
            setHasMore(false)
        } else {
            setHasMore(true) // Reset hasMore if we have more
        }
      }

      // Votes fetching logic...
      if (user && data && data.length > 0) {
        const confessionIds = data.map(c => c.id)
        const { data: votesData, error: votesError } = await supabase
            .from('votes')
            .select('confession_id, vote_type')
            .eq('user_id', user.id)
            .in('confession_id', confessionIds)
        
        if (votesError) {
            console.error("Error fetching votes:", votesError)
        } else if (votesData) {
            const newVotes: Record<string, 1 | -1> = {}
            votesData.forEach((v: any) => {
                newVotes[v.confession_id] = v.vote_type
            })
            setUserVotes(prev => ({...prev, ...newVotes}))
        }
      }

    } catch (err: any) {
      console.error('Error fetching confessions:', err)
      setError('Failed to load confessions. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [supabase, user, searchQuery, sortMethod]) 

  // Reset and fetch when search query or sort method changes
  useEffect(() => {
      setPage(0)
      setHasMore(true) 
      setIsLoading(true)
      fetchConfessions(0, true)
  }, [searchQuery, sortMethod, fetchConfessions])

  const loadMore = async () => {
      const nextPage = page + 1
      setPage(nextPage)
      await fetchConfessions(nextPage)
  }
  
  // Real-time subscription 
  useEffect(() => {
      if (searchQuery) return; 
      if (sortMethod === 'trending') return;

      const channel = supabase
        .channel('public:confessions')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'confessions' }, (payload) => {
            setConfessions(prev => [payload.new as Confession, ...prev])
        })
        .subscribe()

      return () => {
         supabase.removeChannel(channel)
      }
  }, [supabase, searchQuery, sortMethod])

  if (isLoading && page === 0) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2 mb-4">
             <Skeleton className="h-9 w-20" />
             <Skeleton className="h-9 w-20" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-3">
             <Skeleton className="h-[120px] w-full rounded-xl" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-8 text-center">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => { window.location.reload() }}>Retry</Button>
      </div>
    )
  }

  if (confessions.length === 0) {
    if (searchQuery) {
        return (
            <div className="flex flex-col items-center justify-center space-y-4 py-12 text-center">
               <SearchX className="h-12 w-12 text-muted-foreground" />
               <h3 className="text-xl font-semibold">No results found</h3>
               <p className="text-muted-foreground">Try searching for something else.</p>
            </div>
        )
    }
    // Only show empty state if not loading (though loading check above handles init)
    return (
      <div className="space-y-6 pb-8">
        {!searchQuery && (
            <div className="flex items-center gap-2 mb-4">
                <Button 
                    variant={sortMethod === 'latest' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => handleSortChange('latest')}
                    className="rounded-full"
                >
                    Latest
                </Button>
                <Button 
                    variant={sortMethod === 'trending' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => handleSortChange('trending')}
                    className="rounded-full"
                >
                    Trending
                </Button>
            </div>
        )}
        <div className="flex flex-col items-center justify-center space-y-4 py-12 text-center">
            <div className="text-4xl">☕</div>
            <h3 className="text-xl font-semibold">Be the first to spill the chai!</h3>
            <p className="text-muted-foreground">No confessions yet. Why not start the conversation?</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Filters */}
      {!searchQuery && (
          <div className="flex items-center gap-2 mb-4">
              <Button 
                variant={sortMethod === 'latest' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => handleSortChange('latest')}
                className="rounded-full"
              >
                  Latest
              </Button>
              <Button 
                variant={sortMethod === 'trending' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => handleSortChange('trending')}
                className="rounded-full"
              >
                  Trending
              </Button>
          </div>
      )}

      {confessions.map((confession) => (
        <ConfessionCard 
            key={confession.id} 
            confession={confession} 
            userVote={userVotes[confession.id]}
        />
      ))}
      
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={loadMore} disabled={isLoading}>
             {isLoading ? 'Loading...' : 'Load More Tea 🫖'}
          </Button>
        </div>
      )}
      
      {!hasMore && confessions.length > 5 && (
          <p className="text-center text-sm text-muted-foreground pt-8">
              That's all the tea for now! 😴
          </p>
      )}
    </div>
  )
}
