"use client";
import React, { ReactNode, useEffect, useState } from "react";
import { LiveKitRoom } from "@livekit/components-react";
import { getLiveKitToken } from "@/utils/livekit-token-generator";

const ViewerLayout = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string>("");

  const init = async () => {
    try {
      console.log("Start initializing");
      const userToken = await getLiveKitToken({
        room: "test",
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
    init();
  }, []);

  return (
    <LiveKitRoom
      serverUrl={"wss://demointerviewai-j84novad.livekit.cloud"}
      token={token}
      connect
      onError={(e) => {
        console.log(e, 123);
      }}
    >
      {children}
    </LiveKitRoom>
  );
};

export default ViewerLayout;
