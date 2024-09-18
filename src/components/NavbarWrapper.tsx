'use client'

// import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { PublicNavbar } from "@/components/PublicNavbar"
import { PrivateNavbar} from "@/components/PrivateNavbar"
import { ThemeToggle } from "@/components/ThemeToggle"
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface NavbarWrapperProps {
  session: boolean;
}

export function NavbarWrapper({ session}: NavbarWrapperProps) {
  // const [session, setSession] = useState(serverSession)
  console.log('NavbarWrapper - Initial client-side session:', session)

  const pathname = usePathname()
  const hideNavbarRoutes = ['/public/login', '/public/signup']
  const shouldHideNavbar = hideNavbarRoutes.includes(pathname)
  // const supabase = createClientComponentClient()

  // useEffect(() => {
  //   const checkSession = async () => {
  //     const { data: { session } } = await supabase.auth.getSession();
  //     const { data: { user } } = await supabase.auth.getUser();
  //     console.log('NavbarWrapper - Checked session:', session);
  //     console.log('NavbarWrapper - Checked user:', user);
  //     setSession(!!(session && user));
  //   }
  //   checkSession();

  //   const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
  //     console.log('NavbarWrapper - Auth state changed:', event, session);
  //     if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
  //       console.log('NavbarWrapper - User signed in or token refreshed, updating session');
  //       setSession(true);
  //     }
  //     if (event === 'SIGNED_OUT') {
  //       console.log('NavbarWrapper - User signed out, updating session');
  //       setSession(false);
  //     }
  //   });

  //   return () => subscription.unsubscribe();
  // }, [supabase]);

  console.log('NavbarWrapper - Rendering with session:', session)
  if (session) {
    if (!shouldHideNavbar) {
      return (
        <PrivateNavbar>
          <ThemeToggle />
        </PrivateNavbar>
      )
    }
  }

  if (!shouldHideNavbar) {
    return (
      <PublicNavbar>
        <ThemeToggle />
      </PublicNavbar>
    )
  }

  return null
}