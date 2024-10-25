import { NextRequest, NextResponse } from 'next/server'
import { createZoomOAuthCredential, deleteZoomOAuthCredential } from '@/lib/recall'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (!code) {
    return NextResponse.json({ error: 'Invalid OAuth code' }, { status: 400 })
  }

  // TODO these functions appear to be working as it didn't throw an error when it saw that I had an existing crednential (maybe because of the await?) Not totally sure, worth investing again in the future
  try {
    // Function to create Zoom OAuth Credential
    const createCredential = async () => {
      try {
        await createZoomOAuthCredential(code)
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
            await createZoomOAuthCredential(code)
          } else {
            throw new Error('Invalid conflicting_zoom_user_id')
          }
        } else {
          throw error
        }
      }
    }

    // Call Recall API to create Zoom OAuth Credential
    await createCredential()


    // Redirect to dashboard with success parameter
    // TODO verify this is good (also update it to base url which will naturally include https)
    const protocol = process.env.VERCEL_ENV === 'production' ? 'https' : 'http';
    return NextResponse.redirect(`${protocol}://${requestUrl.host}/private/settings?zoom_connected=true`)

  } catch (error) {
    console.error('Error in Zoom OAuth callback:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
