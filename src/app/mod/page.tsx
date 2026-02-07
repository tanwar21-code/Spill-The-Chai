'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/auth-context'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2, AlertTriangle, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'

interface ReportedConfession {
  confession_id: string
  content: string
  created_at: string
  report_count: number
  reasons: string[]
}

export default function ModeratorDashboard() {
  const [reports, setReports] = useState<ReportedConfession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModerator, setIsModerator] = useState<boolean | null>(null)
  
  const { user, isLoading: isAuthLoading } = useAuth()
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function checkModeratorStatus() {
        if (isAuthLoading) return
        if (!user) {
            router.push('/')
            return
        }

        const { data, error } = await supabase
            .from('moderators')
            .select('user_id')
            .eq('user_id', user.id)
            .single()

        if (error || !data) {
            toast.error("You don't have permission to view this page.")
            router.push('/')
        } else {
            setIsModerator(true)
            fetchReports()
        }
    }
    
    checkModeratorStatus()
  }, [user, isAuthLoading, router, supabase])

  const fetchReports = async () => {
      try {
          const { data, error } = await supabase
            .from('reported_confessions')
            .select('*')
            .order('report_count', { ascending: false })

          if (error) throw error
          setReports(data || [])
      } catch (err) {
          console.error(err)
          toast.error("Failed to fetch reports")
      } finally {
          setIsLoading(false)
      }
  }

  const handleDelete = async (confessionId: string) => {
      if (!confirm("Are you sure you want to delete this confession? This cannot be undone.")) return

      try {
          const { error } = await supabase
            .from('confessions')
            .delete()
            .eq('id', confessionId)

          if (error) throw error
          
          toast.success("Confession deleted")
          // Remove from local state
          setReports(prev => prev.filter(r => r.confession_id !== confessionId))
      } catch (err) {
          console.error(err)
          toast.error("Failed to delete confession")
      }
  }

  if (isAuthLoading || isLoading || isModerator === null) {
      return <div className="flex h-screen items-center justify-center">Loading moderator dashboard...</div>
  }

  if (!isModerator) return null // Should have redirected

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-2 mb-8 text-destructive">
          <ShieldAlert className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Moderation Dashboard</h1>
      </div>

      {reports.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
              <p>No reports found. The community is clean! ✨</p>
          </div>
      ) : (
          <div className="grid gap-6">
              {reports.map((report) => (
                  <Card key={report.confession_id} className="border-destructive/20 bg-destructive/5">
                      <CardHeader>
                          <div className="flex justify-between items-start">
                              <CardTitle className="text-base font-medium text-muted-foreground">
                                  Reported ID: {report.confession_id.slice(0, 8)}...
                              </CardTitle>
                              <div className="flex items-center gap-2 bg-destructive/10 text-destructive px-2 py-1 rounded text-sm font-bold">
                                  <AlertTriangle className="h-4 w-4" />
                                  {report.report_count} Reports
                              </div>
                          </div>
                          <CardDescription>
                              Reasons: {report.reasons && report.reasons.join(', ')}
                          </CardDescription>
                      </CardHeader>
                      <CardContent>
                          <p className="text-lg font-medium whitespace-pre-wrap">{report.content}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                             Posted: {new Date(report.created_at).toLocaleString()}
                          </p>
                      </CardContent>
                      <CardFooter className="justify-end">
                          <Button variant="destructive" onClick={() => handleDelete(report.confession_id)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Confession
                          </Button>
                      </CardFooter>
                  </Card>
              ))}
          </div>
      )}
    </div>
  )
}
