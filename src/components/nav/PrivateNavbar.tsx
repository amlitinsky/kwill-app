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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Logo } from '../Logo'
import { User } from '@supabase/supabase-js'
import { useToast } from "@/hooks/use-toast"

interface PrivateNavbarProps {
  children: React.ReactNode
  user: User | null
}

export function PrivateNavbar({ children, user }: PrivateNavbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const userMetadata = user?.user_metadata || null
  const tabs = [
    { name: 'Meetings', href: '/meetings' },
    { name: 'Templates', href: '/templates' },
    { name: 'Integrations', href: '/integrations' },
  ]

  const handleSignOut = async () => {
    try {
      // First, make the sign-out request
      const response = await fetch('/auth/signout', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to sign out');
      }

      // Clear any client-side state
      localStorage.clear();
      sessionStorage.clear();

      // Use router.replace with the root path
      router.replace('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive"
      });
    }
  }

  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-6 z-50">
      <nav className="flex flex-row items-center gap-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2"
        >
          <Logo />
          <span className="text-xl font-medium tracking-tight">Kwill</span>
        </Link>
        {/* Navigation Tabs */}
        <div className="flex items-center gap-4 ml-6">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === tab.href ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              {tab.name}
            </Link>
          ))}
        </div>
      </nav>

      <div className="flex items-center justify-end gap-4 ml-auto">
        {children}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage 
                  src={userMetadata?.avatar_url} 
                  alt={userMetadata?.full_name || 'User avatar'} 
                />
                <AvatarFallback>
                  {userMetadata?.full_name?.[0]?.toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {userMetadata?.full_name}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {userMetadata?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/support">Support</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleSignOut}
              className="text-red-600 focus:text-red-600"
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}