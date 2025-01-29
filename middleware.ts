import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { redirect } from 'next/navigation'


export async function middleware(request: NextRequest) {
  const response = await updateSession(request)
  const supabase = createMiddlewareClient({ req: request, res: response })
  const { data: { user } } = await supabase.auth.getUser()

  const protectedPaths = ['/dashboard', '/meetings', '/settings', '/integrations']
  const authPaths = ['/signin', '/signup']

  // Protected path check
  if (!user && protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )) {
    redirect('/signin')
  }

  // Auth path check
  if (user && authPaths.includes(request.nextUrl.pathname)) {
    redirect('/dashboard')
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}