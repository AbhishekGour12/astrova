"use client";

import { useZego } from "../../hooks/useZego";

export default function UserCallDemo() {
  const { containerRef, connected } = useZego({
    roomId: "astrova-demo-room",
    userId: "user_1",
    userName: "User",
  });

  return (
    <div className="w-screen h-screen bg-black">
      {!connected && (
        <div className="absolute inset-0 flex items-center justify-center text-white">
          Connecting call...
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
