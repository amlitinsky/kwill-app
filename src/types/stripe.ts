export interface Plan {
  id: string;
  name: string;
  price: number;
  description: string | null;
  hours: number;
  calendlyEnabled: boolean;
  order: number;
  features: string[];
}

export interface Subscription {
  id: string;
  status: string;
  current_period_end: string;
  hours: number;
  stripe_customer_id: string;
} 