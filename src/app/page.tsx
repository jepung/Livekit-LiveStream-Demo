"use client";

import { LocalAudioTrack, LocalVideoTrack, Room, Track } from "livekit-client";
import { useMemo, useRef, useState } from "react";
import { getLiveKitToken } from "../utils/livekit-token-generator";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const webcamRef = useRef<HTMLVideoElement>(null);

  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [roomName, setRoomName] = useState<string>("");
  const [room, setRoom] = useState<Room | null>(null);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const pathname = usePathname();

  const isButtonStartStreamDisabled = useMemo(() => {
    return roomName.trim() === "" || isStreaming;
  }, [roomName, isStreaming]);

  const isButtonStopStreamDisabled = useMemo(() => {
    return roomName.trim() === "" || !isStreaming;
  }, [roomName, isStreaming]);

  const startStreaming = async () => {
    setIsLoading(true);
    try {
      // Init auth token
      const userToken = await getLiveKitToken({
        room: roomName,
        identity: `host-${crypto.randomUUID()}`,
      });

      // Connect to the room with auth token
      const newRoom = new Room();
      await newRoom.connect(process.env.NEXT_PUBLIC_LIVEKIT_URL!, userToken);
      setRoom(newRoom);

      // Stream the media to the streaming room
      streamMedia("WEBCAM", newRoom);
      streamMedia("SCREEN", newRoom);

      setIsStreaming(true);
      alert("Streming ON");
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  const streamMedia = async (
    type: "SCREEN" | "WEBCAM",
    streamingRoom: Room
  ) => {
    const media = type === "SCREEN" ? screenStream : webcamStream;

    const mediaVideoTrack = media?.getVideoTracks()[0];
    const mediaAudioTrack = media?.getAudioTracks()[0];

    if (mediaVideoTrack) {
      streamingRoom.localParticipant.publishTrack(
        new LocalVideoTrack(mediaVideoTrack),
        {
          source:
            type === "SCREEN" ? Track.Source.ScreenShare : Track.Source.Camera,
        }
      );
    }
    if (mediaAudioTrack) {
      streamingRoom.localParticipant.publishTrack(
        new LocalAudioTrack(mediaAudioTrack),
        {
          source:
            type === "SCREEN"
              ? Track.Source.ScreenShareAudio
              : Track.Source.Microphone,
        }
      );
    }
  };

  const startShareScreen = async () => {
    try {
      const screen = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      setScreenStream(screen);
    } catch (e) {
      console.log(e, "startShareScreen");
    }
  };

  const startWebcam = async () => {
    try {
      const webcam = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (webcamRef.current) {
        webcamRef.current!.srcObject = webcam;
      }

      setWebcamStream(webcam);
    } catch (e) {
      console.log(e, "startWebcam");
    }
  };

  const stopWebcam = () => {
    webcamStream?.getVideoTracks()[0].stop();
    webcamStream?.getAudioTracks()[0].stop();
    setWebcamStream(null);
  };

  const stopStreaming = async () => {
    await room?.disconnect();
    setIsStreaming(false);
    setWebcamStream(null);
    setScreenStream(null);
    alert("Streming OFF");
  };

  const stopShareScreen = () => {
    screenStream?.getVideoTracks()[0].stop();
    if (screenStream?.getAudioTracks()[0]) {
      screenStream?.getAudioTracks()[0].stop();
    }
    setScreenStream(null);
  };

  return (
    <div className="flex flex-col justify-center items-center p-20">
      <div>
        <input
          onChange={(e) => setRoomName(e.target.value)}
          className="border px-5 py-3 rounded-md"
          placeholder="Input room name"
        />
      </div>
      <div className="flex gap-5 mt-5">
        <button
          onClick={webcamStream ? stopWebcam : startWebcam}
          className={`bg-slate-800 py-2 px-5 rounded-md cursor-pointer`}
        >
          {webcamStream ? "Stop Webcam" : "Start Webcam"}
        </button>
        <button
          onClick={screenStream ? stopShareScreen : startShareScreen}
          className={`bg-slate-800 py-2 px-5 rounded-md cursor-pointer`}
        >
          {screenStream ? "Stop ShareScreen" : "Start ShareScreen"}
        </button>
        <button
          disabled={isButtonStartStreamDisabled}
          onClick={startStreaming}
          className={`bg-slate-800 py-2 px-5 rounded-md ${
            isButtonStartStreamDisabled
              ? "cursor-not-allowed"
              : "cursor-pointer"
          }`}
        >
          {isLoading ? "Loading..." : "Start Streaming"}
        </button>
        <button
          disabled={isButtonStopStreamDisabled}
          onClick={stopStreaming}
          className={`bg-red-800 py-2 px-5 rounded-md ${
            isButtonStopStreamDisabled ? "cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          Stop Streaming
        </button>
      </div>
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
      <div className="mt-10">
        <video
          ref={webcamRef}
          height={600}
          width={500}
          autoPlay
          controls
          playsInline
        />
      </div>
    </div>
  );
}
