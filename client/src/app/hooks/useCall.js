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

  // Check if component is mounted and client-side
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

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
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [isMounted, callId, identity]);

  const setupSocketListeners = () => {
    if (!socketRef.current) return;

   // Add this for call activation
  socketRef.current.on("callActivated", (data) => {
    console.log("🎉 Call activated via socket:", data);
    
    // Update call status to CONNECTED
    setCallStatus("CONNECTED");
    
    // IMPORTANT: Update call data with room ID if provided
    if (data.call) {
      setCall(prev => ({
        ...prev,
        ...data.call,
        zegoRoomId: data.call.zegoRoomId || data.zegoRoomId
      }));
      
      // If we have Zego room ID, trigger token fetch
      if (data.call.zegoRoomId || data.zegoRoomId) {
        fetchZegoTokenForRoom(data.call.zegoRoomId || data.zegoRoomId);
      }
    }
    
    startCallTimer();
    toast.success("Call connected!");
  });

       // Also listen for astrologer joined event
  socketRef.current.on("astrologerJoinedCall", (data) => {
    console.log("Astrologer joined call:", data);
    setPeerJoined(true);
    toast.success("Astrologer has joined the call");
  });
      

    socketRef.current.on('callEnded', (data) => {
      setCallStatus('ENDED');
      stopCallTimer();
      toast.success(`Call ended. Duration: ${formatDuration(duration)}`);
    });

    socketRef.current.on('callRejected', (data) => {
      setCallStatus('REJECTED');
      toast.error('Call rejected by astrologer');
    });

    socketRef.current.on('callMissed', (data) => {
      setCallStatus('MISSED');
      toast.error('Astrologer did not answer');
    });
  };
  //Add this function to fetch Zego token
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
      
      // Update Zego parameters
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

  const startCallTimer = () => {
    stopCallTimer();
    durationIntervalRef.current = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
  };

  const stopCallTimer = () => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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
      setIsConnecting(true);
      toast.loading('Starting call...');

      const response = await api.post('/call/user/start', {
        astrologerId,
        callType: 'AUDIO'
      });

      if (response.data.success) {
        const newCall = response.data.call;
        setCall(newCall);
        setCallStatus('WAITING');
        
        toast.success('Call request sent! Waiting for astrologer...');
        
        // Redirect to call page
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

  // End call
  const endCall = async () => {
    if (!callId || !call) return false;

    try {
      setIsConnecting(true);
      toast.loading('Ending call...');

      let response;
      if (identity?.startsWith('user_')) {
        response = await api.post(`/call/user/end/${callId}`);
      } else if (identity?.startsWith('astrologer_')) {
        const astrologerId = identity.replace('astrologer_', '');
        response = await api.post(`/call/astrologer/end/${callId}/${astrologerId}`);
      }

      if (response?.data?.success) {
        setCallStatus('ENDED');
        stopCallTimer();
        
        toast.success('Call ended successfully');
        return true;
      }
    } catch (error) {
      console.error('End call error:', error);
      toast.error('Failed to end call');
    } finally {
      setIsConnecting(false);
      toast.dismiss();
    }

    return false;
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
            
            if (callData.status === 'ACTIVE' && callData.startedAt) {
              const startedAt = new Date(callData.startedAt);
              const now = new Date();
              const seconds = Math.floor((now - startedAt) / 1000);
              setDuration(Math.max(0, seconds));
              startCallTimer();
            }
          }
        } catch (error) {
          console.error('Fetch call error:', error);
        }
      };
      
      fetchCallData();
    }
  }, [callId, isMounted]);
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

  // Fetch wallet balance on mount
  useEffect(() => {
    if (user && isMounted) {
      api.get('/auth/wallet')
        .then(response => {
          if (response.data.balance) {
            setWalletBalance(response.data.balance);
          }
        })
        .catch(console.error);
    }
  }, [user, isMounted]);

  return {
    // State
    call,
    callStatus,
    duration,
    walletBalance,
    isMuted,
    isSpeakerOn,
    isConnecting,
    zegoReady: isMounted, // Always ready if mounted (simplified)
    peerJoined,
    isInitialized: isMounted,
    fetchZegoToken,
    zegoToken,        // Add this
    zegoRoomId,       // Add this
    appId,  
    // Functions
    startCall,
    endCall,
    toggleMute: () => setIsMuted(!isMuted),
    toggleSpeaker: () => setIsSpeakerOn(!isSpeakerOn),
    formatDuration,
    setPeerJoined,
    setZegoToken,     // Add setter
  setZegoRoomId,    // Add setter
  setAppId   
  };
};