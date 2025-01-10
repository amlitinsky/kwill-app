'use client'

import { useState, useEffect } from 'react'
import { Meeting } from '@/lib/supabase-server'
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, FileText, Clock, Loader2 } from "lucide-react"
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface MeetingListProps {
  initialMeetings: Meeting[]
}

const statusColors = {
  scheduled: "bg-gray-500",
  'in-progress': "bg-blue-500 animate-pulse",
  processing: "bg-yellow-500 animate-pulse",
  completed: "bg-green-500",
  failed: "bg-red-500"
} as const

const statusMessages = {
  'in-progress': "Meeting is currently being recorded",
  processing: "Processing meeting transcript and insights",
  completed: "Meeting analysis complete",
  failed: "Meeting processing failed"
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
          title: `Meeting: ${meeting.name}`,
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
      if (direction === 'asc') {
        return (a[field] ?? 0) > (b[field] ?? 0) ? 1 : -1
      }
      return (a[field] ?? 0) < (b[field] ?? 0) ? 1 : -1
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

  const handleViewMeeting = (meetingId: string) => {
    router.push(`/private/meetings/${meetingId}`)
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
              <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('created_at')}>
                Date {sortField === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead>Duration</TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead>Progress</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {meetings.map((meeting) => (
              <TableRow 
                key={meeting.id}
                className={meeting.status === 'processing' ? 'bg-yellow-50' : ''}
              >
                <TableCell className="font-medium">{meeting.name}</TableCell>
                <TableCell>{format(new Date(meeting.created_at), 'MMM d, yyyy')}</TableCell>
                <TableCell>
                  {meeting.duration ? (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {Math.round(meeting.duration)} min
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
                  {meeting.status === 'completed' && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {meeting.fields_analyzed} fields
                    </div>
                  )}
                  {meeting.status === 'processing' && (
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-500 transition-all duration-500"
                          style={{ width: '50%' }}
                        />
                      </div>
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewMeeting(meeting.id)}>
                        View Meeting Details
                      </DropdownMenuItem>
                      {meeting.status === 'completed' && (
                        <>
                          <DropdownMenuItem onClick={() => handleViewMeeting(meeting.id)}>
                            View Insights & Summary
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewMeeting(meeting.id)}>
                            View Analytics
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
} 