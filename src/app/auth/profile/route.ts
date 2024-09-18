import { NextResponse } from 'next/server';
import { getCurrentUser, updateProfile } from '@/lib/supabase';

export async function GET() {
  try {
    const user = await getCurrentUser();
    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json({ success: false, error}, { status: 400 });
  }
}

export async function PUT(req: Request) {
  try {
    const { firstName, lastName } = await req.json();
    await updateProfile(firstName, lastName);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error}, { status: 400 });
  }
}