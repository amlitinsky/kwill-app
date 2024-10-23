import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { loadStripe } from '@stripe/stripe-js';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Check, LinkIcon, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const LoadingCard = ({ delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.3 }}
  >
    <Card className="w-full h-32 animate-pulse">
      <CardHeader className="h-full">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
      </CardHeader>
    </Card>
  </motion.div>
);
interface StripePlan {
  id: string;
  name: string;
  price: number;
  interval: string;
  features: string[];
}

interface Invoice {
  id: string;
  date: string;
  total: string;
  status: string;
  pdfUrl: string;
}

export function SubscriptionManager() {
  const [currentPlan, setCurrentPlan] = useState<string | null>();
  const [availablePlans, setAvailablePlans] = useState<StripePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);





  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      fetchCurrentPlan();
      fetchAvailablePlans();
      fetchInvoices()
    }, 2000); // 2 second delay


    return () => clearTimeout(timer);
  }, []);


  const fetchInvoices = async () => {
    setLoading(true);
    try {
        const response = await fetch('/api/get-invoices');
        const data = await response.json();
        if (response.ok) {
        setInvoices(data.invoices);
        } else {
        throw new Error(data.error || 'Failed to fetch invoices');
        }
    } catch (error) {
        toast({ title: 'Error', description: (error as Error).message, variant: 'destructive' });
    } finally {
        setLoading(false);
    }
  };

  const handleDownloadInvoice = (pdfUrl: string) => {
    window.open(pdfUrl, '_blank');
  };

  const handleUpdatePayment = async () => {
    setIsUpdatingPayment(true);
    try {
      const response = await fetch('/api/create-customer-portal-session', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create customer portal session');
      }
    } catch (error) {
      console.error('Error updating payment method:', error);
      toast({
        title: 'Error',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingPayment(false);
    }
  };


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
        setCurrentPlan('Free')
        // await fetchCurrentPlan();
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


  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-center">Subscription Plans</h2>
      
      {loading ? (
        <div className="space-y-6" role="status" aria-label="Loading subscription data">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <LoadingCard delay={0.1} />
            <LoadingCard delay={0.2} />
            <LoadingCard delay={0.3} />
            <LoadingCard delay={0.4} />
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex justify-center items-center mt-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-lg text-primary">Loading subscription plans...</span>
            </div>
          </motion.div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {availablePlans.map((plan) => {
              const isPlanCurrent = plan.name === currentPlan;
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
                    {plan.id === 'Enterprise' ? (
                      <Button className="w-full" onClick={handleContactSales}>
                        Contact Sales
                      </Button>
                    ) : isPlanCurrent ? (
                      <Button className="w-full" variant="secondary">
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
              )
            })}
          </div>
          {/* Payment Method Card */}
          {currentPlan !== 'Free' && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Payment</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
              <div className="flex items-center">
                <LinkIcon className="mr-2" />
                <span>Link by Stripe</span>
              </div>
              <Button 
                onClick={handleUpdatePayment} 
                disabled={isUpdatingPayment}
              >
                {isUpdatingPayment ? 'Updating...' : 'Update Payment Method'}
              </Button>
            </CardContent>
          </Card>)}
          

          {/* Invoices Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              {invoices.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices.map((invoice) => (
                            <TableRow key={invoice.id}>
                                <TableCell>{invoice.date}</TableCell>
                                <TableCell>{invoice.total}</TableCell>
                                <TableCell>{invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}</TableCell>
                                <TableCell className="text-right">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDownloadInvoice(invoice.pdfUrl)}
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Download
                                </Button>
                                </TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                    </Table>
              ) : (
                <p>No invoices found.</p>
              )}
            </CardContent>
          </Card>

          {(currentPlan !== 'Free' && currentPlan !== 'Enterprise') && (
            <Card>
              <CardHeader>
                <CardTitle>Cancellation</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <span>Cancel plan</span>
                <Button variant="destructive" onClick={handleCancelSubscription} disabled={loading}>
                  Cancel
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );

}
