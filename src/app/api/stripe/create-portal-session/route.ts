import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createCustomerPortalSession } from '@/lib/stripe'

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { customerId } = await request.json()
    if (!customerId) {
      return new NextResponse('Missing customerId', { status: 400 })
    }

    const session = await createCustomerPortalSession(customerId)
    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Error creating portal session:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 