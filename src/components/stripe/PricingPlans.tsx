'use client';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, HelpCircle, Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Plan } from "@/types/stripe";

interface PricingPlansProps {
  plans: Plan[];
  isLoading?: boolean;
  /* eslint-disable no-unused-vars */
  onSelectPlan: (priceId: string) => void;
}

export function PricingPlans({ plans, isLoading, onSelectPlan }: PricingPlansProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
      {plans.map((plan) => (
        <Card key={plan.id} className="flex flex-col hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>{plan.name}</span>
              <span className="text-2xl font-bold">
                {plan.price === 0 ? "Free" : `$${plan.price}`}
              </span>
            </CardTitle>
            <CardDescription className="text-lg font-semibold">
              {plan.hours} Hours
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
              onClick={() => onSelectPlan(plan.id)}
              disabled={isLoading}
              variant={plan.price === 0 ? "outline" : "default"}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {plan.price === 0 ? "Current Plan" : "Upgrade Now"}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
} 