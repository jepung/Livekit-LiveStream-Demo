import {
    AudioCodec,
    EgressClient,
    EncodedFileOutput,
    EncodedOutputs,
    EncodingOptions,
    VideoCodec,
} from 'livekit-server-sdk'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    try {
        const { roomName } = await req.json()

        const egressClient = new EgressClient(
            process.env.NEXT_PUBLIC_LIVEKIT_URL!,
            process.env.NEXT_PUBLIC_API_KEY,
            process.env.NEXT_PUBLIC_SECRET_KEY
        )

        const currentTime = new Date().toISOString()
        const output: EncodedOutputs = {
            file: new EncodedFileOutput({
                filepath: `test-livekit1/my-output-livekit-${currentTime}`,
                output: {
                    case: 's3',
                    value: {
                        accessKey: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY,
                        secret: process.env.NEXT_PUBLIC_AWS_SECRET_KEY,
                        bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME,
                        region: process.env.NEXT_PUBLIC_AWS_BUCKET_REGION,
                    },
                },
            }),
        }

        // @ts-expect-error supress error all field must be implement
        const encodingOptions: EncodingOptions = {
            videoBitrate: 300, // 1 Mbps
            width: 640,
            height: 480,
            framerate: 30,
            audioBitrate: 96,
            videoCodec: VideoCodec.VP8,
            audioCodec: AudioCodec.AAC,
        }

        const response = await egressClient.startRoomCompositeEgress(
            roomName,
            output,
            {
                encodingOptions: encodingOptions,
            }
        )

        return NextResponse.json(response, { status: 200 })
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 500 }
        )
    }
}
