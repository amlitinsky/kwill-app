'use client'

import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { usePathname, useRouter } from 'next/navigation'
import { CircleUser } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Image from 'next/image'
import { signOut } from '@/lib/supabase-client'


export function PrivateNavbar({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/') // Redirect to the public landing page
      router.refresh() // Force a refresh of the current route
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const isLinkActive = (href: string) => {
    return pathname === href
  }

  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 fixed z-50">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link
          href="/private/dashboard"
          className="flex items-center gap-2 text-lg font-semibold md:text-base"
        >
          <div className="relative w-12 h-12">
            <Image 
              src="/images/logos/kwill.png" 
              alt="Kwill Logo" 
              fill
              style={{ objectFit: 'contain' }}
            /> 
          </div>
        </Link>
        <Link
          href="/private/dashboard"
          className={`transition-colors hover:text-foreground ${
            isLinkActive('/private/dashboard') ? 'text-foreground font-bold' : 'text-muted-foreground'
          }`}
        >
          Dashboard
        </Link>
        {/* <Link
          href="/private/analytics"
          className={`transition-colors hover:text-foreground ${
            isLinkActive('/private/analytics') ? 'text-foreground font-bold' : 'text-muted-foreground'
          }`}
        >
          Analytics
        </Link> */}
        <Link
          href="/private/meetings"
          className={`transition-colors hover:text-foreground ${
            isLinkActive('/private/meetings') ? 'text-foreground font-bold' : 'text-muted-foreground'
          }`}
        >
          Meetings 
        </Link>
        <Link
          href="/private/templates"
          className={`transition-colors hover:text-foreground ${
            isLinkActive('/private/templates') ? 'text-foreground font-bold' : 'text-muted-foreground'
          }`}
        >
          Templates 
        </Link>
        <Link
          href="/private/documentation"
          className={`transition-colors hover:text-foreground ${
            isLinkActive('/private/documentation') ? 'text-foreground font-bold' : 'text-muted-foreground'
          }`}
        >
          Documentation
        </Link>
        <Link
          href="/private/settings"
          className={`transition-colors hover:text-foreground ${
            isLinkActive('/private/settings') ? 'text-foreground font-bold' : 'text-muted-foreground'
          }`}
        >
          Settings 
        </Link>
      </nav>
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
            <Link href="/private/dashboard" className={`hover:text-foreground ${
              isLinkActive('/private/dashboard') ? 'text-foreground font-bold' : 'text-muted-foreground'
            }`}>
              Dashboard
            </Link>
            {/* <Link
              href="/private/analytics"
              className={`hover:text-foreground ${
                isLinkActive('/private/analytics') ? 'text-foreground font-bold' : 'text-muted-foreground'
              }`}
            >
              Analytics
            </Link> */}
            <Link
              href="/private/meetings"
              className={`hover:text-foreground ${
                isLinkActive('/private/meetings') ? 'text-foreground font-bold' : 'text-muted-foreground'
              }`}
            >
              Meetings
            </Link>
            <Link
              href="/private/templates"
              className={`hover:text-foreground ${
                isLinkActive('/private/templates') ? 'text-foreground font-bold' : 'text-muted-foreground'
              }`}
            >
              Templates
            </Link>
            <Link
              href="/private/documentation"
              className={`transition-colors hover:text-foreground ${
                isLinkActive('/private/documentation') ? 'text-foreground font-bold' : 'text-muted-foreground'
              }`}
            >
              Documentation
            </Link>
            <Link
              href="/private/settings"
              className={`hover:text-foreground ${
                isLinkActive('/private/settings') ? 'text-foreground font-bold' : 'text-muted-foreground'
              }`}
            >
              Settings
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
      <div className="flex w-full items-center justify-end gap-4 md:ml-auto md:gap-2 lg:gap-4">
        {/*  TODO: Implement search functionality
        <form className="ml-auto flex-1 sm:flex-initial">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
            />
          </div>
        </form> */}
        {children}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <CircleUser className="h-5 w-5" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href="/private/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}