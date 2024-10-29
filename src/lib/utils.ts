import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getBaseUrl(): string {
  // Check if we're in production or preview environment
  if (process.env.VERCEL_ENV === 'production') {
    return process.env.NEXT_PUBLIC_BASE_URL!;
  }
  // For development or any other environment, use NGROK
  return process.env.NEXT_PUBLIC_NGROK_URL!;
}