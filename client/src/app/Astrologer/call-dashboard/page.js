"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { io } from "socket.io-client";
import api from "../../lib/api";
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
  FaBell,
  FaHistory,
  FaMoneyBillWave,
  FaChartLine,
  FaCog,
  FaSignOutAlt,
  FaUserCircle,
  FaToggleOn,
  FaToggleOff,
  FaArrowRight,
  FaVideo,
  FaStop
} from "react-icons/fa";
import { useZego } from "../../hooks/useZego";

export default function AstrologerCallDashboard() {
  const router = useRouter();
  
  // State for Zego parameters
  const [zegoToken, setZegoToken] = useState(null);
  const [zegoRoomId, setZegoRoomId] = useState(null);
  const [appId, setAppId] = useState(Number(process.env.NEXT_PUBLIC_ZEGO_APP_ID));
  const [zegoEnabled, setZegoEnabled] = useState(false);
  
  // Dashboard states
  const [incomingCalls, setIncomingCalls] = useState([]);
  const [activeCall, setActiveCall] = useState(null);
  const [callHistory, setCallHistory] = useState([]);
  const [earnings, setEarnings] = useState({ today: 0, weekly: 0, monthly: 0 });
  const [socket, setSocket] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [callTimer, setCallTimer] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [totalCalls, setTotalCalls] = useState(0);
  const [avgDuration, setAvgDuration] = useState("00:00");
  const [loading, setLoading] = useState(true);
  const [astrologerId, setAstrologerId] = useState(null);
  const [isCallConnected, setIsCallConnected] = useState(false);

  // Initialize Zego
  const { 
    containerRef, 
    connected: zegoConnected, 
    loading: zegoLoading,
    error: zegoError 
  } = useZego({
    appId: appId,
    token: zegoToken || "dummy_token",
    roomId: zegoRoomId,
    userId: astrologerId ? `astrologer_${astrologerId}` : null,
    userName: "Astrologer",
    enabled: zegoEnabled && !!zegoRoomId && !!astrologerId
  });

  // Initialize socket
  useEffect(() => {
  
    const id = localStorage.getItem("astrologer_id");
    if (!id) {
      router.push("/astrologer/login");
      return;
    }
    setAstrologerId(id);

    const newSocket = io(process.env.NEXT_PUBLIC_API, {
      transports: ["websocket", "polling"],
    });

    setSocket(newSocket);
    newSocket.emit("joinAstrologer", { astrologerId: id });

    // Socket event listeners
    newSocket.on("incomingCall", (data) => {
      console.log("📞 Incoming call:", data);
      const callData = data.call || data;
      const callId = callData._id || data.callId;
      
      setIncomingCalls(prev => {
        const existingCall = prev.find(call => call._id === callId);
        if (existingCall) return prev;
        
        return [...prev, { 
          ...callData, 
          _id: callId,
          receivedAt: new Date(),
          status: "WAITING"
        }];
      });
      
      // Show toast notification
      toast.custom((t) => (
        <div className="bg-white rounded-xl shadow-2xl p-4 max-w-sm animate-pulse border-l-4 border-blue-500">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <FaPhone className="text-white text-lg" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Incoming Call</h3>
              <p className="text-sm text-gray-600">
                {callData.user?.name || "User"} wants to connect
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Type: {callData.callType || "AUDIO"} Call
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                await acceptCall(callId);
                toast.dismiss(t.id);
              }}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-2 rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all"
            >
              Accept
            </button>
            <button
              onClick={async () => {
                await rejectCall(callId);
                toast.dismiss(t.id);
              }}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-2 rounded-lg font-medium hover:from-red-600 hover:to-red-700 transition-all"
            >
              Reject
            </button>
          </div>
        </div>
      ), {
        duration: 30000,
        position: "top-right"
      });
    });

    // When call ends
    newSocket.on("callEnded", (data) => {
      console.log("Call ended:", data);
      handleCallEnd();
      toast.success(`Call ended. Earnings: ₹${data.totalAmount || 0}`);
    });
// Listen for user ending call
newSocket.on("callEndedByUser", (data) => {
  console.log("User ended call:", data);
  if (activeCall && activeCall._id === data.callId) {
    handleCallEnd();
    toast.success("User ended the call");
  }
});

// Listen for billing updates
newSocket.on("walletUpdated", (data) => {
  console.log("Wallet updated:", data);
  // You can show a notification or update UI if needed
});
    // Load initial data
   
    return () => {
      newSocket.disconnect();
      if (callTimer) {
        clearInterval(callTimer);
      }
    };
  }, []);
  useEffect(() =>{
    loadDashboardData()

  },[])

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const astrologerId = localStorage.getItem("astrologer_id");
       const history = await api.get(`call/astrologer/history`, {params: {
    astrologerId,
    limit: 5,
    page: 1
  }})
   if(history){
    setCallHistory(history.data.calls || [])
   }
      const [earningsRes, statsRes, historyRes] = await Promise.all([
        api.get(`/astrologer/earnings/summary`),
        api.get(`/astrologer/stats/calls`),
        api.get(`call/astrologer/history`, {params: {
    astrologerId,
    limit: 5,
    page: 1
  }})
      ]);
     
     

      // Earnings
      if (earningsRes.data.success) {
        setEarnings({
          today: earningsRes.data.today || 0,
          weekly: earningsRes.data.weekly || 0,
          monthly: earningsRes.data.monthly || 0
        });
      }

      // Stats
      if (statsRes.data.success) {
        setTotalCalls(statsRes.data.totalCalls || 0);
        setAvgDuration(statsRes.data.averageDuration || "00:00");
      }

      // History
      if (historyRes.data.success) {
        setCallHistory(historyRes.data.calls || []);
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

 
  // Update the acceptCall function in Astrologer Dashboard:

const acceptCall = async (callId) => {
  try {
    toast.loading("Accepting call...", { id: "accept-call" });
    
    const response = await api.post(`/call/astrologer/accept/${callId}/${astrologerId}`);
    
    toast.success("accept-call");
    
    if (response.data.success) {
      const callData = response.data.call;
      setActiveCall(callData);
      
      // Set Zego room ID
      const roomId = response.data.zegoRoomId || callData.zegoRoomId;
      if (roomId) {
        setZegoRoomId(roomId);
        setZegoEnabled(true);
      }
      
      // Remove from incoming calls
      setIncomingCalls(prev => prev.filter(call => call._id !== callId));
      
      // Join the call room via socket
      if (socket) {
        socket.emit("astrologerJoinCallRoom", {
          callId: callId,
          astrologerId: astrologerId
        });
      }
      
      // Start call
      setIsCallConnected(true);
      startCallTimer();
      
      toast.success("Call accepted!");
    }
  } catch (error) {
    toast.dismiss("accept-call");
    console.error("Accept call error:", error);
    
    if (error.response?.status === 403) {
      toast.error("Unauthorized. Please login again.");
    } else if (error.response?.status === 400) {
      toast.error(error.response.data.message || "Failed to accept call");
    } else {
      toast.error("Failed to accept call");
    }
  }
};

  // Reject call
  const rejectCall = async (callId) => {
    try {
      const response = await api.post(`/call/astrologer/reject/${callId}/${astrologerId}`, {
        reason: "Busy with another call"
      });
      
      if (response.data.success) {
        setIncomingCalls(prev => prev.filter(call => call._id !== callId));
        toast.success("Call rejected");
      }
    } catch (error) {
      console.error("Reject call error:", error);
      toast.error(error.response?.data?.message || "Failed to reject call");
    }
  };

  // End active call
  const endActiveCall = async () => {
    if (!activeCall) return;

    try {
      await api.post(`/call/astrologer/end/${activeCall._id}/${astrologerId}`);
     if (response.data.success) {
      // Emit socket event
      if (socket) {
        socket.emit("astrologerEndedCall", {
          callId: activeCall._id,
          astrologerId: astrologerId
        });
      }
      
      handleCallEnd();
      toast.success("Call ended successfully");
    }
    } catch (error) {
      console.error("End call error:", error);
      toast.error("Failed to end call");
    }
  };

  // Handle call end cleanup
  const handleCallEnd = () => {
    setIsCallConnected(false);
    setActiveCall(null);
    setZegoEnabled(false);
    setZegoRoomId(null);
    setZegoToken(null);
    
    if (callTimer) {
      clearInterval(callTimer);
      setCallTimer(null);
    }
    
    setCallDuration(0);
    loadDashboardData();
  };

  // Start call timer
  const startCallTimer = () => {
    if (callTimer) {
      clearInterval(callTimer);
    }
    
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    
    setCallTimer(timer);
  };

  // Format duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle mute (simplified - no Zego toggle needed)
  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast.success(isMuted ? "Unmuted" : "Muted");
  };

  // Toggle speaker
  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    toast.success(`Speaker ${isSpeakerOn ? "off" : "on"}`);
  };

  // Toggle online status
  const toggleOnlineStatus = async () => {
    try {
      const newStatus = !isOnline;
      const response = await api.put(`/astrologer/availability/${astrologerId}`, {
        isOnline: newStatus
      });
      
      if (response.data.success) {
        setIsOnline(newStatus);
        toast.success(newStatus ? "You're now online" : "You're now offline");
      }
    } catch (error) {
      console.error("Toggle status error:", error);
      toast.error("Failed to update status");
    }
  };

  // Refresh dashboard
  const refreshDashboard = () => {
    loadDashboardData();
    toast.success("Dashboard refreshed");
  };

  // Cleanup missed calls
  const cleanupMissedCalls = async () => {
    try {
      const response = await api.post(`/astrologer/calls/cleanup/${astrologerId}`);
      if (response.data.success) {
        setIncomingCalls([]);
        toast.success("Cleaned up old calls");
      }
    } catch (error) {
      console.error("Cleanup error:", error);
    }
  };

  if (!astrologerId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-xl">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaSignOutAlt className="text-red-500 text-3xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">Please login as an astrologer</p>
          <button
            onClick={() => router.push("/astrologer/login")}
            className="px-6 py-3 bg-gradient-to-r from-[#C06014] to-[#D47C3A] text-white rounded-full font-medium hover:from-[#D47C3A] hover:to-[#C06014] transition-all"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#C06014] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-8">
      {/* Header */}
      <div className="bg-white shadow-lg border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/astrologer/dashboard")}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaArrowLeft />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Call Dashboard</h1>
                <p className="text-gray-600 text-sm">Manage incoming calls and track earnings</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              {/* Online Status Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">Status:</span>
                <button
                  onClick={toggleOnlineStatus}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-medium ${
                    isOnline 
                      ? "bg-green-100 text-green-700 hover:bg-green-200" 
                      : "bg-red-100 text-red-700 hover:bg-red-200"
                  }`}
                >
                  {isOnline ? <FaToggleOn className="text-lg" /> : <FaToggleOff className="text-lg" />}
                  {isOnline ? "Online" : "Offline"}
                </button>
              </div>
              
              {/* Active Call Indicator */}
              {isCallConnected && activeCall && (
                <div className="flex items-center gap-2 bg-gradient-to-r from-green-100 to-emerald-100 px-3 py-1.5 rounded-full border border-green-300">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-700 font-medium">Live Call</span>
                  <span className="text-xs bg-white/80 px-2 py-0.5 rounded-full">
                    {formatDuration(callDuration)}
                  </span>
                </div>
              )}
              
              {/* Earnings Display */}
              <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-full border border-green-200">
                <FaWallet className="text-green-600" />
                <span className="font-bold text-green-700">₹{earnings.today}</span>
                <span className="text-xs text-green-600">Today</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Active Call & Incoming Calls */}
          <div className="lg:col-span-2 space-y-6">
            {/* ACTIVE CALL INTERFACE */}
            {isCallConnected && activeCall ? (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Active Call</h2>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm ${zegoConnected ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {zegoConnected ? 'Connected' : 'Connecting...'}
                    </span>
                  </div>
                </div>
                
                {/* Call Info */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <FaUser className="text-white text-2xl" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">
                          {activeCall.user?.name || "User"}
                        </h3>
                        <p className="text-gray-600">
                          {activeCall.callType === "VIDEO" ? "Video Call" : "Audio Call"}
                        </p>
                        <p className="text-sm text-gray-500">₹{activeCall.ratePerMinute || 100}/min</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-800">
                        {formatDuration(callDuration)}
                      </div>
                      <p className="text-sm text-gray-500">Call Duration</p>
                    </div>
                  </div>
                </div>

                {/* Zego Container */}
              <div className="mb-6">
  <div className="bg-gray-900 rounded-xl p-4 overflow-visible">
    <div className="text-white text-center mb-2">
      {activeCall.callType === "VIDEO" ? "Video Call" : "Voice Call"}
    </div>

    <div className="w-full h-[70vh] sm:h-[500px] bg-black rounded-lg overflow-y-auto">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  </div>
</div>



                {/* Call Controls */}
                <div className="flex justify-center gap-4">
                 
                  <button
                    onClick={endActiveCall}
                    className="p-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full hover:from-red-600 hover:to-red-700 transition-all"
                  >
                    <FaStop size={20} />
                  </button>
                </div>
              </div>
            ) : (
              /* NO ACTIVE CALL - Show incoming calls */
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaPhone className="text-3xl text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-700 mb-2">No Active Calls</h3>
                  <p className="text-gray-500 mb-6">You're ready to accept incoming calls</p>
                  <button
                    onClick={refreshDashboard}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            )}

            {/* INCOMING CALLS SECTION */}
            {!isCallConnected && incomingCalls.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                  <div className="flex items-center gap-2 mb-3 sm:mb-0">
                    <FaBell className="text-[#C06014]" />
                    <h2 className="text-xl font-bold text-gray-800">Incoming Calls</h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-[#C06014] text-white text-xs font-medium px-3 py-1 rounded-full">
                      {incomingCalls.length} waiting
                    </span>
                    {incomingCalls.length > 0 && (
                      <button
                        onClick={cleanupMissedCalls}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  {incomingCalls.map((call, index) => (
                    <div
                      key={call._id || index}
                      className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-blue-50 rounded-full flex items-center justify-center">
                            <FaUser className="text-blue-500" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-800">
                              {call.user?.name || "Unknown User"}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {call.callType === "VIDEO" ? "Video Call" : "Audio Call"} • ₹{call.ratePerMinute || 100}/min
                            </p>
                            <p className="text-xs text-gray-400">
                              {call.receivedAt ? `Waiting for ${Math.floor((new Date() - new Date(call.receivedAt)) / 1000)}s` : 'Just now'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => acceptCall(call._id)}
                            className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium text-sm hover:from-green-600 hover:to-green-700 transition-all flex items-center gap-2"
                          >
                            <FaPhone className="text-xs" />
                            Accept
                          </button>
                          <button
                            onClick={() => rejectCall(call._id)}
                            className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium text-sm hover:from-red-600 hover:to-red-700 transition-all flex items-center gap-2"
                          >
                            <FaPhoneSlash className="text-xs" />
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Stats & Actions */}
          <div className="space-y-6">
            {/* Earnings Stats */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-800">Earnings Overview</h3>
                <FaMoneyBillWave className="text-[#C06014]" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                  <span className="text-gray-600">Today</span>
                  <span className="font-bold text-green-700">₹{earnings.today}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                  <span className="text-gray-600">This Week</span>
                  <span className="font-bold text-blue-700">₹{earnings.weekly}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg">
                  <span className="text-gray-600">This Month</span>
                  <span className="font-bold text-purple-700">₹{earnings.monthly}</span>
                </div>
              </div>
              
              <button
                onClick={() => router.push("/astrologer/earnings")}
                className="w-full mt-6 py-3 bg-gradient-to-r from-[#C06014] to-[#D47C3A] text-white rounded-xl font-medium hover:from-[#D47C3A] hover:to-[#C06014] transition-all flex items-center justify-center gap-2"
              >
                <FaChartLine />
                View Detailed Report
              </button>
            </div>

            {/* Call Statistics */}
            <div className="bg-gradient-to-r from-[#003D33] to-[#00695C] rounded-2xl p-6 text-white">
              <h3 className="text-lg font-bold mb-6">Call Statistics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Total Calls</span>
                  <span className="font-bold text-xl">{totalCalls}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Average Duration</span>
                  <span className="font-bold text-xl">{avgDuration}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Response Rate</span>
                  <span className="font-bold text-xl">95%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>User Rating</span>
                  <span className="font-bold text-xl">4.8/5</span>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-white/20">
                <div className="text-sm text-white/70">
                  <p>Keep your status online to receive more calls</p>
                  <p className="mt-1">Quick response increases user satisfaction</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => router.push("/astrologer/profile")}
                  className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FaUserCircle className="text-gray-400" />
                    <span className="font-medium text-gray-700">Update Profile</span>
                  </div>
                  <FaArrowRight className="text-gray-400" />
                </button>
                
                <button
                  onClick={() => router.push("/astrologer/settings")}
                  className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FaCog className="text-gray-400" />
                    <span className="font-medium text-gray-700">Call Settings</span>
                  </div>
                  <FaArrowRight className="text-gray-400" />
                </button>
                
                <button
                  onClick={() => router.push("/astrologer/call-history")}
                  className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FaHistory className="text-gray-400" />
                    <span className="font-medium text-gray-700">Call History</span>
                  </div>
                  <FaArrowRight className="text-gray-400" />
                </button>
                
                <button
                  onClick={() => {
                    localStorage.removeItem("astrologer_token");
                    localStorage.removeItem("astrologer_id");
                    router.push("/astrologer/login");
                  }}
                  className="w-full flex items-center justify-between p-3 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FaSignOutAlt className="text-red-500" />
                    <span className="font-medium text-red-600">Logout</span>
                  </div>
                  <FaArrowRight className="text-red-400" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Call History */}
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800">Recent Call History</h3>
            <button
              onClick={() => router.push("/astrologer/call-history")}
              className="text-sm text-[#C06014] font-medium hover:text-[#A84F12]"
            >
              View All
            </button>
          </div>
          
          {callHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 text-gray-600 font-medium">User</th>
                    <th className="text-left py-3 text-gray-600 font-medium">Type</th>
                    <th className="text-left py-3 text-gray-600 font-medium">Duration</th>
                    <th className="text-left py-3 text-gray-600 font-medium">Earnings</th>
                    <th className="text-left py-3 text-gray-600 font-medium">Status</th>
                    <th className="text-left py-3 text-gray-600 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {callHistory.map((call, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                          <span>{call.user?.name || "User"}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          call.callType === "VIDEO" 
                            ? "bg-purple-100 text-purple-700" 
                            : "bg-blue-100 text-blue-700"
                        }`}>
                          {call.callType || "AUDIO"}
                        </span>
                      </td>
                      <td className="py-3">{call.totalMinutes || 0} min</td>
                      <td className="py-3 font-medium text-green-600">₹{call.totalAmount || 0}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          call.status === "ENDED" 
                            ? "bg-green-100 text-green-700" 
                            : call.status === "MISSED"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                          {call.status}
                        </span>
                      </td>
                      <td className="py-3 text-sm text-gray-500">
                        {new Date(call.endedAt || call.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No call history yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}