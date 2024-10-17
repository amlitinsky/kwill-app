import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { loadStripe } from '@stripe/stripe-js';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Check } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type Plan = 'free' | 'pro' | 'premium' | 'enterprise';

interface StripePlan {
  id: string;
  name: string;
  price: number;
  interval: string;
  features: string[];
}

export function SubscriptionManager() {
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [availablePlans, setAvailablePlans] = useState<StripePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCurrentPlan();
    fetchAvailablePlans();
  }, []);

  const fetchCurrentPlan = async () => {
    try {
      const response = await fetch('/api/get-current-plan');
      const data = await response.json();
      if (response.ok) {
        setCurrentPlan(data.currentPlan);
      } else {
        throw new Error(data.error || 'Failed to fetch current plan');
      }
    } catch (error) {
      toast({ title: 'Error', description: (error as Error).message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailablePlans = async () => {
    try {
      const response = await fetch('/api/get-plans');
      const data = await response.json();
      if (response.ok) {
        setAvailablePlans(data.plans);
      } else {
        throw new Error(data.error || 'Failed to fetch available plans');
      }
    } catch (error) {
      toast({ title: 'Error', description: (error as Error).message, variant: 'destructive' });
    }
  };

  const handleSubscribe = async (priceId: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });
      const data = await response.json();
      
      if (data.sessionId) {
        const stripe = await stripePromise;
        if (!stripe) {
          throw new Error('Stripe failed to load');
        }
        
        const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
        if (error) {
          throw error;
        }
      } else {
        throw new Error(data.error || 'Failed to create subscription');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast({ title: 'Error', description: (error as Error).message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/cancel-subscription', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        toast({ title: 'Success', description: 'Your subscription has been cancelled' });
        await fetchCurrentPlan();
      } else {
        throw new Error(data.error || 'Failed to cancel subscription');
      }
    } catch (error) {
      toast({ title: 'Error', description: (error as Error).message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleContactSales = () => {
    toast({ title: 'Contact Sales', description: 'Please email sales@yourcompany.com for Enterprise pricing' });
  };

  if (loading) {
    return <div>Loading subscription information...</div>;
  }

  if (!currentPlan) {
    return <div>Unable to load subscription information. Please try again later.</div>;
  }

return (
  <div>
    {availablePlans.map((plan) => {
      const isPlanCurrent = plan.id === currentPlan;

      return (
        <Card key={plan.id} className={`${isPlanCurrent ? 'border-primary' : ''} flex flex-col`}>
          <CardHeader>
            <CardTitle>{plan.name}</CardTitle>
            <CardDescription>
              {plan.price !== null ? `$${plan.price}/${plan.interval}` : 'Custom pricing'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <ul className="list-disc list-inside space-y-2">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            {plan.id === 'enterprise' ? (
              <Button className="w-full" onClick={handleContactSales}>
                Contact Sales
              </Button>
            ) : isPlanCurrent ? (
              <Button className="w-full" disabled variant="outline">
                Current Plan
              </Button>
            ) : (
              <Button 
                className="w-full" 
                onClick={() => handleSubscribe(plan.id)} 
                disabled={loading}
              >
                Switch to {plan.name}
              </Button>
            )}
          </CardFooter>
        </Card>
      );
    })}

    {(currentPlan !== 'free' && currentPlan !== 'enterprise') && (
      <div className="mt-6">
        <Button onClick={handleCancelSubscription} disabled={loading} variant="destructive">
          Cancel Subscription
        </Button>
      </div>
    )}
  </div>
);
}