"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { useCall } from "../../../hooks/useCall";
import { useZego } from "../../../hooks/useZego";
import { io } from "socket.io-client";
import {
  FaPhone,
  FaPhoneSlash,
  FaMicrophone,
  FaMicrophoneSlash,
  FaVolumeUp,
  FaVolumeMute,
  FaUser,
  FaClock,
  FaWallet,
  FaArrowLeft,
  FaSpinner,
  FaTimes,
} from "react-icons/fa";
import toast from "react-hot-toast";
import api from "../../../lib/api";

export default function UserCallPage() {
  const [isClient, setIsClient] = useState(false);
  const { callId } = useParams();
  const router = useRouter();
  const user = useSelector((state) => state.auth.user);
  
  const identity = user ? `user_${user._id}` : null;
  
  // State for Zego parameters
  const [zegoToken, setZegoToken] = useState(null);
  const [zegoRoomId, setZegoRoomId] = useState(null);
  const [appId, setAppId] = useState(Number(process.env.NEXT_PUBLIC_ZEGO_APP_ID));
  const [zegoEnabled, setZegoEnabled] = useState(false);
  const [isFetchingToken, setIsFetchingToken] = useState(false);
  const [socket, setSocket] = useState(null);
  const [callEndedByAstrologer, setCallEndedByAstrologer] = useState(false);
  const [callRejected, setCallRejected] = useState(false); // NEW STATE FOR REJECTION
  
  // TIMER STATES
  const [localDuration, setLocalDuration] = useState(0);
  const durationIntervalRef = useRef(null);
  const localStartRef = useRef(null); // Fix: To track start time locally

  // Use call hook
  const {
    call,
    callStatus,
    duration,
    walletBalance,
    isMuted,
    isSpeakerOn,
    isConnecting,
    peerJoined,
    endCall,
    toggleMute,
    toggleSpeaker,
    formatDuration,
    setPeerJoined
  } = useCall(callId, identity);

  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // LOGIC TO DETERMINE IF WE ARE IN "VIDEO MODE"
  const isVideoMode = isClient && zegoRoomId && zegoEnabled && !callEndedByAstrologer;

  // ==========================================
  //  FIXED TIMER LOGIC (Resilient to re-renders)
  // ==========================================
  useEffect(() => {
    // Check if we should be counting
    // We count if status is CONNECTED OR if Zego Video is active
    const shouldCount = (callStatus === "CONNECTED" || isVideoMode) && !callEndedByAstrologer;

    if (shouldCount) {
      // 1. Initialize local start time if strictly necessary (fallback if server time hasn't arrived)
      if (!localStartRef.current) {
        localStartRef.current = Date.now();
      }

      // 2. Clear any existing interval to prevent duplicates
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }

      // 3. Define the update function
      const updateTimer = () => {
        const now = Date.now();
        
        if (call?.startedAt) {
          // PRIORITY 1: Server Time (Accurate)
          // If we have an official start time from DB, use that
          const serverStart = new Date(call.startedAt).getTime();
          const diff = Math.floor((now - serverStart) / 1000);
          setLocalDuration(diff > 0 ? diff : 0);
        } else if (localStartRef.current) {
          // PRIORITY 2: Local Time (Immediate Feedback)
          // If server time isn't here yet, calculate difference from when we connected locally
          const diff = Math.floor((now - localStartRef.current) / 1000);
          setLocalDuration(diff > 0 ? diff : 0);
        }
      };

      // 4. Run immediately so we don't wait 1 second for the first number
      updateTimer();

      // 5. Start the interval
      durationIntervalRef.current = setInterval(updateTimer, 1000);

    } else {
      // Stop counting if call ends or disconnects
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    }
    
    // Cleanup on unmount or dependency change
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [callStatus, isVideoMode, callEndedByAstrologer, call?.startedAt]);


  // Update socket setup
  useEffect(() => {
    if (!user?._id || !callId) return;

    const newSocket = io(process.env.NEXT_PUBLIC_API, {
      transports: ["websocket", "polling"],
    });

    setSocket(newSocket);
    newSocket.emit("joinUser", { userId: user._id });
    newSocket.emit("joinCallRoom", { callId });

    newSocket.on("callActivated", (data) => {
      console.log("🎉 Call activated received:", data);
      if (data.zegoRoomId) {
        setZegoRoomId(data.zegoRoomId);
        setZegoEnabled(true);
        toast.success("Call connected!");
      }
    });

    newSocket.on("astrologerJoinedCall", (data) => {
      setPeerJoined(true);
    });

    const handleEnd = () => {
        setCallEndedByAstrologer(true);
        setZegoEnabled(false);
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
          durationIntervalRef.current = null;
        }
        setTimeout(() => router.push("/astrologers"), 2000);
    };

    newSocket.on("callEnded", (data) => {
      if (data.endedBy === "astrologer") {
        toast.success("Astrologer ended the call");
        handleEnd();
      }
    });

    newSocket.on("callEndedByAstrologer", (data) => {
      toast.success("Astrologer ended the call");
      handleEnd();
    });

    newSocket.on("userEndedCall", (data) => {
      if (data.callId === callId) {
        toast.success("Call ended successfully");
        handleEnd();
      }
    });
    // 3. NEW: Handle Call Rejected
    newSocket.on("callRejected", (data) => {
      console.log("Call Rejected:", data);
      setCallRejected(true); 
      // Set rejected state
      toast.error(data.reason || "Call rejected by astrologer");
      handleEnd()
      

    });


    return () => {
      newSocket.disconnect();
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    };
  }, [user?._id, callId, router, setPeerJoined]);

  // Fetch call status on mount
  useEffect(() => {
    const fetchCallStatus = async () => {
      if (!callId || !user) return;
      try {
        const response = await api.get(`/call/status/${callId}`);
        if (response.data.success) {
          const callData = response.data.call;
          if (callData.status === "ACTIVE" && callData.zegoRoomId) {
            setZegoRoomId(callData.zegoRoomId);
            setZegoEnabled(true);
          }
          if (callData.status === "ENDED") {
            toast.success("Call has ended");
            setTimeout(() => router.push("/astrologers"), 2000);
          }
          // Handle if we load the page and it's already rejected
          if (callData.status === "REJECTED") {
            setCallRejected(true);
            toast.error("Call was rejected");
            setTimeout(() => router.push("/astrologers"), 2000);
          }
        }
      } catch (error) {
        console.error("Error fetching call status:", error);
      }
    };
    if (isClient) fetchCallStatus();
  }, [callId, user, isClient, router]);

  // Fetch Zego token function
  const fetchZegoToken = useCallback(async () => {
    if (!zegoRoomId || !identity) return null;
    setIsFetchingToken(true);
    try {
      const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET;
      if (!serverSecret) return null;
      setZegoEnabled(true);
      return { success: true };
    } catch (error) {
      toast.error("Failed to setup audio connection");
    } finally {
      setIsFetchingToken(false);
    }
    return null;
  }, [zegoRoomId, identity]);

  useEffect(() => {
    if (zegoRoomId && !zegoToken) {
      fetchZegoToken();
    }
  }, [zegoRoomId, zegoToken, fetchZegoToken]);

  // Initialize Zego
  const { 
    containerRef, 
    connected: zegoConnected, 
    loading: zegoLoading, 
    error: zegoJoinError,
    zegoLoaded
  } = useZego({
    appId: appId,
    token: "dummy_token",
    roomId: zegoRoomId,
    userId: identity,
    userName: user?.name || "User",
    enabled: zegoEnabled && !!zegoRoomId && !!identity && !callEndedByAstrologer
  });

  // Handle End Call
  const handleEndCall = async () => {
    if (isLeaving) return;
    setIsLeaving(true);
    try {
      const success = await endCall();
      if (success) {
        setZegoEnabled(false);
        if (socket) {
          socket.emit("userEndedCall", {
            callId,
            userId: user._id,
            astrologerId: call?.astrologer?._id
          });
        }
        toast.success("Call ended successfully");
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
          durationIntervalRef.current = null;
        }
        setTimeout(() => router.push("/astrologers"), 2000);
      } else {
        toast.error("Failed to end call");
      }
    } catch (error) {
      console.error("Error ending call:", error);
    } finally {
      setIsLeaving(false);
    }
  };

  const getStatusMessage = () => {
    if (callEndedByAstrologer || callStatus === "ENDED") {
      return { title: "Call Ended", message: "Call has ended", showControls: false };
    }
    switch (callStatus) {
      case "WAITING": return { title: "Waiting", message: "Waiting for astrologer...", showControls: false };
      case "RINGING": return { title: "Connecting...", message: "Astrologer accepted. Connecting...", showControls: false };
      case "CONNECTED": return { title: "Connected", message: "Call in progress", showControls: true };
      default: return { title: "Initializing", message: "Setting up call...", showControls: false };
    }
  };

  const statusInfo = getStatusMessage();

  // FIX: Display duration logic
  // If video mode is on, ALWAYS show localDuration
  const displayDuration = (isVideoMode || callStatus === "CONNECTED") ? localDuration : duration;

  // FIX: Controls visibility logic
  const shouldShowCallControls = (statusInfo.showControls || isVideoMode) && !callEndedByAstrologer && callStatus !== "ENDED";

  if (!user) return null;

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-black">
      
      {/* LAYER 1: ZEGO INTERFACE */}
      <div 
        className={`fixed inset-x-0 top-0 transition-all duration-300 ease-in-out bg-gray-900
        ${isVideoMode ? 'h-[88dvh] z-40 opacity-100' : 'h-0 z-[-1] opacity-0'}
        `}
      >
        {isClient && zegoEnabled && (
          <div ref={containerRef} className="w-full h-full object-cover" />
        )}

        {/* Timer Overlay */}
        {isVideoMode && (
          <div className="absolute top-8 left-0 w-full flex flex-col items-center z-50 pointer-events-none">
            <h3 className="text-white font-bold text-lg drop-shadow-md bg-black/30 px-4 py-1 rounded-full backdrop-blur-sm mb-2">
              {call?.astrologer?.fullName}
            </h3>
            <div className="bg-red-600/90 text-white px-6 py-1 rounded-full font-mono text-xl shadow-lg backdrop-blur-md">
              {formatDuration(displayDuration)}
            </div>
          </div>
        )}
      </div>

      {/* LAYER 2: CONNECTING UI */}
      {!isVideoMode && (
        <div className="absolute inset-0 z-30 bg-gradient-to-b from-[#003D33] to-[#001F1A] flex flex-col pt-20 px-4">
          <div className="flex items-center justify-between mb-10">
            <button onClick={() => router.push("/astrologers")} className="p-2 bg-white/10 rounded-full">
               <FaArrowLeft className="text-white" />
            </button>
            <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full">
               <FaWallet className="text-yellow-400" />
               <span className="text-white font-bold">₹{walletBalance}</span>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/5 rounded-3xl p-8 flex flex-col items-center shadow-2xl">
            <div className="relative mb-6">
              <div className="w-32 h-32 rounded-full border-4 border-white/20 overflow-hidden bg-gray-700">
                {call?.astrologer?.profileImageUrl ? (
                   <img src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${call.astrologer.profileImageUrl}`} className="w-full h-full object-cover" />
                ) : (
                   <FaUser className="w-full h-full p-6 text-gray-400" />
                )}
              </div>
              {callStatus === "RINGING" && (
                <div className="absolute inset-0 rounded-full border-4 border-green-400/50 animate-ping" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{call?.astrologer?.fullName || "Astrologer"}</h2>
            <p className={`text-lg font-medium mb-6 ${callStatus === 'RINGING' ? 'text-green-400' : 'text-gray-300'}`}>
              {statusInfo.message}
            </p>
            {callStatus === "CONNECTED" && !zegoConnected && (
               <div className="flex items-center gap-3 text-yellow-400">
                  <FaSpinner className="animate-spin text-xl" />
                  <span>Establishing secure connection...</span>
               </div>
            )}
          </div>
        </div>
      )}

      {/* LAYER 3: BOTTOM CONTROLS */}
      {shouldShowCallControls && (
        <div 
          className={`fixed bottom-0 left-0 w-full z-50 flex items-center justify-center transition-all duration-300
          ${isVideoMode 
             ? "h-[12dvh] bg-[#111] rounded-t-3xl border-t border-white/10" 
             : "h-[20vh] bg-transparent"
          }`}
        >
          <div className="flex items-center gap-8">
            <button onClick={toggleMute} className={`p-4 rounded-full transition-all ${isMuted ? 'bg-white text-black' : 'bg-gray-700 text-white'}`}>
              {isMuted ? <FaMicrophoneSlash size={24} /> : <FaMicrophone size={24} />}
            </button>

            <button onClick={handleEndCall} className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-red-600/30 hover:bg-red-700 hover:scale-105 transition-all">
               {isLeaving ? <FaSpinner className="animate-spin" size={28} /> : <FaPhoneSlash size={28} />}
            </button>

            <button onClick={toggleSpeaker} className={`p-4 rounded-full transition-all ${isSpeakerOn ? 'bg-white text-black' : 'bg-gray-700 text-white'}`}>
              {isSpeakerOn ? <FaVolumeUp size={24} /> : <FaVolumeMute size={24} />}
            </button>
          </div>
        </div>
      )}

      {/* LAYER 4: CALL ENDED OVERLAY */}
      {(callEndedByAstrologer || callStatus === "ENDED") && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex flex-col items-center justify-center text-white">
          <FaPhoneSlash className="text-red-500 text-6xl mb-6" />
          <h2 className="text-3xl font-bold mb-2">Call Ended</h2>
          <p className="text-gray-400 mb-8">Duration: {formatDuration(localDuration)}</p>
          <button onClick={() => router.push("/astrologers")} className="px-8 py-3 bg-white text-black rounded-full font-bold hover:bg-gray-200">
            Return to Home
          </button>
        </div>
      )}

    </div>
  );
}
