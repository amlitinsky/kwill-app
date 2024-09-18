import Link from 'next/link'
import { Button } from "@/components/ui/button"

export function PublicNavbar({ children }: { children: React.ReactNode }) {
  return (
    <nav className="border-b">
      <div className="grid grid-cols-3 h-16 items-center px-4 md:px-6">
        <div className="flex items-center">
          <Link href="/public/landing" className="text-xl font-bold">
            Kwill
          </Link>
        </div>
        <div className="flex justify-center items-center space-x-4">
          <Link href="/public/landing">
            <Button variant="ghost">Home</Button>
          </Link>
          <Link href="/public/features">
            <Button variant="ghost">Features</Button>
          </Link>
          <Link href="/public/pricing">
            <Button variant="ghost">Pricing</Button>
          </Link>
        </div>
        <div className="flex items-center justify-end space-x-4">
          <Link href="/public/login">
            <Button variant="outline">Login</Button>
          </Link>
          <Link href="/public/signup">
            <Button variant="default">Sign Up</Button>
          </Link>
          {children}
        </div>
      </div>
    </nav>
  )
}