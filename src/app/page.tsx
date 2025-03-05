"use client";

import {
  createLocalAudioTrack,
  createLocalVideoTrack,
  LocalAudioTrack,
  LocalVideoTrack,
  Room,
  Track,
} from "livekit-client";
import { useMemo, useRef, useState } from "react";
import Webcam from "react-webcam";
import { getLiveKitToken } from "../utils/livekit-token-generator";

export default function Home() {
  const [roomName, setRoomName] = useState<string>("");
  const [room, setRoom] = useState<Room | null>(null);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const webcamRef = useRef(null);

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

      // Init + streaming webcam (using livekit function)
      const webcamVideoTrack = await createLocalVideoTrack();
      const webcamAudioTrack = await createLocalAudioTrack();
      newRoom.localParticipant.publishTrack(webcamVideoTrack);
      newRoom.localParticipant.publishTrack(webcamAudioTrack);

      // Init + streaming share screen (manually config share screen to get audio track)
      initStreamingShareScreen(newRoom);

      setIsStreaming(true);
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  const initStreamingShareScreen = async (streamingRoom: Room) => {
    const screen = await startShareScreen();
    const screenVideoTrack = screen?.getVideoTracks()[0];
    const screenAudioTrack = screen?.getAudioTracks()[0];
    streamingRoom.localParticipant.publishTrack(
      new LocalVideoTrack(screenVideoTrack!),
      {
        source: Track.Source.ScreenShare,
      }
    );
    if (screenAudioTrack) {
      streamingRoom.localParticipant.publishTrack(
        new LocalAudioTrack(screenAudioTrack),
        {
          source: Track.Source.ScreenShareAudio,
        }
      );
    }
  };

  const startShareScreen = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      return stream;
    } catch (e) {
      console.log(e, "startShareScreen");
    }
  };

  const stopStreaming = async () => {
    await room?.disconnect();
    setIsStreaming(false);
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
        <p>Status: {isStreaming ? "Live on" : "Live off"}</p>
      </div>
      <Webcam
        className="mt-20"
        ref={webcamRef}
        height={600}
        width={500}
        videoConstraints={{ width: 600, height: 500, facingMode: "user" }}
      />
    </div>
  );
}
