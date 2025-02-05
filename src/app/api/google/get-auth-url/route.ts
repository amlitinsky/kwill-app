import { NextResponse } from 'next/server';
import { getGoogleAuthUrl } from '@/lib/google-auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get('source');
  const url = getGoogleAuthUrl(source!);
  return NextResponse.json({ url });
}