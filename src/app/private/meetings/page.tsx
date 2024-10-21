'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MoreHorizontal, Plus, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useMeetings } from '@/hooks/use-meetings'

interface Meeting {
  id: string
  name: string
  zoom_link: string
  spreadsheet_id: string
  column_headers: string[]
  custom_instructions: string
  status: string
}

export function extractSpreadsheetId(url: string): string | null {
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

export default function MeetingsPage() {
  const { meetings, isLoading, isError, mutate } = useMeetings()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [currentMeeting, setCurrentMeeting] = useState<Meeting | null>(null)
  const [name, setName] = useState('')
  const [zoomLink, setZoomLink] = useState('')
  const [spreadsheetId, setSpreadsheetId] = useState('')
  const [customInstructions, setCustomInstructions] = useState('')
  const [showLimitModal, setShowLimitModal] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const googleConnected = urlParams.get('google_connected');

    if (googleConnected === 'true') {
      const pendingMeeting = localStorage.getItem('pendingMeeting');
      if (pendingMeeting) {
        const { name, zoomLink, spreadsheetId, customInstructions } = JSON.parse(pendingMeeting);
        setName(name);
        setZoomLink(zoomLink);
        setSpreadsheetId(spreadsheetId);
        setCustomInstructions(customInstructions);
        localStorage.removeItem('pendingMeeting');

        const createMeeting = async () => {
          try {
            const response = await fetch('/api/meetings', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, zoomLink, spreadsheetId, customInstructions }),
            });
            if (!response.ok) {
              throw new Error('Failed to create meeting');
            }
            toast({ title: "Meeting created successfully" });
            mutate();
          } catch (error) {
            toast({ title: "Error creating meeting", description: (error as Error).message, variant: "destructive" });
          }
        };

        createMeeting();
      }
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [mutate, toast]);

  const handleCreateButtonClick = async () => {
    try {
      const meetingLimitResponse = await fetch('/api/check-meeting-limit');
      const meetingLimitData = await meetingLimitResponse.json();
      console.log("meeting limit data: ", meetingLimitData)

      if (!meetingLimitData.canCreateMeeting) {
        setShowLimitModal(true);
      } else {
        setIsCreateOpen(true);
      }
    } catch (error) {
      console.error('Error checking meeting limit:', error);
      toast({ 
        title: "Error", 
        description: "Unable to check meeting limit. Please try again.", 
        variant: "destructive" 
      });
    }
  };

  const handleCreateMeeting = async () => {
    try {

      // First we check if if we have Google OAuth credentials
      const authCheckResponse = await fetch('/api/check-google-oauth');
      const authCheckData = await authCheckResponse.json();

      // Extract spreadsheet ID from the link
      const extractedSpreadsheetId = extractSpreadsheetId(spreadsheetId);
      console.log("extracted id: ", extractedSpreadsheetId)
      if (!extractedSpreadsheetId) {
        throw new Error('Invalid spreadsheet link');
      }

      if (!authCheckData.isAuthorized) {
        // If not authorized, redirect to Google OAuth
        localStorage.setItem('pendingMeeting', JSON.stringify({ name, zoomLink, spreadsheetId : extractedSpreadsheetId, customInstructions }));
        const authUrlResponse = await fetch('/api/get-google-auth-url');
        const { url } = await authUrlResponse.json();
        window.location.href = url;

      // if valid, then we validate the spreadsheet ID
      const validateResponse = await fetch('/api/validate-spreadsheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spreadsheetId: extractedSpreadsheetId}),
      });

      if (!validateResponse.ok) {
        throw new Error('Invalid spreadsheet ID');
      }
        return;
      }

      // If authorized, create the meeting
      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, zoomLink, spreadsheetId : extractedSpreadsheetId, customInstructions }),
      });

      if (!response.ok) {
        throw new Error('Failed to create meeting');
      }

      toast({ title: "Meeting created successfully" });
      setIsCreateOpen(false);
      mutate();
    } catch (error) {
      toast({ title: "Error creating meeting", description: (error as Error).message, variant: "destructive" });
    }
  };

  const handleUpdateMeeting = async () => {
    if (!currentMeeting) return

    try {
      const response = await fetch('/api/meetings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentMeeting.id, name, zoomLink, spreadsheetId, customInstructions }),
      })
      if (!response.ok) {
        throw new Error('Failed to update meeting')
      }
      toast({ title: "Meeting updated successfully" })
      setIsEditOpen(false)
      mutate()
    } catch (error) {
      toast({ title: "Error updating meeting", description: (error as Error).message, variant: "destructive" })
    }
  }

  const handleDeleteMeeting = async (id: string) => {
    try {
      const response = await fetch('/api/meetings', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!response.ok) {
        throw new Error('Failed to delete meeting')
      }
      toast({ title: "Meeting deleted successfully" })
      mutate()
    } catch (error) {
      toast({ title: "Error deleting meeting", description: (error as Error).message, variant: "destructive" })
    }
  }

  const openEditDialog = (meeting: Meeting) => {
    setCurrentMeeting(meeting)
    setName(meeting.name)
    setZoomLink(meeting.zoom_link)
    setSpreadsheetId(meeting.spreadsheet_id)
    setCustomInstructions(meeting.custom_instructions)
    setIsEditOpen(true)
  }

  const handleUpgradeClick = () => {
    window.location.href = '/private/settings'
  }

  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>Error loading meetings</div>

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Meetings</CardTitle>
        <Button onClick={handleCreateButtonClick}>
          <Plus className="mr-2 h-4 w-4" /> Create Meeting
        </Button>
        </CardHeader>
        <CardContent>
          {meetings && meetings.length === 0 ? (
            <p>No meetings available. Create one to get started!</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Zoom Link</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {meetings && meetings.map((meeting: Meeting) => (
                  <TableRow key={meeting.id}>
                    <TableCell className="font-medium">{meeting.name}</TableCell>
                    <TableCell>{meeting.zoom_link}</TableCell>
                    <TableCell>{meeting.status}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(meeting)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteMeeting(meeting.id)}>Delete</DropdownMenuItem>
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

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        {/* <DialogTrigger asChild>
          <Button><Plus className="mr-2 h-4 w-4" /> Create Meeting</Button>
        </DialogTrigger> */}
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Meeting</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="zoom-link" className="text-right">Zoom Link</Label>
              <Input id="zoom-link" value={zoomLink} onChange={(e) => setZoomLink(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="spreadsheet-id" className="text-right">Spreadsheet Link</Label>
              <Input id="spreadsheet-id" value={spreadsheetId} onChange={(e) => setSpreadsheetId(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="instructions" className="text-right">Custom Instructions</Label>
              <Textarea id="instructions" value={customInstructions} onChange={(e) => setCustomInstructions(e.target.value)} className="col-span-3" />
            </div>
          </div>
          <Button onClick={handleCreateMeeting}>Create Meeting</Button>
        </DialogContent>
      </Dialog>
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Meeting</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">Name</Label>
              <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-zoom-link" className="text-right">Zoom Link</Label>
              <Input id="edit-zoom-link" value={zoomLink} onChange={(e) => setZoomLink(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-spreadsheet-id" className="text-right">Spreadsheet ID</Label>
              <Input id="edit-spreadsheet-id" value={spreadsheetId} onChange={(e) => setSpreadsheetId(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-instructions" className="text-right">Custom Instructions</Label>
              <Textarea id="edit-instructions" value={customInstructions} onChange={(e) => setCustomInstructions(e.target.value)} className="col-span-3" />
            </div>
          </div>
          <Button onClick={handleUpdateMeeting}>Update Meeting</Button>
        </DialogContent>
      </Dialog>
     <Dialog open={showLimitModal} onOpenChange={setShowLimitModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Meeting Limit Reached</DialogTitle>
            <DialogDescription>
              You have reached your usage limit for creating meetings.
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            To create more meetings, please upgrade your account to access additional resources.
          </p>
          <DialogFooter className="sm:justify-between">
            <Button variant="secondary" onClick={() => setShowLimitModal(false)}>
              Close
            </Button>
            <Button onClick={handleUpgradeClick}>
              Upgrade Now
            </Button>
          </DialogFooter>
          <button
            onClick={() => setShowLimitModal(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </DialogContent>
      </Dialog>
    </div>
  )
}