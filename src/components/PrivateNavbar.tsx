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
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Search, CircleUser } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Image from 'next/image'

export function PrivateNavbar({ children }: { children: React.ReactNode }) {
  const supabase = createClientComponentClient()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link
          href="/private/dashboard"
          className="flex items-center gap-2 text-lg font-semibold md:text-base"
        >
          <Image 
           src="/images/logos/kwill.png" 
           alt="Kwill Logo" 
           width={24} 
           height={24} 
          /> 
        </Link>
        <Link
          href="/private/dashboard"
          className="text-foreground transition-colors hover:text-foreground"
        >
          Dashboard
        </Link>
        <Link
          href="/private/analytics"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          Analytics
        </Link>
        <Link
          href="/private/billing"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          Billing
        </Link>
      </nav>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 md:hidden"
          >
            <Image src="/images/icon/kwill-logo1.png" alt="Kwill Logo" width={24} height={24} />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="/private/dashboard"
              className="flex items-center gap-2 text-lg font-semibold"
            >
              <Image src="/images/icon/kwill-logo1.png" alt="Kwill Logo" width={24} height={24} />
              <span>Kwill</span>
            </Link>
            <Link href="/private/dashboard" className="hover:text-foreground">
              Dashboard
            </Link>
            <Link
              href="/private/analytics"
              className="text-muted-foreground hover:text-foreground"
            >
              Analytics
            </Link>
            <Link
              href="/private/billing"
              className="text-muted-foreground hover:text-foreground"
            >
              Billing
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <form className="ml-auto flex-1 sm:flex-initial">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
            />
          </div>
        </form>
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
// 'use client'

// import Link from 'next/link'
// import { Button } from "@/components/ui/button"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { 
//   DropdownMenu, 
//   DropdownMenuContent, 
//   DropdownMenuItem, 
//   DropdownMenuTrigger 
// } from "@/components/ui/dropdown-menu"
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
// import { useRouter } from 'next/navigation'

// export function PrivateNavbar({ children }: { children: React.ReactNode }) {
//   const supabase = createClientComponentClient()
//   const router = useRouter()

//   const handleSignOut = async () => {
//     await supabase.auth.signOut()
//     router.refresh()
//   }

//   return (
//     <nav className="border-b">
//       <div className="flex h-16 items-center px-4">
//         <Link href="/private/dashboard" className="text-xl font-bold">
//           Kwill
//         </Link>
//         <div className="ml-auto flex items-center space-x-4">
//           <Link href="/private/dashboard">
//             <Button variant="ghost">Dashboard</Button>
//           </Link>
//           <Link href="/private/analytics">
//             <Button variant="ghost">Analytics</Button>
//           </Link>
//           <Link href="/private/billing">
//             <Button variant="ghost">Billing</Button>
//           </Link>
//           <DropdownMenu>
//             <DropdownMenuTrigger>
//               <Avatar>
//                 <AvatarImage src="https://github.com/shadcn.png" />
//                 <AvatarFallback>CN</AvatarFallback>
//               </Avatar>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent>
//               <DropdownMenuItem>
//                 <Link href="/private/settings">Settings</Link>
//               </DropdownMenuItem>
//               <DropdownMenuItem>
//                 <Button variant="ghost" onClick={handleSignOut}>Sign out</Button>
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//           {children}
//         </div>
//       </div>
//     </nav>
//   )
// }