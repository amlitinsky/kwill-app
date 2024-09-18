import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for occasional use",
    features: ["1 request every 3 days", "Basic analytics", "Email support"],
  },
  {
    name: "Pro",
    price: "$10",
    description: "Ideal for regular users",
    features: ["6 requests per day", "Advanced analytics", "Priority email support", "Custom instructions"],
  },
  {
    name: "Premium",
    price: "$20",
    description: "For power users and small teams",
    features: ["10 requests per day", "Full analytics suite", "24/7 priority support", "Advanced customization"],
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Tailored solutions for large organizations",
    features: ["Unlimited requests", "Dedicated account manager", "Custom integrations", "On-premise options"],
  },
]

export default function PricingPage() {
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-4xl font-bold text-center mb-12">Choose Your Plan</h1>
      <p className="text-center mb-8 text-muted-foreground">
        Try Pro free for 7 days. No credit card required.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {pricingPlans.map((plan) => (
          <Card key={plan.name} className="flex flex-col">
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-3xl font-bold">{plan.price}</p>
              <ul className="mt-4 space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant={plan.name === "Enterprise" ? "outline" : "default"}>
                {plan.name === "Enterprise" ? "Contact Sales" : "Get Started"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}