'use client'

import { usePathname } from 'next/navigation'
import { PublicNavbar } from "@/components/nav/PublicNavbar"
import { PrivateNavbar} from "@/components/nav/PrivateNavbar"
import { ThemeToggle } from "@/components/ThemeToggle"
import { User } from '@supabase/supabase-js'

interface NavbarWrapperProps {
  user: User | null;
}

export function NavbarWrapper({ user }: NavbarWrapperProps) {
  const pathname = usePathname()
  const hideNavbarRoutes = ['/login']
  const shouldHideNavbar = hideNavbarRoutes.includes(pathname)

  if (user) {
    return !shouldHideNavbar ? (
      <PrivateNavbar user={user}>
        <ThemeToggle />
      </PrivateNavbar>
    ) : null
  }

  return !shouldHideNavbar ? <PublicNavbar /> : null
}