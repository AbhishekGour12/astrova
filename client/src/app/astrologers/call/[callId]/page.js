"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { useCall } from "../../../hooks/useCall";
import { useZego } from "../../../hooks/useZego";
import { io } from "socket.io-client"; // ADD THIS IMPORT
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
  FaExclamationTriangle,
  FaInfoCircle,
  FaSync
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

  // Use call hook
  const {
    call,
    callStatus,
    duration,
    walletBalance,
    isMuted,
    isSpeakerOn,
    isConnecting,
    zegoReady,
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

  // Update the socket setup in UserCallPage:

useEffect(() => {
  if (!user?._id || !callId) return;

  const newSocket = io(process.env.NEXT_PUBLIC_API, {
    transports: ["websocket", "polling"],
  });

  setSocket(newSocket);
  newSocket.emit("joinUser", { userId: user._id });
  newSocket.emit("joinCallRoom", { callId });

  // Listen for call activation
  newSocket.on("callActivated", (data) => {
    console.log("🎉 Call activated received:", data);
    
    // Update local state
    if (data.zegoRoomId) {
      setZegoRoomId(data.zegoRoomId);
      setZegoEnabled(true);
      toast.success("Call connected! Setting up audio...");
    }
  });

  // Listen for astrologer joining
  newSocket.on("astrologerJoinedCall", (data) => {
    console.log("👤 Astrologer joined call:", data);
    setPeerJoined(true);
  });

  return () => {
    newSocket.disconnect();
  };
}, [user?._id, callId]);

  // Fetch Zego token function
  const fetchZegoToken = useCallback(async () => {
    if (!zegoRoomId || !identity) return null;
    
    setIsFetchingToken(true);
    try {
      console.log("🔄 Setting up Zego audio...");
      
      // Always use test token generation for now (simpler)
      const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET;
      
      if (!serverSecret) {
        toast.error("Audio setup failed: Server secret missing");
        return null;
      }
      
      setZegoEnabled(true); // Enable Zego
      
      toast.success("Audio setup complete!");
      return { success: true };
    } catch (error) {
      console.error("❌ Zego setup error:", error);
      toast.error("Failed to setup audio connection");
    } finally {
      setIsFetchingToken(false);
    }
    return null;
  }, [zegoRoomId, identity]);

  // Setup Zego when we have room ID
  useEffect(() => {
    if (zegoRoomId && !zegoToken) {
      console.log("🔄 Zego room available, setting up...");
      fetchZegoToken();
    }
  }, [zegoRoomId, zegoToken, fetchZegoToken]);

  // Initialize Zego when we have all parameters
  const { 
    containerRef, 
    connected: zegoConnected, 
    loading: zegoLoading, 
    error: zegoJoinError,
    zegoLoaded
  } = useZego({
    appId: appId,
    token: "dummy_token", // Not needed for test token generation
    roomId: zegoRoomId,
    userId: identity,
    userName: user?.name || "User",
    enabled: zegoEnabled && !!zegoRoomId && !!identity
  });

  // Update peer joined status
  useEffect(() => {
    if (zegoConnected) {
      setPeerJoined(true);
      toast.success("Connected to voice call!");
    }
  }, [zegoConnected, setPeerJoined]);

  // Handle Zego errors
  useEffect(() => {
    if (zegoJoinError) {
      console.error("Zego join error:", zegoJoinError);
      toast.error(`Audio error: ${zegoJoinError}`);
    }
  }, [zegoJoinError]);

  // Handle end call
  const handleEndCall = async () => {
    if (isLeaving) return;

    setIsLeaving(true);
    try {
      await endCall();
      setTimeout(() => router.push("/astrologers"), 2000);
    } catch (error) {
      console.error("Error ending call:", error);
      toast.error("Failed to end call");
    } finally {
      setIsLeaving(false);
    }
  };

  // Status messages
  const getStatusMessage = () => {
    switch (callStatus) {
      case "WAITING":
        return {
          title: "Waiting for Astrologer",
          message: "Your call request has been sent. Waiting for astrologer to accept...",
          icon: "⏳",
          color: "text-yellow-500",
          bgColor: "bg-yellow-50",
          showControls: false
        };
      case "RINGING":
        return {
          title: "Connecting...",
          message: "Astrologer has accepted. Connecting call...",
          icon: "📞",
          color: "text-blue-500",
          bgColor: "bg-blue-50",
          showControls: true
        };
      case "CONNECTED":
        if (zegoConnected) {
          return {
            title: "Call Connected",
            message: `You are now connected with ${call?.astrologer?.fullName || 'Astrologer'}`,
            icon: "🎧",
            color: "text-green-500",
            bgColor: "bg-green-50",
            showControls: true
          };
        } else {
          return {
            title: "Setting Up Audio",
            message: "Connecting to audio server...",
            icon: "🔊",
            color: "text-blue-500",
            bgColor: "bg-blue-50",
            showControls: true
          };
        }
      default:
        return {
          title: "Initializing",
          message: "Setting up your call...",
          icon: "⚙️",
          color: "text-gray-500",
          bgColor: "bg-gray-50",
          showControls: false
        };
    }
  };

  const statusInfo = getStatusMessage();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#003D33] to-[#001F1A] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaTimes className="text-red-500 text-3xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Login Required</h2>
          <p className="text-gray-600 mb-6">Please login to access calls</p>
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-3 bg-gradient-to-r from-[#C06014] to-[#D47C3A] text-white rounded-full font-medium"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#003D33] to-[#001F1A] text-white">
      <div className="container mx-auto px-4 py-4 sm:py-6 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <button
            onClick={() => router.push("/astrologers")}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <FaArrowLeft className="text-lg" />
          </button>
          
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-bold">Voice Call</h1>
            <p className="text-white/70 text-sm">
              {call?.astrologer?.fullName || "Astrologer"}
            </p>
            <div className="flex items-center justify-center gap-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${
                callStatus === 'CONNECTED' && zegoConnected ? 'bg-green-500 animate-pulse' : 
                callStatus === 'CONNECTED' ? 'bg-yellow-500' : 'bg-gray-500'
              }`}></div>
              <span className="text-xs">{statusInfo.title}</span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
              <FaWallet className="text-yellow-400" />
              <span className="font-bold">₹{walletBalance}</span>
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div className={`${statusInfo.bgColor} rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8 relative z-10`}>
          <div className="flex flex-col items-center">
            {/* Profile Image */}
            <div className="relative mb-6">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-r from-[#C06014] to-[#D47C3A] flex items-center justify-center overflow-hidden">
                {call?.astrologer?.profileImageUrl ? (
                  <img
                    src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${call.astrologer.profileImageUrl}`}
                    alt={call.astrologer.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FaUser className="text-4xl sm:text-5xl text-white" />
                  </div>
                )}
              </div>
              
              {/* Status Animation */}
              {(callStatus === "CONNECTED" && zegoConnected) && (
                <div className="absolute inset-0 rounded-full border-4 border-green-500/30 animate-ping"></div>
              )}
            </div>
            
            {/* Call Info */}
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-800">
              {call?.astrologer?.fullName || "Astrologer"}
            </h2>
            
            {/* Duration/Status */}
            <div className="text-4xl sm:text-5xl font-mono font-bold mb-4 text-[#C06014]">
              {(callStatus === "CONNECTED" && zegoConnected) 
                ? formatDuration(duration)
                : statusInfo.icon}
            </div>
            
            {/* Status Message */}
            <div className={`text-center mb-6 ${statusInfo.color}`}>
              <h3 className="text-lg sm:text-xl font-semibold mb-1">
                {statusInfo.title}
              </h3>
              <p className="text-sm sm:text-base opacity-90 max-w-md">
                {statusInfo.message}
              </p>
              
              {/* Connection status */}
              {callStatus === "CONNECTED" && !zegoConnected && (
                <div className="mt-4">
                  <div className="flex items-center justify-center gap-2">
                    <FaSpinner className="animate-spin" />
                    <span className="text-sm">
                      {isFetchingToken ? "Fetching audio token..." : 
                       zegoLoading ? "Connecting to audio..." : 
                       "Setting up audio..."}
                    </span>
                  </div>
                  
                  {!zegoLoaded && (
                    <p className="text-xs mt-2 text-yellow-600">
                      Loading audio SDK...
                    </p>
                  )}
                </div>
              )}
            </div>
            
            {/* Rate Info */}
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <FaClock />
              <span>Rate: ₹{call?.ratePerMinute || 10}/min</span>
            </div>
          </div>
        </div>

        {/* Zego Audio Interface */}
        {isClient && zegoRoomId && zegoEnabled && (
          <div className="fixed inset-0 z-40">
            <div ref={containerRef} className="w-full h-full" />
            
            {/* Loading overlay */}
            {!zegoConnected && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 p-6 rounded-2xl text-center backdrop-blur-sm">
                <FaSpinner className="animate-spin text-4xl text-white mx-auto mb-4" />
                <p className="text-white text-lg font-semibold">Connecting Audio...</p>
                <p className="text-gray-300 text-sm mt-2">
                  Please wait while we connect you
                </p>
              </div>
            )}
          </div>
        )}

        {/* Call Controls */}
        {statusInfo.showControls && (
          <div className="flex justify-center gap-4 sm:gap-8 mb-8 relative z-50">
            {/* Mute Button */}
            <button
              onClick={toggleMute}
              disabled={!zegoConnected || isLeaving}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all shadow-lg ${
                zegoConnected && !isLeaving
                  ? isMuted
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
                  : "bg-gray-700 text-gray-400 cursor-not-allowed"
              }`}
            >
              {isMuted ? (
                <FaMicrophoneSlash className="text-lg sm:text-xl" />
              ) : (
                <FaMicrophone className="text-lg sm:text-xl" />
              )}
            </button>
            
            {/* Speaker Button */}
            <button
              onClick={toggleSpeaker}
              disabled={!zegoConnected || isLeaving}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all shadow-lg ${
                zegoConnected && !isLeaving
                  ? isSpeakerOn
                    ? "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
                    : "bg-gray-700 text-gray-400"
                  : "bg-gray-700 text-gray-400 cursor-not-allowed"
              }`}
            >
              {isSpeakerOn ? (
                <FaVolumeUp className="text-lg sm:text-xl" />
              ) : (
                <FaVolumeMute className="text-lg sm:text-xl" />
              )}
            </button>
            
            {/* End Call Button */}
            <button
              onClick={handleEndCall}
              disabled={isLeaving}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all shadow-lg ${
                isLeaving
                  ? "bg-gray-700 cursor-not-allowed"
                  : "bg-red-500 text-white hover:bg-red-600"
              }`}
            >
              {isLeaving ? (
                <FaSpinner className="animate-spin text-lg sm:text-xl" />
              ) : (
                <FaPhoneSlash className="text-lg sm:text-xl" />
              )}
            </button>
          </div>
        )}

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 bg-gray-900/70 p-4 rounded-xl text-xs">
            <div className="text-yellow-400 mb-2">DEBUG:</div>
            <div className="grid grid-cols-2 gap-1">
              <div>Call Status: <span className="text-green-400">{callStatus}</span></div>
              <div>Zego Loaded: <span className={zegoLoaded ? 'text-green-400' : 'text-red-400'}>{zegoLoaded ? 'Yes' : 'No'}</span></div>
              <div>Room ID: <span className="text-blue-400">{zegoRoomId?.substring(0, 15) || 'None'}</span></div>
              <div>Zego Enabled: <span className={zegoEnabled ? 'text-green-400' : 'text-red-400'}>{zegoEnabled ? 'Yes' : 'No'}</span></div>
              <div>Zego Connected: <span className={zegoConnected ? 'text-green-400' : 'text-red-400'}>{zegoConnected ? 'Yes' : 'No'}</span></div>
              <div>Peer Joined: <span className={peerJoined ? 'text-green-400' : 'text-yellow-400'}>{peerJoined ? 'Yes' : 'No'}</span></div>
            </div>
          </div>
        )}

        {/* Manual Test Button (for debugging) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-4 bg-blue-500/20 rounded-xl text-center">
            <button
              onClick={() => {
                console.log("Manual test - Simulating call activation");
                setZegoRoomId("test_room_" + Date.now());
                setZegoEnabled(true);
                toast.success("Test: Zego enabled");
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Test Zego Connection
            </button>
            <p className="text-blue-200 text-xs mt-2">
              Use this to test audio without waiting for astrologer
            </p>
          </div>
        )}
      </div>
    </div>
  );
}