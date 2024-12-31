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
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from 'next/image'
import { signOut } from '@/lib/supabase-client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'

interface UserMetadata {
  avatar_url?: string
  full_name?: string
  email?: string
}

export function PrivateNavbar({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [userMetadata, setUserMetadata] = useState<UserMetadata | null>(null)

  useEffect(() => {
    async function loadUserMetadata() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata) {
        setUserMetadata(user.user_metadata)
      }
    }
    loadUserMetadata()
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-6 z-50">
      <nav className="flex flex-row items-center gap-6">
        <Link
          href="/private/dashboard"
          className="flex items-center gap-2"
        >
          <div className="relative w-10 h-10">
            <Image 
              src="/images/logos/kwill-no-bg.png" 
              alt="Kwill Logo" 
              fill
              style={{ objectFit: 'contain' }}
            /> 
          </div>
          <span className="text-xl font-medium text-white tracking-tight">Kwill</span>
        </Link>
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
              <Link href="/private/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/private/support">Support</Link>
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