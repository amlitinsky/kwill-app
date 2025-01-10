import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Image from 'next/image'

export function PublicNavbar({ children }: { children: React.ReactNode }) {
  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <Link href="/public/landing" className="flex items-center gap-2 text-lg font-semibold md:text-base">
          <div className="relative w-12 h-12">
            <Image 
              src="/images/logos/kwill.png" 
              alt="Kwill Logo" 
              fill
              style={{ objectFit: 'contain' }}
            /> 
          </div>
      </Link>
      <nav className="hidden md:flex md:flex-row md:items-center md:gap-5 lg:gap-6">
        <Link href="/public/landing" className="text-muted-foreground transition-colors hover:text-foreground">
          Home 
        </Link>
        <Link href="/public/features" className="text-muted-foreground transition-colors hover:text-foreground">
          Features
        </Link>
        <Link href="/public/pricing" className="text-muted-foreground transition-colors hover:text-foreground">
          Pricing
        </Link>
        <Link href="/public/documentation" className="text-muted-foreground transition-colors hover:text-foreground">
          Documentation 
        </Link>
        <Link href="/public/support" className="text-muted-foreground transition-colors hover:text-foreground">
          Support 
        </Link>
      </nav>

      <div className="flex w-full items-center justify-end gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <Link href="/public/login">
          <Button variant="ghost">Log in</Button>
        </Link>
        <Link href="/public/signup">
          <Button>Sign up</Button>
        </Link>
        {children}
      </div>

      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 md:hidden"
          >
              <div className="relative w-12 h-12">
                <Image 
                  src="/images/logos/kwill.png" 
                  alt="Kwill Logo" 
                  fill
                  style={{ objectFit: 'contain' }}
                /> 
              </div>
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="grid gap-6 text-lg font-medium">
            <Link href="/public/landing" className="text-muted-foreground hover:text-foreground">
              Home
            </Link>
            <Link href="/public/features" className="text-muted-foreground hover:text-foreground">
              Features
            </Link>
            <Link href="/public/pricing" className="text-muted-foreground hover:text-foreground">
              Pricing
            </Link>
            <Link href="/public/login" className="hover:text-foreground">
              Log in
            </Link>
            <Link href="/public/signup" className="hover:text-foreground">
              Sign up
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  )
}