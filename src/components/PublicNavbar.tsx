import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Package2 } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/ThemeToggle"

export function PublicNavbar({ children }: { children: React.ReactNode }) {
  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <Link href="/" className="flex items-center gap-2 text-lg font-semibold md:text-base">
        <Package2 className="h-6 w-6" />
        <span>Kwill</span>
      </Link>

      <nav className="hidden md:flex md:flex-row md:items-center md:gap-5 lg:gap-6">
        <Link href="/features" className="text-muted-foreground transition-colors hover:text-foreground">
          Features
        </Link>
        <Link href="/pricing" className="text-muted-foreground transition-colors hover:text-foreground">
          Pricing
        </Link>
        <Link href="/about" className="text-muted-foreground transition-colors hover:text-foreground">
          About
        </Link>
      </nav>

      <div className="flex w-full items-center justify-end gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <Link href="/login">
          <Button variant="ghost">Log in</Button>
        </Link>
        <Link href="/signup">
          <Button>Sign up</Button>
        </Link>
        <ThemeToggle />
        {children}
      </div>

      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 md:hidden"
          >
            <Package2 className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-semibold"
            >
              <Package2 className="h-6 w-6" />
              <span>Kwill</span>
            </Link>
            <Link href="/features" className="text-muted-foreground hover:text-foreground">
              Features
            </Link>
            <Link href="/pricing" className="text-muted-foreground hover:text-foreground">
              Pricing
            </Link>
            <Link href="/about" className="text-muted-foreground hover:text-foreground">
              About
            </Link>
            <Link href="/login" className="hover:text-foreground">
              Log in
            </Link>
            <Link href="/signup" className="hover:text-foreground">
              Sign up
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  )
}