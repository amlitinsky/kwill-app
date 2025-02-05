import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Update the recall_oauth_app table
    const { error: updateError } = await supabase
      .from('recall_oauth_app_credentials')
      .update({ connected: true })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Failed to update connection status:', updateError)
      return NextResponse.json(
        { error: 'Failed to update connection status' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating Zoom connection:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}