"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import { Check } from "lucide-react";
import { toast } from "sonner";

type Plan = {
  id: string;
  name: string;
  price: number;
  description: string | null;
  hours: number;
  features: string[];
  order?: number;
};

// Free plan definition
const FREE_PLAN: Plan = {
  id: "free",
  name: "Free",
  price: 0,
  description: "Get started with Kwill",
  hours: 2,
  features: ["2 hours of meeting transcription", "Basic analytics", "Limited chat history"],
};

export function PricingModal() {
  const [isOpen, setIsOpen] = useState(false);
  
  // Get plans from API
  const plansQuery = api.subscription.getPlans.useQuery(undefined, {
    enabled: isOpen,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 3,
  });
  
  // Create checkout session mutation
  const createCheckout = api.subscription.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      // Redirect to Stripe Checkout
      window.location.href = `https://checkout.stripe.com/c/pay/${data.sessionId}`;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      toast.success("Redirecting to Stripe Checkout");
    },
    onError: () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      toast.error("Failed to create checkout session. Please try again later.");
    }
  });

  // Determine which plans to show
  const getPlansToShow = (): Plan[] => {
    // If loading or no data, return just the free plan
    if (plansQuery.isLoading || !plansQuery.data) {
      return [FREE_PLAN];
    }
    
    // If we have plans from the API, use those
    if (Array.isArray(plansQuery.data) && plansQuery.data.length > 0) {
      return [FREE_PLAN, ...plansQuery.data];
    }
    
    // Fallback to just the free plan
    return [FREE_PLAN];
  };

  const allPlans = getPlansToShow();

  useEffect(() => {
    // Check if URL has #pricing
    if (window.location.hash === "#pricing") {
      setIsOpen(true);
    }

    // Listen for custom event
    const handleOpenModal = () => setIsOpen(true);
    window.addEventListener("open-pricing-modal", handleOpenModal);

    // Clean up
    return () => {
      window.removeEventListener("open-pricing-modal", handleOpenModal);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    // Remove #pricing from URL
    window.history.pushState({}, "", window.location.pathname);
  };

  const handlePurchase = (plan: Plan) => {
    if (plan.id === "free") {
      // Handle free plan selection
      handleClose();
      return;
    }

    // Create checkout session for paid plans
    createCheckout.mutate({
      priceId: plan.id,
      returnUrl: window.location.pathname,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="container relative max-h-[90vh] max-w-5xl overflow-auto rounded-lg bg-background p-8 shadow-lg">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4"
          onClick={handleClose}
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </Button>

        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold">Choose Your Plan</h2>
          <p className="mt-2 text-muted-foreground">
            Select the plan that works best for you and your team
          </p>
        </div>

        {plansQuery.isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {allPlans.map((plan) => (
              <Card key={plan.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">${plan.price}</span>
                    {plan.price > 0 && <span className="text-muted-foreground">/month</span>}
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="mb-2 font-medium">Features:</p>
                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <Check className="mr-2 h-5 w-5 shrink-0 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                    <li className="flex items-start">
                      <Check className="mr-2 h-5 w-5 shrink-0 text-primary" />
                      <span>{plan.hours} hours of meeting transcription</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={() => handlePurchase(plan)}
                    disabled={createCheckout.isPending}
                  >
                    {createCheckout.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {plan.price === 0 ? "Current Plan" : "Purchase"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 