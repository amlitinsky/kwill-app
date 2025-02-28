"use client";

import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";

export function PricingButton() {
  const handleClick = () => {
    // Add #pricing to the URL
    window.history.pushState({}, "", window.location.pathname + "#pricing");
    // Dispatch a custom event to open the pricing modal
    window.dispatchEvent(new CustomEvent("open-pricing-modal"));
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="fixed bottom-6 left-6 z-[100] rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
      onClick={handleClick}
      aria-label="Pricing"
    >
      <CreditCard className="h-5 w-5" />
    </Button>
  );
} 