import { NextResponse } from 'next/server';
import { signUp } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { email, password, firstName, lastName } = await req.json();
    const data = await signUp(email, password, firstName, lastName);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: error}, { status: 400 });
  }
}