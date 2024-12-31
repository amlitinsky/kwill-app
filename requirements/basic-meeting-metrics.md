For the current meeting overhaul, let's focus on essential, easy-to-implement analytics that directly show value to users. Here's a minimalist approach:

Basic Meeting-Level Metrics:
```typescript
interface BasicMeetingMetrics {
  duration: number;              // Meeting duration in minutes
  fields_analyzed: number;       // Number of spreadsheet columns processed
  success_rate: number;         // Percentage of fields successfully mapped
  processing_duration: number;   // How long it took to process
}
```

Implementation:
1. Add a simple JSONB column to your existing meetings table:
```sql
ALTER TABLE meetings 
ADD COLUMN metrics JSONB;
```

2. Track these in your webhook handler when the meeting completes:
```typescript
async function updateMeetingMetrics(meetingId: string) {
  const metrics = {
    duration: calculateMeetingDuration(),
    fields_analyzed: spreadsheetColumns.length,
    success_rate: successfulMappings / totalFields,
    processing_duration: processingEndTime - processingStartTime
  };

  await supabase
    .from('meetings')
    .update({ metrics })
    .match({ id: meetingId });
}
```

3. Display in Meeting Detail View:
```tsx
const MeetingMetrics = ({ metrics }: { metrics: BasicMeetingMetrics }) => {
  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      <MetricCard
        title="Duration"
        value={`${metrics.duration} mins`}
      />
      <MetricCard
        title="Fields Analyzed"
        value={metrics.fields_analyzed}
      />
      <MetricCard
        title="Success Rate"
        value={`${(metrics.success_rate * 100).toFixed(1)}%`}
      />
      <MetricCard
        title="Processing Time"
        value={`${metrics.processing_duration}s`}
      />
    </div>
  );
};
```

This gives users important information without overcomplicating the implementation. You can always expand the analytics system later based on user feedback and needs.

Want me to show how to implement any specific part of this basic analytics setup?