"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/react";
import { Loader2, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { loadStripe } from "@stripe/stripe-js";

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_API_PUBLISHABLE_KEY!)

type Plan = {
  id: string;
  name: string;
  price: number;
  minutes: number;
  features: string[];
  order?: number;
};

// Free plan definition
const FREE_PLAN: Plan = {
  id: "free",
  name: "Free",
  price: 0,
  minutes: 120,
  features: ["2 hours of meeting processing", "Limited chat history"],
};

export function PricingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const utils = api.useUtils();
  
  // Get plans from API
  const plansQuery = api.subscription.getPlans.useQuery(undefined, {
    enabled: isOpen,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 3,
  });
  
  // Get current subscription
  const subscriptionQuery = api.subscription.getSubscription.useQuery(undefined, {
    enabled: isOpen,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Create checkout session mutation
  const createCheckout = api.subscription.createCheckoutSession.useMutation({
    onSuccess: async (data) => {
      void utils.subscription.getSubscription.invalidate();

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      toast.success("Redirecting to Stripe Checkout");

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const stripe = await stripePromise;

      if (!stripe) {
        toast.error("Failed to load Stripe. Please try again later.");
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      const {error} = await stripe.redirectToCheckout({ sessionId: data.sessionId });
      if (error) {
        toast.error("Failed to redirect to checkout. Please try again later.");
        throw new Error(error.message);
      }
    },
    onError: () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      toast.error("Failed to create checkout session. Please try again later.");
    }
  });
  
  // Create customer portal session mutation
  const createPortalSession = api.subscription.createCustomerPortalSession.useMutation({
    onSuccess: (data) => {
      // Redirect to Stripe Customer Portal
      window.location.href = data.url;
      toast.success("Redirecting to subscription management");
    },
    onError: () => {
      toast.error("Failed to access subscription management. Please try again later.");
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
  
  // Check if user has an active paid subscription
  const hasActivePaidSubscription = subscriptionQuery.data?.status === "active" && 
                                   subscriptionQuery.data?.priceId !== null;

  useEffect(() => {
    // Check if URL has #pricing
    if (window.location.hash === "#pricing") {
      setIsOpen(true);
    }
    
    // Check if URL has session_id (returning from checkout)
    const url = new URL(window.location.href);
    if (url.searchParams.has("session_id")) {
      // Remove the session_id query parameter
      url.searchParams.delete("session_id");
      window.history.replaceState(null, "", url.pathname + url.search);
      
      // Invalidate subscription data to refresh it
      void utils.subscription.getSubscription.invalidate();
      
      // Show success toast
      toast.success("Payment successful! Your subscription has been updated.");
    }

    // Listen for custom event
    const handleOpenModal = () => setIsOpen(true);
    window.addEventListener("open-pricing-modal", handleOpenModal);

    // Clean up
    return () => {
      window.removeEventListener("open-pricing-modal", handleOpenModal);
    };
  }, [utils.subscription.getSubscription]);

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
      returnUrl: window.location.origin + window.location.pathname,
    });
  };
  
  const handleManageSubscription = () => {
    createPortalSession.mutate({
      returnUrl: window.location.origin + window.location.pathname,
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

        {plansQuery.isLoading || subscriptionQuery.isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-3">
              {allPlans.map((plan) => {
                const isCurrentPlan = plan.id === "free" 
                  ? !hasActivePaidSubscription 
                  : subscriptionQuery.data?.priceId === plan.id;
                  
                return (
                  <Card key={plan.id} className={`flex flex-col ${isCurrentPlan ? 'border-primary' : ''}`}>
                    <CardHeader>
                      <CardTitle>{plan.name}</CardTitle>
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
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full" 
                        onClick={() => handlePurchase(plan)}
                        disabled={createCheckout.isPending || isCurrentPlan}
                        variant={isCurrentPlan ? "outline" : "default"}
                      >
                        {createCheckout.isPending && !isCurrentPlan ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        {isCurrentPlan ? "Current Plan" : plan.price === 0 ? "Select" : "Purchase"}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
            
            {hasActivePaidSubscription && (
              <div className="mt-8 text-center">
                <Button 
                  variant="outline" 
                  onClick={handleManageSubscription}
                  disabled={createPortalSession.isPending}
                >
                  {createPortalSession.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ExternalLink className="mr-2 h-4 w-4" />
                  )}
                  Manage Current Subscription
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 