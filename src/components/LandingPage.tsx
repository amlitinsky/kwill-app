
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 px-6 text-center">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl mb-6">
            Streamline Your Meetings to Spreadsheets, Seamlessly
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Kwill transforms your Zoom meetings into structured data, saving you time and enhancing your insights.
          </p>
          <Button size="lg" asChild>
            <Link href="/signin">Try Kwill Now</Link>
          </Button>
        </section>

        {/* Product Demonstration Videos */}
        <section className="py-16 px-6 bg-secondary">
          <h2 className="text-3xl font-bold text-center mb-10">See Kwill in Action</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {['Capture', 'Analyze', 'Organize'].map((step, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    <span className="text-2xl font-semibold">{step} Video</span>
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-semibold mb-2">{step}</h3>
                    <p className="text-muted-foreground">
                      {`See how Kwill ${step.toLowerCase()}s your meeting data effortlessly.`}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Customer Testimonials */}
        <section className="py-16 px-6">
          <h2 className="text-3xl font-bold text-center mb-10">What Our Customers Say</h2>
          <Carousel className="max-w-4xl mx-auto">
            <CarouselContent>
              {[
                { name: "John Doe", role: "VC Partner", quote: "Kwill has revolutionized how we handle investor calls." },
                { name: "Jane Smith", role: "CEO", quote: "The time saved with Kwill is invaluable for our business." },
                { name: "Alex Johnson", role: "Analyst", quote: "Data extraction has never been this seamless and accurate." }
              ].map((testimonial, index) => (
                <CarouselItem key={index}>
                  <Card>
                    <CardContent className="flex flex-col items-center text-center p-6">
                      <blockquote className="text-lg mb-4">&quot;{testimonial.quote}&quot;</blockquote>
                      <cite className="not-italic font-semibold">{testimonial.name}</cite>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </section>

        {/* Final Call-to-Action */}
        <section className="py-20 px-6 text-center bg-primary text-primary-foreground">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Meetings?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who are saving time and gaining deeper insights with Kwill.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/signin">Try Kwill Now</Link>
          </Button>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-6 px-6 bg-background border-t">
        <div className="container mx-auto">
          {/* Footer Links Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Product Info */}
            <div>
              <h3 className="font-semibold mb-3">Product</h3>
              <div className="space-y-2">
                <Link href="/pricing" className="block text-sm text-muted-foreground hover:text-foreground">
                  Pricing
                </Link>
                <Link href="/docs" className="block text-sm text-muted-foreground hover:text-foreground">
                  Documentation
                </Link>
              </div>
            </div>
            
            {/* Support */}
            <div>
              <h3 className="font-semibold mb-3">Support</h3>
              <div className="space-y-2">
                <Link href="/support" className="block text-sm text-muted-foreground hover:text-foreground">
                  Help Center
                </Link>
                <a href="mailto:support@kwill.app" className="block text-sm text-muted-foreground hover:text-foreground">
                  Contact Us
                </a>
              </div>
            </div>
            
            {/* Legal */}
            <div>
              <h3 className="font-semibold mb-3">Legal</h3>
              <div className="space-y-2">
                <Link href="/terms" className="block text-sm text-muted-foreground hover:text-foreground">
                  Terms of Service
                </Link>
                <Link href="/privacy" className="block text-sm text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>

          {/* Copyright Notice */}
          <div className="pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground text-center">
              © {new Date().getFullYear()} Kwill Technologies LLC. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

