'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { loadStripe } from '@stripe/stripe-js';
import { Card, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { PricingPlans } from '@/components/stripe/PricingPlans';
import { Plan, Subscription } from '@/types/stripe';
import { FREE_PLAN } from '@/lib/stripe-constants';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_API_PUBLISHABLE_KEY!);

interface StripeManagerProps {
  initialSubscription: Subscription | null;
  initialPlans: Plan[];
}

export function StripeManager({ initialSubscription, initialPlans }: StripeManagerProps) {
  const [currentSubscription] = useState<Subscription | null>(initialSubscription);
  const [availablePlans] = useState<Plan[]>([
    FREE_PLAN,
    ...initialPlans
  ]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handlePurchase = async (priceId: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });
      const data = await response.json();
      
      if (data.sessionId) {
        const stripe = await stripePromise;
        if (!stripe) throw new Error('Stripe failed to load');
        
        const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
        if (error) throw error;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast({ title: 'Error', description: (error as Error).message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!currentSubscription?.stripe_customer_id) return;
    
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          customerId: currentSubscription.stripe_customer_id 
        }),
      });
      
      if (!response.ok) throw new Error('Failed to create portal session');
      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      toast({
        title: 'Error',
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-center mb-12">Meeting Hours Packages</h2>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading packages...</span>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <PricingPlans 
            plans={availablePlans}
            isLoading={loading}
            onSelectPlan={handlePurchase}
          />
          {currentSubscription && (
            <Card className="mt-8 rounded-xl border border-zinc-800 bg-zinc-950/30">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Current Plan</CardTitle>
                  <CardDescription>
                    {currentSubscription.hours} hours remaining
                    {currentSubscription.status === 'active' && 
                      ` • Renews on ${new Date(currentSubscription.current_period_end).toLocaleDateString()}`
                    }
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  className="border-zinc-800 bg-zinc-950"
                  onClick={handleManageSubscription}
                >
                  Manage Subscription
                </Button>
              </CardHeader>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
}
