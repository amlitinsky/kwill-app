import Link from 'next/link'
import { Button } from "@/components/ui/button"
import Image from 'next/image'

export function PublicNavbar() {
  return (
    <header className="sticky top-0 flex h-16 items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex items-center justify-between max-w-screen-xl mx-auto px-4">
        {/* Logo Section */}
        <Link href="/public/landing" className="flex items-center gap-2">
          <div className="relative w-8 h-8">
            <Image 
              src="/images/logos/kwill-no-bg.png" 
              alt="Kwill Logo" 
              fill
              style={{ objectFit: 'contain' }}
            /> 
          </div>
          <span className="text-lg font-semibold tracking-tight">Kwill</span>
        </Link>

        {/* Auth Buttons - will be pushed to the far right due to justify-between */}
        <div className="flex items-center gap-4">
          <Link href="/public/login">
            <Button variant="ghost" size="sm">Log in</Button>
          </Link>
          <Link href="/public/login">
            <Button size="sm" className="bg-primary">Sign Up</Button>
          </Link>
        </div>
      </div>
    </header>
  )
}