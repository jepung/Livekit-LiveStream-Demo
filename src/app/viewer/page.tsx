"use client";
import { AudioTrack, useTracks, VideoTrack } from "@livekit/components-react";
import { Track } from "livekit-client";

const ViewerPage = () => {
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

  return (
    <div className="flex flex-col h-screen w-screen px-52 pt-20">
      <div>
        <h1 className="text-3xl font-bold text-center">LiveKit Viewer</h1>
      </div>

      <div className="flex gap-52 items-center mt-10">
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
