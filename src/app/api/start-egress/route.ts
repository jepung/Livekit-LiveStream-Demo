import {
  EgressClient,
  EncodedFileOutput,
  EncodingOptionsPreset,
} from "livekit-server-sdk";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { roomName } = await req.json();

    const egressClient = new EgressClient(
      process.env.NEXT_PUBLIC_LIVEKIT_URL!,
      process.env.NEXT_PUBLIC_API_KEY,
      process.env.NEXT_PUBLIC_SECRET_KEY
    );

    const currentTime = new Date().toISOString();
    const output = {
      file: new EncodedFileOutput({
        filepath: `my-output-livekit-${currentTime}`,
        output: {
          case: "s3",
          value: {
            accessKey: "AKIA3KIFA3JSFOVMBZ7H",
            secret: "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",
            bucket: "streaming-recording-demo",
            region: "ap-southeast-1",
          },
        },
      }),
    };

    const response = await egressClient.startRoomCompositeEgress(
      roomName,
      output,
      {
        encodingOptions: EncodingOptionsPreset.H264_720P_30,
      }
    );

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
