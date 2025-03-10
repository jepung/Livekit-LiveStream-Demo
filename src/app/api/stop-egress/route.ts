import { EgressClient } from "livekit-server-sdk";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { egressId } = await req.json();

    const egressClient = new EgressClient(
      "https://demointerviewai-j84novad.livekit.cloud",
      process.env.NEXT_PUBLIC_API_KEY,
      process.env.NEXT_PUBLIC_SECRET_KEY
    );

    console.log(await egressClient.listEgress());
    const response = await egressClient.stopEgress(egressId);

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { error: "Failed to stop recording" },
      { status: 500 }
    );
  }
}
