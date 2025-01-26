import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { analyzeTranscript, generateMeetingSummary, extractKeyPoints, extractActionItems, generateTimeStampedHighlights, analyzeTopicDistribution } from '@/lib/deepseek'

export async function POST(request: Request) {
  try {
    const { meetingId } = await request.json()
    const supabase = await createServerSupabaseClient()

    // TODO in the future we need to check if there are any new column headers in the spreadsheet

    // Get meeting data
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('*')
      .eq('id', meetingId)
      .single()

    if (meetingError || !meeting) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      )
    }

    // Analyze with Deepseek
    const [processedData, summary, keyPoints, actionItems, highlights, topicDistribution] = await Promise.all([
      analyzeTranscript(meeting.transcript, meeting.column_headers, meeting.custom_instructions),
      generateMeetingSummary(meeting.transcript, meeting.custom_instructions),
      extractKeyPoints(meeting.transcript, meeting.custom_instructions),
      extractActionItems(meeting.transcript, meeting.custom_instructions),
      generateTimeStampedHighlights(meeting.transcript, meeting.custom_instructions),
      analyzeTopicDistribution(meeting.transcript)
    ])

    // Update meeting with new analysis
    const { error: updateError } = await supabase
      .from('meetings')
      .update({
        status: 'completed',
        processed_data: processedData,
        ai_insights: {
          summary,
          key_points: keyPoints,
          action_items: actionItems,
          highlights
        },
        metrics: {
          fields_analyzed: meeting.column_headers.length,
          speaker_participation: meeting.metrics?.speaker_participation || {},
          topic_distribution: topicDistribution,
          duration: meeting.metrics?.duration || 0,
          processing_duration: meeting.metrics?.processing_duration || 0,
          success_rate: (Object.keys(processedData).length / meeting.column_headers.length) * 100
        }
      })
      .eq('id', meetingId)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error reprocessing meeting:', error)
    return NextResponse.json(
      { error: 'Failed to reprocess meeting' },
      { status: 500 }
    )
  }
} 