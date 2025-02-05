import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Logo } from '../Logo'

export function PublicNavbar() {
  return (
    <header className="sticky top-0 z-50">
      {/* Semi-transparent backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm border-b" />
      
      {/* Content layer */}
      <div className="relative h-16">
        <div className="container flex items-center justify-between h-full max-w-screen-xl mx-auto px-4">
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-2 relative">
            <Logo />
            <span className="text-lg font-semibold tracking-tight text-foreground">Kwill</span>
          </Link>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button 
                variant="ghost" 
                size="sm"
                className="font-medium hover:bg-background/90"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/login">
              <Button 
                size="sm" 
                className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium"
              >
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}