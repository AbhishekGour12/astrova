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
  FaClock,
  FaPhone,
  FaVideo,
  FaTimes,
  FaRecycle,
  FaCheck,
  FaCheckDouble,
  FaChevronLeft,
  FaHourglassHalf // Added icon for remaining time
} from "react-icons/fa";

export default function ChatPage() {
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
  const [graceSeconds, setGraceSeconds] = useState(0);
  const [astrologerTyping, setAstrologerTyping] = useState(false);
  const [totalCharged, setTotalCharged] = useState(0);
  const [isRecharging, setIsRecharging] = useState(false);
  
  // New State for Timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Initialize socket
  const initSocket = useCallback(() => {
    if (!user) return;

    const socket = io(process.env.NEXT_PUBLIC_API, {
      transports: ["websocket", "polling"],
      query: { userId: user._id }
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to socket");
      socket.emit("joinUser", { userId: user._id });
      socket.emit("joinChat", { chatId });
    });

    socket.on("chatActivated", (updatedChat) => {
      setChat(updatedChat);
      toast.success("Astrologer joined the chat!");
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
        
        if (message.senderType === "astrologer" && !message.seen && chat?._id) {
          socketRef.current.emit("messageSeen", {
            chatId: chat._id,
            messageId: message._id
          });
        }
        return newMessages;
      });
    });

    socket.on("messageSeenUpdate", ({ messageId, seen }) => {
      setMessages(prev => prev.map(msg => msg._id === messageId ? { ...msg, seen } : msg));
    });

    socket.on("userTyping", ({ userId, isTyping }) => {
      if (userId !== user._id) {
        setAstrologerTyping(isTyping);
      }
    });

    socket.on("walletUpdated", ({ walletBalance, amountDeducted }) => {
      setWallet(walletBalance);
      if (amountDeducted) {
        setTotalCharged(prev => prev + amountDeducted);
      }
    });

    socket.on("gracePeriodStarted", ({ secondsRemaining }) => {
      setGraceSeconds(secondsRemaining);
      toast.warning("Low balance! Recharge within 5 mins.", { duration: 5000 });
    });

    socket.on("gracePeriodEnded", () => {
      setGraceSeconds(0);
      toast.success("Balance sufficient!");
    });

    socket.on("chatEnded", ({ endedBy, totalAmount }) => {
      if (endedBy === "system") {
        toast.error("Chat ended by system");
      } else {
        toast.success(`Chat completed! Total: ₹${totalAmount}`);
      }
      setTimeout(() => router.push("/astrologers"), 3000);
    });

    return socket;
  }, [user, chatId, router, chat?._id]);

  // ==========================================
  //  FIXED TIMER LOGIC
  // ==========================================
  useEffect(() => {
    let interval;
    
    // Only run timer if chat is ACTIVE and has a start time
    if (chat?.status === "ACTIVE" && chat.startedAt) {
      // Immediate calculation
      const calculateTime = () => {
        const startedAt = new Date(chat.startedAt).getTime();
        const now = Date.now();
        const diffInSeconds = Math.floor((now - startedAt) / 1000);
        setElapsedSeconds(Math.max(0, diffInSeconds));
      };

      calculateTime(); // Run once immediately
      interval = setInterval(calculateTime, 1000); // Run every second
    }

    return () => clearInterval(interval);
  }, [chat?.status, chat?.startedAt]);

  // Helper to format MM:SS
  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // ==========================================
  //  CALCULATE REMAINING TIME
  // ==========================================
  const remainingTimeInfo = useMemo(() => {
    if (!wallet || !chat?.ratePerMinute) return { minutes: 0, text: "0m" };
    
    const minutesLeft = Math.floor(wallet / chat.ratePerMinute);
    
    // Logic for display color
    let colorClass = "text-[#00695C]";
    if (minutesLeft < 5) colorClass = "text-red-600 font-bold";
    else if (minutesLeft < 10) colorClass = "text-yellow-600";

    return {
      minutes: minutesLeft,
      text: `${minutesLeft} min`,
      color: colorClass
    };
  }, [wallet, chat?.ratePerMinute]);


  // Load data
  const loadChatData = useCallback(async () => {
    try {
      const [chatRes, messagesRes, walletRes] = await Promise.all([
        api.get(`/chat/status/${chatId}`),
        api.get(`/chat/messages/${chatId}`),
        api.get("/auth/wallet")
      ]);

      if (chatRes.data.success) setChat(chatRes.data.chat);
      if (messagesRes.data.success) setMessages(messagesRes.data.messages);
      if (walletRes.data.balance !== undefined) setWallet(walletRes.data.balance);
    } catch (error) {
      toast.error("Failed to load chat");
    }
  }, [chatId]);

  // Socket connection effect
  useEffect(() => {
    if (!socketRef.current && chat?._id) {
        socketRef.current.emit("joinChat", { chatId: chat._id });
    }
  }, [chat?._id]);

  useEffect(() => {
    if (!chat || !socketRef.current) return;
    messages.forEach(msg => {
      if (msg.senderType === "astrologer" && !msg.seen) {
        socketRef.current.emit("messageSeen", { chatId: chat._id, messageId: msg._id });
      }
    });
  }, [messages, chat]);

  // Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !chat || chat.status !== "ACTIVE") return;

    try {
      await api.post("/chat/user/message", { chatId, content: newMessage.trim() });
      setNewMessage("");
      
      socketRef.current.emit("typing", {
        chatId,
        senderId: user._id,
        senderRole: "user",
        isTyping: false // Stop typing immediately after send
      });
    } catch (error) {
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

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
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
    if (!window.confirm("End chat?")) return;
    try {
      await api.post(`/chat/user/end/${chatId}`);
      toast.success("Chat ended");
      router.push("/astrologers");
    } catch (error) {
      toast.error("Failed to end");
    }
  };

  // Recharge
  const handleRecharge = async () => {
    setIsRecharging(true);
    const amount = prompt("Enter amount (₹):", "500");
    if (!amount) { setIsRecharging(false); return; }

    try {
      const orderRes = await api.post("/payment/create-order", { amount: Number(amount) });
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: orderRes.data.amount,
        currency: "INR",
        name: "Astrology Chat",
        order_id: orderRes.data.id,
        handler: async (response) => {
          await api.post("/payment/verify", {
            razorpay_order_id: orderRes.data.id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          const wRes = await api.post("/auth/addMoneyToWallet", { amount: Number(amount) });
          setWallet(wRes.data.balance);
          setIsRecharging(false);
          setGraceSeconds(0);
          toast.success("Recharged!");
          socketRef.current.emit("walletRecharged", { amount: Number(amount), chatId });
        },
        modal: { ondismiss: () => setIsRecharging(false) },
      };
      new window.Razorpay(options).open();
    } catch (error) {
      setIsRecharging(false);
      toast.error("Recharge failed");
    }
  };

  // Grace timer
  useEffect(() => {
    let interval;
    if (graceSeconds > 0) {
      interval = setInterval(() => setGraceSeconds(p => p <= 1 ? 0 : p - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [graceSeconds]);

  // Auto scroll
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Initial load
  useEffect(() => {
    if (!user) return;
    const socket = initSocket();
    loadChatData();
    return () => { if (socket) socket.disconnect(); };
  }, [user, router, initSocket, loadChatData]);

  if (!chat) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#F7F3E9] pt-20 lg:pt-24">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 h-[calc(100vh-80px)]">
        <div className="h-full flex flex-col">
          
          {/* Header */}
          <div className="bg-white rounded-t-2xl border border-[#B2C5B2] px-4 py-3 mb-1 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button onClick={() => router.push("/astrologers")} className="p-2 hover:bg-gray-100 rounded-full">
                  <FaChevronLeft />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#C06014] flex items-center justify-center text-white">
                    <FaUser />
                  </div>
                  <div>
                    <h2 className="font-semibold text-[#003D33]">{chat.astrologer?.fullName}</h2>
                    <div className="flex items-center gap-2 text-xs text-[#00695C]">
                      <span className={`w-2 h-2 rounded-full ${chat.status === "ACTIVE" ? "bg-green-500" : "bg-yellow-500"}`}></span>
                      <span>{chat.status === "ACTIVE" ? formatTime(elapsedSeconds) : "Waiting..."}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Wallet Info Section */}
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <div className="flex items-center justify-end gap-1 text-sm font-medium">
                    <FaWallet className="text-[#C06014]" />
                    <span>₹{wallet}</span>
                  </div>
                  
                  {/* TIME REMAINING DISPLAY */}
                  {chat.status === "ACTIVE" && (
                    <div className={`flex items-center justify-end gap-1 text-xs ${remainingTimeInfo.color}`}>
                      <FaHourglassHalf />
                      <span>{remainingTimeInfo.text} left</span>
                    </div>
                  )}
                </div>

                {graceSeconds > 0 && (
                  <div className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded animate-pulse">
                    End in: {graceSeconds}s
                  </div>
                )}
                
                <button onClick={handleRecharge} className="px-3 py-1 bg-[#003D33] text-white rounded text-sm hover:bg-[#004D40]">
                  + Add Money
                </button>
                
                <button onClick={endChat} className="p-2 text-red-600 hover:bg-red-50 rounded-full">
                  <FaTimes />
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 bg-white rounded-b-2xl border border-[#B2C5B2] flex flex-col min-h-0">
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.senderType === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] rounded-2xl p-3 ${
                    msg.senderType === "user" ? "bg-[#C06014] text-white rounded-br-none" : "bg-[#F7F3E9] text-black rounded-bl-none border"
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <div className="text-[10px] opacity-70 text-right mt-1 flex justify-end gap-1 items-center">
                      {new Date(msg.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                      {msg.senderType === "user" && (msg.seen ? <FaCheckDouble /> : <FaCheck />)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Typing & Input */}
            {astrologerTyping && <div className="px-4 py-1 text-xs text-gray-500 italic">Astrologer is typing...</div>}
            
            <div className="p-3 border-t">
              {/* Mobile Wallet View */}
              <div className="sm:hidden flex justify-between text-xs text-gray-500 mb-2 px-1">
                 <span>Bal: ₹{wallet}</span>
                 <span className={remainingTimeInfo.color}>{remainingTimeInfo.text} left</span>
              </div>

              <form onSubmit={sendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleTyping}
                  disabled={chat.status !== "ACTIVE"}
                  placeholder={chat.status === "ACTIVE" ? "Type a message..." : "Waiting for astrologer..."}
                  className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:border-[#C06014]"
                />
                <button 
                  type="submit" 
                  disabled={!newMessage.trim() || chat.status !== "ACTIVE"}
                  className="w-10 h-10 bg-[#C06014] text-white rounded-full flex items-center justify-center disabled:opacity-50"
                >
                  <FaPaperPlane />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
