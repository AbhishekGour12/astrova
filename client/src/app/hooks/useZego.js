"use client";

import { useEffect, useRef, useState } from "react";

export function useZego({ 
  appId, 
  token, 
  roomId, 
  userId, 
  userName, 
  enabled = true 
}) {
  const containerRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [zegoLoaded, setZegoLoaded] = useState(false);
  const zegoInstanceRef = useRef(null);
  const initAttemptedRef = useRef(false);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
      if (zegoInstanceRef.current) {
        try {
          zegoInstanceRef.current.destroy();
        } catch (e) {
          console.log('Cleanup error:', e);
        }
      }
    };
  }, []);

  // Load Zego SDK
  useEffect(() => {
    if (!isMounted || typeof window === 'undefined') return;

    const loadZegoSDK = async () => {
      if (window.ZegoUIKitPrebuilt) {
        setZegoLoaded(true);
        return;
      }

      try {
        setLoading(true);
        console.log('📦 Loading Zego SDK...');
        
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/@zegocloud/zego-uikit-prebuilt@latest/zego-uikit-prebuilt.js';
          script.async = true;
          
          script.onload = () => {
            console.log('✅ Zego SDK loaded successfully');
            setZegoLoaded(true);
            setLoading(false);
            resolve();
          };
          
          script.onerror = () => {
            console.error('❌ Failed to load Zego SDK');
            setError('Failed to load audio SDK');
            setLoading(false);
            reject(new Error('Failed to load Zego SDK'));
          };
          
          document.head.appendChild(script);
        });
      } catch (err) {
        console.error('SDK load error:', err);
        setError('Failed to load audio SDK');
      }
    };

    loadZegoSDK();
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted || typeof window === 'undefined' || !enabled) return;
    if (!zegoLoaded) {
      console.log('⏳ Zego SDK not loaded yet, waiting...');
      return;
    }
    if (initAttemptedRef.current) {
      console.log('⚠️ Zego initialization already attempted');
      return;
    }

    // Validate all required parameters
    const isValid = appId && roomId && userId;
    
    if (!isValid) {
      console.log('❌ Zego missing parameters:', { 
        appId: !!appId, 
        roomId: !!roomId, 
        userId: !!userId, 
        enabled,
        zegoLoaded 
      });
      return;
    }

    initAttemptedRef.current = true;
    
    const initZego = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🚀 Zego starting initialization:', { 
          appId, 
          roomId, 
          userId, 
          userName,
          hasToken: !!token,
          tokenType: typeof token
        });
        
        const { ZegoUIKitPrebuilt } = window;
        
        // ALWAYS use test token generation for now (simpler)
        const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET;
        
        if (!serverSecret) {
          throw new Error('Zego server secret not found. Add NEXT_PUBLIC_ZEGO_SERVER_SECRET to .env');
        }
        
        console.log('🔑 Generating test token...');
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          Number(appId),
          serverSecret,
          roomId,
          userId,
          userName || `User_${userId}`
        );

        console.log('✅ Test token generated');
        
        // Create Zego instance
        zegoInstanceRef.current = ZegoUIKitPrebuilt.create(kitToken);

        // Join room with audio-only configuration
        await zegoInstanceRef.current.joinRoom({
          container: containerRef.current,
          scenario: {
            mode: ZegoUIKitPrebuilt.OneONoneCall,
          },
          turnOnCameraWhenJoining: false,
          turnOnMicrophoneWhenJoining: true,
          showMyCameraToggleButton: false,
          showMyMicrophoneToggleButton: true,
          showAudioVideoSettingsButton: false,
          showTextChat: false,
          showUserList: false,
          showScreenSharingButton: false,
          showRecordingButton: false,
          maxUsers: 2,
          layout: "Auto",
          showLayoutButton: false,
          showNonVideoUser: false,
          showOnlyAudioUser: true,
          onJoinRoom: () => {
            console.log('🎉 Successfully joined Zego room:', roomId);
            setConnected(true);
          },
          onLeaveRoom: () => {
            console.log('Left Zego room');
            setConnected(false);
          }
        });

      } catch (err) {
        console.error('❌ Zego initialization error:', err);
        console.error('Full error:', err.message, err.stack);
        setError(`Failed to setup audio: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    initZego();

    return () => {
      if (zegoInstanceRef.current) {
        try {
          zegoInstanceRef.current.destroy();
          zegoInstanceRef.current = null;
        } catch (e) {
          console.error('Error destroying Zego:', e);
        }
      }
      setConnected(false);
      initAttemptedRef.current = false;
    };
  }, [isMounted, appId, token, roomId, userId, userName, enabled, zegoLoaded]);

  return { 
    containerRef, 
    connected, 
    loading, 
    error,
    zegoLoaded 
  };
}