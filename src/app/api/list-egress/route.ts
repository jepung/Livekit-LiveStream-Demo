import { NextResponse } from 'next/server';
import { EgressClient } from 'livekit-server-sdk';

export async function GET() {
  const livekitHost = process.env.NEXT_PUBLIC_LIVEKIT_URL; // e.g., "https://your-livekit-server"
  const apiKey = process.env.NEXT_PUBLIC_API_KEY;
  const apiSecret = process.env.NEXT_PUBLIC_SECRET_KEY;

  if (!apiKey || !apiSecret || !livekitHost) {
    return NextResponse.json({ error: 'Missing LiveKit environment variables' }, { status: 500 });
  }

  try {
    const egressClient = new EgressClient(livekitHost, apiKey, apiSecret);
    const egressList = await egressClient.listEgress({});
    
    return NextResponse.json({ egressList });
  } catch (error) {
    console.error('Error listing egress:', error);
    return NextResponse.json({ error: 'Failed to fetch egress list' }, { status: 500 });
  }
}