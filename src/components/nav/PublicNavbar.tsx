import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Logo } from '../Logo'

export function PublicNavbar() {
  return (
    <header className="sticky top-0 flex h-16 items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex items-center justify-between max-w-screen-xl mx-auto px-4">
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-2">
          <Logo />
          <span className="text-lg font-semibold tracking-tight">Kwill</span>
        </Link>

        {/* Auth Buttons - will be pushed to the far right due to justify-between */}
        <div className="flex items-center gap-4">
          <Link href="/signin">
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
          <Link href="/signin">
            <Button size="sm" className="bg-primary">Sign Up</Button>
          </Link>
        </div>
      </div>
    </header>
  )
}