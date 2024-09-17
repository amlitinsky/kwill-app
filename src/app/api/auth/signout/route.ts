import { NextResponse } from 'next/server';
import { signOut } from '@/lib/supabase';

export async function POST() {
  try {
    await signOut();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error}, { status: 400 });
  }
}