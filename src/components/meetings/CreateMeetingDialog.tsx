'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from 'next/navigation'

interface CreateMeetingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function extractSpreadsheetId(url: string): string | null {
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/)
  return match ? match[1] : null
}

export function CreateMeetingDialog({ open, onOpenChange }: CreateMeetingDialogProps) {
  const [name, setName] = useState('')
  const [zoomLink, setZoomLink] = useState('')
  const [spreadsheetId, setSpreadsheetId] = useState('')
  const [customInstructions, setCustomInstructions] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleCreate = async () => {
    try {
      setIsLoading(true)

      // TODO move google integration to integrations tab
      // Extract spreadsheet ID from the link
      const extractedSpreadsheetId = extractSpreadsheetId(spreadsheetId)
      if (!extractedSpreadsheetId) {
        throw new Error('Invalid spreadsheet link')
      }

      // Validate spreadsheet
      const validateResponse = await fetch('/api/google/validate-spreadsheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spreadsheetId: extractedSpreadsheetId })
      })

      if (!validateResponse.ok) {
        throw new Error('Invalid or inaccessible spreadsheet')
      }

      // Create meeting
      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          zoomLink,
          spreadsheetId: extractedSpreadsheetId,
          customInstructions
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create meeting')
      }

      toast({ title: "Meeting created successfully" })
      onOpenChange(false)
      router.refresh()
    } catch (error) {
      toast({
        title: "Error creating meeting",
        description: (error as Error).message,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Meeting</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="Meeting name"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="zoom-link" className="text-right">Zoom Link</Label>
            <Input
              id="zoom-link"
              value={zoomLink}
              onChange={(e) => setZoomLink(e.target.value)}
              className="col-span-3"
              placeholder="https://zoom.us/j/..."
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="spreadsheet-link" className="text-right">Spreadsheet</Label>
            <Input
              id="spreadsheet-link"
              value={spreadsheetId}
              onChange={(e) => setSpreadsheetId(e.target.value)}
              className="col-span-3"
              placeholder="https://docs.google.com/spreadsheets/d/..."
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="instructions" className="text-right">Instructions</Label>
            <Textarea
              id="instructions"
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              className="col-span-3"
              placeholder="Custom instructions for processing the meeting..."
            />
          </div>
        </div>
        <Button onClick={handleCreate} disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Meeting"}
        </Button>
      </DialogContent>
    </Dialog>
  )
} 