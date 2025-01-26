import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select"

function LoadingRow() {
  return (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-[100px]" />
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-[60px]" />
        </div>
      </TableCell>
      <TableCell><Skeleton className="h-6 w-[80px] rounded-full" /></TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-[40px]" />
        </div>
      </TableCell>
      <TableCell className="text-right">
        <Skeleton className="h-8 w-8 rounded-md ml-auto" />
      </TableCell>
    </TableRow>
  )
}

export function LoadingMeetings() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <Select disabled>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
          </Select>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Fields</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <LoadingRow />
            <LoadingRow />
            <LoadingRow />
            <LoadingRow />
            <LoadingRow />
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
} 