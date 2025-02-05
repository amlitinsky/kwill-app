import { Suspense } from 'react'
import { fetchTemplates } from '@/lib/supabase-server'
import { TemplatesContent } from '@/components/templates/TemplatesContent'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

function TemplatesLoading() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-4 w-[300px] mt-2" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader>
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default async function TemplatesPage() {
  const initialTemplates = await fetchTemplates()

  return (
    <Suspense fallback={<TemplatesLoading />}>
      <TemplatesContent initialTemplates={initialTemplates} />
    </Suspense>
  )
}