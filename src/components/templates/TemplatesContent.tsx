'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MoreHorizontal, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from 'next/navigation'

interface Template {
  id: string
  name: string
  spreadsheet_id: string
  prompt: string
  transcript: string
}

interface TemplatesContentProps {
  initialTemplates: Template[]
}

function extractSpreadsheetId(url: string): string | null {
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

export default function TemplatesContent({ initialTemplates }: TemplatesContentProps) {
  const [templates, setTemplates] = useState<Template[]>(initialTemplates)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null)
  const [name, setName] = useState('')
  const [spreadsheetId, setSpreadsheetId] = useState('')
  const [prompt, setPrompt] = useState('')
  const [transcript, setTranscript] = useState('')
  const { toast } = useToast()
  const router = useRouter()

  const handleCreateTemplate = async () => {
    if (templates.some((t: Template) => t.name === name)) {
      toast({ title: "Error", description: "A template with this name already exists", variant: "destructive" })
      return
    }

    // Extract spreadsheet ID from the link
    const extractedSpreadsheetId = extractSpreadsheetId(spreadsheetId)
    if (!extractedSpreadsheetId) {
      toast({ title: "Error", description: "Invalid spreadsheet link", variant: "destructive" })
      return
    }

    try {
      // Validate spreadsheet
      const validateResponse = await fetch('/api/google/validate-spreadsheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spreadsheetId: extractedSpreadsheetId }),
      })

      if (!validateResponse.ok) {
        throw new Error('Invalid spreadsheet ID')
      }

      // Create template through server action (will be added later)
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          spreadsheetId: extractedSpreadsheetId, 
          prompt, 
          transcript 
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create template')
      }

      const newTemplate = await response.json()
      setTemplates([...templates, newTemplate])
      toast({ title: "Template created successfully" })
      setIsCreateOpen(false)
      router.refresh()
    } catch (error) {
      toast({ 
        title: "Error creating template", 
        description: (error as Error).message, 
        variant: "destructive" 
      })
    }
  }

  const handleUpdateTemplate = async () => {
    if (!currentTemplate) return

    try {
      const response = await fetch('/api/templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: currentTemplate.id, 
          name, 
          spreadsheetId, 
          prompt, 
          transcript 
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update template')
      }

      const updatedTemplate = await response.json()
      setTemplates(templates.map(t => 
        t.id === currentTemplate.id ? updatedTemplate : t
      ))
      toast({ title: "Template updated successfully" })
      setIsEditOpen(false)
      router.refresh()
    } catch (error) {
      toast({ 
        title: "Error updating template", 
        description: (error as Error).message, 
        variant: "destructive" 
      })
    }
  }

  const handleDeleteTemplate = async (id: string) => {
    try {
      const response = await fetch('/api/templates', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete template')
      }

      setTemplates(templates.filter(t => t.id !== id))
      toast({ title: "Template deleted successfully" })
      router.refresh()
    } catch (error) {
      toast({ 
        title: "Error deleting template", 
        description: (error as Error).message, 
        variant: "destructive" 
      })
    }
  }

  const openEditDialog = (template: Template) => {
    setCurrentTemplate(template)
    setName(template.name)
    setSpreadsheetId(template.spreadsheet_id)
    setPrompt(template.prompt)
    setTranscript(template.transcript)
    setIsEditOpen(true)
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Templates</CardTitle>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> Create Template</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Template</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="spreadsheet" className="text-right">Spreadsheet Link</Label>
                  <Input id="spreadsheet" value={spreadsheetId} onChange={(e) => setSpreadsheetId(e.target.value)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="instructions" className="text-right">Prompt</Label>
                  <Textarea id="instructions" value={prompt} onChange={(e) => setPrompt(e.target.value)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="transcript" className="text-right">Enter Transcript</Label>
                  <Textarea id="transcript" value={transcript} onChange={(e) => setTranscript(e.target.value)} className="col-span-3" />
                </div>
              </div>
              <Button onClick={handleCreateTemplate}>Create Template</Button>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <p>No templates available. Create one to get started!</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Spreadsheet Link</TableHead>
                  <TableHead>Custom Instructions</TableHead>
                  <TableHead>Transcript</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template: Template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>{template.spreadsheet_id}</TableCell>
                    <TableCell>{template.prompt.length > 50 ? `${template.prompt.substring(0, 50)}...` : template.prompt}</TableCell>
                    <TableCell>{template.transcript.length > 50 ? `${template.transcript.substring(0, 50)}...` : template.transcript}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(template)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteTemplate(template.id)}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">Name</Label>
              <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-spreadsheet" className="text-right">Spreadsheet Link</Label>
              <Input id="edit-spreadsheet" value={spreadsheetId} onChange={(e) => setSpreadsheetId(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-instructions" className="text-right">Prompt</Label>
              <Textarea id="edit-instructions" value={prompt} onChange={(e) => setPrompt(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-transcript" className="text-right">Transcript</Label>
              <Textarea id="edit-transcript" value={transcript} onChange={(e) => setTranscript(e.target.value)} className="col-span-3" />
            </div>
          </div>
          <Button onClick={handleUpdateTemplate}>Update Template</Button>
        </DialogContent>
      </Dialog>
    </div>
  )
} 