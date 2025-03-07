"use client";

import { LocalTrackPublication, Room } from "livekit-client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { getLiveKitToken } from "../utils/livekit-token-generator";

export default function Home() {
  const webcamRef = useRef<HTMLVideoElement>(null);
  const pathname = usePathname();

  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [microphoneStream, setMicrophoneStream] = useState<MediaStream | null>(
    null
  );
  const [roomName, setRoomName] = useState<string>("");
  const [room, setRoom] = useState<Room | null>(null);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const initRoom = async () => {
    try {
      setIsLoading(true);
      const userToken = await getLiveKitToken({
        room: roomName,
        identity: `host-${crypto.randomUUID()}`,
      });

      const newRoom = new Room();
      await newRoom.connect(process.env.NEXT_PUBLIC_LIVEKIT_URL!, userToken);

      setRoom(newRoom);
      setIsStreaming(true);
      alert("Room initialized");
    } catch (e) {
      if (e instanceof Error) {
        alert(e.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const configDevice = async (
    device: "WEBCAM" | "MICROPHONE" | "SCREEN",
    type: "START" | "STOP"
  ) => {
    let media: LocalTrackPublication | undefined;

    if (type === "START") {
      switch (device) {
        case "WEBCAM": {
          media = await room?.localParticipant.setCameraEnabled(true);
          break;
        }
        case "MICROPHONE": {
          media = await room?.localParticipant.setMicrophoneEnabled(true);
          break;
        }
        case "SCREEN": {
          media = await room?.localParticipant.setScreenShareEnabled(true, {
            audio: true,
          });
          break;
        }
      }
      const mediaStream = media?.track?.mediaStream;
      if (mediaStream) {
        switch (device) {
          case "WEBCAM": {
            webcamRef.current!.srcObject = mediaStream;
            setWebcamStream(mediaStream);
            break;
          }
          case "MICROPHONE": {
            setMicrophoneStream(mediaStream);
            break;
          }
          case "SCREEN": {
            setScreenStream(mediaStream);
            break;
          }
        }
      }
    } else {
      switch (device) {
        case "WEBCAM": {
          room?.localParticipant.setCameraEnabled(false);
          setWebcamStream(null);
          break;
        }
        case "MICROPHONE": {
          room?.localParticipant.setMicrophoneEnabled(false);
          setMicrophoneStream(null);
          break;
        }
        case "SCREEN": {
          room?.localParticipant.setScreenShareEnabled(false);
          setScreenStream(null);
          break;
        }
      }
    }
  };

  const stopStreaming = async () => {
    await room?.disconnect();
    setIsStreaming(false);
    configDevice("WEBCAM", "STOP");
    configDevice("MICROPHONE", "STOP");
    configDevice("SCREEN", "STOP");
    alert("Streaming OFF");
  };

  return (
    <div className="flex flex-col justify-center items-center p-20">
      <div>
        <h1 className="text-3xl font-bold">LiveKit</h1>
      </div>
      <div className="mt-10 flex gap-5">
        <input
          onChange={(e) => setRoomName(e.target.value)}
          className="border px-5 py-3 rounded-md"
          placeholder="Input room name"
        />
        <button
          disabled={isLoading}
          onClick={initRoom}
          className="px-5 py-3 border border-slate-500 rounded cursor-pointer"
        >
          {isLoading ? "Loading..." : "Create"}
        </button>
      </div>
      {isStreaming && (
        <div className="flex gap-5 mt-5">
          <button
            onClick={() =>
              webcamStream
                ? configDevice("WEBCAM", "STOP")
                : configDevice("WEBCAM", "START")
            }
            className={`bg-slate-800 py-2 px-5 rounded-md cursor-pointer`}
          >
            {webcamStream ? "Stop Webcam" : "Start Webcam"}
          </button>
          <button
            onClick={() =>
              microphoneStream
                ? configDevice("MICROPHONE", "STOP")
                : configDevice("MICROPHONE", "START")
            }
            className={`bg-slate-800 py-2 px-5 rounded-md cursor-pointer`}
          >
            {microphoneStream ? "Stop Microphone" : "Start Microphone"}
          </button>
          <button
            onClick={() =>
              screenStream
                ? configDevice("SCREEN", "STOP")
                : configDevice("SCREEN", "START")
            }
            className={`bg-slate-800 py-2 px-5 rounded-md cursor-pointer`}
          >
            {screenStream ? "Stop ShareScreen" : "Start ShareScreen"}
          </button>
          {isStreaming && (
            <button
              onClick={stopStreaming}
              className={`bg-red-800 py-2 px-5 rounded-md cursor-pointer`}
            >
              Stop Streaming
            </button>
          )}
        </div>
      )}
      <div className="mt-5">
        <p className="text-center">
          Status: {isStreaming ? "Live on" : "Live off"}
        </p>
        {isStreaming && (
          <Link
            href={pathname + `viewer?room=${roomName}`}
            target="_blank"
            className="text-center underline text-blue-500 cursor-pointer"
          >
            Go to viewer screen
          </Link>
        )}
      </div>
      <div className="mt-10 border border-slate-500">
        <video ref={webcamRef} height={600} width={500} autoPlay playsInline />
      </div>
    </div>
  );
}
