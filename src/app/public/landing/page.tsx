import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-grow flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
            Welcome to Kwill
          </h1>
          <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
            AI-powered query analysis for seamless meeting insights.
          </p>
          <div className="mt-8 space-x-4">
            <Button size="lg" asChild>
              <Link href="/public/signup">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/public/features">Learn More</Link>
            </Button>
          </div>
        </div>
      </main>
      <footer className="py-6 text-center">
        <div className="space-x-4">
          <Link href="/public/terms" className="text-sm text-muted-foreground hover:underline">
            Terms of Service
          </Link>
          <Link href="/public/privacy" className="text-sm text-muted-foreground hover:underline">
            Privacy Policy
          </Link>
        </div>
      </footer>
    </div>
  )
}