import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function POST(req: Request) {
  try {
    // Extract userId from request body
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    console.log("Disabling Calendly for user:", userId);

    // Update user's Calendly access using supabaseAdmin
    const { error } = await supabaseAdmin
      .from('users')
      .update({ 
        calendly_access_until: null,
        calendly_enabled: false 
      })
      .eq('id', userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error disabling Calendly:', error);
    return NextResponse.json(
      { error: 'Failed to disable Calendly access' },
      { status: 500 }
    );
  }
} 