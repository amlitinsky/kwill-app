import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createServerSupabaseClient();

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('zoom_oauth_credentials')
      .select('recall_id')
      .eq('user_id', user.id)
      .single()

    if (error) {
      return NextResponse.json({ isConnected: false })
    }

    return NextResponse.json({ isConnected: !!data })
  } catch (error) {
    console.error('Error checking Zoom credentials:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}