import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { checkTokenValidity, mapHeadersAndAppendData, refreshAccessToken } from '@/lib/google-auth'

export async function POST(request: Request) {
  try {
    const { meetingId, spreadsheetId } = await request.json()
    const supabase = await createServerSupabaseClient()

    // Get meeting first
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
    const { data: credentials, error: credentialsError } = await supabase.from('google_oauth_credentials').select('*').eq('user_id', meeting.user_id).single()

    if (credentialsError || !credentials?.access_token) {
      return NextResponse.json(
        { error: 'Google credentials not found' },
        { status: 404 }
      )
    }

    let accessToken = credentials.access_token

    // Check if token is valid
    const isTokenExpired = await checkTokenValidity(accessToken)
    // If token expired and we have refresh token, get new access token
    if (isTokenExpired) {
      const newCredentials = await refreshAccessToken(credentials.refresh_token)
      accessToken = newCredentials.access_token
      // Update credentials in database
      await supabase
      .from('google_oauth_credentials')
      .update({ 
        access_token: newCredentials.access_token,
        expiry_date: newCredentials.expiry_date 
      })
      .eq('user_id', meeting.user_id)
      .single()
    }

    // Use existing function to export processed data
    const { rowNumber } = await mapHeadersAndAppendData(
      spreadsheetId,
      meeting.spreadsheet_name,
      meeting.processed_data as Record<string, string>,
      accessToken,
      meeting.spreadsheet_row_number,
      true
    )

    // If this was a new row, save it to the meeting
    if (!meeting.spreadsheet_row_number) {
      await supabase
        .from('meetings')
        .update({ spreadsheet_row_number: rowNumber })
        .eq('id', meeting.id)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error exporting meeting:', error)
    return NextResponse.json(
      { error: 'Failed to export meeting' },
      { status: 500 }
    )
  }
} 