import { NextResponse } from 'next/server';
import { deleteAccount } from '@/lib/supabase';

export async function POST() {
  try {
    await deleteAccount();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error}, { status: 400 });
  }
}