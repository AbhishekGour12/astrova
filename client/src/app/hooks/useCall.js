"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '../lib/api';

export const useCall = (callId, identity) => {
  const router = useRouter();
  const user = useSelector((state) => state.auth.user);
  
  const [call, setCall] = useState(null);
  const [callStatus, setCallStatus] = useState('IDLE');
  const [duration, setDuration] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [peerJoined, setPeerJoined] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [zegoToken, setZegoToken] = useState(null);
  const [zegoRoomId, setZegoRoomId] = useState(null);
  const [appId, setAppId] = useState(null);
  
  const durationIntervalRef = useRef(null);
  const socketRef = useRef(null);
  const walletCheckIntervalRef = useRef(null);
  const callStartedAtRef = useRef(null);

  // Check if component is mounted and client-side
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // ==============================================
  // 🔥 CRITICAL: FETCH WALLET BALANCE REGULARLY
  // ==============================================
  const fetchWalletBalance = useCallback(async () => {
    if (!user || !isMounted) return;
    
    try {
      const response = await api.get('/auth/wallet');
      if (response.data.balance !== undefined) {
        const newBalance = response.data.balance;
        setWalletBalance(newBalance);
        return newBalance;
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
    }
    return null;
  }, [user, isMounted]);

  // ==============================================
  // 🔥 SETUP WALLET BALANCE MONITORING
  // ==============================================
  useEffect(() => {
    // Initial fetch
    if (user && isMounted) {
      fetchWalletBalance();
    }

    // Clear any existing interval
    if (walletCheckIntervalRef.current) {
      clearInterval(walletCheckIntervalRef.current);
    }

    // Set up interval to check wallet balance regularly during active calls
    if ((callStatus === 'CONNECTED' || callStatus === 'ACTIVE') && isMounted) {
      // Check immediately and then every 10 seconds
      walletCheckIntervalRef.current = setInterval(() => {
        fetchWalletBalance();
      }, 10000); // Every 10 seconds
    }

    return () => {
      if (walletCheckIntervalRef.current) {
        clearInterval(walletCheckIntervalRef.current);
        walletCheckIntervalRef.current = null;
      }
    };
  }, [callStatus, user, isMounted, fetchWalletBalance]);

  // Initialize socket only on client side
  useEffect(() => {
    if (!isMounted || typeof window === 'undefined') return;

    // Initialize socket
    socketRef.current = window.io?.(process.env.NEXT_PUBLIC_API, {
      transports: ["websocket", "polling"],
    });

    if (socketRef.current) {
      if (identity?.startsWith('user_')) {
        const userId = identity.replace('user_', '');
        socketRef.current.emit('joinUser', { userId });
      }

      if (callId) {
        socketRef.current.emit('joinCallRoom', { callId });
      }

      // Set up socket listeners
      setupSocketListeners();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      stopCallTimer();
    };
  }, [isMounted, callId, identity]);

  const setupSocketListeners = () => {
    if (!socketRef.current) return;

    socketRef.current.on("callActivated", (data) => {
      console.log("🎉 Call activated via socket:", data);
      
      setCallStatus("CONNECTED");
      setIsConnecting(false);
      
      if (data.call?.startedAt) {
        callStartedAtRef.current = new Date(data.call.startedAt);
      } else {
        callStartedAtRef.current = new Date();
      }
      
      if (data.call) {
        setCall(prev => ({
          ...prev,
          ...data.call,
          zegoRoomId: data.call.zegoRoomId || data.zegoRoomId
        }));
        
        if (data.call.zegoRoomId || data.zegoRoomId) {
          fetchZegoTokenForRoom(data.call.zegoRoomId || data.zegoRoomId);
        }
      }
      
      startCallTimer();
      
      // 🔥 Update wallet balance when call starts
      fetchWalletBalance();
      
      toast.success("Call connected!");
    });

    socketRef.current.on("astrologerJoinedCall", (data) => {
      console.log("Astrologer joined call:", data);
      setPeerJoined(true);
      toast.success("Astrologer has joined the call");
    });
      
    socketRef.current.on('callEnded', (data) => {
      console.log("Call ended event received:", data);
      setCallStatus('ENDED');
      stopCallTimer();
      
      if (data.endedBy === "user") {
        toast.success('You ended the call');
      } else if (data.endedBy === "astrologer") {
        toast.success('Astrologer ended the call');
      } else {
        toast.success(`Call ended. Duration: ${formatDuration(duration)}`);
      }
      
      // 🔥 Fetch final wallet balance when call ends
      setTimeout(() => fetchWalletBalance(), 1000);
    });

    socketRef.current.on('callRejected', (data) => {
      setCallStatus('REJECTED');
      toast.error('Call rejected by astrologer');
    });

    socketRef.current.on('callMissed', (data) => {
      setCallStatus('MISSED');
      toast.error('Astrologer did not answer');
    });
    
    // Listen for specific astrologer ended call event
    socketRef.current.on('callEndedByAstrologer', (data) => {
      console.log("Astrologer ended the call:", data);
      setCallStatus('ENDED');
      stopCallTimer();
      toast.success("Astrologer ended the call");
      
      // 🔥 Fetch final wallet balance
      setTimeout(() => fetchWalletBalance(), 1000);
    });

    // 🔥 CRITICAL: LISTEN FOR WALLET UPDATES DURING CALL
    socketRef.current.on('walletUpdated', (data) => {
      console.log("💰 Wallet updated via socket:", data);
      if (data.walletBalance !== undefined) {
        setWalletBalance(data.walletBalance);
        
        // Show notification for deductions
        if (data.amountDeducted) {
          console.log(`💸 Deducted ₹${data.amountDeducted}. New balance: ₹${data.walletBalance}`);
        }
      }
    });

    // 🔥 Listen for minute billed events
    socketRef.current.on('minuteBilled', (data) => {
      console.log("⏰ Minute billed:", data);
      if (data.walletBalance !== undefined) {
        setWalletBalance(data.walletBalance);
        
        // Show toast for deduction
        toast.success(
          <div className="flex items-center gap-2">
            <span>₹{data.amount} deducted</span>
            <span className="text-sm">(Balance: ₹{data.walletBalance})</span>
          </div>,
          { duration: 3000 }
        );
      }
    });

    // 🔥 Listen for low balance warnings
    socketRef.current.on('lowBalanceWarning', (data) => {
      console.log("⚠️ Low balance warning:", data);
      toast.warning(
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span>⚠️ Low Balance!</span>
          </div>
          <div className="text-sm">
            Only ₹{data.currentBalance} left. {data.minutesLeft} minute(s) remaining.
          </div>
        </div>,
        { duration: 5000 }
      );
    });
  };

  const startCallTimer = () => {
    stopCallTimer();
    
    let initialDuration = 0;
    if (callStartedAtRef.current) {
      const now = new Date();
      initialDuration = Math.floor((now - callStartedAtRef.current) / 1000);
    }
    
    setDuration(initialDuration);
    
    durationIntervalRef.current = setInterval(() => {
      setDuration(prev => {
        if (callStartedAtRef.current) {
          const now = new Date();
          return Math.floor((now - callStartedAtRef.current) / 1000);
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopCallTimer = () => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    callStartedAtRef.current = null;
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateDurationFromBackend = (callData) => {
    if (!callData?.startedAt) return 0;
    
    const startedAt = new Date(callData.startedAt);
    const now = new Date();
    return Math.max(0, Math.floor((now - startedAt) / 1000));
  };

  // Fetch call data if callId is provided
  useEffect(() => {
    if (callId && isMounted) {
      const fetchCallData = async () => {
        try {
          const response = await api.get(`/call/status/${callId}`);
          if (response.data.success) {
            const callData = response.data.call;
            setCall(callData);
            setCallStatus(callData.status);
            
            // 🔥 Fetch wallet balance when loading call
            fetchWalletBalance();
            
            if (callData.status === 'ACTIVE' && callData.startedAt) {
              callStartedAtRef.current = new Date(callData.startedAt);
              const initialDuration = calculateDurationFromBackend(callData);
              setDuration(initialDuration);
              startCallTimer();
            }
          }
        } catch (error) {
          console.error('Fetch call error:', error);
        }
      };
      
      fetchCallData();
    }
  }, [callId, isMounted, fetchWalletBalance]);

  const fetchZegoTokenForRoom = async (roomId) => {
    try {
      console.log("🔑 Fetching Zego token for room:", roomId);
      
      const response = await api.post('/call/zego-token', {
        roomId: roomId,
        userId: identity,
        userName: user?.name || 'User'
      });
      
      if (response.data.success) {
        console.log("✅ Zego token received");
        setZegoToken(response.data.token);
        setZegoRoomId(response.data.roomId);
        setAppId(response.data.appId);
        return response.data;
      }
    } catch (error) {
      console.error("❌ Failed to fetch Zego token:", error);
    }
    return null;
  };

  const fetchZegoToken = useCallback(async () => {
    try {
      const response = await api.post('/call/zego-token', {
        roomId: zegoRoomId || call?.zegoRoomId,
        userId: identity,
        userName: user?.name || 'User'
      });
      
      if (response.data.success) {
        return response.data;
      }
    } catch (error) {
      console.error('Failed to fetch Zego token:', error);
      throw error;
    }
    return null;
  }, [call, identity, user]);

  // Start a new call - SIMPLIFIED
  const startCall = async (astrologerId) => {
    if (!isMounted || !user) {
      toast.error('Please login to start a call');
      return null;
    }

    if (isConnecting) {
      toast.loading('Already starting a call...');
      return null;
    }

    try {
      setIsConnecting(false);
      toast.loading('Starting call...');

      const response = await api.post('/call/user/start', {
        astrologerId,
        callType: 'AUDIO'
      });

      if (response.data.success) {
        const newCall = response.data.call;
        setCall(newCall);
        setCallStatus('WAITING');
        
        // 🔥 Fetch wallet balance when starting call
        fetchWalletBalance();
        
        toast.success('Call request sent! Waiting for astrologer...');
        router.push(`/astrologers/call/${newCall._id}`);
        return newCall;
      }
    } catch (error) {
      console.error('Start call error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to start call';
      toast.error(errorMessage);
      
      if (errorMessage.includes('already exists')) {
        const existingCallId = error.response.data.call?._id;
        if (existingCallId) {
          router.push(`/astrologers/call/${existingCallId}`);
        }
      }
    } finally {
      setIsConnecting(false);
      toast.dismiss();
    }
    return null;
  };

  // End call - UPDATED TO CALL BACKEND API
  const endCall = async () => {
    if (!callId || !call) {
      toast.error('No active call to end');
      return false;
    }

    try {
      setIsConnecting(true);
      toast.loading('Ending call...');

      let response;
      if (identity?.startsWith('user_')) {
        // Call the backend API to properly end the call
        response = await api.post(`/call/user/end/${callId}`);
      } else if (identity?.startsWith('astrologer_')) {
        const astrologerId = identity.replace('astrologer_', '');
        response = await api.post(`/call/astrologer/end/${callId}/${astrologerId}`);
      } else {
        toast.error('Unauthorized to end call');
        return false;
      }

      if (response?.data?.success) {
        setCallStatus('ENDED');
        stopCallTimer();
        
        // 🔥 Fetch final wallet balance
        setTimeout(() => fetchWalletBalance(), 1000);
        
        // Emit socket event
        if (socketRef.current && identity?.startsWith('user_')) {
          socketRef.current.emit("userEndedCall", {
            callId,
            userId: user?._id,
            astrologerId: call?.astrologer?._id
          });
        }
        
        toast.success('Call ended successfully');
        return true;
      } else {
        toast.error('Failed to end call');
        return false;
      }
    } catch (error) {
      console.error('End call error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to end call';
      toast.error(errorMessage);
    } finally {
      setIsConnecting(false);
      toast.dismiss();
    }

    return false;
  };

  return {
    // State
    call,
    callStatus,
    duration,
    walletBalance,
    isMuted,
    isSpeakerOn,
    isConnecting,
    zegoReady: isMounted,
    peerJoined,
    isInitialized: isMounted,
    fetchZegoToken,
    zegoToken,
    zegoRoomId,
    appId,
    
    // Functions
    startCall,
    endCall,
    toggleMute: () => setIsMuted(!isMuted),
    toggleSpeaker: () => setIsSpeakerOn(!isSpeakerOn),
    formatDuration,
    setPeerJoined,
    setZegoToken,
    setZegoRoomId,
    setAppId,
    fetchWalletBalance // 🔥 Export for manual refresh if needed
  };
};