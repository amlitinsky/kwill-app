import { Suspense } from 'react'
import { fetchMeetings, getSubscription } from '@/lib/supabase-server'
import { MeetingList } from '@/components/meetings/MeetingList'
import { MeetingHeader } from '@/components/meetings/MeetingHeader'
import { LoadingMeetings } from '@/components/meetings/LoadingMeetings'

export const dynamic = 'force-dynamic'

export default async function MeetingsPage() {
  const [meetings, user] = await Promise.all([
    fetchMeetings(),
    getSubscription()
  ])

  return (
    <div className="container mx-auto py-10">
      <MeetingHeader hoursRemaining={user?.hours || 0} />
      <Suspense fallback={<LoadingMeetings />}>
        <MeetingList initialMeetings={meetings} />
      </Suspense>
    </div>
  )
}
