import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="container py-8">
      <div className="flex flex-col items-center justify-center space-y-4">
        <h1 className="text-3xl font-bold">Meeting Not Found</h1>
        <p className="text-muted-foreground">
          The meeting you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
        </p>
        <Button asChild>
          <Link href="/private/meetings">Back to Meetings</Link>
        </Button>
      </div>
    </div>
  )
} 