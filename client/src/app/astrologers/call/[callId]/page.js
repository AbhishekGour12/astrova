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
  //  FIXED TIMER LOGIC (Resilient to re-renders)
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
    // MAIN WRAPPER: Force strict overflow hidden and viewport height
    <div className="fixed inset-0 w-full h-[100dvh] max-w-full overflow-hidden bg-black touch-none">
      
      {/* LAYER 1: ZEGO INTERFACE */}
      <div 
        className={`fixed inset-0 z-40 w-full transition-all duration-300 ease-in-out bg-gray-900
        ${isVideoMode ? 'opacity-100' : ' opacity-0'}
        `}
      >
        {isClient && zegoEnabled && (
          // ✅ FIX: Added [&_*] classes to force EVERY child element to fit width
          <div className="relative w-screen h-[100dvh] overflow-hidden">
          <div 
            ref={containerRef} 
            id="zego-root"
            className="absolute inset-0  overflow-hidden"
          />
          </div>
        )}

        {/* Timer Overlay */}
        {isVideoMode && (
          <div className="absolute top-12 md:top-8 left-0 w-full flex flex-col items-center z-50 pointer-events-none px-4">
            <h3 className="text-white font-bold text-lg drop-shadow-md bg-black/30 px-4 py-1 rounded-full backdrop-blur-sm mb-2 max-w-[90%] truncate">
              {call?.astrologer?.fullName}
            </h3>
            <div className="bg-red-600/90 text-white px-6 py-1 rounded-full font-mono text-xl shadow-lg backdrop-blur-md">
              {formatDuration(displayDuration)}
            </div>
          </div>
        )}
      </div>

      {/* LAYER 2: CONNECTING UI (Non-Zego Mode) */}
      {!isVideoMode && (
        <div className="absolute inset-0 z-30 bg-gradient-to-b from-[#003D33] to-[#001F1A] flex flex-col w-full h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 pt-8 w-full max-w-4xl mx-auto z-10">
            <button onClick={() => router.push("/astrologers")} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition">
               <FaArrowLeft className="text-white" />
            </button>
            <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm">
               <FaWallet className="text-yellow-400" />
               <span className="text-white font-bold">₹{walletBalance}</span>
            </div>
          </div>

          {/* Centered Card */}
          <div className="flex-1 flex flex-col items-center justify-center p-4 w-full">
            <div className="bg-white/10 backdrop-blur-md border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col items-center shadow-2xl w-full max-w-[90%] md:max-w-sm mx-auto">
              <div className="relative mb-6">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white/20 overflow-hidden bg-gray-700 shadow-xl">
                  {call?.astrologer?.profileImageUrl ? (
                     <img src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${call.astrologer.profileImageUrl}`} className="w-full h-full object-cover" />
                  ) : (
                     <FaUser className="w-full h-full p-6 text-gray-400" />
                  )}
                </div>
                {callStatus === "RINGING" && <div className="absolute inset-0 rounded-full border-4 border-green-400/50 animate-ping" />}
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-2 text-center">{call?.astrologer?.fullName || "Astrologer"}</h2>
              <p className={`text-base md:text-lg font-medium mb-6 text-center ${callStatus === 'RINGING' ? 'text-green-400' : 'text-gray-300'}`}>
                {statusInfo.message}
              </p>
              {callStatus === "CONNECTED" && !zegoConnected && (
               <div className="flex items-center gap-3 text-yellow-400 text-sm md:text-base animate-pulse">
                  <FaSpinner className="animate-spin" /><span>Connecting secure line...</span>
               </div>
              )}
            </div>
          </div>
          <div className="h-[20vh] w-full shrink-0" />
        </div>
      )}

      {/* LAYER 3: BOTTOM CONTROLS */}
      {shouldShowCallControls && (
        <div className={`fixed bottom-0 left-0 w-full z-50 flex items-center justify-center transition-all duration-300 pb-4
          ${isVideoMode ? "h-[15dvh] bg-[#111] rounded-t-3xl border-t border-white/10" : "h-[20vh] bg-transparent"}`}>
          <div className="flex items-center gap-6 md:gap-10">
            <button onClick={toggleMute} className={`p-4 rounded-full transition-all shadow-lg ${isMuted ? 'bg-white text-black' : 'bg-gray-700/80 text-white backdrop-blur-md'}`}>
              {isMuted ? <FaMicrophoneSlash size={22} /> : <FaMicrophone size={22} />}
            </button>
            <button onClick={handleEndCall} className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white shadow-xl hover:bg-red-700 active:scale-95 transition-all">
               {isLeaving ? <FaSpinner className="animate-spin" size={28} /> : <FaPhoneSlash size={28} />}
            </button>
            <button onClick={toggleSpeaker} className={`p-4 rounded-full transition-all shadow-lg ${isSpeakerOn ? 'bg-white text-black' : 'bg-gray-700/80 text-white backdrop-blur-md'}`}>
              {isSpeakerOn ? <FaVolumeUp size={22} /> : <FaVolumeMute size={22} />}
            </button>
          </div>
        </div>
      )}

      {/* LAYER 4: CALL ENDED OVERLAY */}
      {(callEndedByAstrologer || callStatus === "ENDED") && (
        <div className="fixed inset-0 z-[60] bg-black/95 flex flex-col items-center justify-center text-white px-4">
          <div className="bg-gray-900/50 p-8 rounded-3xl border border-white/10 flex flex-col items-center max-w-sm w-full">
            <FaPhoneSlash className="text-red-500 text-4xl mb-6" />
            <h2 className="text-2xl font-bold mb-2">Call Ended</h2>
            <p className="text-gray-400 mb-8 font-mono bg-black/30 px-4 py-1 rounded-lg">Duration: {formatDuration(localDuration)}</p>
            <button onClick={() => router.push("/astrologers")} className="w-full py-3 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition">Return to Home</button>
          </div>
        </div>
      )}
    </div>
  );
}