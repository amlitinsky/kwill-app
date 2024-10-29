'use client'

import Link from "next/link"
import { useEffect, useState } from "react"
import {
  ArrowUpRight,
  FileText,
  Users,
  Clock,
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
  column_headers?: string[];
  custom_instructions?: string;
  spreadsheet_id?: string;
}
// Define the RecentSpreadsheet interface
interface RecentSpreadsheet {
  id: string;
  instructions: string;
}

// const description =
//   "Dashboard showing key metrics and recent meetings."

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
    fieldsAnalyzed: 0,
    totalCustomInstructions: 0,
    recentSpreadsheets: [] as RecentSpreadsheet[]
  })

  useEffect(() => {
    if (meetings) {
      const totalFields = meetings.reduce((acc: number, m: Meeting) => acc + (m.column_headers?.length || 0), 0);
      const totalInstructions = meetings.reduce((acc: number, m: Meeting) => acc + (m.custom_instructions?.length || 0), 0);
      const recentSpreadsheets: RecentSpreadsheet[] = meetings
        .filter((m: Meeting) => m.spreadsheet_id)
        .sort((a: Meeting, b: Meeting) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 3)
        .map((m: Meeting) => ({
          id: m.spreadsheet_id,
          instructions: m.custom_instructions
        }));

      setStats({
        totalMeetings: meetings.length,
        fieldsAnalyzed: totalFields,
        totalCustomInstructions: totalInstructions,
        recentSpreadsheets: recentSpreadsheets
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
            <div className="grid gap-8 md:grid-cols-2 md:gap-8 lg:grid-cols-3 mb-8">
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
                    Fields Analyzed
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.fieldsAnalyzed}</div>
                  <p className="text-xs text-muted-foreground">
                    Total fields analyzed across all meetings
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Custom Instructions</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalCustomInstructions}</div>
                  <p className="text-xs text-muted-foreground">
                    Total characters in custom instructions
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
                        <TableHead className="text-right">Fields Analyzed</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {meetings.slice(0, 5).map((meeting: Meeting) => (
                        <TableRow key={meeting.id}>
                          <TableCell>
                            <div className="font-medium">{meeting.name}</div>
                          </TableCell>
                          <TableCell className="hidden xl:table-column">
                            {new Date(meeting.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </TableCell>
                          <TableCell className="hidden xl:table-column">
                            <Badge className="text-xs" variant="outline">
                              {meeting.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">{meeting.column_headers?.length || 0}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Recently Used Spreadsheet Templates</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  {stats.recentSpreadsheets.map((spreadsheet, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <FileText className="h-9 w-9" />
                      <div className="grid gap-1">
                        <p className="text-sm font-medium leading-none">
                          Spreadsheet ID: {spreadsheet.id.substring(0, 8)}...
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Instructions: {spreadsheet.instructions.length > 50
                            ? `${spreadsheet.instructions.substring(0, 50)}...`
                            : spreadsheet.instructions}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}
