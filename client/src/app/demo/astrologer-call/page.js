"use client";

import { useZego } from "../../hooks/useZego";

export default function AstrologerCallDemo() {
  const { containerRef, connected } = useZego({
    roomId: "astrova-demo-room", // SAME ROOM
    userId: "astro_1",
    userName: "Astrologer",
  });

  return (
    <div className="w-screen h-screen bg-black">
      {!connected && (
        <div className="absolute inset-0 flex items-center justify-center text-white">
          Waiting for user...
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
