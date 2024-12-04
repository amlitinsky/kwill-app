import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getCalendlyCreds } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createServerSupabaseClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const credentials = await getCalendlyCreds(user.id)
    return NextResponse.json({ isConnected: !!credentials })
    
  } catch (error) {
    console.error('Error checking Calendly connection:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}