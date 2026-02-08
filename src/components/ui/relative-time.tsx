'use client'

import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'

export function RelativeTime({ date }: { date: string | Date }) {
  const [formatted, setFormatted] = useState<string>('')

  useEffect(() => {
    setFormatted(formatDistanceToNow(new Date(date), { addSuffix: true }))
  }, [date])

  if (!formatted) return <span>...</span> // or some placeholder/skeleton

  return <span>{formatted}</span>
}
