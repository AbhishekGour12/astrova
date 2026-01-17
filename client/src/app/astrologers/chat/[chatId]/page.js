"use client";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import api from "../../../lib/api";
import toast from "react-hot-toast";
import {
  FaPaperPlane,
  FaWallet,
  FaUser,
  FaTimes,
  FaChevronLeft,
  FaHourglassHalf,
  FaExclamationTriangle,
  FaPauseCircle,
  FaCheck,
  FaCheckDouble,
  FaBell,
  FaPlayCircle
} from "react-icons/fa";
import ReviewModal from "../../../components/ReviewModal";

export default function ChatPage() {
  
  // Refs
  const graceToastShownRef = useRef(false);
  const lowBalanceToastShownRef = useRef(false);
  const lastBillingTimeRef = useRef(null);
  const timerPausedAtRef = useRef(null); // Track when timer was paused
  const totalPausedTimeRef = useRef(0); // Total paused time in ms

  const { chatId } = useParams();
  const router = useRouter();
  const user = useSelector((s) => s.auth.user);
  
  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [wallet, setWallet] = useState(0);
  
  // Grace Period States
  const [graceSeconds, setGraceSeconds] = useState(0);
  const [graceEndTime, setGraceEndTime] = useState(null);
  const [isInGrace, setIsInGrace] = useState(false);
  
  // Timer States
  const [activeSeconds, setActiveSeconds] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [chatStartedAt, setChatStartedAt] = useState(null);
  
  const [astrologerTyping, setAstrologerTyping] = useState(false);
  const [isRecharging, setIsRecharging] = useState(false);
  
  // Review Modal
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [hasCheckedForReview, setHasCheckedForReview] = useState(false);
  
  // UI States
  const [windowHeight, setWindowHeight] = useState(0);
  const [showGraceBanner, setShowGraceBanner] = useState(false);
// Add this useEffect for real-time balance monitoring
useEffect(() => {
  if (!chat || chat.status !== "ACTIVE" || isInGrace) return;
  
  const checkBalanceImmediately = () => {
    const rate = chat.ratePerMinute || 20;
    
    // If balance can't pay for even 1 second of chat
    if (wallet < (rate / 60)) {
      console.log("💰 Balance critically low, requesting immediate grace");
      
      if (socketRef.current) {
        socketRef.current.emit("requestImmediateGrace", {
          chatId,
          userId: user._id,
          currentBalance: wallet,
          requiredAmount: rate
        });
      }
    }
  };
  
  // Check immediately when wallet updates
  checkBalanceImmediately();
  
  // Also check every 10 seconds for safety
  const interval = setInterval(checkBalanceImmediately, 10000);
  
  return () => clearInterval(interval);
}, [wallet, chat, isInGrace, chatId, user]);
  // Track window height
  useEffect(() => {
    const updateHeight = () => setWindowHeight(window.innerHeight);
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // =================================================================
  // 1. SOCKET INITIALIZATION (FIXED)
  // =================================================================
  const initSocket = useCallback(() => {
    if (!user || socketRef.current) return;

    const socket = io(process.env.NEXT_PUBLIC_API, {
      transports: ["websocket", "polling"],
      query: { userId: user._id, chatId }
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Socket connected");
      socket.emit("joinUser", { userId: user._id });
      socket.emit("joinChat", { chatId });
    });

    // Grace Period Events - IMMEDIATE when balance is insufficient
    socket.on("gracePeriodStarted", (data) => {
      console.log("⏸️ Grace period started:", data);
      
      const secondsRemaining = data.secondsRemaining || 300;
      const graceUntil = data.graceUntil ? new Date(data.graceUntil).getTime() : Date.now() + (secondsRemaining * 1000);
      
      setGraceSeconds(secondsRemaining);
      setGraceEndTime(graceUntil);
      setIsInGrace(true);
      
      // 🔥 CRITICAL FIX: Pause timer IMMEDIATELY
      setIsTimerActive(false);
      timerPausedAtRef.current = Date.now(); // Store when timer was paused
      
      setShowGraceBanner(true);
      
      if (!graceToastShownRef.current) {
        toast.error(
          <div className="flex items-center gap-2">
            <FaExclamationTriangle className="text-red-500" />
            <span>Low balance! Recharge within {Math.floor(secondsRemaining/60)}:{String(secondsRemaining%60).padStart(2,'0')}</span>
          </div>,
          { 
            duration: 6000,
            icon: '⚠️'
          }
        );
        graceToastShownRef.current = true;
        lowBalanceToastShownRef.current = false;
      }
    });

    socket.on("gracePeriodEnded", (data) => {
      console.log("✅ Grace period ended:", data);
      
      setGraceSeconds(0);
      setGraceEndTime(null);
      setIsInGrace(false);
      
      // 🔥 CRITICAL FIX: Resume timer IMMEDIATELY
      if (timerPausedAtRef.current) {
        const pausedDuration = Date.now() - timerPausedAtRef.current;
        totalPausedTimeRef.current += pausedDuration;
        timerPausedAtRef.current = null;
      }
      setIsTimerActive(true); // Resume timer
      
      setShowGraceBanner(false);
      
      if (data.newBalance) {
        setWallet(data.newBalance);
      }
      
      toast.success(
        <div className="flex items-center gap-2">
          <FaPlayCircle className="text-green-500" />
          <span>Balance restored! Chat resumed</span>
        </div>,
        { duration: 3000 }
      );
      
      graceToastShownRef.current = false;
    });

    // Billing Events
    socket.on("minuteBilled", (data) => {
      console.log("💰 Minute billed:", data);
      setWallet(data.walletBalance);
      lastBillingTimeRef.current = Date.now();
    });

    socket.on("walletUpdated", (data) => {
      setWallet(data.walletBalance);
      
      // 🔥 Check if wallet just went to 0 or below
      if (data.walletBalance <= 0 && !isInGrace && chat?.status === "ACTIVE") {
        console.log("⚠️ Wallet just reached 0, requesting grace period");
        
        // Request immediate grace period
        socket.emit("requestImmediateGrace", {
          chatId,
          userId: user._id,
          currentBalance: data.walletBalance
        });
      }
    });

    socket.on("lowBalanceWarning", (data) => {
      if (!lowBalanceToastShownRef.current) {
        toast.warning(
          <div className="flex items-center gap-2">
            <FaBell className="text-yellow-500" />
            <span>Low balance: ₹{data.currentBalance}. Only {data.minutesLeft} min left</span>
          </div>,
          { duration: 4000 }
        );
        lowBalanceToastShownRef.current = true;
      }
    });

    socket.on("chatEnded", ({ endedBy, totalAmount }) => {
      setIsTimerActive(false);
      if (endedBy === "system") {
        toast.error("Chat ended due to insufficient balance");
      } else {
        toast.success(`Chat completed! Total: ₹${totalAmount || 0}`);
      }
      checkReviewEligibility();
    });

    // Chat Events
    socket.on("chatActivated", (updatedChat) => {
      setChat(updatedChat);
      setChatStartedAt(new Date(updatedChat.startedAt).getTime());
      setIsTimerActive(true);
      toast.success("Astrologer joined!");
    });

    socket.on("newMessage", (message) => {
      setMessages(prev => {
        if (prev.some(m => m._id === message._id)) return prev;
        return [...prev, message];
      });
    });

    socket.on("typingUpdate", ({ senderRole, isTyping }) => {
      if (senderRole === "astrologer") setAstrologerTyping(isTyping);
    });

    socket.on("disconnect", () => {
      console.log("🔌 Socket disconnected");
    });

    return socket;
  }, [user, chatId, isInGrace, chat?.status]);

  // =================================================================
  // 2. LOAD INITIAL DATA (FIXED)
  // =================================================================
  const loadChatData = useCallback(async () => {
    try {
      const [chatRes, messagesRes, walletRes] = await Promise.all([
        api.get(`/chat/status/${chatId}`),
        api.get(`/chat/messages/${chatId}`),
        api.get("/auth/wallet")
      ]);

      if (chatRes.data.success) {
        const loadedChat = chatRes.data.chat;
        setChat(loadedChat);
        
        // Set chat start time
        if (loadedChat.startedAt) {
          setChatStartedAt(new Date(loadedChat.startedAt).getTime());
        }
        
        // 🔥 Check if in grace period on load
        if (loadedChat.graceUntil) {
          const graceEnd = new Date(loadedChat.graceUntil).getTime();
          const now = Date.now();
          const diffSeconds = Math.floor((graceEnd - now) / 1000);
          
          if (diffSeconds > 0) {
            setGraceSeconds(diffSeconds);
            setGraceEndTime(graceEnd);
            setIsInGrace(true);
            setIsTimerActive(false); // Timer paused
            setShowGraceBanner(true);
            
            // Set paused time reference
            timerPausedAtRef.current = now;
            
            if (!graceToastShownRef.current) {
              toast.error("You are in grace period! Recharge now.", {
                duration: 5000
              });
              graceToastShownRef.current = true;
            }
          }
        }
        
        // 🔥 Check if we need to start grace period immediately
        if (loadedChat.status === "ACTIVE" && !loadedChat.graceUntil) {
          const userBalance = walletRes.data.balance || 0;
          const ratePerMinute = loadedChat.ratePerMinute || 20;
          
          if (userBalance < ratePerMinute) {
            console.log("⚠️ Wallet insufficient on load, requesting grace");
            // Request grace period immediately
            setTimeout(() => {
              if (socketRef.current) {
                socketRef.current.emit("requestImmediateGrace", {
                  chatId,
                  userId: user._id,
                  currentBalance: userBalance
                });
              }
            }, 1000);
          }
        }
      }
      
      if (messagesRes.data.success) setMessages(messagesRes.data.messages);
      if (walletRes.data.balance !== undefined) {
        const balance = walletRes.data.balance;
        setWallet(balance);
        
        // 🔥 Check if balance is 0 on load
        if (balance <= 0 && chat?.status === "ACTIVE" && !chat.graceUntil) {
          console.log("💰 Balance is 0 on load, requesting grace");
          setTimeout(() => {
            if (socketRef.current) {
              socketRef.current.emit("requestImmediateGrace", {
                chatId,
                userId: user._id,
                currentBalance: balance
              });
            }
          }, 1500);
        }
      }
    } catch (error) {
      console.error("Load chat error:", error);
      toast.error("Failed to load chat");
    }
  }, [chatId, user, chat?.status]);

  // =================================================================
  // 3. TIMER LOGIC (FIXED - Proper calculation with pauses)
  // =================================================================
  useEffect(() => {
    let interval = null;
    
    // Timer should run only when: chat is ACTIVE, NOT in grace, timer is active
    const shouldRunTimer = chat?.status === "ACTIVE" && !isInGrace && isTimerActive;
    
    if (shouldRunTimer && chatStartedAt) {
      const updateTimer = () => {
        const now = Date.now();
        
        // Calculate elapsed time since chat started
        const elapsedSinceStart = now - chatStartedAt;
        
        // Subtract total paused time
        const activeTime = Math.max(0, elapsedSinceStart - totalPausedTimeRef.current);
        
        setActiveSeconds(Math.floor(activeTime / 1000));
      };
      
      updateTimer();
      interval = setInterval(updateTimer, 1000);
    } else {
      // Timer is paused
      if (interval) clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [chat?.status, isInGrace, isTimerActive, chatStartedAt]);

  // =================================================================
  // 4. GRACE TIMER COUNTDOWN (FIXED)
  // =================================================================
  useEffect(() => {
    let interval = null;
    
    if (isInGrace && graceEndTime) {
      const updateGraceTimer = () => {
        const now = Date.now();
        const remaining = Math.floor((graceEndTime - now) / 1000);
        
        if (remaining <= 0) {
          // Grace period expired
          setGraceSeconds(0);
          setGraceEndTime(null);
          setIsInGrace(false);
          setShowGraceBanner(false);
          
          toast.error("Grace period expired! Chat will end.");
          
          if (socketRef.current) {
            socketRef.current.emit("graceExpired", { chatId });
          }
          
          if (interval) clearInterval(interval);
        } else {
          setGraceSeconds(remaining);
        }
      };
      
      updateGraceTimer();
      interval = setInterval(updateGraceTimer, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isInGrace, graceEndTime, chatId]);

  // =================================================================
  // 5. WALLET MONITORING (FIXED - Immediate grace on 0 balance)
  // =================================================================
  useEffect(() => {
    if (!chat || chat.status !== "ACTIVE" || !chat.ratePerMinute || isInGrace) return;
    
    const checkWalletForGrace = () => {
      const minutesLeft = wallet / chat.ratePerMinute;
      
      // 🔥 CRITICAL FIX: Trigger grace IMMEDIATELY when balance can't pay for next minute
      if (minutesLeft < 1 && wallet < chat.ratePerMinute) {
        console.log(`⚠️ Balance insufficient for next minute: ₹${wallet} < ₹${chat.ratePerMinute}`);
        
        if (socketRef.current && !isInGrace) {
          socketRef.current.emit("requestImmediateGrace", {
            chatId,
            userId: user._id,
            currentBalance: wallet,
            requiredAmount: chat.ratePerMinute
          });
        }
      }
      
      // Show warning when balance is low (less than 2 minutes)
      if (minutesLeft < 2 && minutesLeft > 0) {
        if (!lowBalanceToastShownRef.current) {
          toast.error(`Low balance: Only ${Math.floor(minutesLeft)} minute(s) left`, {
            duration: 4000
          });
          lowBalanceToastShownRef.current = true;
        }
      } else {
        lowBalanceToastShownRef.current = false;
      }
    };
    
    // Check more frequently (every 5 seconds) to catch immediate grace
    const walletCheckInterval = setInterval(checkWalletForGrace, 5000);
    
    return () => clearInterval(walletCheckInterval);
  }, [wallet, chat, isInGrace, chatId, user]);

  // =================================================================
  // 6. RECHARGE FUNCTION (FIXED - Proper timer resume)
  // =================================================================
  const handleRecharge = async () => {
    setIsRecharging(true);
    
    // Calculate suggested amount (minimum 2 minutes worth)
    const suggestedAmount = chat?.ratePerMinute ? Math.max(chat.ratePerMinute * 2, 100) : 100;
    
    const amount = prompt(`Enter amount to recharge (₹):`, suggestedAmount.toString());
    if (!amount || isNaN(amount) || Number(amount) < 10) { 
      setIsRecharging(false); 
      toast.error("Please enter a valid amount (minimum ₹10)");
      return; 
    }

    try {
      const orderRes = await api.post("/payment/create-order", { amount: Number(amount) });
      
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: orderRes.data.amount,
        currency: "INR",
        name: "Astro Chat",
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
            const wRes = await api.post("/auth/addMoneyToWallet", { amount: Number(amount) });
            const newBalance = wRes.data.balance;
            setWallet(newBalance);
            
            // 🔥 CRITICAL FIX: Notify server about recharge
            await api.post(`/chat/recharge/${chatId}`, {
              amount: Number(amount),
              newBalance: newBalance,
              timestamp: Date.now()
            });
            
            // Also notify via socket
            if (socketRef.current) {
              socketRef.current.emit("walletRecharged", {
                chatId,
                amount: Number(amount),
                newBalance: newBalance,
                timestamp: Date.now()
              });
            }
            
            toast.success(`₹${amount} added successfully! Chat resumed.`);
            
            // 🔥 Reset low balance toast flag
            lowBalanceToastShownRef.current = false;
            
          } catch (error) {
            console.error("Payment error:", error);
            toast.error("Payment failed. Please try again.");
          } finally {
            setIsRecharging(false);
          }
        },
        modal: { 
          ondismiss: () => {
            setIsRecharging(false);
            toast.info("Recharge cancelled");
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
      setIsRecharging(false);
    }
  };

  // =================================================================
  // 7. END CHAT (Always accessible)
  // =================================================================
  const endChat = async () => {
    const message = isInGrace 
      ? "Chat is paused due to low balance. End chat anyway?"
      : "Are you sure you want to end the chat?";
    
    if (!window.confirm(message)) return;
    
    try {
      await api.post(`/chat/user/end/${chatId}`);
      toast.success("Chat ended");
      checkReviewEligibility();
    } catch (error) {
      console.error("End chat error:", error);
      toast.error("Failed to end chat");
    }
  };

  // =================================================================
  // 8. SEND MESSAGE
  // =================================================================
  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) {
      toast.error("Message cannot be empty");
      return;
    }
    
    if (!chat || chat.status !== "ACTIVE") {
      toast.error("Chat is not active");
      return;
    }
    
    if (isInGrace) {
      toast.error("Please recharge to continue chatting");
      return;
    }
    
    try {
      await api.post("/chat/user/message", {
        chatId,
        content: newMessage.trim()
      });
      
      setNewMessage("");
      
      // Clear typing indicator
      if (socketRef.current) {
        socketRef.current.emit("typing", {
          chatId,
          senderId: user._id,
          senderRole: "user",
          isTyping: false
        });
      }
      
    } catch (error) {
      console.error("Send message error:", error);
      toast.error("Failed to send message");
    }
  };

  // =================================================================
  // 9. TYPING HANDLER
  // =================================================================
  const handleTyping = (e) => {
    const value = e.target.value;
    setNewMessage(value);
    
    if (!socketRef.current || isInGrace) return;
    
    // Send typing indicator
    socketRef.current.emit("typing", {
      chatId,
      senderId: user._id,
      senderRole: "user",
      isTyping: true
    });
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to clear typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (socketRef.current) {
        socketRef.current.emit("typing", {
          chatId,
          senderId: user._id,
          senderRole: "user",
          isTyping: false
        });
      }
    }, 1000);
  };

  // =================================================================
  // 10. HELPER FUNCTIONS
  // =================================================================
  const checkReviewEligibility = useCallback(async () => {
    if (!user || !chatId || hasCheckedForReview) return;
    
    try {
      setHasCheckedForReview(true);
      const response = await api.get(`/reviews/check/CHAT/${chatId}`);
      
      if (response.data.canReview) {
        setShowReviewModal(true);
      } else {
        setTimeout(() => router.push("/astrologers"), 2000);
      }
    } catch (error) {
      console.error("Review check error:", error);
      setTimeout(() => router.push("/astrologers"), 2000);
    }
  }, [user, chatId, hasCheckedForReview, router]);

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatGraceTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const remainingTimeInfo = useMemo(() => {
    if (!wallet || !chat?.ratePerMinute || wallet <= 0) {
      return { minutes: 0, text: "0m", color: "text-red-600 animate-pulse" };
    }
    
    const minutesLeft = Math.floor(wallet / chat.ratePerMinute);
    let colorClass = "text-[#00695C]";
    
    if (minutesLeft < 1) colorClass = "text-red-600 font-bold animate-pulse";
    else if (minutesLeft < 2) colorClass = "text-red-600";
    else if (minutesLeft < 5) colorClass = "text-yellow-600";
    
    return { 
      minutes: minutesLeft, 
      text: `${minutesLeft} min`, 
      color: colorClass 
    };
  }, [wallet, chat?.ratePerMinute]);

  // =================================================================
  // 11. INITIALIZE
  // =================================================================
  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    
    const socket = initSocket();
    loadChatData();
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [user, initSocket, loadChatData, router]);

  // Auto-scroll
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  if (!chat) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F3E9]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C06014] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F7F3E9] min-h-screen">
      {/* 🔥 FIXED GRACE BANNER - Separate from header with high z-index */}
      {showGraceBanner && (
        <div className="fixed top-0 left-0 right-0 z-50 animate-slideDown">
          <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-3 px-4 shadow-lg">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <FaExclamationTriangle className="text-xl animate-pulse" />
                <div>
                  <p className="font-bold">CHAT PAUSED - LOW BALANCE!</p>
                  <p className="text-sm opacity-90">
                    Recharge within <span className="font-mono font-bold">{formatGraceTime(graceSeconds)}</span> to continue
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={endChat}
                  className="bg-transparent border border-white text-white px-4 py-2 rounded-full font-medium hover:bg-white/10 transition-all"
                >
                  End Chat
                </button>
                <button
                  onClick={handleRecharge}
                  disabled={isRecharging}
                  className="bg-white text-red-600 font-bold px-5 py-2 rounded-full hover:bg-gray-100 disabled:opacity-50 transition-all transform hover:scale-105 active:scale-95 shadow-md whitespace-nowrap"
                >
                  {isRecharging ? "Processing..." : "ADD MONEY NOW"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Chat Container */}
      <div 
        className="flex flex-col"
        style={{ 
          height: windowHeight > 0 ? `${windowHeight}px` : '100vh',
          maxHeight: windowHeight > 0 ? `${windowHeight}px` : '100vh',
          paddingTop: showGraceBanner ? '80px' : '0px'
        }}
      >
        {/* Header */}
        <div className="flex-shrink-0 bg-white border-b border-[#B2C5B2] px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between">
            {/* Left Section */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => router.push("/astrologers")}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaChevronLeft />
              </button>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#C06014] to-[#D07024] flex items-center justify-center text-white shadow">
                  <FaUser />
                </div>
                <div>
                  <h2 className="font-bold text-[#003D33]">
                    {chat.astrologer?.fullName || "Astrologer"}
                  </h2>
                  <div className="flex items-center gap-2 text-sm">
                    <span className={`w-2 h-2 rounded-full ${chat.status === "ACTIVE" && !isInGrace ? "bg-green-500 animate-pulse" : "bg-yellow-500"}`}></span>
                    <span className="text-gray-600 font-medium">
                      {isInGrace ? (
                        <span className="text-red-600 font-semibold flex items-center gap-1">
                          <FaPauseCircle className="animate-pulse" /> PAUSED
                        </span>
                      ) : chat.status === "ACTIVE" ? (
                        <span className="flex items-center gap-1">
                          <FaPlayCircle className="text-green-500" />
                          {formatTime(activeSeconds)}
                        </span>
                      ) : (
                        "Waiting..."
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              {/* Wallet Info */}
              <div className="hidden md:block text-right">
                <div className="flex items-center justify-end gap-2 font-semibold">
                  <FaWallet className="text-[#C06014]" />
                  <span className={wallet <= 0 ? "text-red-600 animate-pulse" : ""}>
                    ₹{wallet.toFixed(2)}
                  </span>
                </div>
                {chat.status === "ACTIVE" && !isInGrace && (
                  <div className={`flex items-center justify-end gap-1 text-xs ${remainingTimeInfo.color}`}>
                    <FaHourglassHalf />
                    <span>{remainingTimeInfo.text} left</span>
                  </div>
                )}
              </div>

              {/* Add Money Button */}
              <button
                onClick={handleRecharge}
                disabled={isRecharging}
                className="bg-gradient-to-r from-[#003D33] to-[#004D40] text-white px-4 py-2 rounded-lg font-medium hover:from-[#004D40] hover:to-[#005A4A] disabled:opacity-50 transition-all shadow-sm"
              >
                {isRecharging ? "..." : "+ Add"}
              </button>

              {/* End Chat Button */}
              <button
                onClick={endChat}
                className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="End Chat"
              >
                <FaTimes />
              </button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 min-h-0 bg-white overflow-hidden">
          <div 
            ref={messagesContainerRef}
            className="h-full overflow-y-auto p-4 space-y-4"
          >
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <div className="text-center max-w-md">
                  <div className="text-xl font-bold text-[#003D33] mb-2">Start Conversation</div>
                  <p className="text-gray-600 mb-4">
                    {isInGrace 
                      ? "Chat paused due to low balance. Recharge to continue." 
                      : "Send your first message to begin"}
                  </p>
                  {isInGrace && (
                    <button
                      onClick={handleRecharge}
                      className="mt-4 bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all animate-pulse"
                    >
                      🔄 Recharge to Resume
                    </button>
                  )}
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div 
                  key={msg._id} 
                  className={`flex ${msg.senderType === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[75%] rounded-2xl p-4 ${msg.senderType === "user" 
                    ? "bg-gradient-to-r from-[#C06014] to-[#D07024] text-white rounded-br-none" 
                    : "bg-gray-100 text-gray-900 rounded-bl-none border border-gray-200"}`}>
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    <div className="text-xs opacity-70 mt-2 flex justify-between items-center">
                      <span>
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {msg.senderType === "user" && (
                        <span className="ml-2">
                          {msg.seen ? <FaCheckDouble /> : <FaCheck />}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {astrologerTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl p-4 rounded-bl-none">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4">
          <form onSubmit={sendMessage} className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={handleTyping}
              disabled={chat.status !== "ACTIVE" || isInGrace}
              placeholder={
                isInGrace 
                  ? "💡 Recharge to continue chatting..." 
                  : chat.status === "ACTIVE" 
                    ? "Type your message..." 
                    : "Waiting for astrologer..."
              }
              className="flex-1 border border-gray-300 rounded-full px-5 py-3 focus:outline-none focus:border-[#C06014] focus:ring-2 focus:ring-[#C06014]/30 disabled:bg-gray-50 disabled:text-gray-500 transition-all"
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || chat.status !== "ACTIVE" || isInGrace}
              className="w-14 h-14 bg-gradient-to-r from-[#C06014] to-[#D07024] text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:from-[#D07024] hover:to-[#E08034] transition-all shadow-lg transform active:scale-95"
            >
              <FaPaperPlane />
            </button>
          </form>
          
          {/* Status Indicator */}
          <div className="text-center mt-2">
            {isInGrace ? (
              <p className="text-xs text-red-600 animate-pulse">
                ⏸️ Chat paused. Timer: {formatTime(activeSeconds)} (Frozen)
              </p>
            ) : chat.status === "ACTIVE" ? (
              <p className="text-xs text-green-600">
                ▶️ Chat active. Timer: {formatTime(activeSeconds)}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && chat?.astrologer && (
        <ReviewModal
          serviceId={chatId}
          serviceType="CHAT"
          astrologerName={chat.astrologer.fullName}
          onClose={() => {
            setShowReviewModal(false);
            setTimeout(() => router.push("/astrologers"), 1000);
          }}
          onReviewSubmitted={() => {
            setTimeout(() => router.push("/astrologers"), 1000);
          }}
        />
      )}
    </div>
  );
}