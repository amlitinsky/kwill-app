import { NextResponse } from 'next/server';
import { createServerSupabaseClient, getStripeCustomerId } from '@/lib/supabase-server';
import { getCustomerInvoices } from '@/lib/stripe';


export async function GET() {
  const supabase = createServerSupabaseClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const stripeCustomerId = await getStripeCustomerId(user.id);
    
    const invoices = await getCustomerInvoices(stripeCustomerId)
    return NextResponse.json({ invoices });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}
