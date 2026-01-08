// src/hooks/useHMS.js
"use client";

import { useEffect } from "react";
import { 
  useHMSActions, 
  useHMSStore, 
  selectIsConnectedToRoom, 
  selectPeers, 
  selectIsLocalAudioEnabled 
} from "@100mslive/react-sdk";

export const useHMS = (token) => {
  const hmsActions = useHMSActions();
  const isConnected = useHMSStore(selectIsConnectedToRoom);
  const peers = useHMSStore(selectPeers);
  const isAudioEnabled = useHMSStore(selectIsLocalAudioEnabled);

  useEffect(() => {
    if (!token) return;

    const joinRoom = async () => {
      try {
        await hmsActions.join({
          authToken: token,
          userName: "Participant", // Aap yahan user name pass kar sakte hain
          settings: { isAudioMuted: false, isVideoMuted: true }, // Voice call setup
          rememberDeviceSelection: true
        });
      } catch (e) {
        console.error("Join Room Error:", e);
      }
    };

    joinRoom();

    return () => {
      hmsActions.leave();
    };
  }, [token, hmsActions]);

  return {
    connected: isConnected,
    remotePeers: peers.filter(p => !p.isLocal),
    isMuted: !isAudioEnabled,
    toggleMute: () => hmsActions.setLocalAudioEnabled(isAudioEnabled ? false : true),
    leave: () => hmsActions.leave()
  };
};