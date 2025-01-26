'use client'

import { useState, useEffect } from 'react'
import { Meeting } from '@/lib/supabase-server'
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, FileText, Loader2 } from "lucide-react"
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface MeetingListProps {
  initialMeetings: Meeting[]
}

const statusColors = {
  scheduled: "bg-gray-500",
  'in-progress': "bg-blue-500 animate-pulse",
  created: "bg-sky-500",
  processing: "bg-yellow-500 animate-pulse",
  completed: "bg-green-500",
  failed: "bg-red-500"
} as const

const statusMessages = {
  'in-progress': "Recording in progress...",
  processing: "Analyzing meeting transcript and generating insights...",
  created: "Meeting created",
  completed: "Meeting analysis complete",
  failed: "Failed to process meeting"
}

export function MeetingList({ initialMeetings }: MeetingListProps) {
  const [meetings, setMeetings] = useState(initialMeetings)
  const [sortField, setSortField] = useState<keyof Meeting>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const router = useRouter()
  const { toast } = useToast()

  // Monitor processing meetings and show toast updates
  useEffect(() => {
    const processingMeetings = meetings.filter(m => 
      m.status === 'processing' || m.status === 'in-progress'
    )

    if (processingMeetings.length > 0) {
      processingMeetings.forEach(meeting => {
        toast({
          title: meeting.name,
          description: statusMessages[meeting.status as keyof typeof statusMessages],
          duration: 5000
        })
      })
    }
  }, [meetings, toast])

  const handleSort = (field: keyof Meeting) => {
    const direction = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc'
    setSortField(field)
    setSortDirection(direction)

    const sorted = [...meetings].sort((a, b) => {
      const aValue = a[field]
      const bValue = b[field]

      // Handle null/undefined values
      if (!aValue && !bValue) return 0
      if (!aValue) return 1
      if (!bValue) return -1

      // Sort by date for created_at
      if (field === 'created_at') {
        const aDate = new Date(aValue as string).getTime()
        const bDate = new Date(bValue as string).getTime()
        return direction === 'asc' 
          ? aDate - bDate
          : bDate - aDate
      }

      // Sort by string comparison for other fields
      return direction === 'asc'
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue))
    })

    setMeetings(sorted)
  }

  const handleStatusFilter = (status: Meeting['status'] | 'all') => {
    if (status === 'all') {
      setMeetings(initialMeetings)
    } else {
      const filtered = initialMeetings.filter(m => m.status === status)
      setMeetings(filtered)
    }
  }

  const handleViewMeeting = (meeting: Meeting) => {
    if (meeting.status === 'processing' || meeting.status === 'in-progress') {
      toast({
        title: "Meeting is still processing",
        description: "Please wait until processing is complete to view details.",
        duration: 3000
      })
      return
    }
    router.push(`/private/meetings/${meeting.id}`)
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <Select onValueChange={(value) => handleStatusFilter(value as Meeting['status'] | 'all')}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer" 
                onClick={() => handleSort('name')}
              >
                Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('created_at')}
              >
                Date {sortField === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead>Duration</TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('status')}
              >
                Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead>Fields</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {meetings.map((meeting) => (
              <TableRow 
                key={meeting.id}
                className={cn(
                  meeting.status === 'processing' ? 'bg-yellow-500/10 dark:bg-yellow-500/5' : '',
                  'cursor-pointer hover:bg-muted/50 transition-colors'
                )}
                onClick={() => handleViewMeeting(meeting)}
              >
                <TableCell className="font-medium">{meeting.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {format(new Date(meeting.created_at), 'MMM d, yyyy')}
                  </div>
                </TableCell>
                <TableCell>
                  {meeting.metrics?.duration ? (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {Math.round(meeting.metrics.duration / 60)} min
                    </div>
                  ) : '-'}
                </TableCell>
                <TableCell>
                  <Badge className={`${statusColors[meeting.status]} text-white`}>
                    {meeting.status === 'processing' && (
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    )}
                    {meeting.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {meeting.status === 'completed' && meeting.metrics && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      {meeting.metrics.fields_analyzed} fields
                    </div>
                  )}
                  {meeting.status === 'processing' && (
                    <Progress 
                      value={meeting.metrics?.progress ?? 0} 
                      className="w-[60px]" 
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
} 