import { NextResponse } from 'next/server'
import { processAutoRenewal } from '@/lib/auto-renewal'
import { Receiver } from "@upstash/qstash"

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

export async function POST(req: Request) {
  try {
    console.log("Checking auto-renewal");
    const signature = req.headers.get('Upstash-Signature');
    const body = await req.text();
    
    if (!signature) {
      console.error('Missing Upstash-Signature header');
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    // TODO: Change this to the actual URL
    const isValid = await receiver.verify({
      body,
      signature,
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/check-auto-renewal`,
    });

    if (!isValid) {
      console.error('Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const data = JSON.parse(body);
    const { userId } = data;
    console.log("Checking auto-renewal for user:", userId);
    
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }
    console.log("About to process auto-renewal for user:", userId);

    await processAutoRenewal(userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing auto-renewal check:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Configure the runtime to use Edge for better performance
// export const runtime = 'edge'