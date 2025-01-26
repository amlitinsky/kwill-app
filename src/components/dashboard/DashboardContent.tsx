'use client'

import Link from "next/link"
import { useEffect, useState } from "react"
import {
  ArrowRight,
  FileText,
  BarChart2,
  Clock,
  Users,
} from "lucide-react"

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
import { motion } from 'framer-motion'
import { Meeting } from "@/lib/supabase-server"

interface DashboardStats {
  totalMeetings: number
  averageSuccessRate: number
  averageDuration: number
  averageProcessingTime: number
  recentMeetings: Meeting[]
  mostUsedTemplates: Array<{
    name: string
    usageCount: number
  }>
}

interface DashboardContentProps {
  initialMeetings: Meeting[]
}

export function DashboardContent({ initialMeetings }: DashboardContentProps) {
  const { meetings } = useMeetings()
  const [stats, setStats] = useState<DashboardStats>(() => {
    // Initialize stats with initial meetings data
    const successRates = initialMeetings.map((m: Meeting) => 
      m.metrics?.success_rate || 0
    )
    const avgSuccessRate = successRates.length 
      ? successRates.reduce((a: number, b: number) => a + b, 0) / successRates.length 
      : 0

    const durations = initialMeetings
      .map((m: Meeting) => m.metrics?.duration ? Math.round(m.metrics.duration / 60) : 0)
      .filter((d: number) => d > 0)
    const avgDuration = durations.length 
      ? durations.reduce((a: number, b: number) => a + b, 0) / durations.length 
      : 0

    const recentMeetings = [...initialMeetings]
      .sort((a: Meeting, b: Meeting) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)

    const templateUsage = initialMeetings.reduce((acc: Record<string, number>, meeting: Meeting) => {
      if (meeting.custom_instructions) {
        acc[meeting.custom_instructions] = (acc[meeting.custom_instructions] || 0) + 1
      }
      return acc
    }, {})

    const mostUsedTemplates = Object.entries(templateUsage)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([instructions, count]) => ({
        name: instructions.length > 30 ? instructions.substring(0, 30) + '...' : instructions,
        usageCount: count as number
      }))

    return {
      totalMeetings: initialMeetings.length,
      averageSuccessRate: Math.round(avgSuccessRate),
      averageDuration: Math.round(avgDuration),
      averageProcessingTime: 3.2, // Placeholder
      recentMeetings,
      mostUsedTemplates
    }
  })

  useEffect(() => {
    if (meetings) {
      // Calculate success rate (fields analyzed vs total fields)
      const successRates = meetings.map((m: Meeting) => 
        m.metrics?.success_rate || 0
      )
      const avgSuccessRate = successRates.length 
        ? successRates.reduce((a: number, b: number) => a + b, 0) / successRates.length 
        : 0

      // Calculate average duration
      const durations = meetings
        .map((m: Meeting) => m.metrics?.duration ? Math.round(m.metrics.duration / 60) : 0)
        .filter((d: number) => d > 0)
      const avgDuration = durations.length 
        ? durations.reduce((a: number, b: number) => a + b, 0) / durations.length 
        : 0

      // Get recent meetings (sorted by date)
      const recentMeetings = [...meetings]
        .sort((a: Meeting, b: Meeting) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)

      // Get most used templates (based on custom instructions)
      const templateUsage = meetings.reduce((acc: Record<string, number>, meeting: Meeting) => {
        if (meeting.custom_instructions) {
          acc[meeting.custom_instructions] = (acc[meeting.custom_instructions] || 0) + 1
        }
        return acc
      }, {})

      const mostUsedTemplates = Object.entries(templateUsage)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 3)
        .map(([instructions, count]) => ({
          name: instructions.length > 30 ? instructions.substring(0, 30) + '...' : instructions,
          usageCount: count as number
        }))

      setStats({
        totalMeetings: meetings.length,
        averageSuccessRate: Math.round(avgSuccessRate),
        averageDuration: Math.round(avgDuration),
        averageProcessingTime: 3.2, // Placeholder
        recentMeetings,
        mostUsedTemplates
      })
    }
  }, [meetings])

  return (
    <div className="space-y-8">
      <motion.div
        style={{ opacity: 0 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="rounded-xl border border-zinc-800 bg-zinc-950/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">
                Total Meetings
              </CardTitle>
              <FileText className="h-4 w-4 text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMeetings}</div>
              <p className="text-sm text-zinc-500">
                Lifetime meetings processed
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-xl border border-zinc-800 bg-zinc-950/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">
                Avg. Success Rate
              </CardTitle>
              <BarChart2 className="h-4 w-4 text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageSuccessRate}%</div>
              <p className="text-sm text-zinc-500">
                Fields successfully mapped
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-xl border border-zinc-800 bg-zinc-950/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">
                Avg. Duration
              </CardTitle>
              <Clock className="h-4 w-4 text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageDuration} min</div>
              <p className="text-sm text-zinc-500">
                Average meeting duration
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-xl border border-zinc-800 bg-zinc-950/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">
                Processing Time
              </CardTitle>
              <Users className="h-4 w-4 text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageProcessingTime}s</div>
              <p className="text-sm text-zinc-500">
                Average time to process meetings
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="mt-8 grid grid-cols-[2fr,1fr] gap-6">
          <Card className="rounded-xl border border-zinc-800 bg-zinc-950/30">
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-2xl font-semibold">Latest Meetings</CardTitle>
                <CardDescription>Your most recent meetings</CardDescription>
              </div>
              <Button asChild variant="outline" size="sm" className="border-zinc-800 bg-zinc-950">
                <Link href="/private/meetings">
                  View All Meetings
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-zinc-800">
                    <TableHead className="py-3 text-sm font-semibold text-zinc-400">Name</TableHead>
                    <TableHead className="py-3 text-sm font-semibold text-zinc-400">Date</TableHead>
                    <TableHead className="py-3 text-sm font-semibold text-zinc-400">Status</TableHead>
                    <TableHead className="py-3 text-sm font-semibold text-zinc-400">Duration</TableHead>
                    <TableHead className="py-3 text-sm font-semibold text-zinc-400">Success Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentMeetings.map((meeting) => (
                    <TableRow key={meeting.id} className="border-b border-zinc-800/50">
                      <TableCell className="py-3 font-medium">{meeting.name}</TableCell>
                      <TableCell className="py-3 text-zinc-400">
                        {new Date(meeting.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="py-3 text-zinc-400">{meeting.status}</TableCell>
                      <TableCell className="py-3 text-zinc-400">{meeting.metrics?.duration ? Math.round(meeting.metrics.duration / 60) : 0} min</TableCell>
                      <TableCell className="py-3 text-zinc-400">{Math.round(meeting.metrics?.success_rate || 0)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card className="rounded-xl border border-zinc-800 bg-zinc-950/30">
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-2xl font-semibold">Most Used Templates</CardTitle>
                <CardDescription>Your most frequently used templates</CardDescription>
              </div>
              <div className="space-x-4">
                <Button variant="outline" size="sm" className="border-zinc-800 bg-zinc-950" asChild>
                  <Link href="/private/integrations">
                    Manage Integrations
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="border-zinc-800 bg-zinc-950" asChild>
                  <Link href="/templates">
                    Manage Templates
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {stats.mostUsedTemplates.map((template, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-zinc-800/50 last:border-0">
                  <div>
                    <p className="font-medium">{template.name}</p>
                    <p className="text-sm text-muted-foreground">Used {template.usageCount} times</p>
                  </div>
                  <span className="text-muted-foreground">{(template.usageCount / stats.totalMeetings * 100).toFixed(1)}%</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  )
} 