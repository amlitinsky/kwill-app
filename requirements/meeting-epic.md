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
- Implementation: Grid-based card layout OR simple list (based on your recommendation based on PRD)
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