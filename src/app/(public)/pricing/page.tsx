import { getPlans } from "@/lib/stripe"
import { PublicPricingDisplay } from "@/components/stripe/PublicPricingDisplay"
import { FREE_PLAN } from "@/lib/stripe-constants"

export default async function PricingPage() {
  const stripePlans = await getPlans()
  
  // Combine free plan with Stripe plans, ensuring proper order
  const allPlans = [FREE_PLAN, ...stripePlans].sort((a, b) => a.order - b.order)

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-4xl font-bold text-center mb-12">Choose Your Plan</h1>
      <p className="text-center mb-8 text-muted-foreground">
        Try Pro free for 7 days. No credit card required.
      </p>
      <PublicPricingDisplay plans={allPlans} />
    </div>
  )
}