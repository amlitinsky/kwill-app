import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { createZoomOAuthCredential, deleteZoomOAuthCredential } from '@/lib/recall'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (!code) {
    return NextResponse.json({ error: 'Invalid OAuth code' }, { status: 400 })
  }

  const supabase = await createRouteHandlerClient({ cookies })

  try {
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Function to create Zoom OAuth Credential
    const createCredential = async () => {
      try {
        return await createZoomOAuthCredential(code)
      } catch (error) {
        if (
          error instanceof Error &&
          'status' in error &&
          error.status === 400 &&
          'body' in error &&
          typeof error.body === 'object' &&
          error.body &&
          'conflicting_zoom_account_id' in error.body
        ) {
          // Handle re-authorization
          const { data: existingCred } = await supabase
            .from('zoom_oauth_credentials')
            .select('recall_user_id')
            .eq('user_id', session.user.id)
            .single()

          if (existingCred) {
            // Delete existing credential from Recall
            await deleteZoomOAuthCredential(existingCred.recall_user_id)
            
            // Delete existing credential from database
            await supabase
              .from('zoom_oauth_credentials')
              .delete()
              .eq('user_id', session.user.id)

            // Retry creating the credential
            return await createZoomOAuthCredential(code)
          }
        }
        throw error
      }
    }

    // Call Recall API to create Zoom OAuth Credential
    const recallData = await createCredential()

    // Store the credential in your database
    const { error } = await supabase
      .from('zoom_oauth_credentials')
      .insert({
        user_id: session.user.id,
        recall_id: recallData.id,
        recall_oauth_app: recallData.oauth_app,
        recall_user_id: recallData.user_id,
        created_at: recallData.created_at
      })

    if (error) throw error

    // Redirect to dashboard with success parameter
    return NextResponse.redirect(`${requestUrl.origin}/private/settings?zoom_connected=true`)
  } catch (error) {
    console.error('Error in Zoom OAuth callback:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
