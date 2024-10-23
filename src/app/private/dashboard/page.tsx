'use client'

import Link from "next/link"
import { useEffect, useState } from "react"
import {
  Activity,
  ArrowUpRight,
  FileText,
  Users,
  Clock,
  Calendar
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useMeetings } from "@/hooks/use-meetings"
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

// Define the Meeting interface
interface Meeting {
  id: string;
  name: string;
  created_at: string;
  status: string;
  duration?: number;
  // Add other properties as needed
}

export const description =
  "Dashboard showing key metrics and recent meetings."

const LoadingCard = ({ delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.3 }}
  >
    <Card className="w-full h-32 animate-pulse">
      <CardHeader className="h-full">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
      </CardHeader>
    </Card>
  </motion.div>
);

export default function PrivateDashboard() {
  const { meetings, isLoading, isError } = useMeetings()
  const [stats, setStats] = useState({
    totalMeetings: 0,
    completedMeetings: 0,
    averageDuration: 0,
    recentActivity: 0
  })

  useEffect(() => {
    if (meetings) {
      // Calculate stats
      const completed = meetings.filter((m: Meeting) => m.status === 'completed').length;
      const avgDuration = meetings.reduce((acc: number, m: Meeting) => acc + (m.duration || 0), 0) / meetings.length;

      setStats({
        totalMeetings: meetings.length,
        completedMeetings: completed,
        averageDuration: Math.round(avgDuration),
        recentActivity: meetings.filter((m: Meeting) => new Date(m.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length
      })
    }
  }, [meetings])

  if (isError) return <div>Error: {isError.message}</div>

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {isLoading ? (
          <div className="space-y-6" role="status" aria-label="Loading dashboard data">
            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
              <LoadingCard delay={0.1} />
              <LoadingCard delay={0.2} />
              <LoadingCard delay={0.3} />
              <LoadingCard delay={0.4} />
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex justify-center items-center mt-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-lg text-primary">Loading dashboard...</span>
              </div>
            </motion.div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid gap-8 md:grid-cols-2 md:gap-8 lg:grid-cols-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Meetings
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalMeetings}</div>
                  <p className="text-xs text-muted-foreground">
                    Lifetime meetings created
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Completed Meetings
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.completedMeetings}</div>
                  <p className="text-xs text-muted-foreground">
                    Successfully processed meetings
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Duration</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.averageDuration} min</div>
                  <p className="text-xs text-muted-foreground">
                    Average meeting duration
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.recentActivity}</div>
                  <p className="text-xs text-muted-foreground">
                    Meetings in the last 7 days
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-8 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
              <Card className="xl:col-span-2">
                <CardHeader className="flex flex-row items-center">
                  <div className="grid gap-2">
                    <CardTitle>Recent Meetings</CardTitle>
                    <CardDescription>
                      Your 5 most recent meetings.
                    </CardDescription>
                  </div>
                  <Button asChild size="sm" className="ml-auto gap-1">
                    <Link href="/private/meetings">
                      View All
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Meeting Name</TableHead>
                        <TableHead className="hidden xl:table-column">Date</TableHead>
                        <TableHead className="hidden xl:table-column">Status</TableHead>
                        <TableHead className="text-right">Duration</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {meetings.slice(0, 5).map((meeting: Meeting) => (
                        <TableRow key={meeting.id}>
                          <TableCell>
                            <div className="font-medium">{meeting.name}</div>
                          </TableCell>
                          <TableCell className="hidden xl:table-column">
                            {new Date(meeting.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="hidden xl:table-column">
                            <Badge className="text-xs" variant="outline">
                              {meeting.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">{meeting.duration || 'N/A'} min</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Quick Info</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-8">
                  <div className="flex items-center gap-4">
                    <Calendar className="h-9 w-9" />
                    <div className="grid gap-1">
                      <p className="text-sm font-medium leading-none">
                        Next Scheduled Meeting
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Tomorrow, 2:00 PM
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Users className="h-9 w-9" />
                    <div className="grid gap-1">
                      <p className="text-sm font-medium leading-none">
                        Team Members
                      </p>
                      <p className="text-sm text-muted-foreground">
                        5 active members
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <FileText className="h-9 w-9" />
                    <div className="grid gap-1">
                      <p className="text-sm font-medium leading-none">
                        Latest Transcript
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Project Review - 05/15/2023
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}
