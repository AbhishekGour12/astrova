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
  FaExclamationTriangle,
} from "react-icons/fa";
import toast from "react-hot-toast";
import api from "../../../lib/api";
import ReviewModal from "../../../components/ReviewModal";

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
  const [callRejected, setCallRejected] = useState(false);
  
  // TIMER STATES
  const [localDuration, setLocalDuration] = useState(0);
  const durationIntervalRef = useRef(null);
  const localStartRef = useRef(null);

  // Low Balance Warning State
  const [lowBalanceWarning, setLowBalanceWarning] = useState(false);
  const [showRechargePrompt, setShowRechargePrompt] = useState(false);
  const lowBalanceCheckRef = useRef(null);

  // Review Modal States
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [hasCheckedForReview, setHasCheckedForReview] = useState(false);
  const [redirectTimer, setRedirectTimer] = useState(null);

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
// Add this debug effect to see wallet balance changes
useEffect(() => {
  console.log(`🔍 WALLET BALANCE UPDATE: ₹${walletBalance} | Call Status: ${callStatus}`);
  
  // Debug: Check if call exists and has rate
  if (call && walletBalance !== undefined) {
    console.log(`📊 Call Rate: ₹${call.ratePerMinute}/min | Balance: ₹${walletBalance}`);
    
    // Check if balance is sufficient
    if (call.ratePerMinute && walletBalance < call.ratePerMinute) {
      console.log(`⚠️ INSUFFICIENT BALANCE: ₹${walletBalance} < ₹${call.ratePerMinute}`);
    }
  }
}, [walletBalance, callStatus, call]);
  useEffect(() => {
    setIsClient(true);
  }, []);

  // LOGIC TO DETERMINE IF WE ARE IN "VIDEO MODE"
  const isVideoMode = isClient && zegoRoomId && zegoEnabled && !callEndedByAstrologer;

  // ==========================================
  //  CHECK REVIEW ELIGIBILITY
  // ==========================================
  const checkReviewEligibility = useCallback(async () => {
    if (!user || !callId) return;
    
    try {
      setHasCheckedForReview(true);
      const response = await api.get(`/reviews/check/CALL/${callId}`);
      
      if (!response.data.canReview) {
        // User can review - show modal
        setShowReviewModal(true);
      } else {
        // User cannot review - redirect after delay
        toast.success(response.data.reason || "Redirecting to astrologers...");
        startRedirectTimer();
      }
    } catch (error) {
      console.error("Check review eligibility error:", error);
      // If there's an error checking, still redirect
      startRedirectTimer();
    }
  }, [user, callId]);

  // ==========================================
  //  REDIRECT TIMER
  // ==========================================
  const startRedirectTimer = useCallback(() => {
    // Clear any existing timer
    if (redirectTimer) {
      clearTimeout(redirectTimer);
    }
    
    // Start new timer for 3 seconds
    const timer = setTimeout(() => {
      router.push("/astrologers");
    }, 3000);
    
    setRedirectTimer(timer);
    
    // Cleanup function
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [router, redirectTimer]);

  // ==========================================
  //  HANDLE MODAL CLOSE (SKIP REVIEW)
  // ==========================================
  const handleModalClose = useCallback(() => {
    setShowReviewModal(false);
    // Start redirect timer when user skips review
    startRedirectTimer();
  }, [startRedirectTimer]);

  // ==========================================
  //  HANDLE REVIEW SUBMISSION
  // ==========================================
  const handleReviewSubmitted = useCallback(() => {
    // Start redirect timer after successful review submission
    startRedirectTimer();
  }, [startRedirectTimer]);

  // ==========================================
  //  FIXED TIMER LOGIC (Resilient to re-renders)
  // ==========================================
  useEffect(() => {
    // Check if we should be counting
    const shouldCount = (callStatus === "CONNECTED" || isVideoMode) && !callEndedByAstrologer;

    if (shouldCount) {
      // 1. Initialize local start time if strictly necessary
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
          const serverStart = new Date(call.startedAt).getTime();
          const diff = Math.floor((now - serverStart) / 1000);
          setLocalDuration(diff > 0 ? diff : 0);
        } else if (localStartRef.current) {
          // PRIORITY 2: Local Time (Immediate Feedback)
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
      // 🔥 ADD THESE NEW LISTENERS:
  newSocket.on("walletUpdated", (data) => {
    console.log("💰 Wallet updated via socket:", data);
    // The useCall hook should handle this via its own listener
  });

  newSocket.on("minuteBilled", (data) => {
    console.log("⏰ Minute billed via socket:", data);
    // This should trigger balance update in useCall
  });

  newSocket.on("lowBalanceWarning", (data) => {
    console.log("⚠️ Low balance warning via socket:", data);
    setLowBalanceWarning(true);
    setShowRechargePrompt(true);
    
    toast.error(
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <FaExclamationTriangle className="text-yellow-500" />
          <span>Low Balance Warning!</span>
        </div>
        <div className="text-sm">
          Only ₹{data.currentBalance} left. {data.minutesLeft} minute(s) remaining.
        </div>
      </div>,
      { duration: 5000 }
    );
   

    
  });

  newSocket.on("insufficientBalance", (data) => {
    console.log("❌ Insufficient balance via socket:", data);
    toast.error(
      <div className="flex items-center gap-2">
        <FaExclamationTriangle className="text-red-500" />
        <span>Insufficient balance! Call will end.</span>
      </div>,
      { duration: 4000 }
    );
  
    // Auto-end call
    setTimeout(() => {
      if (!callEndedByAstrologer) {
        handleEndCall();
      }
    }, 2000);
  });

  newSocket.on("balanceUpdate", (data) => {
    console.log("📊 Balance update via socket:", data);
    // This comes from manual checkBalance request
  });
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
      // Check for review eligibility when call ends
      setTimeout(() => {
        checkReviewEligibility();
      }, 1000);
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

    // Handle Call Rejected
    newSocket.on("callRejected", (data) => {
      console.log("Call Rejected:", data);
      setCallRejected(true);
      toast.error(data.reason || "Call rejected by astrologer");
      // Still check for review eligibility even if rejected
      setTimeout(() => {
        checkReviewEligibility();
      }, 1000);
    });

    return () => {
      newSocket.disconnect();
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    };
  }, [user?._id, callId, router, setPeerJoined, checkReviewEligibility]);

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
            // Check for review eligibility when call has already ended
            setTimeout(() => {
              checkReviewEligibility();
            }, 1000);
          }
          // Handle if we load the page and it's already rejected
          if (callData.status === "REJECTED") {
            setCallRejected(true);
            toast.error("Call was rejected");
            // Still check for review eligibility
            setTimeout(() => {
              checkReviewEligibility();
            }, 1000);
          }
        }
      } catch (error) {
        console.error("Error fetching call status:", error);
      }
    };
    if (isClient) fetchCallStatus();
  }, [callId, user, isClient, router, checkReviewEligibility]);

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
  const handleEndCall = useCallback(async () => {
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
        // Check for review eligibility after ending call
        setTimeout(() => {
          checkReviewEligibility();
        }, 1000);
      } else {
        toast.error("Failed to end call");
      }
    } catch (error) {
      console.error("Error ending call:", error);
    } finally {
      setIsLeaving(false);
    }
  },[isLeaving, endCall, socket, callId, user, call, checkReviewEligibility]);

  // ==========================================
  //  🔥 CRITICAL: AUTO END CALL ON LOW BALANCE
  // ==========================================
  /** 
  useEffect(() => {
    // Clear any existing check
    if (lowBalanceCheckRef.current) {
      clearInterval(lowBalanceCheckRef.current);
    }

    // Only check if call is connected/active
    if ((callStatus === "CONNECTED" || isVideoMode) && call && walletBalance !== undefined && walletBalance !== null) {
      const ratePerMinute = call.ratePerMinute || 0;
      
      // Function to check balance and handle auto-end
      const checkAndHandleLowBalance = () => {
        console.log(`💰 Balance check: ₹${walletBalance} | Rate: ₹${ratePerMinute} per minute`);
        
        // If balance is less than required for 1 minute
        if (walletBalance < ratePerMinute) {
          if (walletBalance <= 0) {

            // 🔥 CRITICAL: Balance is ZERO or NEGATIVE - END CALL IMMEDIATELY
           // console.log(`❌ Balance is ₹${walletBalance}. Ending call immediately.`);
            
            // Show final warning
            toast.error(
              <div className="flex items-center gap-2">
                <FaExclamationTriangle className="text-red-500" />
                <span>Insufficient balance! Call ended.</span>
              </div>,
              { duration: 5000 }
            );
            
            // Auto-end the call
            if (!isLeaving && !callEndedByAstrologer) {
              handleEndCall();
              
            }
            
          } else if (!lowBalanceWarning) {
            // 🔥 Warning: Balance is LOW (but not zero)
            console.log(`⚠️ Low balance warning: ₹${walletBalance} < ₹${ratePerMinute}`);
            setLowBalanceWarning(true);
            
            // Show recharge prompt
            setShowRechargePrompt(true);
            
            toast.error(
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <FaExclamationTriangle className="text-yellow-500" />
                  <span className="font-bold">Low Balance!</span>
                </div>
                <div className="text-sm">
                  Only ₹{walletBalance} left. Recharge now or call will end automatically.
                </div>
              </div>,
              { 
                duration: 6000,
                icon: '⚠️'
              }
            );
            
            // Auto-hide recharge prompt after 10 seconds
            setTimeout(() => {
              setShowRechargePrompt(false);
            }, 10000);
          }
        } else {
          // Balance is sufficient
          if (lowBalanceWarning) {
            setLowBalanceWarning(false);
            setShowRechargePrompt(false);
          }
        }
      };

      // Check immediately
      checkAndHandleLowBalance();
      
      // Set up interval to check every 10 seconds
      lowBalanceCheckRef.current = setInterval(checkAndHandleLowBalance, 10000);
    }

    // Cleanup
    return () => {
      if (lowBalanceCheckRef.current) {
        clearInterval(lowBalanceCheckRef.current);
        lowBalanceCheckRef.current = null;
      }
      setLowBalanceWarning(false);
      setShowRechargePrompt(false);
    };
  }, [walletBalance, callStatus, isVideoMode, call, isLeaving, callEndedByAstrologer, handleEndCall]);
*/
  // ==========================================
  //  RECHARGE WALLET FUNCTION
  // ==========================================
  const handleRecharge = async () => {
    const amount = prompt("Enter amount to recharge (₹):", "500");
    if (!amount || isNaN(amount) || Number(amount) < 10) { 
      toast.error("Please enter a valid amount (minimum ₹10)");
      return; 
    }

    try {
      const orderRes = await api.post("/payment/create-order", { amount: Number(amount) });
      
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: orderRes.data.amount,
        currency: "INR",
        name: "Astro Call",
        order_id: orderRes.data.id,
        handler: async (response) => {
          try {
            // Verify payment
            await api.post("/payment/verify", {
              razorpay_order_id: orderRes.data.id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            
            // Add to wallet
            await api.post("/auth/addMoneyToWallet", { amount: Number(amount) });
            
            toast.success(`₹${amount} added successfully!`);
            setShowRechargePrompt(false);
            
            // Refresh wallet balance
            if (socket) {
              socket.emit("walletUpdated", { callId });
            }
            
          } catch (error) {
            console.error("Payment error:", error);
            toast.error("Payment failed. Please try again.");
          }
        },
        modal: { 
          ondismiss: () => {
            toast.success("Recharge cancelled");
          }
        },
        prefill: {
          name: user?.name || "User",
          email: user?.email || "",
          contact: user?.phone || ""
        },
        theme: { color: "#C06014" }
      };
      
      const rzp = new window.Razorpay(options);
      rzp.open();
      
    } catch (error) {
      console.error("Recharge error:", error);
      toast.error("Failed to initiate recharge");
    }
  };

  // ==========================================
  //  GET STATUS MESSAGE
  // ==========================================
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
  const displayDuration = (isVideoMode || callStatus === "CONNECTED") ? localDuration : duration;

  // FIX: Controls visibility logic
  const shouldShowCallControls = (statusInfo.showControls || isVideoMode) && !callEndedByAstrologer && callStatus !== "ENDED";

  // Cleanup redirect timer on unmount
  useEffect(() => {
    return () => {
      if (redirectTimer) {
        clearTimeout(redirectTimer);
      }
      if (lowBalanceCheckRef.current) {
        clearInterval(lowBalanceCheckRef.current);
      }
    };
  }, [redirectTimer]);

  if (!user) return null;

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-black">
      
      {/* LOW BALANCE WARNING BANNER */}
      {showRechargePrompt && !callEndedByAstrologer && callStatus !== "ENDED" && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-red-600 to-orange-600 text-white py-3 px-4 shadow-lg animate-slideDown">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <FaExclamationTriangle className="text-xl animate-pulse" />
              <div>
                <p className="font-bold">LOW BALANCE WARNING!</p>
                <p className="text-sm opacity-90">
                  Only ₹{walletBalance} left. Recharge now or call will end automatically.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowRechargePrompt(false)}
                className="bg-transparent border border-white text-white px-4 py-2 rounded-full font-medium hover:bg-white/10 transition-all"
              >
                Dismiss
              </button>
              <button
                onClick={handleRecharge}
                className="bg-white text-red-600 font-bold px-5 py-2 rounded-full hover:bg-gray-100 transition-all transform hover:scale-105 active:scale-95 shadow-md"
              >
                Recharge Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LAYER 1: ZEGO INTERFACE */}
      <div 
        className={`fixed inset-x-0 top-0 transition-all duration-300 ease-in-out bg-gray-900
        ${isVideoMode ? 'h-[88dvh] z-40 opacity-100' : 'h-0 z-[-1] opacity-0'}
        ${showRechargePrompt ? 'mt-16' : ''}
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
            <div className="flex items-center gap-2">
              <div className="bg-red-600/90 text-white px-6 py-1 rounded-full font-mono text-xl shadow-lg backdrop-blur-md">
                {formatDuration(displayDuration)}
              </div>
              {lowBalanceWarning && (
                <div className="bg-yellow-600/90 text-white px-3 py-1 rounded-full text-sm animate-pulse">
                  ⚠️ Low Balance
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* LAYER 2: CONNECTING UI */}
      {!isVideoMode && (
        <div className={`absolute inset-0 z-30 bg-gradient-to-b from-[#003D33] to-[#001F1A] flex flex-col pt-20 px-4 ${showRechargePrompt ? 'pt-32' : 'pt-20'}`}>
          <div className="flex items-center justify-between mb-10">
            <button onClick={() => router.push("/astrologers")} className="p-2 bg-white/10 rounded-full">
               <FaArrowLeft className="text-white" />
            </button>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${lowBalanceWarning ? 'bg-red-600/80' : 'bg-black/20'}`}>
               <FaWallet className={lowBalanceWarning ? "text-yellow-400 animate-pulse" : "text-yellow-400"} />
               <span className={`font-bold ${lowBalanceWarning ? 'text-white animate-pulse' : 'text-white'}`}>
                 ₹{walletBalance}
               </span>
               {lowBalanceWarning && (
                 <FaExclamationTriangle className="text-yellow-400 animate-pulse" />
               )}
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
            
            {/* Low Balance Warning in Connecting UI */}
            {lowBalanceWarning && (
              <div className="bg-yellow-600/80 text-white px-6 py-3 rounded-xl mb-4 animate-pulse">
                <div className="flex items-center gap-2">
                  <FaExclamationTriangle />
                  <span className="font-bold">Low Balance Warning!</span>
                </div>
                <p className="text-sm mt-1">Only ₹{walletBalance} left. Recharge now to continue call.</p>
                <button
                  onClick={handleRecharge}
                  className="mt-2 bg-white text-yellow-700 px-4 py-1 rounded-full text-sm font-bold hover:bg-gray-100"
                >
                  Recharge Now
                </button>
              </div>
            )}
            
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
            

            <button onClick={handleEndCall} className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-red-600/30 hover:bg-red-700 hover:scale-105 transition-all">
               {isLeaving ? <FaSpinner className="animate-spin" size={28} /> : <FaPhoneSlash size={28} />}
            </button>

           
          </div>
        </div>
      )}

      {/* LAYER 4: CALL ENDED OVERLAY */}
      {(callEndedByAstrologer || callStatus === "ENDED" || callRejected) && !showReviewModal && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex flex-col items-center justify-center text-white">
          <FaPhoneSlash className="text-red-500 text-6xl mb-6" />
          <h2 className="text-3xl font-bold mb-2">
            {callRejected ? "Call Rejected" : "Call Ended"}
          </h2>
          <p className="text-gray-400 mb-8">
            Duration: {formatDuration(localDuration)}
          </p>
          
          {/* Show reason if call ended due to low balance */}
          {walletBalance !== undefined && walletBalance <= 0 && (
            <div className="bg-red-600/80 text-white px-6 py-3 rounded-xl mb-4">
              <div className="flex items-center gap-2">
                <FaExclamationTriangle />
                <span className="font-bold">Call ended due to insufficient balance</span>
              </div>
              <p className="text-sm mt-1">Please recharge your wallet for future calls.</p>
              <button
                onClick={handleRecharge}
                className="mt-2 bg-white text-red-700 px-4 py-1 rounded-full text-sm font-bold hover:bg-gray-100"
              >
                Recharge Wallet
              </button>
            </div>
          )}
          
          {!callRejected && (
            <p className="text-gray-300 mb-4">Thank you for your call!</p>
          )}
          <button onClick={() => router.push("/astrologers")} className="px-8 py-3 bg-white text-black rounded-full font-bold hover:bg-gray-200">
            Return to Home
          </button>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && call?.astrologer && (
        <ReviewModal
          serviceId={callId}
          serviceType="CALL"
          astrologerName={call.astrologer.fullName}
          onClose={handleModalClose}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </div>
  );
}