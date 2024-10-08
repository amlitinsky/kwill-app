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
import { useTemplates } from '@/hooks/use-templates'

interface Template {
  id: string
  name: string
  spreadsheet_link: string
  custom_instructions: string
}

export default function TemplatesPage() {
  const { templates, isLoading, isError, mutate } = useTemplates()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null)
  const [name, setName] = useState('')
  const [spreadsheetLink, setSpreadsheetLink] = useState('')
  const [customInstructions, setCustomInstructions] = useState('')
  const { toast } = useToast()
  const handleCreateTemplate = async () => {
    if (templates && templates.some((t: Template) => t.name === name)) {
      toast({ title: "Error", description: "A template with this name already exists", variant: "destructive" })
      return
    }

    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, spreadsheetLink, customInstructions }),
      })
      if (!response.ok) {
        throw new Error('Failed to create template')
      }
      toast({ title: "Template created successfully" })
      setIsCreateOpen(false)
      mutate() // This will trigger a re-fetch of the templates
    } catch (error) {
      toast({ title: "Error creating template", description: (error as Error).message, variant: "destructive" })
    }
  }

  const handleUpdateTemplate = async () => {
    if (!currentTemplate) return

    try {
      const response = await fetch('/api/templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentTemplate.id, name, spreadsheetLink, customInstructions }),
      })
      if (!response.ok) {
        throw new Error('Failed to update template')
      }
      toast({ title: "Template updated successfully" })
      setIsEditOpen(false)
      mutate() // This will trigger a re-fetch of the templates
    } catch (error) {
      toast({ title: "Error updating template", description: (error as Error).message, variant: "destructive" })
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
      toast({ title: "Template deleted successfully" })
      mutate() // This will trigger a re-fetch of the templates
    } catch (error) {
      toast({ title: "Error deleting template", description: (error as Error).message, variant: "destructive" })
    }
  }

  const openEditDialog = (template: Template) => {
    setCurrentTemplate(template)
    setName(template.name)
    setSpreadsheetLink(template.spreadsheet_link)
    setCustomInstructions(template.custom_instructions)
    setIsEditOpen(true)
  }

  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>Error loading templates</div>

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
                  <Input id="spreadsheet" value={spreadsheetLink} onChange={(e) => setSpreadsheetLink(e.target.value)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="instructions" className="text-right">Custom Instructions</Label>
                  <Textarea id="instructions" value={customInstructions} onChange={(e) => setCustomInstructions(e.target.value)} className="col-span-3" />
                </div>
              </div>
              <Button onClick={handleCreateTemplate}>Create Template</Button>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {templates && templates.length === 0 ? (
            <p>No templates available. Create one to get started!</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Spreadsheet Link</TableHead>
                  <TableHead>Custom Instructions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates && templates.map((template: Template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>{template.spreadsheet_link}</TableCell>
                    <TableCell>{template.custom_instructions.length > 50 ? `${template.custom_instructions.substring(0, 50)}...` : template.custom_instructions}</TableCell>
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
              <Input id="edit-spreadsheet" value={spreadsheetLink} onChange={(e) => setSpreadsheetLink(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-instructions" className="text-right">Custom Instructions</Label>
              <Textarea id="edit-instructions" value={customInstructions} onChange={(e) => setCustomInstructions(e.target.value)} className="col-span-3" />
            </div>
          </div>
          <Button onClick={handleUpdateTemplate}>Update Template</Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}