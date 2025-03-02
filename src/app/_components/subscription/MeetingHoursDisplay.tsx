"use client";

import { api } from "@/trpc/react";
import { Clock } from "lucide-react";

export function MeetingHoursDisplay() {
  // Fetch the user's subscription
  const { data: subscription, isLoading, error } = api.subscription.getSubscription.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center rounded-full bg-blue-500 px-3 py-2 text-sm text-white shadow-md">
        <Clock className="mr-2 h-4 w-4" />
        <span>Loading hours...</span>
      </div>
    );
  }

  if (error || !subscription) {
    return null;
  }

  // Convert minutes to hours for display
  const hours = subscription.minutes / 60;
  // Format hours to 1 decimal place if it has a decimal part
  const formattedHours = Number.isInteger(hours) ? hours.toString() : hours.toFixed(1);

  return (
    <div className="flex items-center rounded-full bg-blue-500 px-3 py-2 text-sm text-white shadow-md">
      <Clock className="mr-2 h-4 w-4" />
      <span>
        <strong>{formattedHours}</strong> meeting hours remaining
      </span>
    </div>
  );
} 