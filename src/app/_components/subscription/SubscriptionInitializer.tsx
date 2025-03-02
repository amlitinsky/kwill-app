"use client";

import { useInitializeSubscription } from "@/hooks/useInitializeSubscription";

/**
 * This component initializes a subscription for a user if they don't have one.
 * It should be included in the main layout to ensure it runs for all authenticated users.
 */
export function SubscriptionInitializer() {
  // The hook handles all the logic
  useInitializeSubscription();
  
  // This component doesn't render anything
  return null;
} 