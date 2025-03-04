"use client";

import {
  createLocalAudioTrack,
  createLocalScreenTracks,
  createLocalVideoTrack,
  Room,
} from "livekit-client";
import { useMemo, useRef, useState } from "react";
import Webcam from "react-webcam";
import { getLiveKitToken } from "../utils/webrtc-adaptor";

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
        identity: "host",
      });

      // Connect to the room with auth token
      const newRoom = new Room();
      await newRoom.connect(process.env.NEXT_PUBLIC_LIVEKIT_URL!, userToken);
      setRoom(newRoom);

      // Init webcam and desktop screen
      const videoTrack = await createLocalVideoTrack();
      const audioTrack = await createLocalAudioTrack();
      const screenTrack = await createLocalScreenTracks();

      // Streaming the webcam and desktop screen to the room
      newRoom.localParticipant.publishTrack(videoTrack);
      newRoom.localParticipant.publishTrack(audioTrack);
      screenTrack.forEach((track) =>
        newRoom.localParticipant.publishTrack(track)
      );

      setIsStreaming(true);
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
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
