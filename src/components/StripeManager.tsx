import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { loadStripe } from '@stripe/stripe-js';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Check, Loader2, RefreshCw, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_API_PUBLISHABLE_KEY!);

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


interface MeetingPlan {
  id: string;
  name: string;
  price: number;
  hours: number;
  order: number;
  calendlyEnabled: boolean;
  description: string;
  features: string[];
}

interface UserPlanInfo {
  meeting_hours_remaining: number;
  total_hours_purchased: number;
  auto_renewal_enabled: boolean;
  auto_renewal_package_hours: number;
  calendly_access_until: string | null;
}

interface PaymentHistory {
  id: string;
  date: string;
  total: string;
  status: string;
  hours: string;
}

interface PaymentMethod {
  id: string;
  card: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
}

export function StripeManager() {
  const [currentPlanInfo, setCurrentPlanInfo] = useState<UserPlanInfo | null>(null);
  const [availablePlans, setAvailablePlans] = useState<MeetingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdatingAutoRenewal, setIsUpdatingAutoRenewal] = useState(false);
  const { toast } = useToast();
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedAutoRenewalPlan, setSelectedAutoRenewalPlan] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch user plan info
      // TODO: change to more intuitive names like user preferences
      const planResponse = await fetch('/api/get-current-plan');
      if (!planResponse.ok) throw new Error('Failed to fetch user plan info');
      const { planInfo} = await planResponse.json();
      console.log("current plan info frontend", planInfo)
      setCurrentPlanInfo(planInfo);

      // Fetch available plans
      const plansResponse = await fetch('/api/get-plans');
      if (!plansResponse.ok) throw new Error('Failed to fetch available plans');
      const { plans }= await plansResponse.json();
      setAvailablePlans(plans);

      // Fetch invoices
      const invoicesResponse = await fetch('/api/get-payment-history');
      if (!invoicesResponse.ok) throw new Error('Failed to fetch invoices');
      const { invoices}  = await invoicesResponse.json();
      setPaymentHistory(invoices);
    } catch (error) {
      toast({
        title: 'Error',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch('/api/get-payment-methods');
      if (!response.ok) throw new Error('Failed to fetch payment methods');
      const { paymentMethods } = await response.json();
      console.log("frontend payment methods", paymentMethods)
      setPaymentMethods(paymentMethods);
    } catch (error) {
      toast({
        title: 'Error',
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  };

  // TODO we probably want to fetch this automatically with dependency if data changes versus a manual reload
  useEffect(() => {
    fetchData();
    fetchPaymentMethods();
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (currentPlanInfo?.auto_renewal_package_hours) {
      setSelectedAutoRenewalPlan(currentPlanInfo.auto_renewal_package_hours);
    }
  }, [currentPlanInfo]);

  const handleAutoRenewalToggle = async () => {
    if (!currentPlanInfo) return;
    
    // 1. Add validation for selected plan
    if (!currentPlanInfo.auto_renewal_enabled && !selectedAutoRenewalPlan && !currentPlanInfo.auto_renewal_package_hours) {
      toast({
        title: 'Please select a plan',
        description: 'You need to select an auto-renewal plan before enabling.',
        variant: 'destructive',
      });
      return;
    }
    
    // 2. Check for payment method when enabling
    if (!currentPlanInfo.auto_renewal_enabled && paymentMethods.length === 0) {
      handleAddPaymentMethod();
      return;
    }
    
    setIsUpdatingAutoRenewal(true);
    try {
      const response = await fetch('/api/update-auto-renewal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          enabled: !currentPlanInfo.auto_renewal_enabled,
          // 3. Better fallback handling
          packageHours: selectedAutoRenewalPlan || currentPlanInfo.auto_renewal_package_hours || 0
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update auto-renewal setting');
      }

      // 4. Update local state
      setCurrentPlanInfo(prev => prev ? {
        ...prev,
        auto_renewal_enabled: !prev.auto_renewal_enabled,
        auto_renewal_package_hours: selectedAutoRenewalPlan || prev.auto_renewal_package_hours
      } : null);

      // 5. Clear selection after successful update
      setSelectedAutoRenewalPlan(null);

      toast({
        title: 'Success',
        description: `Auto-renewal has been ${!currentPlanInfo.auto_renewal_enabled ? 'enabled' : 'disabled'} ${
          !currentPlanInfo.auto_renewal_enabled ? 
            `with ${selectedAutoRenewalPlan || currentPlanInfo.auto_renewal_package_hours} hours package` : 
            ''
        }`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingAutoRenewal(false);
    }
  };

  const handlePurchaseHours = async (priceId: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/create-checkout', {
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


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleAddPaymentMethod = async () => {
    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          setupOnly: true,
          returnUrl: `${window.location.origin}/private/settings`
        }),
      });
      
      if (!response.ok) throw new Error('Failed to create setup session');
      const data = await response.json();
      
      if (data.sessionId) {
        const stripe = await stripePromise;
        if (!stripe) throw new Error('Stripe failed to load');
        
        const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
        if (error) throw error;
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  };

  // Update the Auto-Renewal Card JSX
  const renderAutoRenewalCard = () => (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Auto-Renewal</CardTitle>
          <CardDescription>
            Automatically purchase more hours when your balance is low
          </CardDescription>
        </div>
        <Button
          variant={currentPlanInfo?.auto_renewal_enabled ? "default" : "outline"}
          onClick={handleAutoRenewalToggle}
          disabled={isUpdatingAutoRenewal}
        >
          {isUpdatingAutoRenewal ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : currentPlanInfo?.auto_renewal_enabled ? (
            "Enabled"
          ) : (
            "Disabled"
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex overflow-x-auto pb-4 gap-4 -mx-4 px-4">
            {availablePlans.map((plan) => (
              <div
                key={plan.id}
                className={`flex-shrink-0 w-[200px] flex flex-col p-4 border rounded-lg cursor-pointer hover:border-primary transition-all ${
                  (selectedAutoRenewalPlan || currentPlanInfo?.auto_renewal_package_hours) === plan.hours
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'hover:shadow-sm'
                }`}
                onClick={async () => {
                  if (plan.hours === currentPlanInfo?.auto_renewal_package_hours) {
                    // If clicking the same plan, do nothing
                    return;
                  }

                  setSelectedAutoRenewalPlan(plan.hours);
                  
                  // Only handle auto-renewal if it's not already enabled
                  if (!currentPlanInfo?.auto_renewal_enabled) {
                    await handleAutoRenewalToggle();
                  } else {
                    // Update the package hours without toggling auto-renewal
                    try {
                      setIsUpdatingAutoRenewal(true);
                      const response = await fetch('/api/update-auto-renewal', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                          enabled: true, // Keep it enabled
                          packageHours: plan.hours
                        }),
                      });
                      
                      if (!response.ok) {
                        const error = await response.json();
                        throw new Error(error.message || 'Failed to update auto-renewal plan');
                      }

                      // Update local state
                      setCurrentPlanInfo(prev => prev ? {
                        ...prev,
                        auto_renewal_package_hours: plan.hours
                      } : null);

                      toast({
                        title: 'Success',
                        description: `Auto-renewal plan updated to ${plan.hours} hours package`,
                      });
                    } catch (error) {
                      toast({
                        title: 'Error',
                        description: (error as Error).message,
                        variant: 'destructive',
                      });
                    } finally {
                      setIsUpdatingAutoRenewal(false);
                    }
                  }
                }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium min-h-[48px]">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.hours} Hours</p>
                  </div>
                  <p className="font-medium">${plan.price}</p>
                </div>
                {plan.calendlyEnabled && (
                  <div className="flex items-center text-primary text-sm mt-2">
                    <Check className="h-4 w-4 mr-1" />
                    <span>Includes Calendly</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-4">
            <RefreshCw className="h-4 w-4" />
            <p>Your account will be automatically charged when your hours are running low</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <TooltipProvider>
      <div className="container mx-auto p-6">
        <>
          <div className="flex justify-between items-center mb-6">
            <div className="w-20" /> {/* Spacer to balance the refresh button */}
            <h2 className="text-3xl font-bold text-center flex-grow">Meeting Hours Packages</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          
          {loading ? (
            <div className="space-y-6" role="status" aria-label="Loading data">
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
                  <span className="ml-2 text-lg text-primary">Loading packages...</span>
                </div>
              </motion.div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Available Packages */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-6 mb-6">
                {availablePlans.map((plan) => (
                  <Card key={plan.id} className="flex flex-col hover:shadow-lg transition-shadow h-full">
                    <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                        <span>{plan.name}</span>
                        <span className="text-2xl font-bold">${plan.price}</span>
                      </CardTitle>
                      <CardDescription className="text-lg font-semibold">
                        {plan.hours} Hours
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
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
                        onClick={() => handlePurchaseHours(plan.id)} 
                        disabled={loading}
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Purchase Hours
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {/* Auto-Renewal and Payment Method (only show if user has a plan) */}
              {currentPlanInfo && (
                <>
                  {/* Payment Method (show if exists) */}
                  {paymentMethods.length > 0 && (
                    <>
                      <Card className="mb-6">
                        <CardHeader className="flex flex-row items-center justify-between">
                          <div>
                            <CardTitle>Payment Method</CardTitle>
                            <CardDescription>
                              {currentPlanInfo.auto_renewal_enabled 
                                ? "Used for auto-renewal purchases"
                                : "Saved for future purchases"}
                            </CardDescription>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleAddPaymentMethod}
                          >
                            Update Payment Method
                          </Button>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center space-x-4">
                              <div className="space-y-1">
                                <p className="font-medium">
                                  {paymentMethods[0].card.brand.toUpperCase()} •••• {paymentMethods[0].card.last4}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Expires {paymentMethods[0].card.exp_month}/{paymentMethods[0].card.exp_year}
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Auto-Renewal with Plan Selection */}
                      {renderAutoRenewalCard()}
                    </>
                  )}
                </>
              )}

              {/* Purchase History */}
              <Card className="mb-6">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Purchase History</CardTitle>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <HelpCircle className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View and download your past invoices</p>
                    </TooltipContent>
                  </Tooltip>
                </CardHeader>
                <CardContent>
                  {paymentHistory.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paymentHistory.map((payment) => (
                            <TableRow key={payment.id}>
                              <TableCell>{formatDate(payment.date)}</TableCell>
                              <TableCell>{payment.total}</TableCell>
                              <TableCell>
                                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                  payment.status === 'paid' 
                                    ? 'bg-green-50 text-green-700' 
                                    : 'bg-gray-50 text-gray-700'
                                }`}>
                                  {payment.status}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <p>No purchase history available.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </>
      </div>
    </TooltipProvider>
  );
}
