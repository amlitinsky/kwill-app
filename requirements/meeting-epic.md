# Meeting Management and Analysis Dashboard
Feature Epic Specification v1.0

## Core Objectives
1. Create an intuitive meeting management interface that prioritizes user efficiency
2. Implement real-time status tracking and notification system
3. Develop comprehensive meeting analysis and insights dashboard
4. Establish efficient transcript and data management system

## Technical Context

### Current Implementation Files
```
~/src/app/private/meetings/page.tsx        # Main meetings list view
~/src/app/api/webhook/route.ts             # Webhook handler for meeting updates
~/src/lib/supabase-server.ts               # Database interactions
```

### Additional Required Files
```
~/src/app/private/meetings/[id]/page.tsx   # Individual meeting view
~/src/components/meetings/                 # Meeting-related components
  |- MeetingList.tsx                      # List component
  |- MeetingCard.tsx                      # Individual meeting row/card
  |- MeetingStatus.tsx                    # Status indicator component
  |- MeetingAnalytics.tsx                 # Analytics visualization
  |- TranscriptViewer.tsx                 # Transcript management
  |- CustomInstructions.tsx               # Instructions editor
```

## Detailed Requirements

### 1. Meetings List View

#### Layout & Design
- Implementation: simple list card layout (based on your recommendation based on PRD) (should be a single row with name, date, fields analyzed, status, and maybe custom instructions)
- Responsive design: 1 column mobile, 2 columns tablet, 3 columns desktop
- Sort options: Date, Status, Duration
- Filter options: Status, Date range, Custom instructions

#### Per Meeting Card
```typescript
interface MeetingCard {
  id: string
  title: string
  date: Date
  duration: number
  status: 'scheduled' | 'in-progress' | 'processing' | 'completed' | 'failed'
  fieldsAnalyzed: number
  customInstructions: boolean
  spreadsheetInfo: {
    id: string
    name: string
  }
}
```

#### Interactive Elements
- Entire card clickable → routes to detailed view
- Quick action buttons:
  - View transcript (if available)
  - Reprocess meeting
  - Download data
  - Delete meeting

#### Status Visualization
- Color coding:
  - Scheduled: Gray
  - In-Progress: Pulsing Blue
  - Processing: Amber with loading animation
  - Completed: Green
  - Failed: Red
- Status icon with tooltip
- Progress indicator for processing state

### 2. Real-Time Updates

#### Toast Notifications
```typescript
interface ToastNotification {
  type: 'info' | 'success' | 'error' | 'warning'
  title: string
  message: string
  duration: number
  action?: {
    label: string
    onClick: () => void
  }
}
```

#### Status Updates
- WebSocket connection for real-time updates
- Loading states:
  - Skeleton loading for initial fetch
  - Shimmer effect for processing meetings
  - Smooth transitions between states

### 3. Meeting Detail View

#### Layout Structure
```
+------------------------+
| Meeting Header         |
+------------------------+
| Summary | Analytics    |
| & Stats | Charts       |
+------------------------+
| Transcript & Analysis  |
+------------------------+
| Custom Instructions    |
+------------------------+
| Actions & Controls     |
+------------------------+
```

#### AI Summary Component
- Key meeting statistics
- Important discussion points
- Action items extracted
- Time-stamped highlights

#### Analytics Visualization
- Meeting duration
- Speaker participation rates
- Topic distribution
- Key metrics from spreadsheet mapping

#### Transcript Management
- Collapsible transcript viewer
- Search functionality
- Time-stamp navigation
- Download options
- Auto-deletion notice

#### Custom Instructions
- Edit interface
- Preview changes
- Reprocess controls
- Version history

### 4. Data Management

#### Transcript Storage
```typescript
interface TranscriptPolicy {
  retention: {
    default: '7 days'
    premium: '30 days'
  }
  storage: {
    format: 'compressed JSON'
    location: 'edge storage'
  }
  download: {
    formats: ['txt', 'json', 'csv']
    maxSize: '100MB'
  }
}
```

#### Data Update Strategy
- Options for spreadsheet updates:
  1. Overwrite existing row
  2. Append to new row
  3. Create version history
- Confirmation required for overwrites
- Backup of previous data

## Technical Implementation Notes

### State Management
```typescript
interface MeetingState {
  meetings: Meeting[]
  loading: boolean
  error: Error | null
  filters: FilterOptions
  sort: SortOptions
  selectedMeeting: Meeting | null
}
```

### Performance Considerations
- Implement virtual scrolling for large meeting lists
- Lazy load meeting details and transcripts
- Cache frequently accessed meeting data
- Optimize images and animations

