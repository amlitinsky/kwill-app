'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Tabs } from '@/components/ui/tabs';

interface ClientSettingsWrapperProps {
  children: React.ReactNode;
  defaultTab: string;
}

export function ClientSettingsWrapper({ children, defaultTab }: ClientSettingsWrapperProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const searchParams = useSearchParams();
  const verificationCompleteRef = useRef(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const savedTab = localStorage.getItem('settingsActiveTab');
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, []);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const canceled = searchParams.get('canceled');
    const mode = searchParams.get('mode');
    
    if (sessionId && !verificationCompleteRef.current) {
      verificationCompleteRef.current = true;
      
      if (mode === 'setup') {
        toast({
          title: "Card Updated",
          description: "Your payment method has been successfully updated.",
          duration: 5000,
        });
      } else {
        toast({
          title: "Purchase Successful",
          description: "Your hours have been added to your account!",
          duration: 5000,
        });
      }

      // Clean up URL
      router.replace('/settings');
    }
    
    // Handle canceled checkout
    if (canceled && !verificationCompleteRef.current) {
      verificationCompleteRef.current = true;
      
      const cancelMessage = mode === 'setup' 
        ? "Card update was canceled. No changes were made."
        : "Purchase was canceled. No charges were made.";

      toast({
        title: "Canceled",
        description: cancelMessage,
        variant: "default",
        duration: 5000,
      });

      router.replace('/settings');
    }
  }, [searchParams, router, toast]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    localStorage.setItem('settingsActiveTab', value);
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      {children}
    </Tabs>
  );
} 