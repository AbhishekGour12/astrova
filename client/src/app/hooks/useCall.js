"use client";
import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { io } from "socket.io-client";

export const useCall = (callId = null, identity = null) => {
  const router = useRouter();
  const user = useSelector((state) => state.auth.user);
  
  // Call States
  const [call, setCall] = useState(null);
  const [callStatus, setCallStatus] = useState('IDLE');
  const [duration, setDuration] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false); // Used for loading states
  const [lowBalanceAlert, setLowBalanceAlert] = useState(false);
  // Zego States
  const [zegoToken, setZegoToken] = useState(null);
  const [zegoRoomId, setZegoRoomId] = useState(null);
  const [appId, setAppId] = useState(Number(process.env.NEXT_PUBLIC_ZEGO_APP_ID));

  const socketRef = useRef(null);
  const durationIntervalRef = useRef(null);

  // ============================================================
  // 🟢 1. START CALL FUNCTION (Restored)
  // ============================================================
  const startCall = async (astrologerId, callType = "AUDIO") => {
    if (!user) {
      toast.error("Please login to start a call");
      router.push("/login");
      return null;
    }

    if (isConnecting) return null;

    try {
      setIsConnecting(true);
      
      // 1. Call Backend API
      const { data } = await api.post('/call/user/start', {
        astrologerId,
        callType
      });

      if (data.success) {
        // 2. Set Local State
        setCall(data.call);
        setCallStatus("WAITING");
        
        // 3. Return call data so UI can redirect
        return data.call;
      }

    } catch (error) {
      console.error("Start Call Error:", error);
      // Pass the specific error message back to UI
      throw error; 
    } finally {
      setIsConnecting(false);
    }
  };

  // ============================================================
  // 🔵 2. END CALL FUNCTION
  // ============================================================
  const endCall = async () => {
    if (!callId && !call?._id) return;
    try {
      const targetId = callId || call._id;
      await api.post(`/call/user/end/${targetId}`);
      setCallStatus("ENDED");
    } catch (error) {
      console.error("End call error", error);
    }
  };

  // ============================================================
  // 🟠 3. SOCKET & ACTIVE CALL MANAGEMENT
  // (Only runs if we have a callId passed to the hook)
  // ============================================================
  useEffect(() => {
    if (!user || !callId) return;
    // 1. Initial Fetch to get Wallet Balance IMMEDIATELY
    const fetchInitialData = async () => {
        try {
            const { data } = await api.get(`/call/status/${callId}`);
            if(data.success) {
                setCall(data.call);
                // 🔥 FIX: Set wallet immediately from API
                setWalletBalance(data.call.user.walletBalance);
                
                if(data.call.status === "ACTIVE") {
                   setCallStatus("CONNECTED");
                   setZegoRoomId(data.call.zegoRoomId);
                   fetchZegoToken(data.call.zegoRoomId);
                   startTimer(data.call.startedAt);
                }
            }
        } catch(e) { console.error(e); }
    };
    fetchInitialData();
    // Connect Socket
    socketRef.current = io(process.env.NEXT_PUBLIC_API, {
      transports: ["websocket", "polling"],
      reconnection: true,
    });

    const socket = socketRef.current;

    if (identity) {
      const userId = identity.replace('user_', '');
      socket.emit('joinUser', { userId });
    }
    socket.emit('joinCallRoom', { callId });

    // Listeners
    socket.on("callActivated", (data) => {
      setCallStatus("CONNECTED");
      if(data.zegoRoomId) {
        setZegoRoomId(data.zegoRoomId);
        fetchZegoToken(data.zegoRoomId);
      }
      startTimer(data.call?.startedAt || new Date());
    });

    
    // --- EVENTS ---
    socket.on("callActivated", (data) => {
      setCallStatus("CONNECTED");
      setZegoRoomId(data.zegoRoomId);
      fetchZegoToken(data.zegoRoomId);
      startTimer(data.call?.startedAt || new Date());
    });

    socket.on("walletUpdated", (data) => {
      console.log("💰 Wallet Updated:", data.walletBalance);
      setWalletBalance(data.walletBalance);
      // If balance is restored, remove warning
      if(data.walletBalance > (call?.ratePerMinute || 0)) {
          setLowBalanceAlert(false);
      }
    });
    // 🔥 FIX: Low Balance Warning Listener
    socket.on("lowBalanceWarning", (data) => {
        console.warn("⚠️ Low Balance Warning");
        setLowBalanceAlert(true);
        toast("⚠️ Recharge now! Call ends in 1 min.", {
            icon: "⏳",
            duration: 5000,
            style: { border: '1px solid #FFCC00', padding: '16px', color: '#333' },
        });
    });
    socket.on("forceDisconnect", () => {
      setCallStatus("ENDED");
      toast.error("Call ended: Insufficient Balance");
      cleanup();
    });

    socket.on("callEnded", () => {
      setCallStatus("ENDED");
      cleanup();
    });

    return () => {
      if (socket) socket.disconnect();
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    };
  }, [user, callId, identity]);

  // Helper: Fetch Token
  const fetchZegoToken = async (roomId) => {
    try {
      const { data } = await api.post('/call/zego-token', {
        roomId, userId: identity, userName: user?.name
      });
      if (data.success) setZegoToken(data.token);
    } catch (err) {
      console.error("Token error", err);
    }
  };

  // Helper: Timer
  const startTimer = (startTime) => {
    if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    const start = new Date(startTime).getTime();
    durationIntervalRef.current = setInterval(() => {
      setDuration(Math.floor((Date.now() - start) / 1000));
    }, 1000);
  };

  const cleanup = () => {
    if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
  };

  return {
    // Methods
    startCall, // <--- EXPORTED HERE
    endCall,
    
    // State
    call,
    callStatus,
    isConnecting,
    duration,
    walletBalance,
    zegoToken,
    zegoRoomId,
    appId,
    lowBalanceAlert, // Export this
    
    // Utilities
    zegoReady: !!(zegoToken && zegoRoomId),
    formatDuration: (s) => new Date(s * 1000).toISOString().substr(11, 8)
  };
};