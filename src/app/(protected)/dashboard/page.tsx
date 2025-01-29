import { Suspense } from 'react'
import { DashboardContent } from '@/components/dashboard/DashboardContent'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchMeetings } from '@/lib/supabase-server'

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Skeleton className="h-[400px] col-span-4" />
        <Skeleton className="h-[400px] col-span-3" />
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const meetings = await fetchMeetings()

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardContent initialMeetings={meetings} />
        </Suspense>
      </main>
    </div>
  )
}
