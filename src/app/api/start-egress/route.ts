import { EgressClient, EncodedFileOutput } from "livekit-server-sdk";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { roomName } = await req.json();

    const egressClient = new EgressClient(
      "https://demointerviewai-j84novad.livekit.cloud",
      process.env.NEXT_PUBLIC_API_KEY,
      process.env.NEXT_PUBLIC_SECRET_KEY
    );

    const output = {
      file: new EncodedFileOutput({
        filepath: `${roomName}/recording.mp4`,
        output: {
          case: "s3",
          value: {
            accessKey: "00454334f934ef20000000001",
            secret: "K004QoTW9M5ioMkhjDILr2PIjvvgcBQ",
            bucket: "test-livekit",
            region: "us-west",
            endpoint: "https://s3.us-west-004.backblazeb2.com",
            forcePathStyle: true,
          },
        },
      }),
    };

    const response = await egressClient.startRoomCompositeEgress(
      roomName,
      output
    );

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { error: "Failed to start recording" },
      { status: 500 }
    );
  }
}
