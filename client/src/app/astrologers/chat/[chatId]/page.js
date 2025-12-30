"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import api from "../../../lib/api";
import toast from "react-hot-toast";
import {
  FaPaperPlane,
  FaWallet,
  FaUser,
  FaClock,
  FaPhone,
  FaVideo,
  FaTimes,
  FaRecycle,
  FaCheck,
  FaCheckDouble,
  FaChevronLeft
} from "react-icons/fa";

export default function ChatPage() {
  const { chatId } = useParams();
  const router = useRouter();
  const user = useSelector((s) => s.auth.user);
  
  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const billingIntervalRef = useRef(null);
  
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [wallet, setWallet] = useState(0);
  const [graceSeconds, setGraceSeconds] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [astrologerTyping, setAstrologerTyping] = useState(false);
  const [totalCharged, setTotalCharged] = useState(0);
  const [minutesUsed, setMinutesUsed] = useState(0);
  const [isRecharging, setIsRecharging] = useState(false);

  // Initialize socket
  const initSocket = useCallback(() => {
    if (!user) return;

    const socket = io(process.env.NEXT_PUBLIC_API, {
      transports: ["websocket", "polling"],
      query: { userId: user._id }
    });

    socketRef.current = socket;

    // Socket event handlers
    socket.on("connect", () => {
      console.log("Connected to socket");
      socket.emit("joinUser", { userId: user._id });
      socket.emit("joinChat", { chatId });
    });

    socket.on("chatActivated", (updatedChat) => {
      setChat(updatedChat);
      toast.success("Astrologer joined the chat!");
      
      // Start billing timer
      startBillingTimer();
    });

    socket.on("typingUpdate", ({ senderRole, isTyping }) => {
      if (senderRole === "astrologer") {
        setAstrologerTyping(isTyping);
      }
    });

    socket.on("newMessage", (message) => {
      setMessages(prev => {
        const exists = prev.some(m => 
          m._id === message._id || 
          (m.content === message.content && 
           new Date(m.createdAt).getTime() === new Date(message.createdAt).getTime())
        );
        
        if (exists) return prev;
        
        const newMessages = [...prev, message];
        
        // Mark astrologer message as seen
        if (
          message.senderType === "astrologer" &&
          !message.seen &&
          chat?._id
        ) {
          socketRef.current.emit("messageSeen", {
            chatId: chat._id,
            messageId: message._id
          });
        }
        
        return newMessages;
      });
    });

    socket.on("messageSeenUpdate", ({ messageId, seen }) => {
      setMessages(prev =>
        prev.map(msg =>
          msg._id === messageId ? { ...msg, seen } : msg
        )
      );
    });

    socket.on("userTyping", ({ userId, isTyping }) => {
      if (userId !== user._id) {
        setAstrologerTyping(isTyping);
      }
    });

    socket.on("walletUpdated", ({ walletBalance, amountDeducted, minutesBilled }) => {
      setWallet(walletBalance);
      if (amountDeducted) {
        setTotalCharged(prev => prev + amountDeducted);
        setMinutesUsed(prev => prev + minutesBilled);
      }
    });

    socket.on("gracePeriodStarted", ({ graceUntil, secondsRemaining }) => {
      setGraceSeconds(secondsRemaining);
      toast.warning(
        <div>
          <p>Insufficient balance! You have 5 minutes to recharge.</p>
          <p>Current balance: ₹{wallet}</p>
        </div>,
        { duration: 10000 }
      );
    });

    socket.on("gracePeriodEnded", () => {
      setGraceSeconds(0);
      toast.success("Balance sufficient! Chat continues.");
    });

    socket.on("insufficientBalance", ({ requiredAmount, currentBalance }) => {
      setIsRecharging(true);
      toast.error(
        `Need ₹${requiredAmount}, but only ₹${currentBalance} available`,
        { duration: 5000 }
      );
    });

    socket.on("chatEnded", ({ endedBy, reason, totalMinutes, totalAmount }) => {
      stopBillingTimer();
      
      if (endedBy === "system") {
        toast.error(`Chat ended: ${reason}`);
      } else {
        toast.success(`Chat completed! Total: ₹${totalAmount} for ${totalMinutes} minutes`);
      }
    
      setTimeout(() => {
        router.push("/astrologers");
      }, 3000);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket error:", error);
      toast.error("Connection lost. Reconnecting...");
    });

    return socket;
  }, [user, chatId, router, wallet]);

  // Load chat data
  const loadChatData = useCallback(async () => {
    try {
      const [chatRes, messagesRes, walletRes] = await Promise.all([
        api.get(`/chat/status/${chatId}`),
        api.get(`/chat/messages/${chatId}`),
        api.get("/auth/wallet")
      ]);

      if (chatRes.data.success) {
        setChat(chatRes.data.chat);
        
        if (chatRes.data.chat.status === "ACTIVE") {
          startBillingTimer();
        }
      }

      if (messagesRes.data.success) {
        setMessages(messagesRes.data.messages);
      }

      if (walletRes.data.balance !== undefined) {
        setWallet(walletRes.data.balance);
      }
    } catch (error) {
      console.error("Load chat error:", error);
      toast.error("Failed to load chat");
    }
  }, [chatId]);

  useEffect(() => {
    if (!socketRef.current) return;
    if (!chat?._id) return;

    socketRef.current.emit("joinChat", {
      chatId: chat._id
    });
  }, [chat?._id]);

  useEffect(() => {
    if (!chat || !socketRef.current) return;

    messages.forEach(msg => {
      if (msg.senderType === "astrologer" && !msg.seen) {
        socketRef.current.emit("messageSeen", {
          chatId: chat._id,
          messageId: msg._id
        });
      }
    });
  }, [messages]);

  // Start billing timer
  const startBillingTimer = () => {
    if (billingIntervalRef.current) {
      clearInterval(billingIntervalRef.current);
    }

    billingIntervalRef.current = setInterval(() => {
      if (chat?.status === "ACTIVE") {
        const startedAt = new Date(chat.startedAt);
        const minutes = Math.ceil((Date.now() - startedAt.getTime()) / (1000 * 60));
        setMinutesUsed(minutes);
        
        const rate = chat.ratePerMinute || 50;
        setTotalCharged(minutes * rate);
      }
    }, 60000); // Update every minute
  };

  // Stop billing timer
  const stopBillingTimer = () => {
    if (billingIntervalRef.current) {
      clearInterval(billingIntervalRef.current);
      billingIntervalRef.current = null;
    }
  };

  // Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !chat || chat.status !== "ACTIVE") return;

    try {
      const messageData = {
        chatId,
        content: newMessage.trim()
      };

      await api.post("/chat/user/message", messageData);

      setNewMessage("");
      setIsTyping(false);
      
      socketRef.current.emit("typing", {
        chatId,
        senderId: user._id,
        senderRole: "user",
        isTyping: true
      });

    } catch (error) {
      console.error("Send message error:", error);
      toast.error("Failed to send message");
    }
  };

  // Handle typing
  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    socketRef.current.emit("typing", {
      chatId,
      senderId: user._id,
      senderRole: "user",
      isTyping: true
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit("typing", {
        chatId,
        senderId: user._id,
        senderRole: "user",
        isTyping: false
      });
    }, 1000);
  };

  // End chat
  const endChat = async () => {
    if (!window.confirm("Are you sure you want to end this chat?")) return;

    try {
      await api.post(`/chat/user/end/${chatId}`);
      toast.success("Chat ended successfully");
      router.push("/astrologers");
    } catch (error) {
      console.error("End chat error:", error);
      toast.error("Failed to end chat");
    }
  };

  // Recharge wallet
  const handleRecharge = async () => {
    setIsRecharging(true);
    const amount = prompt("Enter recharge amount (₹):", "500");
    
    if (!amount || Number(amount) <= 0) {
      setIsRecharging(false);
      return;
    }

    try {
      const orderRes = await api.post("/payment/create-order", {
        amount: Number(amount),
      });

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: orderRes.data.amount,
        currency: "INR",
        name: "Sacred Earth Astrology",
        description: "Wallet Recharge",
        order_id: orderRes.data.id,
        handler: async (response) => {
          try {
            await api.post("/payment/verify", {
              razorpay_order_id: orderRes.data.id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            const walletRes = await api.post("/auth/addMoneyToWallet", {
              amount: Number(amount),
            });

            setWallet(walletRes.data.balance);
            setIsRecharging(false);
            setGraceSeconds(0);
            
            toast.success(`Recharged ₹${amount} successfully!`);
            
            socketRef.current.emit("walletRecharged", { 
              amount: Number(amount),
              chatId 
            });
          } catch (error) {
            console.error("Payment verification error:", error);
            toast.error("Payment verification failed");
            setIsRecharging(false);
          }
        },
        theme: { color: "#C06014" },
        modal: { ondismiss: () => setIsRecharging(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Recharge error:", error);
      toast.error("Failed to initiate recharge");
      setIsRecharging(false);
    }
  };

  // Grace period countdown
  useEffect(() => {
    let graceInterval;
    
    if (graceSeconds > 0) {
      graceInterval = setInterval(() => {
        setGraceSeconds(prev => {
          if (prev <= 1) {
            clearInterval(graceInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (graceInterval) clearInterval(graceInterval);
    };
  }, [graceSeconds]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Initialize
  useEffect(() => {
    if (!user) {
      //router.push("/login");
      return;
    }

    const socket = initSocket();
    loadChatData();

    return () => {
      stopBillingTimer();
      if (socket) socket.disconnect();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [user, router, initSocket, loadChatData]);

  if (!chat) {
    return (
      <div className="min-h-screen bg-[#F7F3E9] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#C06014] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-[#003D33]">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F3E9] pt-20 lg:pt-24">
      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 h-[calc(100vh-80px)]">
        <div className="h-full flex flex-col">
          
          {/* Chat Header - Not fixed, part of flow */}
          <div className="bg-white rounded-t-2xl border border-[#B2C5B2] px-4 py-3 mb-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push("/astrologers")}
                  className="p-2 hover:bg-[#F7F3E9] rounded-full flex-shrink-0"
                >
                  <FaChevronLeft className="text-lg" />
                </button>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#C06014] flex items-center justify-center text-white flex-shrink-0">
                    <FaUser />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-semibold text-[#003D33] text-sm sm:text-base truncate">
                      {chat.astrologer?.fullName || "Astrologer"}
                    </h2>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-[#00695C]">
                      <span className={`w-2 h-2 rounded-full ${
                        chat.status === "ACTIVE" ? "bg-green-500" : "bg-yellow-500"
                      }`}></span>
                      <span>{chat.status === "ACTIVE" ? "Online" : "Waiting..."}</span>
                      {astrologerTyping && (
                        <span className="text-[#C06014] truncate">typing...</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Wallet & Actions */}
              <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
                {/* Wallet Info */}
                <div className="text-right">
                  <div className="flex items-center gap-1 text-xs sm:text-sm text-[#00695C]">
                    <FaWallet className="text-xs" />
                    <span className="font-medium">₹{wallet}</span>
                  </div>
                  <div className="text-[10px] sm:text-xs text-gray-500">
                    ₹{totalCharged} used ({minutesUsed} min)
                  </div>
                </div>
                
                {/* Grace Timer */}
                {graceSeconds > 0 && (
                  <div className="px-2 sm:px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium whitespace-nowrap">
                    ⏰ {graceSeconds}s
                  </div>
                )}
                
                {/* Recharge Button */}
                <button
                  onClick={handleRecharge}
                  disabled={isRecharging}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-[#003D33] to-[#00695C] text-white rounded-full text-xs sm:text-sm font-medium hover:from-[#00695C] hover:to-[#003D33] transition-all disabled:opacity-50 whitespace-nowrap"
                >
                  {isRecharging ? "Processing..." : "Recharge"}
                </button>
                
                {/* End Chat Button */}
                <button
                  onClick={endChat}
                  className="p-2 hover:bg-red-50 text-red-600 rounded-full flex-shrink-0"
                  title="End Chat"
                >
                  <FaTimes />
                </button>
              </div>
            </div>
          </div>

          {/* Status Banners */}
          {chat.status === "WAITING" && (
            <div className="mb-3 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaClock className="text-yellow-600 text-sm sm:text-base" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-yellow-800 text-sm sm:text-base">
                    Waiting for astrologer to join
                  </h3>
                  <p className="text-xs sm:text-sm text-yellow-600 truncate">
                    Your astrologer will be with you shortly...
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Grace Period Warning */}
          {graceSeconds > 0 && (
            <div className="mb-3 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FaRecycle className="text-red-600 text-sm sm:text-base" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-red-800 text-sm sm:text-base">
                      Low Balance! Recharge Now
                    </h3>
                    <p className="text-xs sm:text-sm text-red-600">
                      Chat will end in {graceSeconds} seconds if not recharged
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRecharge}
                  className="px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-red-700 whitespace-nowrap"
                >
                  Recharge Now
                </button>
              </div>
            </div>
          )}

          {/* Messages Container */}
          <div className="flex-1 min-h-0 bg-white rounded-b-2xl border border-[#B2C5B2] flex flex-col">
            
            {/* Messages Area - Fixed height with scroll */}
            <div 
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3"
            >
              {messages.map((message) => (
                <div
                  key={message._id || message.tempId}
                  className={`flex ${
                    message.senderType === "user" 
                      ? "justify-end" 
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3 ${
                      message.senderType === "user"
                        ? "bg-gradient-to-r from-[#C06014] to-[#D47C3A] text-white rounded-br-none"
                        : "bg-[#F7F3E9] text-[#003D33] border border-[#B2C5B2] rounded-bl-none"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words text-sm sm:text-base">{message.content}</p>
                    <div className={`flex items-center justify-end gap-1 mt-1 text-xs ${
                      message.senderType === "user" 
                        ? "text-white/70" 
                        : "text-gray-500"
                    }`}>
                      <span>
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {message.senderType === "user" && (
                        <span>
                          {message.seen ? (
                            <FaCheckDouble className="text-blue-400" />
                          ) : (
                            <FaCheck />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Typing Indicator */}
            {astrologerTyping && (
              <div className="px-4 py-2 border-t border-[#B2C5B2]">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-[#00695C]">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-[#C06014] rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-[#C06014] rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></div>
                    <div className="w-2 h-2 bg-[#C06014] rounded-full animate-bounce" style={{animationDelay: "0.4s"}}></div>
                  </div>
                  <span>Astrologer is typing...</span>
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="border-t border-[#B2C5B2] p-3 sm:p-4">
              <form onSubmit={sendMessage} className="flex gap-2 sm:gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleTyping}
                  placeholder={
                    chat.status === "WAITING"
                      ? "Waiting for astrologer to join..."
                      : "Type your message here..."
                  }
                  disabled={chat.status !== "ACTIVE" || graceSeconds > 0}
                  className="flex-1 border border-[#B2C5B2] rounded-full px-4 py-2 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#C06014] disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
                <button
                  type="submit"
                  disabled={
                    !newMessage.trim() || 
                    chat.status !== "ACTIVE" || 
                    graceSeconds > 0
                  }
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-[#C06014] to-[#D47C3A] text-white rounded-full flex items-center justify-center hover:from-[#D47C3A] hover:to-[#C06014] disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <FaPaperPlane className="text-sm sm:text-base" />
                </button>
              </form>
              
              {/* Chat Status */}
              <div className="mt-3 text-center text-xs sm:text-sm text-gray-500">
                {chat.status === "ACTIVE" ? (
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
                    <span>Rate: ₹{chat.ratePerMinute || 50}/min</span>
                    <span className="hidden sm:inline">•</span>
                    <span>Used: {minutesUsed} minutes</span>
                    <span className="hidden sm:inline">•</span>
                    <span>Charged: ₹{totalCharged}</span>
                  </div>
                ) : (
                  <span>Waiting for astrologer to accept your chat request...</span>
                )}
              </div>
            </div>
          </div>
         
          {/* Call Options (Future Feature) - Hidden on small screens 
          <div className="hidden sm:grid grid-cols-2 gap-4 mt-4">
            <button
              disabled={chat.status !== "ACTIVE"}
              className="p-4 bg-white border border-[#B2C5B2] rounded-xl flex items-center justify-center gap-3 hover:bg-[#F7F3E9] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaPhone className="text-[#00695C]" />
              <span className="font-medium">Voice Call</span>
            </button>
            <button
              disabled={chat.status !== "ACTIVE"}
              className="p-4 bg-white border border-[#B2C5B2] rounded-xl flex items-center justify-center gap-3 hover:bg-[#F7F3E9] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaVideo className="text-[#C06014]" />
              <span className="font-medium">Video Call</span>
            </button>
          </div>
          */}
        </div>
      </div>
    </div>
  );
}