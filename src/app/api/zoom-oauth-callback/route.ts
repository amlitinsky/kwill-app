import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient} from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (!code) {
    return NextResponse.json({ error: 'Invalid OAuth code' }, { status: 400 })
  }

  const supabase = createRouteHandlerClient({ cookies })


  try {
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Call Recall API to create Zoom OAuth Credential
    const recallResponse = await fetch('https://us-east-1.recall.ai/api/v2/zoom-oauth-credentials/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RECALL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        oauth_app: process.env.RECALL_ZOOM_OAUTH_APP_ID,
        authorization_code: {
          code: code,
          redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/zoom-oauth-callback`,
        },
      }),
    })

    if (!recallResponse.ok) {
      const errorData = await recallResponse.json()
      if (errorData.conflicting_zoom_account_id) {
        // Handle re-authorization
        // This is a simplified example and should be expanded in a real application
        return NextResponse.json({ error: 'Zoom account already connected. Please disconnect and try again.' }, { status: 400 })
      }
      throw new Error('Failed to create Zoom OAuth Credential')
    }

    const recallData = await recallResponse.json()

    // Store the credential in your database
    const { error } = await supabase
      .from('zoom_oauth_credentials')
      .insert({
        user_id: session.user.id,
        recall_credential_id: recallData.id,
        zoom_account_id: recallData.account_id,
      })

    if (error) throw error

    // Redirect to dashboard with success parameter
    return NextResponse.redirect(`${requestUrl.origin}/dashboard?zoom_connected=true`)
  } catch (error) {
    console.error('Error in Zoom OAuth callback:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}