# Final MVP Requirements

## 1. User Sign on
- When a users signs up for the first time, we also request google spreadsheet scopes to immediately access necessary tokens
- We also initially create the stripe customer

## 2. Pivot back to subscription model
- We are using a pay-as-you-go model for now, but we need to pivot back to a subscription model
- we have a free tier (2 hour meeting), then a basic, pro, and premium tier, $20, $30, $40 per month (5, 10, 20 hours)
- We also need an option to cancel a subscripiton (but users can still use the app until the end of the month)
- If user uses all hours by the end of the month, they can purchase more hours at an overage rate of $3.5 per hour

## 3.  Implement General Dashboard
- We need to implement a general dashboard that allows users to view their meetings, insights and relevant analytics and statistics

The following is code from v0 of the updated dashboard, instead of using dummy data we use actual data as well as best practices

```typescript
'use client'

import Link from "next/link"
import { ArrowRight, BarChart2, Clock, FileText, Users } from 'lucide-react'

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

// Dummy data for analytics
const analyticsData = {
  totalMeetings: 1287,
  averageSuccessRate: 92.5,
  averageDuration: 45,
  averageProcessingTime: 3.2
}

// Dummy data for latest meetings
const latestMeetings = [
  { id: 1, name: "Q4 Investor Call", date: "2025-01-15", status: "Completed", duration: 62, successRate: 95 },
  { id: 2, name: "Product Roadmap Review", date: "2025-01-14", status: "Processing", duration: 48, successRate: 88 },
  { id: 3, name: "Team Performance Evaluation", date: "2025-01-13", status: "Completed", duration: 55, successRate: 91 },
  { id: 4, name: "Customer Feedback Session", date: "2025-01-12", status: "Completed", duration: 40, successRate: 94 },
  { id: 5, name: "Budget Planning Meeting", date: "2025-01-11", status: "Completed", duration: 75, successRate: 89 },
]

// Dummy data for most used templates
const mostUsedTemplates = [
  { id: 1, name: "Investor Call Template", usageCount: 78 },
  { id: 2, name: "Product Feedback Analysis", usageCount: 65 },
  { id: 3, name: "Customer Interview Summary", usageCount: 52 },
]

export default function Dashboard() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <div className="flex items-center space-x-2">
            <Button>Download</Button>
            <Button>Create Meeting</Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Meetings
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.totalMeetings}</div>
              <p className="text-xs text-muted-foreground">
                Lifetime meetings processed
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg. Success Rate
              </CardTitle>
              <BarChart2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.averageSuccessRate}%</div>
              <p className="text-xs text-muted-foreground">
                Fields successfully mapped
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Duration</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.averageDuration} min</div>
              <p className="text-xs text-muted-foreground">
                Average meeting duration
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Processing Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.averageProcessingTime}s</div>
              <p className="text-xs text-muted-foreground">
                Average time to process meetings
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Latest Meetings</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Success Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {latestMeetings.map((meeting) => (
                    <TableRow key={meeting.id}>
                      <TableCell className="font-medium">{meeting.name}</TableCell>
                      <TableCell>{meeting.date}</TableCell>
                      <TableCell>{meeting.status}</TableCell>
                      <TableCell>{meeting.duration} min</TableCell>
                      <TableCell>{meeting.successRate}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 flex justify-end">
                <Button asChild variant="outline">
                  <Link href="/meetings">
                    View All Meetings
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Most Used Templates</CardTitle>
              <CardDescription>
                Top 3 most frequently used meeting templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {mostUsedTemplates.map((template) => (
                  <div key={template.id} className="flex items-center">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {template.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Used {template.usageCount} times
                      </p>
                    </div>
                    <div className="ml-auto font-medium">{((template.usageCount / analyticsData.totalMeetings) * 100).toFixed(1)}%</div>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex justify-end">
                <Button asChild variant="outline">
                  <Link href="/templates">
                    Manage Templates
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}


```

## 4. Fix public interfacing pages
- we need to include up-to-date pricing, use-cases and support page

## 5. It would be nice to also sign in through email
- We need to implement a sign in through email feature
- We also need to display better more informative emails via resend (also a better email alias)

## 6. New Logo
- Add the new logo to the website
- Also include image in Kwill  Scribe create bot endpoint

## 7. Clean up repo
- Remove unused files, functions, code, and API endpoints, and packages we aren't using
- Clean up webhook routes organization
- Organize api endpoints better

## 8. Verify Calendly works, and that the general service works before we launch

## 9. Integrating Templates
- Seperate page to create update delete templates
- We simply link a google spreadsheet (verify that the spreadsheet is valid) as well as a custom prompt
- When user creates a new meeting, user can select a template, and the template will be used to create the meeting
- If the user doesn't use the template 







