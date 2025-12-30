"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FaStar,
  FaComments,
  FaPhone,
  FaWallet,
  FaClock,
  FaGlobe,
  FaGraduationCap,
  FaCheckCircle,
  FaHistory,
  FaArrowLeft,
  FaVideo,
  FaUser,
  FaCalendarAlt,
  FaBook,
  FaLanguage,
  FaAward,
  FaCertificate
} from "react-icons/fa";
import { IoMdChatbubbles } from "react-icons/io";
import { GiSkills } from "react-icons/gi";
import api from "../../lib/api";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";

export default function AstrologerProfile() {
  const { astroId } = useParams();
  const router = useRouter();
  const user = useSelector((state) => state.auth.user);

  const [astrologer, setAstrologer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState(0);
  const [socket, setSocket] = useState(null);
  const [activeChat, setActiveChat] = useState();
  const [isBusy, setIsBusy] = useState(false);
  const [stats, setStats] = useState({
    totalSessions: 0,
    satisfactionRate: 0,
    responseTime: "Within 5 mins"
  });

  // Initialize socket
  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_API, {
      transports: ["websocket", "polling"],
      reconnection: true
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Fetch astrologer data
  const fetchAstrologerData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [astroRes, walletRes] = await Promise.all([
        api.get(`/astrologer/profile/${astroId}`),
        user ? api.get("/auth/wallet") : Promise.resolve({ data: { balance: 0 } })
      ]);
      
      setAstrologer(astroRes.data);
      setWallet(walletRes.data?.balance || 0);
      setIsBusy(astroRes.data?.isBusy || false);

      // Fetch active chat if user is logged in
      if (user) {
        try {
          const chatRes = await api.get(`/chat/user/active-with-astrologer/${astroId}`);
          if (chatRes.data.success && chatRes.data.chat) {
            setActiveChat(chatRes.data.chat);
          }
        } catch (error) {
          // No active chat is fine
          console.log("No active chat found");
        }
      }

      // Fetch astrologer stats (you might want to create this endpoint)
      fetchAstrologerStats();

    } catch (error) {
      console.error("Error fetching astrologer data:", error);
      toast.error("Failed to load astrologer profile");
    } finally {
      setLoading(false);
    }
  }, [astroId, user]);

  const fetchAstrologerStats = async () => {
    try {
      // This is a placeholder - create this endpoint in your backend
      const response = await api.get(`/astrologer/${astroId}/stats`);
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchAstrologerData();
  }, [fetchAstrologerData]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on("astrologerStatusUpdate", ({ astrologerId, isBusy: busyStatus }) => {
      if (astrologerId === astroId) {
        setIsBusy(busyStatus);
        setAstrologer(prev => prev ? { ...prev, isBusy: busyStatus } : null);
      }
    });

    socket.on("chatStarted", ({ chatId, astrologerId }) => {
      if (astrologerId === astroId) {
        setActiveChat({ _id: chatId });
      }
    });

    return () => {
      socket.off("astrologerStatusUpdate");
      socket.off("chatStarted");
    };
  }, [socket, astroId]);

  const handleWalletRecharge = async () => {
    const amount = prompt("Enter recharge amount (₹):", "500");
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
            toast.success(`Recharged ₹${amount} successfully!`);
            
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

  const handleStartChat = async () => {
    if (!user) {
      toast.error("Please login to start a chat");
      router.push("/login");
      return;
    }

    if (activeChat) {
      router.push(`/astrologers/chat/${activeChat._id}`);
      return;
    }

    try {
      toast.loading("Starting chat...", { id: "start-chat" });
      
      const response = await api.post("/chat/user/start", {
        astrologerId: astroId
      });

      toast.dismiss("start-chat");
      
      if (response.data.success) {
        toast.success("Chat request sent!");
        
        if (socket) {
          socket.emit("chatStarted", { 
            chatId: response.data.chat._id,
            astrologerId: astroId 
          });
        }
        
        router.push(`/astrologers/chat/${response.data.chat._id}`);
      }
    } catch (error) {
      toast.dismiss("start-chat");
      console.error("Start chat error:", error);
      
      if (error.response?.data?.message === "Chat already exists") {
        const existingChatId = error.response.data.chat?._id;
        if (existingChatId) {
          router.push(`/astrologers/chat/${existingChatId}`);
        }
      } else {
        toast.error(error.response?.data?.message || "Failed to start chat");
      }
    }
  };

  const handleStartCall = async (type = "voice") => {
    if (!user) {
      toast.error("Please login to start a call");
      router.push("/login");
      return;
    }

    try {
      toast.loading(`Starting ${type} call...`, { id: "start-call" });
      
      const response = await api.post("/call/user/start", {
        astrologerId: astroId,
        type: type
      });

      toast.dismiss("start-call");
      
      if (response.data.success) {
        toast.success(`${type === "voice" ? "Voice" : "Video"} call started!`);
        // Redirect to call page
        router.push(`/call/${response.data.call._id}`);
      }
    } catch (error) {
      toast.dismiss("start-call");
      console.error("Start call error:", error);
      toast.error(error.response?.data?.message || "Failed to start call");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F3E9] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#C06014] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-[#003D33]">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!astrologer) {
    return (
      <div className="min-h-screen bg-[#F7F3E9] flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaUser className="text-4xl text-red-500" />
          </div>
          <h3 className="text-2xl font-bold text-[#003D33] mb-2">
            Astrologer Not Found
          </h3>
          <p className="text-[#00695C] mb-6 max-w-md mx-auto">
            The astrologer you're looking for might not exist or has been removed.
          </p>
          <button
            onClick={() => router.push("/astrologers")}
            className="px-6 py-3 bg-gradient-to-r from-[#C06014] to-[#D47C3A] text-white rounded-full font-medium hover:from-[#D47C3A] hover:to-[#C06014] transition-all"
          >
            Browse Astrologers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F3E9] pt-[100px]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-[#B2C5B2] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/astrologers")}
                className="p-2 hover:bg-[#F7F3E9] rounded-full transition-colors"
              >
                <FaArrowLeft className="text-lg text-[#003D33]" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-[#003D33]">Astrologer Profile</h1>
                <p className="text-sm text-[#00695C]">Detailed information & connect</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {user && (
                <>
                  <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-[#F7F3E9] rounded-full">
                    <FaWallet className="text-[#C06014]" />
                    <span className="font-medium text-[#003D33]">₹{wallet}</span>
                  </div>
                  <button
                    onClick={handleWalletRecharge}
                    className="px-4 py-2 bg-gradient-to-r from-[#003D33] to-[#00695C] text-white rounded-full text-sm font-medium hover:from-[#00695C] hover:to-[#003D33] transition-all"
                  >
                    Recharge
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-[#B2C5B2]/60 shadow-lg sticky top-24">
              {/* Profile Header */}
              <div className="relative">
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    isBusy 
                      ? "bg-red-100 text-red-700 border border-red-300" 
                      : "bg-green-100 text-green-700 border border-green-300"
                  }`}>
                    {isBusy ? "🔴 BUSY" : "🟢 AVAILABLE"}
                  </span>
                </div>

                {/* Profile Image */}
                <div className="p-6 text-center">
                  <div className="relative inline-block">
                    <img
                      src={`${process.env.NEXT_PUBLIC_API}${astrologer.profileImageUrl}`}
                      alt={astrologer.fullName}
                      className="w-40 h-40 rounded-full object-cover border-8 border-white shadow-2xl"
                    />
                    {astrologer.isVerified && (
                      <div className="absolute bottom-4 right-4 bg-[#C06014] text-white p-2 rounded-full shadow-lg">
                        <FaCheckCircle className="text-lg" />
                      </div>
                    )}
                  </div>
                  
                  <h1 className="font-serif font-bold text-2xl text-[#003D33] mt-6">
                    {astrologer.fullName}
                  </h1>
                  
                  <p className="text-lg text-[#00695C] mt-2">
                    {astrologer.specialization || "Vedic Astrologer"}
                  </p>
                  
                  {/* Rating */}
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <div className="flex text-[#FFB74D]">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={`text-xl ${
                            i < Math.floor(astrologer.averageRating || 0)
                              ? "fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-lg font-bold text-[#C06014]">
                      {astrologer.averageRating?.toFixed(1) || "New"}
                    </span>
                    <span className="text-gray-500">
                      ({astrologer.totalReviews || 0} reviews)
                    </span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 p-6 border-t border-[#B2C5B2]/40">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#C06014]">
                      {astrologer.experience || "5+"}
                    </div>
                    <div className="text-xs text-[#00695C]">Years Exp</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#C06014]">
                      {stats.totalSessions || "1K+"}
                    </div>
                    <div className="text-xs text-[#00695C]">Sessions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#C06014]">
                      {stats.satisfactionRate || "98"}%
                    </div>
                    <div className="text-xs text-[#00695C]">Satisfaction</div>
                  </div>
                </div>
              </div>

              {/* Connection Buttons */}
              <div className="p-6 border-t border-[#B2C5B2]/40 space-y-4">
                {activeChat ? (
                  <button
                    onClick={() => router.push(`/astrologers/chat/${activeChat._id}`)}
                    className="w-full py-4 bg-gradient-to-r from-[#00695C] to-[#003D33] text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 hover:from-[#003D33] hover:to-[#00695C] transition-all shadow-lg hover:shadow-xl"
                  >
                    <FaHistory />
                    Resume Chat
                  </button>
                ) : (
                  <>
                    {["CHAT", "BOTH"].includes(astrologer.availability) && (
                      <button
                        onClick={handleStartChat}
                        disabled={isBusy || !user}
                        className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg ${
                          isBusy || !user
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-[#C06014] to-[#D47C3A] text-white hover:from-[#D47C3A] hover:to-[#C06014] hover:shadow-xl"
                        }`}
                      >
                        <IoMdChatbubbles className="text-xl" />
                        {isBusy ? "Currently Busy" : !user ? "Login to Chat" : "Start Chat"}
                        <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                          ₹{astrologer.pricing?.chatPerMinute || 50}/min
                        </span>
                      </button>
                    )}
                    
                    {["CALL", "BOTH"].includes(astrologer.availability) && (
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => handleStartCall("voice")}
                          disabled={isBusy || !user}
                          className={`py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                            isBusy || !user
                              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                              : "bg-gradient-to-r from-[#00695C] to-[#003D33] text-white hover:from-[#003D33] hover:to-[#00695C]"
                          }`}
                        >
                          <FaPhone />
                          Voice Call
                          <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                            ₹{astrologer.pricing?.callPerMinute || 100}/min
                          </span>
                        </button>
                        <button
                          onClick={() => handleStartCall("video")}
                          disabled={isBusy || !user}
                          className={`py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                            isBusy || !user
                              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                              : "bg-gradient-to-r from-[#C06014] to-[#D47C3A] text-white hover:from-[#D47C3A] hover:to-[#C06014]"
                          }`}
                        >
                          <FaVideo />
                          Video Call
                          <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                            ₹{astrologer.pricing?.callPerMinute || 150}/min
                          </span>
                        </button>
                      </div>
                    )}
                  </>
                )}
                
                {!user && (
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-2">Login to connect with astrologer</p>
                    <button
                      onClick={() => router.push("/login")}
                      className="px-4 py-2 bg-[#F7F3E9] border border-[#B2C5B2] text-[#003D33] rounded-full text-sm font-medium hover:bg-[#E8E3CF] transition-colors"
                    >
                      Login / Sign Up
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <div className="bg-white rounded-2xl border border-[#B2C5B2]/60 shadow-lg p-6">
              <h2 className="text-xl font-bold text-[#003D33] mb-4 flex items-center gap-2">
                <FaUser className="text-[#C06014]" />
                About Me
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {astrologer.bio || `Expert ${astrologer.specialization || "Vedic astrologer"} with ${astrologer.experience || "5+"} years of experience. Specializing in providing accurate predictions and guidance for life's challenges. Committed to helping clients find clarity and direction through ancient wisdom.`}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#F7F3E9] rounded-lg flex items-center justify-center">
                    <FaGraduationCap className="text-[#C06014]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#003D33]">Education</h4>
                    <p className="text-sm text-gray-600">{astrologer.education || "Masters in Vedic Astrology"}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#F7F3E9] rounded-lg flex items-center justify-center">
                    <FaLanguage className="text-[#C06014]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#003D33]">Languages</h4>
                    <p className="text-sm text-gray-600">{(astrologer.languages || ["English", "Hindi", "Punjabi"]).join(", ")}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#F7F3E9] rounded-lg flex items-center justify-center">
                    <FaGlobe className="text-[#C06014]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#003D33]">Timezone</h4>
                    <p className="text-sm text-gray-600">IST (GMT+5:30)</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#F7F3E9] rounded-lg flex items-center justify-center">
                    <FaClock className="text-[#C06014]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#003D33]">Response Time</h4>
                    <p className="text-sm text-gray-600">{stats.responseTime || "Within 5 minutes"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills & Expertise */}
            <div className="bg-white rounded-2xl border border-[#B2C5B2]/60 shadow-lg p-6">
              <h2 className="text-xl font-bold text-[#003D33] mb-4 flex items-center gap-2">
                <GiSkills className="text-[#C06014]" />
                Skills & Expertise
              </h2>
              <div className="flex flex-wrap gap-3">
                {(astrologer.skills || [
                  "Vedic Astrology", "Horoscope Reading", "Numerology", 
                  "Palmistry", "Vastu Shastra", "Gemstone Recommendation",
                  "Career Guidance", "Relationship Counseling"
                ]).map((skill, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-gradient-to-r from-[#F7F3E9] to-[#E8E3CF] text-[#00695C] rounded-full text-sm font-medium border border-[#B2C5B2]/40"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Experience & Certifications */}
            <div className="bg-white rounded-2xl border border-[#B2C5B2]/60 shadow-lg p-6">
              <h2 className="text-xl font-bold text-[#003D33] mb-4 flex items-center gap-2">
                <FaCertificate className="text-[#C06014]" />
                Experience & Certifications
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#F7F3E9] rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaBook className="text-[#C06014]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#003D33]">Certifications</h4>
                    <p className="text-sm text-gray-600">
                      Certified Vedic Astrologer, International Institute of Astrology<br />
                      Jyotish Visharad, Bharatiya Vidya Bhavan
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#F7F3E9] rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaAward className="text-[#C06014]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#003D33]">Achievements</h4>
                    <p className="text-sm text-gray-600">
                      • Featured in Astrology Today Magazine (2023)<br />
                      • Best Astrologer Award, National Astrology Conference (2022)<br />
                      • 5000+ satisfied clients worldwide
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews Preview */}
            <div className="bg-white rounded-2xl border border-[#B2C5B2]/60 shadow-lg p-6">
              <h2 className="text-xl font-bold text-[#003D33] mb-4 flex items-center gap-2">
                <FaStar className="text-[#C06014]" />
                Client Reviews ({astrologer.totalReviews || 0})
              </h2>
              <div className="space-y-4">
                {[1, 2].map((review, index) => (
                  <div key={index} className="border-b border-[#B2C5B2]/20 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#F7F3E9] rounded-full"></div>
                        <span className="font-medium text-[#003D33]">Client {index + 1}</span>
                      </div>
                      <div className="flex text-[#FFB74D]">
                        {[...Array(5)].map((_, i) => (
                          <FaStar key={i} className="fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      "Excellent guidance! The predictions were accurate and helped me make important life decisions."
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <FaCalendarAlt className="text-gray-400 text-xs" />
                      <span className="text-xs text-gray-500">2 weeks ago</span>
                    </div>
                  </div>
                ))}
                {astrologer.totalReviews > 2 && (
                  <button
                    onClick={() => router.push(`/astrologers/${astroId}/reviews`)}
                    className="w-full py-3 border border-[#B2C5B2] text-[#00695C] rounded-xl font-medium hover:bg-[#F7F3E9] transition-colors"
                  >
                    View All Reviews
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}