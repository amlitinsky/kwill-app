'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Check, ChevronsUpDown } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface CreateMeetingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface Template {
  id: string
  name: string
  spreadsheet_id: string
  prompt: string | null
  meeting_link: string | null
}

interface FormData {
  name: string
  meetingLink: string
  spreadsheetId: string
  prompt: string
  templateId: string | null
}

const initialFormData: FormData = {
  name: '',
  meetingLink: '',
  spreadsheetId: '',
  prompt: '',
  templateId: null,
}

function extractSpreadsheetId(input: string): string | null {
  // Handle full URLs
  const urlMatch = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (urlMatch) return urlMatch[1];

  // Handle direct IDs (if they just paste the ID)
  const idMatch = input.match(/^[a-zA-Z0-9-_]+$/);
  if (idMatch) return input;

  return null;
}

export function CreateMeetingDialog({ open, onOpenChange }: CreateMeetingDialogProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Fetch templates with loading and error states
  const { data: templates, isLoading: isLoadingTemplates, error: templatesError } = useQuery<Template[]>({
    queryKey: ['templates'],
    queryFn: async () => {
      const response = await fetch('/api/templates')
      if (!response.ok) throw new Error('Failed to fetch templates')
      return response.json()
    },
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleTemplateSelect = (templateId: string) => {
    const template = templates?.find((t) => t.id === templateId)
    if (template) {
      setFormData({
        name: formData.name, // Keep the existing name
        meetingLink: template.meeting_link || '',
        spreadsheetId: template.spreadsheet_id,
        prompt: template.prompt || '',
        templateId,
      })
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsLoading(true)

      // Extract spreadsheet ID if it's a URL
      const extractedSpreadsheetId = extractSpreadsheetId(formData.spreadsheetId)
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
          name: formData.name,
          meetingLink: formData.meetingLink,
          spreadsheetId: extractedSpreadsheetId,
          prompt: formData.prompt,
          templateId: formData.templateId,
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create meeting')
      }

      toast.success('Meeting created successfully')
      onOpenChange(false)
      setFormData(initialFormData)
      router.refresh()
    } catch (error) {
      toast.error(`Error creating meeting: ${(error as Error).message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleCreate}>
          <DialogHeader>
            <DialogTitle>Create New Meeting</DialogTitle>
            <DialogDescription>
              Create a new meeting and optionally use a template to pre-fill the fields.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="template">Template (Optional)</Label>
              <Select
                disabled={isLoadingTemplates}
                value={formData.templateId || ''}
                onValueChange={handleTemplateSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    isLoadingTemplates 
                      ? "Loading templates..." 
                      : "Select a template"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {templates?.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {templatesError && (
                <p className="text-xs text-destructive">
                  Error loading templates: {templatesError.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Meeting name"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="meetingLink">Meeting Link</Label>
              <Input
                id="meetingLink"
                name="meetingLink"
                value={formData.meetingLink}
                onChange={handleInputChange}
                placeholder="https://zoom.us/j/..."
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="spreadsheetId">Spreadsheet Link</Label>
              <Input
                id="spreadsheetId"
                name="spreadsheetId"
                value={formData.spreadsheetId}
                onChange={handleInputChange}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                required
              />
              <p className="text-xs text-muted-foreground">
                Paste the full Google Sheets URL or just the spreadsheet ID
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="prompt">Prompt (Optional)</Label>
              <Textarea
                id="prompt"
                name="prompt"
                value={formData.prompt}
                onChange={handleInputChange}
                placeholder="Instructions for processing the meeting..."
                className="h-20"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Meeting"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 