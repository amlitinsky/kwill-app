import { Plan } from "@/types/stripe";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PublicPricingDisplayProps {
  plans: Plan[];
}

export function PublicPricingDisplay({ plans }: PublicPricingDisplayProps) {
  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className="flex flex-col hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{plan.name}</span>
                <span className="text-2xl font-bold">
                  {plan.price === 0 ? "Free" : `$${plan.price}`}
                  <span className="text-sm text-muted-foreground">/mo</span>
                </span>
              </CardTitle>
              <CardDescription className="text-lg font-semibold">
                {plan.hours} Hours/month
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
              <ul className="space-y-2">
                {plan.features?.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              {plan.calendlyEnabled && (
                <div className="flex items-center gap-2 text-primary w-full">
                  <Check className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm">Includes Calendly Integration</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <HelpCircle className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Schedule meetings automatically through Calendly</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}
              <Button 
                className="w-full" 
                variant={plan.price === 0 ? "outline" : "default"}
                asChild
              >
                <a href="/auth/signup">
                  {plan.price === 0 ? "Get Started" : "Sign Up Now"}
                </a>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </TooltipProvider>
  );
} 