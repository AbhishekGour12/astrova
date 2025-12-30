"use client";
import { useEffect, useState, useCallback } from "react";
import {
  FaStar,
  FaComments,
  FaPhone,
  FaWallet,
  FaCheckCircle,
  FaClock,
  FaUserCheck,
  FaHistory,
  FaArrowRight
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import api from "../lib/api"
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";

export default function AstrologerList() {
  const [astrologers, setAstrologers] = useState([]);
  const [wallet, setWallet] = useState(0);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [activeChats, setActiveChats] = useState([]);
  const [resumeChats, setResumeChats] = useState([]);
  const router = useRouter();
  const user = useSelector((state) => state.auth.user);

  // Initialize socket
  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_API, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    setSocket(newSocket);
    if(!user){
      toast.error("login first")
      router.push("/")
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

    return () => {
      socket.off("astrologerStatusUpdate");
      socket.off("chatStarted");
      socket.off("connect_error");
    };
  }, [socket]);

  const fetchActiveChats = useCallback(async () => {
    try {
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
      setLoading(true);
      
      const [astroRes, walletRes] = await Promise.all([
        api.get('/astrologer'),
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
  }, [user, fetchActiveChats]);

  useEffect(() => {
    fetchData();
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
        name: "Sacred Earth Astrology",
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

      const rzp = new window.Razorpay(options);
      rzp.open();
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
        
        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-[#B2C5B2] rounded-xl p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-[#C06014]">4.3Cr+</div>
            <div className="text-sm text-[#00695C]">Happy Customers</div>
          </div>
          <div className="bg-white border border-[#B2C5B2] rounded-xl p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-[#C06014]">13K+</div>
            <div className="text-sm text-[#00695C]">Expert Astrologers</div>
          </div>
          <div className="bg-white border border-[#B2C5B2] rounded-xl p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-[#C06014]">60+</div>
            <div className="text-sm text-[#00695C]">Countries Served</div>
          </div>
          <div className="bg-white border border-[#B2C5B2] rounded-xl p-4 text-center shadow-sm">
            <div className="text-2xl font-bold text-[#C06014]">24/7</div>
            <div className="text-sm text-[#00695C]">Available Support</div>
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
              {/* Status Badge */}
              <div className="flex justify-between items-center mb-3">
                <div>
                  {resumeChat && (
                    <span className="px-2 py-1 bg-gradient-to-r from-[#00695C] to-[#003D33] text-white rounded-full text-xs font-semibold flex items-center gap-1">
                      <FaHistory className="text-[10px]" />
                      Active Chat
                    </span>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  astrologer.isBusy 
                    ? "bg-red-100 text-red-700" 
                    : "bg-green-100 text-green-700"
                }`}>
                  {astrologer.isBusy ? "🔴 BUSY" : "🟢 AVAILABLE"}
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
                  <span>{astrologer.experience || "5+"} years experience</span>
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
                  {["CHAT", "BOTH"].includes(astrologer.availability) && (
                    <div className="flex items-center justify-center gap-2">
                      <FaComments className="text-[#C06014]" />
                      <span className="font-medium text-[#003D33]">
                        ₹{astrologer.pricing?.chatPerMinute || 50}/min
                      </span>
                    </div>
                  )}
                  
                  {["CALL", "BOTH"].includes(astrologer.availability) && (
                    <div className="flex items-center justify-center gap-2">
                      <FaPhone className="text-[#00695C]" />
                      <span className="font-medium text-[#003D33]">
                        ₹{astrologer.pricing?.callPerMinute || 100}/min
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Actions */}
                <div className="mt-6 space-y-2">
                  {resumeChat ? (
                    <>
                      <button
                        onClick={() => handleResumeChat(resumeChat.chatId)}
                        className="w-full py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-[#00695C] to-[#003D33] text-white hover:from-[#003D33] hover:to-[#00695C] hover:shadow-lg"
                      >
                        <FaHistory />
                        Resume Chat
                      </button>
                      <div className="text-xs text-center text-gray-500">
                        Chat status: <span className="font-medium capitalize">{resumeChat.status.toLowerCase()}</span>
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={() => handleStartChat(astrologer._id)}
                      disabled={astrologer.isBusy}
                      className={`w-full py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                        astrologer.isBusy
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-[#C06014] to-[#D47C3A] text-white hover:from-[#D47C3A] hover:to-[#C06014] hover:shadow-lg"
                      }`}
                    >
                      <FaComments />
                      {astrologer.isBusy ? "Currently Busy" : "Start Chat"}
                    </button>
                  )}
                  
                  <button
                    onClick={() => router.push(`/astrologers/${astrologer._id}`)}
                    className="w-full py-2.5 border border-[#B2C5B2] text-[#00695C] rounded-xl font-medium hover:bg-[#F7F3E9] transition-colors"
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
    </div>
  );
}