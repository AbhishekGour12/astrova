"use client";
export const dynamic = "force-dynamic";


import { useEffect, useState, useCallback, Suspense } from "react";
import {
  FaStar,
  FaComments,
  FaPhone,
  FaWallet,
  FaCheckCircle,
  FaClock,
  FaUserCheck,
  FaHistory,
  FaArrowRight,
  FaTimes,
  FaUser,
  FaPhoneAlt,
  FaEnvelope,
  FaPhoneSlash,
  FaSpinner,
  FaCircle
} from "react-icons/fa";
import { useRouter, useSearchParams } from "next/navigation";
import api from "../lib/api"
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";

import { useCall } from "../hooks/useCall";
// 1. Create a Loading Component (Extracted from your existing code)
const LoadingFallback = () => (
  <div className="min-h-screen bg-[#F7F3E9] flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-[#C06014] border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p className="mt-4 text-[#003D33]">Loading astrologers...</p>
    </div>
  </div>
);
 function AstrologerContent() {
  const [astrologers, setAstrologers] = useState([]);
  const [wallet, setWallet] = useState(0);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [activeChats, setActiveChats] = useState([]);
  const [resumeChats, setResumeChats] = useState([]);
  const [showMeetModal, setShowMeetModal] = useState(false);
  const [selectedAstrologer, setSelectedAstrologer] = useState(null);
  const [meetForm, setMeetForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [meetLoading, setMeetLoading] = useState(false);
  const router = useRouter();
  const user = useSelector((state) => state.auth.user);


const searchParams = useSearchParams();
const service = searchParams?.get("service") || "ALL";


 // Use the call hook
  
// ✅ UPDATED: Use the new useCall hook for Zego
  const { 
    startCall, 
    isConnecting: callConnecting,
    zegoReady
  } = useCall(null, user ? `user_${user._id}` : null);

  // Initialize socket
  useEffect(() => {
     if (typeof window === "undefined") return;
    const newSocket = io(process.env.NEXT_PUBLIC_API, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    setSocket(newSocket);
    let token = localStorage.getItem("token")
    if(!token){
      toast.error("login first")
      router.push("/Login")
    }

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on("astrologerStatusUpdate", ({ astrologerId, isBusy }) => {
      setAstrologers(prev =>
        prev.map(astro =>
          astro._id === astrologerId
            ? { ...astro, isBusy }
            : astro
        )
      );
    });

    socket.on("chatStarted", ({ chatId, astrologerId }) => {
      // Update active chats when new chat is started
      fetchActiveChats();
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });
    // ✅ UPDATED: Changed socket event for Zego
    socket.on("callActivated", (data) => {
      console.log("📞 Call activated via socket:", data);
      // Navigate to call page when call is activated
      router.push(`/astrologers/call/${data.callId}`);
    });

    socket.on("callRejected", (data) => {
      toast.error("Call was rejected by astrologer");
    });

    socket.on("callMissed", (data) => {
      toast.error("Astrologer did not answer");
    });

    socket.on("walletUpdated", ({ walletBalance }) => {
      setWallet(walletBalance);
    });

     socket.on("zegoParticipantJoined", (data) => {
      console.log("Astrologer joined Zego room:", data);
    });

    socket.on("zegoParticipantLeft", (data) => {
      console.log("Astrologer left Zego room:", data);
    });
    socket.on("astrologerAvailabilityChanged", ({ astrologerId, isAvailable }) => {
      setAstrologers(prev =>
        prev.map(astro =>
          astro._id === astrologerId
            ? { ...astro, isAvailable }
            : astro
        )
      );
    });
    return () => {
      socket.off("astrologerStatusUpdate");
      socket.off("chatStarted");
      socket.off("connect_error");
       socket.off("callActivated");
      socket.off("callRejected");
      socket.off("callMissed");
      socket.off("walletUpdated");
      socket.off("zegoParticipantJoined");
      socket.off("zegoParticipantLeft");
       socket.off("astrologerAvailabilityChanged");

    };
  }, [socket, router]);


  const fetchActiveChats = useCallback(async () => {
    try {
      if(!user){
        return;
      }
      const response = await api.get('/chat/user/active');
      if (response.data.success) {
        setActiveChats(response.data.chats);
        
        // Extract unique astrologer IDs from active chats
        const activeAstrologerIds = response.data.chats
          .filter(chat => chat.status === "ACTIVE" || chat.status === "WAITING")
          .map(chat => chat.astrologer?._id)
          .filter(Boolean);
        
        // Create resume chats data structure
        const resumeData = response.data.chats
          .filter(chat => chat.status === "ACTIVE" || chat.status === "WAITING")
          .map(chat => ({
            chatId: chat._id,
            astrologerId: chat.astrologer?._id,
            astrologerName: chat.astrologer?.fullName,
            status: chat.status,
            lastMessage: chat.lastMessage,
            updatedAt: chat.updatedAt
          }));
        
        setResumeChats(resumeData);
        
        // Update astrologers with active chat status
        setAstrologers(prev => prev.map(astro => ({
          ...astro,
          hasActiveChat: activeAstrologerIds.includes(astro._id)
        })));
      }
    } catch (error) {
      console.error("Error fetching active chats:", error);
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      if(!user){
        return;
      }
      setLoading(true);
     



      const [astroRes, walletRes] = await Promise.all([
        api.get('/astrologer', {
          params: service != "ALL" ? { service } : {}
        }),
        api.get('/auth/wallet')
      ]);
      
      setAstrologers(astroRes?.data || []);
      setWallet(walletRes.data?.balance || 0);
      
      // Fetch active chats if user is logged in
      if (user) {
        await fetchActiveChats();
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to load astrologers");
    } finally {
      setLoading(false);
    }
  }, [service,user, fetchActiveChats]);

  useEffect(() => {
    fetchData()
  }, [fetchData]);

  const handleWalletRecharge = async () => {
    const amount = prompt("Enter recharge amount (₹)");
    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
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
        name: "My Astrova",
        description: "Wallet Recharge",
        order_id: orderRes.data.id,
        handler: async (response) => {
          try {
            const verifyRes = await api.post("/payment/verify", {
              razorpay_order_id: orderRes.data.id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (!verifyRes.data.success) {
              toast.error("Payment verification failed");
              return;
            }

            const walletRes = await api.post("/auth/addMoneyToWallet", {
              amount: Number(amount),
            });

            setWallet(walletRes.data.balance);
            toast.success("Wallet recharged successfully! 💰");
            
            if (socket) {
              socket.emit("walletRecharged", { amount: Number(amount) });
            }
          } catch (err) {
            console.error("Payment handler error:", err);
            toast.error("Failed to process payment");
          }
        },
        theme: { color: "#C06014" },
        modal: {
          ondismiss: () => toast.error("Payment cancelled"),
        },
      };

if (typeof window !== "undefined") {
  const rzp = new window.Razorpay(options);
  rzp.open();
}


    } catch (err) {
      console.error("Recharge error:", err);
      toast.error("Failed to initiate payment");
    }
  };

  const handleStartChat = async (astrologerId) => {
    try {
      if(!user){
        toast.error("login first");
        return;
      }
      toast.loading("Starting chat...", { id: "start-chat" });
      
      const response = await api.post("/chat/user/start", {
        astrologerId
      });

      toast.dismiss("start-chat");
      
      if (response.data.success) {
        toast.success("Chat request sent!");
        
        // Update resume chats
        await fetchActiveChats();
        
        router.push(`/astrologers/chat/${response.data.chat._id}`);
        
        // Notify via socket
        if (socket) {
          socket.emit("chatStarted", { 
            chatId: response.data.chat._id,
            astrologerId 
          });
        }
      }
    } catch (error) {
      toast.dismiss("start-chat");
      console.error("Start chat error:", error);
      
      if (error.response?.data?.message === "Chat already exists") {
        const existingChatId = error.response.data.chat?._id;
        if (existingChatId) {
          router.push(`/astrologers/chat/${existingChatId}`);
        } else {
          toast.error("Chat already exists but ID not found");
        }
      } else {
        toast.error(error.response?.data?.message || "Failed to start chat");
      }
    }
  };

  const handleResumeChat = (chatId) => {
    router.push(`/astrologers/chat/${chatId}`);
  };

  // Function to get resume chat for a specific astrologer
  const getResumeChatForAstrologer = (astrologerId) => {
    return resumeChats.find(chat => chat.astrologerId === astrologerId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F3E9] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#C06014] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-[#003D33]">Loading astrologers...</p>
        </div>
      </div>
    );
  }



  // Add call handler function
const handleStartCall = async (astrologerId) => {
  if (!user) {
    toast.error("Please login to start a call");
    router.push("/login");
    return;
  }

  if (callConnecting) {
    toast.loading("Starting call...", { id: "start-call" });
    return;
  }

  try {
    toast.loading("Starting voice call...", { id: "start-call" });
    
    const callData = await startCall(astrologerId);
    
    if (callData) {
      toast.success("Call request sent! Waiting for astrologer...");
    }
  } catch (error) {
    console.error("Start call error:", error);
    
    // Handle specific errors
    if (error.response?.data?.message?.includes("already exists")) {
      const existingCallId = error.response.data.call?._id;
      if (existingCallId) {
        router.push(`/astrologers/call/${existingCallId}`);
      }
    } else if (error.message?.includes("balance")) {
      toast.error("Insufficient balance to start call");
    } else {
      toast.error("Failed to start call. Please try again.");
    }
  }
};
const canChat = (a) =>
  ["CHAT", "BOTH", "ALL"].includes(a.availability);

const canCall = (a) =>
  ["CALL", "BOTH", "ALL"].includes(a.availability);

const canMeet = (a) =>
  ["MEET", "ALL"].includes(a.availability);

/* ================= SERVICE PAGE FILTER ================= */

const showChatBtn = (a) =>
  (service === "CHAT" || service === "ALL") && canChat(a);

const showCallBtn = (a) =>
  (service === "CALL" || service === "ALL") && canCall(a);

const showMeetBtn = (a) =>
  (service === "MEET" || service === "ALL") && canMeet(a);
// Meet Modal Functions
  const openMeetModal = (astrologer) => {
    if (!user) {
      toast.error("Please login first");
      router.push("/");
      return;
    }
    
    setSelectedAstrologer(astrologer);
    // Pre-fill form with user data if available
    if (user) {
      setMeetForm(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || ""
      }));
    }
    setShowMeetModal(true);
  };

  const closeMeetModal = () => {
    setShowMeetModal(false);
    setSelectedAstrologer(null);
    setMeetForm({
      name: "",
      email: "",
      phone: "",
      message: "",
    });
  };

  const handleMeetFormChange = (e) => {
    const { name, value } = e.target;
    setMeetForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMeetSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedAstrologer) return;
    
    // Validate form
    if (!meetForm.name.trim() || !meetForm.email.trim() || !meetForm.phone.trim()) {
      toast.error("Please fill all required fields");
      return;
    }
    
    setMeetLoading(true);
    
    try {
      const response = await api.post('/auth/meet-request', {
        astrologerId: selectedAstrologer._id,
        astrologerEmail: selectedAstrologer.email,
        astrologerName: selectedAstrologer.fullName,
        userName: meetForm.name,
        userEmail: meetForm.email,
        userPhone: meetForm.phone,
        message: meetForm.message,
        service: "MEET"
      });
      
      if (response.data.success) {
        toast.success("Meeting request sent successfully! The astrologer will contact you soon.");
        closeMeetModal();
      } else {
        toast.error(response.data.message || "Failed to send request");
      }
    } catch (error) {
      console.error("Meet request error:", error);
      toast.error(error.response?.data?.message || "Failed to send meeting request");
    } finally {
      setMeetLoading(false);
    }
  };
// Test in browser console
const testToken = async () => {
  const body = {
      roomId: 'test_room',
      userId: 'test_user',
      userName: 'Test User'
    }
  
  const response = await api.post('/call/zego-token', body, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    
  });
  console.log(response)
  
  console.log('Token response:', data);
};
  return (
    <div className="min-h-screen bg-[#F7F3E9] px-4 sm:px-6 lg:px-10 py-6 relative">
      
      {/* Header */}
      <div className="mb-8 mt-20">
       
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-[#003D33]">
              Connect with Expert Astrologers
            </h1>
            <p className="text-sm md:text-base text-[#00695C] mt-1">
              Real-time guidance through ancient wisdom
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            {/* Resume Chats Badge */}
            {resumeChats.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => router.push("/astrologers/chats")}
                  className="flex items-center gap-2 bg-gradient-to-r from-[#C06014] to-[#D47C3A] text-white px-4 py-2 rounded-full hover:from-[#D47C3A] hover:to-[#C06014] transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <FaHistory />
                  <span className="font-medium">Resume Chat{resumeChats.length > 1 ? 's' : ''}</span>
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                    {resumeChats.length}
                  </span>
                </button>
              </div>
            )}
            
            <div className="bg-white border border-[#B2C5B2] rounded-full px-4 py-2 shadow-sm">
              <span className="text-sm font-medium text-[#003D33]">
                {astrologers.length} Astrologers Online
              </span>
            </div>
            
            <button
              onClick={handleWalletRecharge}
              className="flex items-center gap-2 bg-gradient-to-r from-[#003D33] to-[#00695C] text-white px-4 py-2 rounded-full hover:from-[#00695C] hover:to-[#003D33] transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <FaWallet className="text-lg" />
              <span className="font-medium">₹{wallet}</span>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                +
              </span>
            </button>
          </div>
        </div>
        
      
      </div>

      {/* Active Chats Banner */}
      {resumeChats.length > 0 && (
        <div className="mb-6 p-4 bg-gradient-to-r from-[#E6F2ED] to-[#F5EDE6] border border-[#B2C5B2] rounded-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                <FaHistory className="text-[#C06014]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#003D33]">
                  Continue Your Conversation
                </h3>
                <p className="text-sm text-[#00695C]">
                  You have {resumeChats.length} active chat{resumeChats.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {resumeChats.slice(0, 3).map((chat, index) => (
                <button
                  key={index}
                  onClick={() => handleResumeChat(chat.chatId)}
                  className="px-3 py-2 bg-white border border-[#B2C5B2] rounded-lg text-sm font-medium hover:bg-[#F7F3E9] transition-colors flex items-center gap-2"
                >
                  <span className="truncate max-w-[120px]">{chat.astrologerName}</span>
                  <FaArrowRight className="text-[#C06014]" />
                </button>
              ))}
              {resumeChats.length > 3 && (
                <button
                  onClick={() => router.push("/astrologers/chats")}
                  className="px-3 py-2 bg-[#C06014] text-white rounded-lg text-sm font-medium hover:bg-[#A84F12] transition-colors"
                >
                  +{resumeChats.length - 3} more
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Astrologer Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {astrologers.map((astrologer) => {
          const resumeChat = getResumeChatForAstrologer(astrologer._id);
          
          return (
            <div
              key={astrologer._id}
              className="bg-white rounded-2xl p-5 border border-[#B2C5B2]/60 shadow-[0_8px_30px_rgba(0,61,51,0.08)] hover:shadow-[0_12px_40px_rgba(192,96,20,0.15)] transition-all duration-300 hover:-translate-y-1 relative"
            >

              {/* Status Badge - Updated with online/offline */}
              <div className="flex justify-between items-center mb-3">
                <div className="flex flex-col gap-1">
                  {/* Online/Offline Status */}
                  <div className="flex items-center gap-1">
                    <FaCircle
                      className={`text-xs ${astrologer.isAvailable ? 'text-green-500' : 'text-gray-400'}`}
                    />
                    <span className={`text-xs font-medium ${astrologer.isAvailable ? 'text-green-600' : 'text-gray-500'}`}>
                      {astrologer.isAvailable ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
              {/* Status Badge */}
              <div className="flex justify-between items-center mb-3">
                <div>
                 {resumeChat && showChatBtn(astrologer) && (
  <button
    onClick={() => handleResumeChat(resumeChat.chatId)}
    className="w-full p-3 rounded-xl font-medium flex items-center justify-center gap-2 bg-gradient-to-r from-[#00695C] to-[#003D33] text-white"
  >
    <FaHistory />
    Resume Chat
  </button>
)}

                </div>
              <span
  className={`px-3 py-1 rounded-full text-xs font-semibold ${
   service === "MEET"
      ? "bg-green-100 text-green-700"
      :service === "CHAT"
      ? astrologer.isBusyChat
        ? "bg-red-100 text-red-700"
        : "bg-green-100 text-green-700"
      :service === "CALL"
      ? astrologer.isBusyCall
        ? "bg-red-100 text-red-700"
        : "bg-green-100 text-green-700"
      : astrologer.isBusy
      ? "bg-red-100 text-red-700"
      : "bg-green-100 text-green-700"
  }`}
>
  {service === "MEET"
    ? "🟢 AVAILABLE"
    :service === "CHAT"
    ? astrologer.isBusyChat
      ? "🔴 BUSY"
      : "🟢 AVAILABLE"
    :service === "CALL"
    ? astrologer.isBusyCall
      ? "🔴 BUSY"
      : "🟢 AVAILABLE"
    : astrologer.isBusy
    ? "🔴 BUSY"
    : "🟢 AVAILABLE"}
</span>

              </div>

              {/* Profile */}
              <div className="text-center">
                <div className="relative inline-block">
                  <img
                    src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${astrologer.profileImageUrl}`}
                    alt={astrologer.fullName}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  {astrologer.isVerified && (
                    <div className="absolute -bottom-2 -right-2 bg-[#C06014] text-white p-1.5 rounded-full">
                      <FaCheckCircle className="text-sm" />
                    </div>
                  )}
                </div>
                
                <h3 className="font-serif font-bold text-[#003D33] mt-4 text-lg">
                  {astrologer.fullName}
                </h3>
                
                <p className="text-sm text-[#00695C] mt-1">
                  {astrologer.specialization || "Vedic Astrologer"}
                </p>
                
                {/* Rating */}
                <div className="flex items-center justify-center gap-1 mt-2">
                  <div className="flex text-[#FFB74D]">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={`${
                          i < Math.floor(astrologer.averageRating || 0)
                            ? "fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-[#C06014] ml-1">
                    {astrologer.averageRating?.toFixed(1) || "New"}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({astrologer.totalReviews || 0})
                  </span>
                </div>
                
                {/* Experience */}
                <div className="flex items-center justify-center gap-2 mt-2 text-sm text-[#00695C]">
                  <FaClock />
                  <span>{astrologer.experienceYears || "5+"} years experience</span>
                </div>
                
                {/* Languages */}
                <div className="mt-3">
                  <div className="flex flex-wrap justify-center gap-1">
                    {(astrologer.languages || ["English", "Hindi"]).map((lang, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-[#F7F3E9] text-[#00695C] text-xs rounded-full"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Pricing */}
              <div className="mt-4 space-y-2">

  {showChatBtn(astrologer) && (
    <div className="flex items-center justify-center gap-2">
      <FaComments className="text-[#C06014]" />
      <span className="font-medium text-[#003D33]">
        ₹{astrologer.pricing?.chatPerMinute || 50}/min
      </span>
    </div>
  )}

 
{/* ✅ UPDATED: Call Button with Zego */}
                  {showCallBtn(astrologer) && (
  <button
    disabled={astrologer.isBusyCall || callConnecting || !astrologer.isAvailable}
    onClick={() => handleStartCall(astrologer._id)}
    className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 ${
      astrologer.isBusyCall || callConnecting
        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
        : "bg-gradient-to-r from-[#003D33] to-[#00695C] text-white hover:from-[#00695C] hover:to-[#003D33]"
    }`}
  >
    {callConnecting ? (
      <>
        <FaSpinner className="animate-spin" />
        Starting...
      </>
    ) : astrologer.isBusyCall ? (
      <>
        <FaPhoneSlash />
        Busy
      </>
    ) : (
      <>
        <FaPhone />
        Call
      </>
    )}
    <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
      ₹{astrologer.pricing?.callPerMinute || 100}/min
    </span>
  </button>
)}
   

  {showMeetBtn(astrologer) && (
        <button
          onClick={() => openMeetModal(astrologer)}
          className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white hover:from-purple-700 hover:to-purple-900 transition-all"
        >
          <FaUserCheck />
          Book Meet
        </button>
      )}

</div>

                
                {/* Actions */}
               <div className="mt-6 space-y-2">

  {/* RESUME CHAT */}
  {resumeChat &&service !== "MEET" && (
    <button
      disabled={!astrologer.isAvailable}
      onClick={() => handleResumeChat(resumeChat.chatId)}
      className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 bg-gradient-to-r from-[#00695C] to-[#003D33] text-white"
    >
      <FaHistory />
      Resume Chat
    </button>
  )}

  {/* CHAT */}
  {showChatBtn(astrologer) && !resumeChat && (
  <button
    onClick={() => handleStartChat(astrologer._id)}
    disabled={astrologer.isBusyChat || !astrologer.isAvailable}
    className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 ${
      astrologer.isBusyChat
        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
        : "bg-gradient-to-r from-[#C06014] to-[#D47C3A] text-white"
    }`}
  >
    <FaComments />
    Chat
  </button>
)}


 


 

  {/* PROFILE */}
  <button
    onClick={() => router.push(`/astrologers/${astrologer._id}`)}
    className="w-full py-2.5 border border-[#B2C5B2] text-[#00695C] rounded-xl"
  >
    View Profile
  </button>
</div>

              </div>
            </div>
          );
        })}
      </div>
      
      {/* Empty State */}
      {astrologers.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-[#F7F3E9] rounded-full flex items-center justify-center mx-auto mb-4">
            <FaUserCheck className="text-4xl text-[#B2C5B2]" />
          </div>
          <h3 className="text-xl font-semibold text-[#003D33] mb-2">
            No Astrologers Available
          </h3>
          <p className="text-[#00695C] max-w-md mx-auto">
            All our astrologers are currently busy. Please check back in a few minutes.
          </p>
        </div>
      )}
       {/* Meet Booking Modal */}
      {showMeetModal && selectedAstrologer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#003D33] flex items-center gap-2">
                <FaUserCheck className="text-[#C06014]" />
                Book Meeting with {selectedAstrologer.fullName}
              </h3>
              <button
                onClick={closeMeetModal}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleMeetSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#00695C] mb-1">
                    Your Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={meetForm.name}
                      onChange={handleMeetFormChange}
                      required
                      className="w-full pl-10 pr-3 py-2.5 border border-[#B2C5B2] rounded-lg focus:ring-2 focus:ring-[#C06014] focus:border-transparent outline-none"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#00695C] mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={meetForm.email}
                      onChange={handleMeetFormChange}
                      required
                      className="w-full pl-10 pr-3 py-2.5 border border-[#B2C5B2] rounded-lg focus:ring-2 focus:ring-[#C06014] focus:border-transparent outline-none"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#00695C] mb-1">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaPhoneAlt className="text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={meetForm.phone}
                      onChange={handleMeetFormChange}
                      required
                      className="w-full pl-10 pr-3 py-2.5 border border-[#B2C5B2] rounded-lg focus:ring-2 focus:ring-[#C06014] focus:border-transparent outline-none"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#00695C] mb-1">
                    Message (Optional)
                  </label>
                  <textarea
                    name="message"
                    value={meetForm.message}
                    onChange={handleMeetFormChange}
                    rows="3"
                    className="w-full px-3 py-2.5 border border-[#B2C5B2] rounded-lg focus:ring-2 focus:ring-[#C06014] focus:border-transparent outline-none resize-none"
                    placeholder="Any specific concerns or preferred time for meeting..."
                  />
                </div>
              </div>
              
              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={closeMeetModal}
                  className="flex-1 py-3 border border-[#B2C5B2] text-[#00695C] rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={meetLoading}
                  className="flex-1 py-3 bg-gradient-to-r from-[#C06014] to-[#D47C3A] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {meetLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : "Send Request"}
                </button>
              </div>
              
              <p className="text-xs text-gray-500 mt-4 text-center">
                The astrologer will receive your details and contact you to schedule the meeting
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


// 3. New Default Export wrapping the content in Suspense
export default function AstrologerList() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AstrologerContent />
    </Suspense>
  );
}