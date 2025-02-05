'use client'

import { useState, useEffect } from 'react'
import { Meeting } from "@/lib/supabase-server"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, FileText, Save, Upload, ChevronDown, Loader2, RefreshCw } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { createClient } from '@/lib/supabase-client'
import { MeetingCharts } from "@/components/meetings/MeetingCharts"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface TranscriptSegment {
  speaker: string;
  start_time: number;
  text: string;
}

interface MeetingDetailsProps {
  meeting: Meeting
}

const statusColors = {
  scheduled: "bg-gray-500",
  created: "bg-sky-500",
  'in-progress': "bg-blue-500",
  processing: "bg-yellow-500",
  completed: "bg-green-500",
  failed: "bg-red-500"
} as const

export function MeetingDetails({ meeting: initialMeeting }: MeetingDetailsProps) {
  const [meeting, setMeeting] = useState(initialMeeting)
  const [prompt, setPrompt] = useState(meeting.prompt || '')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isTranscriptExpanded, setIsTranscriptExpanded] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  // Real-time updates
  useEffect(() => {
    const channel = supabase
      .channel(`meeting-${meeting.id}`)
      .on<Meeting>(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'meetings',
          filter: `id=eq.${meeting.id}`
        },
        (payload) => {
          setMeeting(payload.new)
          setPrompt(payload.new.prompt)
          toast({
            title: 'Meeting Updated',
            description: 'Meeting details have been refreshed.',
            duration: 3000
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [meeting.id])

  const handleSavePrompt = async () => {
    if (isSaving) return
    setIsSaving(true)

    try {
      const { error } = await supabase
        .from('meetings')
        .update({ prompt: prompt })
        .eq('id', meeting.id)

      if (error) throw error

      toast({
        title: 'Prompt Saved',
        description: 'Prompt has been updated.',
        duration: 3000
      })
    } catch (error) {
      console.error('Error saving prompt:', error)
      toast({
        title: 'Error',
        description: 'Failed to save prompt. Please try again.',
        variant: 'destructive',
        duration: 5000
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleReprocess = async () => {
    if (isProcessing) return
    setIsProcessing(true)

    try {
      const { error } = await supabase
        .from('meetings')
        .update({ 
          status: 'processing',
          ai_insights: null,
          metrics: null
        })
        .eq('id', meeting.id)

      if (error) throw error

      const response = await fetch('/api/meetings/reprocess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingId: meeting.id })
      })

      if (!response.ok) throw new Error('Failed to trigger reprocessing')

      toast({
        title: 'Processing Started',
        description: 'Your meeting is being reprocessed with the new prompt.',
        duration: 5000
      })
    } catch (error) {
      console.error('Error reprocessing:', error)
      toast({
        title: 'Error',
        description: 'Failed to reprocess meeting. Please try again.',
        variant: 'destructive',
        duration: 5000
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleExportToSheet = async () => {
    try {
      const response = await fetch('/api/meetings/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          meetingId: meeting.id,
          spreadsheetId: meeting.spreadsheet_id
        })
      })

      if (!response.ok) throw new Error('Failed to export')

      toast({
        title: 'Export Successful',
        description: 'Meeting data has been exported to Google Sheets.',
        duration: 3000
      })
    } catch (error) {
      console.error('Error exporting:', error)
      toast({
        title: 'Export Failed',
        description: 'Failed to export to Google Sheets. Please try again.',
        variant: 'destructive',
        duration: 5000
      })
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{meeting.name}</h1>
          <Badge className={`${statusColors[meeting.status]} text-white`}>
            {meeting.status}
          </Badge>
        </div>
        
        <div className="flex gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {format(new Date(meeting.created_at), 'MMM d, yyyy')}
          </div>
          {meeting.metrics?.duration && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {Math.round(meeting.metrics.duration / 60)} minutes
            </div>
          )}
          {meeting.metrics?.fields_analyzed && (
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {meeting.metrics.fields_analyzed} fields analyzed
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          {/* Meeting Summary */}
          <Card>
            <CardHeader className="pb-3">
              <h2 className="text-xl font-semibold">Meeting Summary</h2>
            </CardHeader>
            <CardContent>
              {meeting.ai_insights?.summary ? (
                <p className="text-sm text-muted-foreground">{meeting.ai_insights.summary}</p>
              ) : (
                <p className="text-sm text-muted-foreground">No summary available.</p>
              )}
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card>
            <CardHeader className="pb-3">
              <h2 className="text-xl font-semibold">AI Insights</h2>
            </CardHeader>
            <CardContent className="space-y-6">
              {meeting.ai_insights ? (
                <>
                  <div>
                    <h3 className="font-medium mb-2">Key Points</h3>
                    <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
                      {meeting.ai_insights.key_points.map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Action Items</h3>
                    <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
                      {meeting.ai_insights.action_items.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No insights available.</p>
              )}
            </CardContent>
          </Card>

          {/* Extracted Fields */}
          <Card>
            <CardHeader className="pb-3">
              <h2 className="text-xl font-semibold">Extracted Fields</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              {meeting.processed_data ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-max">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-4 font-medium text-sm">Field</th>
                          <th className="text-left py-2 px-4 font-medium text-sm">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(meeting.processed_data as Record<string, string>).map(([field, value], index) => (
                          <tr 
                            key={field}
                            className={index % 2 === 0 ? 'bg-muted/50' : ''}
                          >
                            <td className="py-2 px-4 text-sm font-medium">{field}</td>
                            <td className="py-2 px-4 text-sm text-muted-foreground">{value || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleExportToSheet}
                    disabled={meeting.status !== 'completed'}
                    className="w-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Export to Sheet
                  </Button>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No extracted fields available.</p>
              )}
            </CardContent>
          </Card>

          {/* Prompt */}
          <Card>
            <CardHeader className="pb-3">
              <h2 className="text-xl font-semibold">Prompt</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter prompt for AI processing..."
                className="min-h-[100px]"
              />
              <div className="flex gap-4">
                <Button
                  onClick={handleSavePrompt}
                  disabled={isSaving || prompt === meeting.prompt}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? 'Saving...' : 'Save Prompt'}
                </Button>
                <Button
                  onClick={handleReprocess}
                  disabled={isProcessing}
                  variant="secondary"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reprocess Meeting
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          {/* Transcript */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Meeting Transcript</h2>
                {meeting.transcript && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsTranscriptExpanded(true)}
                  >
                    <ChevronDown className="mr-2 h-4 w-4" />
                    Show Full Transcript
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {meeting.transcript ? (
                <div className="space-y-4 max-h-[300px] overflow-y-auto">
                  {(() => {
                    try {
                      let transcriptData: TranscriptSegment[];
                      
                      if (typeof meeting.transcript === 'string') {
                        transcriptData = JSON.parse(meeting.transcript);
                      } else {
                        transcriptData = meeting.transcript as unknown as TranscriptSegment[];
                      }

                      const displaySegments = transcriptData.slice(0, 3);
                      
                      return (
                        <div className="space-y-4">
                          {displaySegments.map((segment, i) => (
                            <div key={i} className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{segment.speaker}</span>
                                <span className="text-sm text-muted-foreground">
                                  {Math.floor(segment.start_time / 60)}:
                                  {String(Math.floor(segment.start_time % 60)).padStart(2, '0')}
                                </span>
                              </div>
                              <p className="pl-4 text-sm text-muted-foreground">{segment.text}</p>
                            </div>
                          ))}
                        </div>
                      );
                    } catch (error) {
                      console.error('Error displaying transcript', error)
                      return (
                        <p className="text-sm text-muted-foreground">
                          Unable to display transcript. The data may be in an incorrect format.
                        </p>
                      );
                    }
                  })()}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No transcript available.</p>
              )}
            </CardContent>
          </Card>

          {/* Full Transcript Dialog */}
          <Dialog open={isTranscriptExpanded} onOpenChange={setIsTranscriptExpanded}>
            <DialogContent className="max-w-4xl h-[80vh]">
              <DialogHeader>
                <DialogTitle>Full Transcript</DialogTitle>
              </DialogHeader>
              <div className="overflow-y-auto flex-1 mt-4">
                {meeting.transcript && (() => {
                  try {
                    let transcriptData: TranscriptSegment[];
                    
                    if (typeof meeting.transcript === 'string') {
                      transcriptData = JSON.parse(meeting.transcript);
                    } else {
                      transcriptData = meeting.transcript as unknown as TranscriptSegment[];
                    }
                    
                    return (
                      <div className="space-y-4">
                        {transcriptData.map((segment, i) => (
                          <div key={i} className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{segment.speaker}</span>
                              <span className="text-sm text-muted-foreground">
                                {Math.floor(segment.start_time / 60)}:
                                {String(Math.floor(segment.start_time % 60)).padStart(2, '0')}
                              </span>
                            </div>
                            <p className="pl-4 text-sm text-muted-foreground">{segment.text}</p>
                          </div>
                        ))}
                      </div>
                    );
                  } catch (error) {
                    console.error('Error displaying transcript', error)
                    return (
                      <p className="text-sm text-muted-foreground">
                        Unable to display transcript. The data may be in an incorrect format.
                      </p>
                    );
                  }
                })()}
              </div>
            </DialogContent>
          </Dialog>

          {/* Analytics */}
          <Card>
            <CardHeader className="pb-3">
              <h2 className="text-xl font-semibold">Analytics</h2>
            </CardHeader>
            <CardContent>
              {meeting.metrics ? (
                <MeetingCharts metrics={meeting.metrics} />
              ) : (
                <p className="text-sm text-muted-foreground">No analytics available.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 