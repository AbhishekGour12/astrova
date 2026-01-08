"use client";

import { HMSRoomProvider } from "@100mslive/react-sdk";

export default function HMSProvider({ children }) {
  return (
    <HMSRoomProvider>
      {children}
    </HMSRoomProvider>
  );
}