### Error Handling
- Graceful degradation of real-time features
- Retry logic for failed API calls
- Clear error messages with recovery options
- Offline support for viewing existing data

## Success Metrics
1. Average time to access meeting information < 2s
2. Real-time update latency < 500ms
3. User engagement with meeting insights > 60%
4. System uptime > 99.9%
5. Error rate < 1%

## Future Considerations
1. Advanced search capabilities
2. Meeting templates
3. Batch processing
4. Export functionality
5. Team collaboration features

The above is a high-level overivew, and I've implemented the majority of the components in v0.
Additionally, I've made UI/UX sketches in v0, please refer and use them when executing this epic. Please also let me know which columns I should add to add to my supabase meetings table to refer to system metrics and analytics.
The following is the directory structure of the v0 file:

app/
  meetings/
    [id]/
      page.tsx
  page.tsx
  components/
    AIInsights.tsx
    CustomInstructions.tsx
    MeetingCard.tsx
    MeetingChart.tsx
    MeetingList.tsx
    Transcript.tsx
  lib/
    dummy-data.ts
  
File Contents:
meetings/[id]/page.tsx
import { dummyMeetings } from "@/lib/dummy-data"
import { MeetingDetails } from "@/components/MeetingDetails"
import { notFound } from "next/navigation"

export default function MeetingPage({ params }: { params: { id: string } }) {
  const meeting = dummyMeetings.find(m => m.id === params.id)

  if (!meeting) {
    notFound()
  }

  return (
    <main className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Meeting Details</h1>
      <MeetingDetails meeting={meeting} />
    </main>
  )
}


meetings/page.tsx
import { dummyMeetings } from "@/lib/dummy-data"
import { MeetingList } from "@/components/MeetingList"

export default function Home() {
  return (
    <main className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Meetings</h1>
      <MeetingList meetings={dummyMeetings} />
    </main>
  )
}


components/AIInsights.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AiInsightsProps {
  insights: string
  summary: string
}

