"use client";
import React, { useEffect, useRef, useState } from "react";
import { getLiveKitToken } from "../../utils/livekit-token-generator";
import { Room, Track } from "livekit-client";
import { useRouter, useSearchParams } from "next/navigation";

const ViewerPage = () => {
  const [room, setRoom] = useState<Room | null>(null);
  const [roomQuery, setRoomQuery] = useState<string>(
    useSearchParams().get("room") ?? ""
  );
  const router = useRouter();
  const userWebcamRef = useRef<HTMLVideoElement>(null);
  const userScreenRef = useRef<HTMLVideoElement>(null);
  const microphoneAudioRef = useRef<HTMLAudioElement>(null);
  const screenAudioRef = useRef<HTMLAudioElement>(null);
  const divRef = useRef<HTMLDivElement>(null);

  const connectToRoom = async () => {
    try {
      const userToken = await getLiveKitToken({
        room: roomQuery!,
        identity: "viewer",
      });
      const newRoom = new Room();

      newRoom.on("trackSubscribed", (track) => {
        if (track.kind === "video") {
          console.log(track.kind, track.source);
          if (track.source === Track.Source.Camera) {
            userWebcamRef.current!.srcObject = new MediaStream([
              track.mediaStreamTrack,
            ]);
          } else if (track.source === Track.Source.ScreenShare) {
            userScreenRef.current!.srcObject = new MediaStream([
              track.mediaStreamTrack,
            ]);
          }
        } else {
          console.log(track.kind, track.source);
          if (track.source === Track.Source.Microphone) {
            microphoneAudioRef.current!.srcObject = new MediaStream([
              track.mediaStreamTrack,
            ]);
            microphoneAudioRef.current!.volume = 1.0;
          } else if (track.source === Track.Source.ScreenShareAudio) {
            screenAudioRef.current!.srcObject = new MediaStream([
              track.mediaStreamTrack,
            ]);
            screenAudioRef.current!.volume = 1.0;
          }
        }
      });

      newRoom.on("trackUnsubscribed", () => {
        console.log("unsubscribed");
      });

      await newRoom.connect(process.env.NEXT_PUBLIC_LIVEKIT_URL!, userToken);
      setRoom(room);
    } catch (e) {
      console.log(e);
    }
  };

  const searchHandler = () => {
    router.push(`http://localhost:3001/viewer?room=${roomQuery}`);
    connectToRoom();
  };

  useEffect(() => {
    if (roomQuery && userScreenRef && userWebcamRef) {
      connectToRoom();
    }
    return () => {
      room?.disconnect();
    };
  }, [userScreenRef, userWebcamRef]);

  useEffect(() => {
    if (divRef) {
      divRef.current?.addEventListener("click", () => {
        microphoneAudioRef.current!.play();
        screenAudioRef.current!.play();
        userScreenRef.current!.play();
        userWebcamRef.current!.play();
      });
    }
  }, [divRef]);

  return (
    <div ref={divRef} className="flex flex-col h-screen w-screen p-52">
      <div className="self-center flex items-center gap-2">
        <input
          placeholder="Input room name"
          className="border px-5 py-3 rounded"
          onChange={(e) => setRoomQuery(e.target.value)}
        />
        <button
          disabled={!roomQuery}
          onClick={searchHandler}
          className="bg-slate-500 h-full px-5 py-3 rounded-md cursor-pointer"
        >
          Search
        </button>
      </div>
      <h1 className="text-center text-xl mt-10">
        Live streaming room: <span className="font-bold">{roomQuery}</span>
      </h1>

      <div className=" w-full mt-10 flex gap-10">
        <div className="flex-1 flex flex-col gap-2">
          <h2 className="text-3xl font-bold">Webcam</h2>
          <video
            ref={userWebcamRef}
            autoPlay
            controls
            playsInline
            className="w-full h-full"
          />
          <audio
            ref={microphoneAudioRef}
            controls
            autoPlay
            className="w-full h-10"
          />
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <h2 className="text-3xl font-bold">Screen</h2>
          <video
            ref={userScreenRef}
            autoPlay
            controls
            playsInline
            className="w-full h-full"
          />
          <audio
            ref={screenAudioRef}
            controls
            autoPlay
            className="w-full h-10"
          />
        </div>
      </div>
    </div>
  );
};

export default ViewerPage;
