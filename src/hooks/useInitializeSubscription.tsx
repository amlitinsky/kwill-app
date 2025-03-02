import { useEffect, useRef } from "react";
import { api } from "@/trpc/react";
import { useUser } from "@clerk/nextjs";

export function useInitializeSubscription() {
  const { user, isLoaded, isSignedIn } = useUser();
  const initializeSubscription = api.subscription.initializeSubscription.useMutation();
  const hasInitializedRef = useRef(false);
  
  useEffect(() => {
    // Only run if the user is signed in and loaded and we haven't initialized yet
    if (!isLoaded || !isSignedIn || !user || hasInitializedRef.current) return;
    
    // Get the user's primary email
    const email = user.primaryEmailAddress?.emailAddress;
    if (!email) return;
    
    // Initialize the subscription
    initializeSubscription.mutate({ email });
    
    // Mark as initialized to prevent repeated calls
    hasInitializedRef.current = true;
  }, [isLoaded, isSignedIn, user, initializeSubscription]);
  
  return {
    isInitializing: initializeSubscription.isPending,
    error: initializeSubscription.error,
    subscription: initializeSubscription.data,
  };
} 