export function AiInsights({ insights, summary }: AiInsightsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-1">Insights</h3>
            <p className="text-sm">{insights}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Summary</h3>
            <p className="text-sm">{summary}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


components/CustomInstructions.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface CustomInstructionsProps {
  instructions: string
  onSave: (newInstructions: string) => void
}

export function CustomInstructions({ instructions, onSave }: CustomInstructionsProps) {
  const [editing, setEditing] = useState(false)
  const [editedInstructions, setEditedInstructions] = useState(instructions)

  const handleSave = () => {
    onSave(editedInstructions)
    setEditing(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom Instructions</CardTitle>
      </CardHeader>
      <CardContent>
        {editing ? (
          <>
            <Textarea
              value={editedInstructions}
              onChange={(e) => setEditedInstructions(e.target.value)}
              className="mb-4"
            />
            <div className="flex space-x-2">
              <Button onClick={handleSave}>Save</Button>
              <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </>
        ) : (
          <>
            <p className="mb-4">{instructions}</p>
            <Button onClick={() => setEditing(true)}>Edit</Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}


components/MeetingCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, ClipboardIcon } from 'lucide-react'
import { Meeting } from "@/lib/dummy-data"
import Link from "next/link"

export function MeetingCard({ meeting }: { meeting: Meeting }) {
  const statusColors = {
    scheduled: "bg-gray-500",
    "in-progress": "bg-blue-500",
    processing: "bg-yellow-500",
    completed: "bg-green-500",
    failed: "bg-red-500"
  }

  return (
    <Link href={`/meetings/${meeting.id}`}>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle>{meeting.title}</CardTitle>
          <Badge className={`${statusColors[meeting.status]} text-white`}>
            {meeting.status}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <CalendarIcon className="w-4 h-4" />
            <span>{new Date(meeting.date).toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500 mt-2">
            <ClipboardIcon className="w-4 h-4" />
            <span>{meeting.spreadsheetInfo.name}</span>
          </div>
          <div className="mt-4">
            <span className="text-sm font-medium">Fields Analyzed: </span>
            <span className="text-sm">{meeting.fieldsAnalyzed}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}


components/MeetingChart.tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, LineChart, Line } from "recharts"

interface MeetingChartsProps {
  metrics: {
    duration: number
    fields_analyzed: number
    success_rate: number
    processing_duration: number
  }
}

export function MeetingCharts({ metrics }: MeetingChartsProps) {
  const barChartData = [
    { name: 'Duration (min)', value: metrics.duration },
    { name: 'Fields Analyzed', value: metrics.fields_analyzed },
    { name: 'Processing Time (s)', value: metrics.processing_duration },
  ]

  const lineChartData = [
    { name: 'Start', value: 0 },
    { name: 'Middle', value: metrics.success_rate * 50 },
    { name: 'End', value: metrics.success_rate * 100 },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meeting Metrics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold mb-2">Key Metrics</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barChartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div>
          <h3 className="text-sm font-semibold mb-2">Success Rate</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={lineChartData}>
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}


components/MeetingList.tsx
import { Meeting } from "@/lib/dummy-data"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function MeetingList({ meetings }: { meetings: Meeting[] }) {
  const statusColors = {
    scheduled: "bg-gray-500",
    "in-progress": "bg-blue-500",
    processing: "bg-yellow-500",
    completed: "bg-green-500",
    failed: "bg-red-500"
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Spreadsheet</TableHead>
          <TableHead>Fields Analyzed</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {meetings.map((meeting) => (
          <TableRow key={meeting.id}>
            <TableCell>
              <Link href={`/meetings/${meeting.id}`} className="hover:underline">
                {meeting.title}
              </Link>
            </TableCell>
            <TableCell>{new Date(meeting.date).toLocaleString()}</TableCell>
            <TableCell>{meeting.spreadsheetInfo.name}</TableCell>
            <TableCell>{meeting.fieldsAnalyzed}</TableCell>
            <TableCell>
              <Badge className={`${statusColors[meeting.status]} text-white`}>
                {meeting.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}


components/Transcript.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface TranscriptProps {
  snippet: string
  fullTranscript: string
}

export function Transcript({ snippet, fullTranscript }: TranscriptProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleSave = () => {
    // In a real application, this would trigger a download or save action
    console.log('Saving transcript:', fullTranscript)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transcript Snippet</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">{snippet}</p>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>View Full Transcript</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Full Transcript</DialogTitle>
            </DialogHeader>
            <div className="mt-4 max-h-96 overflow-y-auto">
              <p>{fullTranscript}</p>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <Button onClick={handleSave}>Save Transcript</Button>
              <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

components/meetings/MeetingDetails.tsx
```tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarIcon, ClipboardIcon, ClockIcon, BarChart2Icon, FileTextIcon } from 'lucide-react'
import { Meeting } from "@/lib/dummy-data"
import { AiInsights } from "./AiInsights"
import { CustomInstructions } from "./CustomInstructions"
import { Transcript } from "./Transcript"
import { MeetingCharts } from "./MeetingCharts"

export function MeetingDetails({ meeting }: { meeting: Meeting }) {
  const statusColors = {
    scheduled: "bg-gray-500",
    "in-progress": "bg-blue-500",
    processing: "bg-yellow-500",
    completed: "bg-green-500",
    failed: "bg-red-500"
  }

  const handleSaveInstructions = (newInstructions: string) => {
    console.log('Saving new instructions:', newInstructions)
    // In a real application, this would update the meeting data
  }

  const handleRequestQuery = () => {
    console.log('Requesting query again for meeting:', meeting.id)
    // In a real application, this would trigger a new query
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{meeting.title}</CardTitle>
              <Badge className={`${statusColors[meeting.status]} text-white`}>
                {meeting.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <CalendarIcon className="w-4 h-4" />
                <span>{new Date(meeting.date).toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <ClockIcon className="w-4 h-4" />
                <span>{meeting.duration} minutes</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <ClipboardIcon className="w-4 h-4" />
                <span>{meeting.spreadsheetInfo.name}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <BarChart2Icon className="w-4 h-4" />
                <span>Fields Analyzed: {meeting.fieldsAnalyzed}</span>
              </div>
              {meeting.metrics && (
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <FileTextIcon className="w-4 h-4" />
                  <span>Success Rate: {(meeting.metrics.success_rate * 100).toFixed(1)}%</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <AiInsights insights={meeting.aiInsights} summary={meeting.aiSummary} />

        <CustomInstructions
          instructions={meeting.customInstructions}
          onSave={handleSaveInstructions}
        />
      </div>

      <div className="space-y-6">
        <Transcript
          snippet={meeting.transcriptSnippet}
          fullTranscript={meeting.fullTranscript}
        />

        {meeting.metrics && <MeetingCharts metrics={meeting.metrics} />}

        <div className="flex justify-end">
          <Button onClick={handleRequestQuery}>Request Query Again</Button>
        </div>
      </div>
    </div>
  )
}
```




lib/dummy-data.ts
import { BasicMeetingMetrics } from './types'

export interface Meeting {
  id: string
  title: string
  date: string
  duration: number
  status: 'scheduled' | 'in-progress' | 'processing' | 'completed' | 'failed'
  fieldsAnalyzed: number
  customInstructions: string
  spreadsheetInfo: {
    id: string
    name: string
  }
  metrics?: BasicMeetingMetrics
  aiInsights: string
  aiSummary: string
  transcriptSnippet: string
  fullTranscript: string
}

export const dummyMeetings: Meeting[] = [
  {
    id: '1',
    title: 'Project Kickoff',
    date: '2024-01-05T10:00:00Z',
    duration: 60,
    status: 'completed',
    fieldsAnalyzed: 15,
    customInstructions: 'Focus on project milestones and team assignments',
    spreadsheetInfo: {
      id: 'sheet1',
      name: 'Project Tasks'
    },
    metrics: {
      duration: 58,
      fields_analyzed: 15,
      success_rate: 0.93,
      processing_duration: 120
    },
    aiInsights: 'Team seems enthusiastic about the new project. Key focus areas identified: user research, prototype development, and marketing strategy.',
    aiSummary: 'The project kickoff meeting was productive, with clear goals set for the next quarter. Team roles were assigned, and a timeline was established for the first phase of development.',
    transcriptSnippet: "John: Let's start by discussing our main objectives for this quarter...",
    fullTranscript: "John: Let's start by discussing our main objectives for this quarter. Sarah: I think we should prioritize user research. Tom: Agreed, and we need to set a timeline for the prototype. Sarah: How about we aim for a prototype by the end of next month? John: Sounds good. Let's also discuss our marketing strategy..."
  },
  {
    id: '2',
    title: 'Weekly Standup',
    date: '2024-01-12T09:00:00Z',
    duration: 30,
    status: 'scheduled',
    fieldsAnalyzed: 0,
    customInstructions: 'Track progress on individual tasks and identify blockers',
    spreadsheetInfo: {
      id: 'sheet2',
      name: 'Team Progress'
    },
    aiInsights: 'Meeting not yet conducted',
    aiSummary: 'Meeting not yet conducted',
    transcriptSnippet: 'Meeting not yet conducted',
    fullTranscript: 'Meeting not yet conducted'
  },
  {
    id: '3',
    title: 'Client Presentation',
    date: '2024-01-08T14:00:00Z',
    duration: 90,
    status: 'failed',
    fieldsAnalyzed: 8,
    customInstructions: 'Highlight key features and gather client feedback',
    spreadsheetInfo: {
      id: 'sheet3',
      name: 'Client Feedback'
    },
    metrics: {
      duration: 87,
      fields_analyzed: 8,
      success_rate: 0.5,
      processing_duration: 180
    },
    aiInsights: 'Client expressed concerns about the timeline. Positive feedback received on the user interface design.',
    aiSummary: 'The client presentation covered the main features of the product. While the client liked the UI, they requested changes to the project timeline. Action items were created to address their concerns.',
    transcriptSnippet: "Client: The interface looks great, but I'm worried about the delivery date...",
    fullTranscript: "Client: The interface looks great, but I'm worried about the delivery date. Can we discuss the timeline? Presenter: Certainly, we understand your concern. Let's go through the project phases and see where we can optimize. Client: That would be helpful. I also wanted to ask about the new features you mentioned..."
  }
]
-- END FILE CONTENTS --
Please make sure to provide the necessary supabase columns for the meetings table as well as following best practices. I want the core functionality to be the same as we have but with these new meeting epic requirements.
I also forgot to mention but we still want to have that create meeting modal with the google auth checks as well to ensure the user can create a meeting successfully. Also we probably have to modify the check-meeting-limit to a more appropiate name and instead of checking meetings we should check the meeting_hours_remaining column in the users table.

Please let me know if you have any questions or need any clarification.



NEXT PROMPT:
Before we move onto the next portion of the frontend, a couple of things, when we render the meetings, list we should only render relevant information, not something like zoom link, we should show the name, the date it was created, status, etc, feel free to judge what is important from a ui/ux along as it aligns with @prd.md @meeting-epic.md Also, one more thing to mention, you basically followed the pattern from v0 right? That file structure and components implemented make sense? Also, when we click meeting, is calling it view analytics and appropiate name? Because we also want to view summary, AI insights, actions, etc. Also, I'm not sure if you incorporated this already, but if a meeting is processing, I want a unique intuitive loading screen as well as toasts to remind users of meeting updates. If the meeting has been completed, then the user should be able to click into it and all of the useful summaries, analytics and insights are there.