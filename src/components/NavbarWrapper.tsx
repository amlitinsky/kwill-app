'use client'

import { usePathname } from 'next/navigation'
import { PublicNavbar } from "@/components/PublicNavbar"
import { PrivateNavbar} from "@/components/PrivateNavbar"
import { ThemeToggle } from "@/components/ThemeToggle"

interface NavbarWrapperProps {
  session: boolean;
}

export function NavbarWrapper({ session}: NavbarWrapperProps) {

  const pathname = usePathname()
  const hideNavbarRoutes = ['/public/login', '/public/signup']
  const shouldHideNavbar = hideNavbarRoutes.includes(pathname)

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
      <PublicNavbar />
    )
  }

  return null
}