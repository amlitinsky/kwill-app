import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

function LoadingRow() {
  return (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-3/4" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
      <TableCell><Skeleton className="h-2 w-full" /></TableCell>
      <TableCell><Skeleton className="h-4 w-8 ml-auto" /></TableCell>
    </TableRow>
  )
}

export function LoadingMeetings() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-4">
          <Skeleton className="h-10 w-[180px]" />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <LoadingRow />
            <LoadingRow />
            <LoadingRow />
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
} 