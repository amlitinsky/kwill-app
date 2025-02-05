import { NextRequest, NextResponse } from 'next/server'
import { createZoomOAuthCredential, deleteZoomOAuthCredential } from '@/lib/recall'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (!code) {
    return NextResponse.json({ error: 'Invalid OAuth code' }, { status: 400 })
  }

  // TODO these functions appear to be working as it didn't throw an error when it saw that I had an existing crednential (maybe because of the await?) Not totally sure, worth investing again in the future
  let recall_oauth_app_credentials;
  try {
    recall_oauth_app_credentials = await createZoomOAuthCredential(code)

  } catch (error) {
    if (
      error instanceof Error &&
      'body' in error &&
      typeof error.body === 'object' &&
      error.body &&
          'conflicting_zoom_user_id' in error.body
        ) {
          // Handle re-authorization
          // In this case, we'll just delete the existing credential and retry
          const existingUserId = error.body.conflicting_zoom_user_id
          if (typeof existingUserId === 'string') {
            await deleteZoomOAuthCredential(existingUserId)
            
            // Retry creating the credential
            recall_oauth_app_credentials = await createZoomOAuthCredential(code)
          } else {
        throw new Error('Invalid conflicting_zoom_user_id')
      }
    } else {
      console.error('Error in Zoom OAuth callback:', error)
      throw error
    }
  }

  // TODO verify this is good (also update it to base url which will naturally include https)
  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/integrations?zoom_connected=true`)

}
