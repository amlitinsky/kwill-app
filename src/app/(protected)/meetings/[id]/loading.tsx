import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function LoadingMeetingDetails() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-[300px]" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-[150px]" />
            <Skeleton className="h-6 w-[100px]" />
          </div>
        </div>
        
        <div className="flex gap-4">
          <Skeleton className="h-5 w-[120px]" />
          <Skeleton className="h-5 w-[120px]" />
          <Skeleton className="h-5 w-[120px]" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          {/* Meeting Summary Skeleton */}
          <Card>
            <CardHeader className="pb-3">
              <Skeleton className="h-6 w-[150px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>

          {/* AI Insights Skeleton */}
          <Card>
            <CardHeader className="pb-3">
              <Skeleton className="h-6 w-[150px]" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Skeleton className="h-5 w-[100px] mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[90%]" />
                  <Skeleton className="h-4 w-[80%]" />
                </div>
              </div>
              <div>
                <Skeleton className="h-5 w-[100px] mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[85%]" />
                  <Skeleton className="h-4 w-[75%]" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prompt Skeleton */}
          <Card>
            <CardHeader className="pb-3">
              <Skeleton className="h-6 w-[150px]" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-[100px] w-full" />
              <Skeleton className="h-10 w-[150px]" />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          {/* Transcript Skeleton */}
          <Card>
            <CardHeader className="pb-3">
              <Skeleton className="h-6 w-[150px]" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-4 w-[50px]" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Analytics Skeleton */}
          <Card>
            <CardHeader className="pb-3">
              <Skeleton className="h-6 w-[150px]" />
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <Skeleton className="h-[200px] w-full" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-[150px] w-full" />
                  <Skeleton className="h-[150px] w-full" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Extracted Fields Skeleton */}
          <Card>
            <CardHeader className="pb-3">
              <Skeleton className="h-6 w-[150px]" />
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex-none w-[250px]">
                    <Skeleton className="h-[100px] w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 