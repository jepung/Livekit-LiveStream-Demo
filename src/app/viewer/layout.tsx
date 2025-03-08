"use client";
import { getLiveKitToken } from "@/utils/livekit-token-generator";
import { LiveKitRoom } from "@livekit/components-react";
import { useSearchParams } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

const ViewerLayout = ({ children }: { children: ReactNode }) => {
  const room = useSearchParams().get("room");
  const [token, setToken] = useState<string>("");

  const init = async () => {
    try {
      alert("Intializing streaming room");
      const userToken = await getLiveKitToken({
        room: room!,
        identity: `viewer-${crypto.randomUUID()}`,
      });
      setToken(userToken);
      alert("Initiated");
    } catch (e) {
      if (e instanceof Error) {
        alert(e.message);
      }
    }
  };

  useEffect(() => {
    if (room) {
      init();
    }
  }, [room]);

  return (
    <LiveKitRoom
      serverUrl={"wss://demointerviewai-j84novad.livekit.cloud"}
      token={token}
      connect
    >
      {children}
    </LiveKitRoom>
  );
};

export default ViewerLayout;
