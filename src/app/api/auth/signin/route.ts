import { NextResponse } from 'next/server';
import { signIn } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const data = await signIn(email, password);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error}, { status: 400 });
  }
}