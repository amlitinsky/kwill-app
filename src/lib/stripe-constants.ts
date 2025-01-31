import { Plan } from "@/types/stripe";

export const FREE_PLAN: Plan = {
  id: 'free',
  name: 'Free',
  price: 0,
  description: 'Get started with basic features',
  hours: 2,
  calendlyEnabled: false,
  order: 0,
  features: [
    'Up to 2 hours of Meeting Hours',
    'Unlimited Templates',
    'Basic Analytics',
    'Email Support'
  ]
}; 