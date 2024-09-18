'use client'

import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export function PrivateNavbar({ children }: { children: React.ReactNode }) {
  const supabase = createClientComponentClient()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4">
        <Link href="/private/dashboard" className="text-xl font-bold">
          Kwill
        </Link>
        <div className="ml-auto flex items-center space-x-4">
          <Link href="/private/dashboard">
            <Button variant="ghost">Dashboard</Button>
          </Link>
          <Link href="/private/analytics">
            <Button variant="ghost">Analytics</Button>
          </Link>
          <Link href="/private/billing">
            <Button variant="ghost">Billing</Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Link href="/private/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Button variant="ghost" onClick={handleSignOut}>Sign out</Button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {children}
        </div>
      </div>
    </nav>
  )
}