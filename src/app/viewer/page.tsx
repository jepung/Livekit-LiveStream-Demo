"use client";

import {
  AudioTrack,
  useRoomContext,
  useTracks,
  VideoTrack,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { EgressInfo } from "livekit-server-sdk";
import { useEffect, useState } from "react";

const ViewerPage = () => {
  const room = useRoomContext();
  const [eggressInfo, setEggressInfo] = useState<EgressInfo | null>();

  const cameraTracks = useTracks([Track.Source.Camera], {
    onlySubscribed: true,
  });
  const screenTracks = useTracks([Track.Source.ScreenShare], {
    onlySubscribed: true,
  });
  const microphoneTrack = useTracks([Track.Source.Microphone], {
    onlySubscribed: true,
  });
  const screenAudio = useTracks([Track.Source.ScreenShareAudio], {
    onlySubscribed: true,
  });

  const startRecording = async () => {
    try {
      const res = await fetch("/api/start-egress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomName: room.name,
        }),
      });

      const data = (await res.json()) as EgressInfo;

      console.log("Recording started:", data);
      setEggressInfo(data);
    } catch (e) {
      if (e instanceof Error) {
        console.log(e);
      }
    }
  };

  const stopRecording = async (egressId: string) => {
    try {
      const res = await fetch("/api/stop-egress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          egressId: egressId,
        }),
      });

      const data = await res.json();
      console.log("Recording stopped:", data);
    } catch (e) {
      if (e instanceof Error) {
        console.log(e);
      }
    }
  };

  useEffect(() => {
    if (room.name) {
      startRecording();
    }
  }, [room.name]);

  return (
    <div className="flex flex-col h-screen w-screen px-52 py-20">
      <div>
        <h1 className="text-3xl font-bold text-center">LiveKit Viewer</h1>
      </div>
      {eggressInfo && (
        <div className="mt-5 mx-auto">
          <button
            onClick={() => stopRecording(eggressInfo.egressId)}
            className="px-5 py-3 bg-slate-800 rounded-md cursor-pointer"
          >
            Stop Record
          </button>
        </div>
      )}
      <div className="flex gap-52 items-center mt-10 h-full">
        <div className="flex-1">
          <h2 className="text-2xl font-bold">Webcam</h2>
          <div className="mt-5 flex flex-col gap-5 ">
            {cameraTracks[0] && (
              <VideoTrack
                className="object-contain h-96 border border-slate-500"
                trackRef={cameraTracks[0]}
              />
            )}
            {microphoneTrack[0] && (
              <AudioTrack
                className="w-full"
                controls
                autoPlay
                trackRef={microphoneTrack[0]}
              />
            )}
          </div>
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">Screen</h2>
          <div className="mt-5 flex flex-col gap-5">
            {screenTracks[0] && (
              <VideoTrack
                className="w-full h-96 object-contain border border-slate-500"
                trackRef={screenTracks[0]}
              />
            )}
            {screenAudio[0] && (
              <AudioTrack
                className="w-full"
                controls
                autoPlay
                trackRef={screenAudio[0]}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewerPage;
