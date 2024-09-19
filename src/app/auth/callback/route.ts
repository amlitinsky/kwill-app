import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  console.log("request received: ", request)
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  const supabase = createRouteHandlerClient({ cookies });

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(`${requestUrl.origin}/auth-error?reason=${encodeURIComponent(error.message)}`);
    }
  } else {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.redirect(`${requestUrl.origin}/auth-error?reason=no_session`);
    }
  }

  return NextResponse.redirect(`${requestUrl.origin}/private/dashboard`);
}


// import { NextResponse } from 'next/server'
// // The client you created from the Server-Side Auth instructions
// import { createClient } from '@supabase/supabase-js'

// export async function GET(request: Request) {
//   const { searchParams, origin } = new URL(request.url)
//   const code = searchParams.get('code')
//   // if "next" is in param, use it as the redirect URL
//   const next = searchParams.get('next') ?? '/'

//   if (code) {
//     const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
//     const { error } = await supabase.auth.exchangeCodeForSession(code)
//     if (!error) {
//       const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
//       const isLocalEnv = process.env.NODE_ENV === 'development'
//       if (isLocalEnv) {
//         // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
//         return NextResponse.redirect(`${origin}${next}`)
//       } else if (forwardedHost) {
//         return NextResponse.redirect(`https://${forwardedHost}${next}`)
//       } else {
//         return NextResponse.redirect(`${origin}${next}`)
//       }
//     }
//   }

//   // return the user to an error page with instructions
//   return NextResponse.redirect(`${origin}/auth/auth-code-error`)
// }