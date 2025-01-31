import Hero from "./Hero"
import Features from "./Features"
import HowItWorks from "./HowItWorks"
import Pricing from "./Pricing"
import CTA from "./CTA"
import Footer from "./Footer"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50 dark:from-background dark:to-background/80 relative">
      {/* Subtle grid pattern overlay */}
      <div 
        className="absolute inset-0 bg-grid-gray-900/[0.02] dark:bg-grid-white/[0.02] bg-[size:30px_30px] pointer-events-none"
        style={{
          maskImage: 'linear-gradient(to bottom, transparent, black, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black, transparent)',
        }}
      />
      <div className="relative">
        <Hero />
        <Features />
        <HowItWorks />
        <Pricing />
        <CTA />
        <Footer />
      </div>
    </div>
  )
}

