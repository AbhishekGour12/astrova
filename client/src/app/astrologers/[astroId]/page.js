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
  FaTimes,
  FaChevronLeft,
  FaUserCheck,
  FaEnvelope,
  FaPhoneAlt
} from "react-icons/fa";
import { IoMdChatbubbles } from "react-icons/io";
import { GiSkills } from "react-icons/gi";
import api from "../../lib/api";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import Image from "next/image";
import { useCall } from "../../hooks/useCall";

export default function AstrologerProfile() {
  const { astroId } = useParams();
  const router = useRouter();
  const [showMeetModal, setShowMeetModal] = useState(false);
  const [selectedAstrologer, setSelectedAstrologer] = useState(null);
  const [meetForm, setMeetForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [meetLoading, setMeetLoading] = useState(false);
  const user = useSelector((state) => state.auth.user);
const { startCall, isConnecting: callConnecting } = useCall(null, user ? `user_${user._id}` : null);
  const [astrologer, setAstrologer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState(0);
  const [socket, setSocket] = useState(null);
  const [activeChat, setActiveChat] = useState(null);

 const availability = astrologer?.availability;

const canChat = availability === "CHAT" || availability === "BOTH" || availability === "ALL";
const canCall = availability === "CALL" || availability === "BOTH" || availability === "ALL";
const canMeet = availability === "MEET" || availability === "ALL";

const isBusyChat = astrologer?.isBusyChat;
const isBusyCall = astrologer?.isBusyCall;

// Overall busy only if enabled service is busy
const isBusyNow =
  (canChat && isBusyChat) ||
  (canCall && isBusyCall);



  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
      
      if (astroRes.data.success) {
        setAstrologer(astroRes.data.astrologer);
        
      } else {
        setAstrologer(null);
      }
      
      setWallet(walletRes.data?.balance || 0);

      // Fetch active chat if user is logged in
      if (user) {
        try {
          const chatRes = await api.get(`/chat/user/active-with-astrologer/${astroId}`);
          if (chatRes.data.success && chatRes.data.chat) {
            setActiveChat(chatRes.data.chat);
          }
        } catch (error) {
          console.log("No active chat found");
        }
      }

    } catch (error) {
      console.error("Error fetching astrologer data:", error);
      toast.error("Failed to load astrologer profile");
    } finally {
      setLoading(false);
    }
  }, [astroId, user]);

  useEffect(() => {
    fetchAstrologerData();
  }, [fetchAstrologerData]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

   socket.on("astrologerStatusUpdate", ({ astrologerId, isBusyChat, isBusyCall }) => {
  if (astrologerId === astroId) {
    setAstrologer(prev =>
      prev
        ? { ...prev, isBusyChat, isBusyCall }
        : prev
    );
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
        name: "MyAstrova",
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

  const handleStartCall = async () => {
  if (!user) {
    toast.error("Please login to start a call");
    router.push("/login");
    return;
  }

  if (astrologer.isBusyCall) {
    toast.error("Astrologer is busy on another call");
    return;
  }

  try {
    const callData = await startCall(astroId);
    if (callData) {
      toast.success("Call request sent!");
    }
  } catch (error) {
    console.error("Start call error:", error);
    // Error is already shown in the hook
  }
};
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F3E9] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-[#C06014] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-[#003D33] text-sm sm:text-base">Loading profile...</p>
        </div>
      </div>
    );
  }



  if (!astrologer) {
    return (
      <div className="min-h-screen bg-[#F7F3E9] flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full">
          <div className="w-16 h-16 sm:w-24 sm:h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaUser className="text-2xl sm:text-4xl text-red-500" />
          </div>
          <h3 className="text-lg sm:text-2xl font-bold text-[#003D33] mb-2">
            Astrologer Not Found
          </h3>
          <p className="text-[#00695C] text-sm sm:text-base mb-6">
            The astrologer you're looking for might not exist or has been removed.
          </p>
          <button
            onClick={() => router.push("/astrologers")}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-[#C06014] to-[#D47C3A] text-white rounded-full text-sm sm:text-base font-medium hover:from-[#D47C3A] hover:to-[#C06014] transition-all"
          >
            Browse Astrologers
          </button>
        </div>
      </div>
    );
  }
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



  return (
    <div className="min-h-screen pt-[100px] bg-[#F7F3E9]">
      {/* Mobile Header - Sticky */}
      <div className="sticky  top-0 z-50 bg-white border-b border-[#B2C5B2] shadow-sm lg:static lg:bg-transparent lg:border-none lg:shadow-none">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 lg:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => router.push("/astrologers")}
                className="p-1.5 sm:p-2 hover:bg-[#F7F3E9] rounded-full transition-colors flex-shrink-0"
                aria-label="Go back"
              >
                <FaChevronLeft className="text-base sm:text-lg text-[#003D33]" />
              </button>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-base lg:text-xl font-bold text-[#003D33] truncate">
                  {isMobile ? "Profile" : "Astrologer Profile"}
                </h1>
                <p className="text-xs sm:text-sm text-[#00695C] truncate">
                  {isMobile ? "Connect with expert" : "Connect with expert guidance"}
                </p>
              </div>
            </div>
            
            {user && (
              <div className="flex items-center gap-2 sm:gap-4">
                <div className=" sm:flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 bg-[#F7F3E9] rounded-full">
                  <FaWallet className="text-xs sm:text-sm text-[#C06014]" />
                  <span className="font-medium text-[#003D33] text-xs sm:text-sm">₹{wallet}</span>
                </div>
                <button
                  onClick={handleWalletRecharge}
                  className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-[#003D33] to-[#00695C] text-white rounded-full text-xs sm:text-sm font-medium hover:from-[#00695C] hover:to-[#003D33] transition-all flex-shrink-0"
                >
                  Recharge
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl sm:rounded-2xl border border-[#B2C5B2]/60 shadow-md sm:shadow-lg lg:sticky lg:top-24">
              {/* Status Badge */}
              <div className=" flex justify-end top-3 right-3 sm:top-4 sm:right-4 z-10">
            <span
  className={`px-3 py-1 rounded-full text-xs font-semibold ${
    isBusyNow
      ? "bg-red-100 text-red-700"
      : "bg-green-100 text-green-700"
  }`}
>
  {isBusyNow ? "🔴 BUSY" : "🟢 AVAILABLE"}
</span>


              </div>

              {/* Profile Image & Info */}
              <div className="p-4 sm:p-6 text-center">
                <div className="relative inline-block">
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-full border-4 sm:border-6 lg:border-8 border-white shadow-lg sm:shadow-2xl overflow-hidden">
                    <img
                      src={`${process.env.NEXT_PUBLIC_API}${astrologer.profileImageUrl}`}
                      alt={astrologer.fullName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "/avatar-placeholder.png";
                      }}
                    />
                  </div>
                  {astrologer.isApproved && (
                    <div className="absolute bottom-1  right-1 sm:bottom-2 sm:right-2 lg:bottom-4 lg:right-4 bg-[#C06014] text-white p-1 sm:p-1.5 lg:p-2 rounded-full shadow-lg">
                      <FaCheckCircle className="text-xs sm:text-sm lg:text-base" />
                    </div>
                  )}
                </div>
                
                <h1 className="font-serif font-bold text-lg sm:text-xl lg:text-2xl text-[#003D33] mt-3 sm:mt-4 lg:mt-6 break-words px-2">
                  {astrologer.fullName}
                </h1>
                
                <div className="flex items-center justify-center gap-1 sm:gap-2 mt-2 sm:mt-3 lg:mt-4">
                  <div className="flex text-[#FFB74D]">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={`text-sm sm:text-base lg:text-xl ${
                          i < Math.floor(astrologer.averageRating || 0)
                            ? "fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm sm:text-base lg:text-lg font-bold text-[#C06014]">
                    {astrologer.averageRating?.toFixed(1) || "New"}
                  </span>
                  <span className="text-gray-500 text-xs sm:text-sm hidden sm:inline">
                    ({astrologer.totalConsultations || 0} sessions)
                  </span>
                </div>
                <div className="text-gray-500 text-xs sm:hidden mt-1">
                  {astrologer.totalConsultations || 0} sessions
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 p-3 sm:p-4 lg:p-6 border-t border-[#B2C5B2]/40 bg-[#F7F3E9]/30">
                <div className="text-center">
                  <div className="text-base sm:text-xl lg:text-2xl font-bold text-[#C06014]">
                    {astrologer.experienceYears || "5+"}
                  </div>
                  <div className="text-[10px] sm:text-xs lg:text-sm text-[#00695C] mt-0.5 sm:mt-1">Years Exp</div>
                </div>
                <div className="text-center">
                  <div className="text-base sm:text-xl lg:text-2xl font-bold text-[#C06014]">
                    {astrologer.totalConsultations || "0"}
                  </div>
                  <div className="text-[10px] sm:text-xs lg:text-sm text-[#00695C] mt-0.5 sm:mt-1">Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-base sm:text-xl lg:text-2xl font-bold text-[#C06014]">
                    {astrologer.languages?.length || 2}
                  </div>
                  <div className="text-[10px] sm:text-xs lg:text-sm text-[#00695C] mt-0.5 sm:mt-1">Languages</div>
                </div>
              </div>

              {/* Connection Buttons */}
              <div className="p-3 sm:p-4 lg:p-6 border-t border-[#B2C5B2]/40 space-y-3 sm:space-y-4">

  {/* RESUME CHAT */}
  {activeChat && canChat && (
    <button
      onClick={() => router.push(`/astrologers/chat/${activeChat._id}`)}
      className="w-full py-3 bg-gradient-to-r from-[#00695C] to-[#003D33] text-white rounded-xl flex items-center justify-center gap-2"
    >
      <FaHistory />
      Resume Chat
    </button>
  )}

  {/* CHAT */}
 {!activeChat && canChat && (
  <button
    onClick={handleStartChat}
    disabled={isBusyChat || !user}
    className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 ${
      isBusyChat || !user
        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
        : "bg-gradient-to-r from-[#C06014] to-[#D47C3A] text-white"
    }`}
  >
    <IoMdChatbubbles />
    {isBusyChat ? "Busy on Chat" : !user ? "Login to Chat" : "Start Chat"}
    <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
      ₹{astrologer.pricing?.chatPerMinute}/min
    </span>
  </button>
)}


  {/* CALL */}
 {canCall && (
  <button
    onClick={handleStartCall}
    disabled={isBusyCall || callConnecting || !user}
    className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 ${
      isBusyCall || callConnecting || !user
        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
        : "bg-gradient-to-r from-[#00695C] to-[#003D33] text-white hover:from-[#003D33] hover:to-[#00695C]"
    }`}
  >
    {callConnecting ? (
      <>
        <FaSpinner className="animate-spin" />
        Starting...
      </>
    ) : isBusyCall ? (
      <>
        <FaPhoneSlash />
        Busy
      </>
    ) : !user ? (
      <>
        <FaPhone />
        Login to Call
      </>
    ) : (
      <>
        <FaPhone />
        Start Voice Call
      </>
    )}
    <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
      ₹{astrologer.pricing?.callPerMinute}/min
    </span>
  </button>
)}


  {/* MEET */}
  {canMeet && (
  <button
    onClick={() => openMeetModal(astrologer)}
    className="w-full py-3 rounded-xl bg-purple-600 text-white flex items-center justify-center gap-2"
  >
    <FaCalendarAlt />
    Book Meet
  </button>
)}


  {/* LOGIN CTA */}
  {!user && (
    <div className="text-center">
      <p className="text-xs text-gray-500 mb-2">
        Login to connect with astrologer
      </p>
      <button
        onClick={() => router.push("/login")}
        className="px-4 py-2 bg-[#F7F3E9] border border-[#B2C5B2] rounded-full text-sm"
      >
        Login / Sign Up
      </button>
    </div>
  )}
</div>

            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
            {/* About Section */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-[#B2C5B2]/60 shadow-md sm:shadow-lg p-4 sm:p-6">
              <h2 className="text-base sm:text-lg lg:text-xl font-bold text-[#003D33] mb-3 sm:mb-4 flex items-center gap-2">
                <FaUser className="text-[#C06014] text-sm sm:text-base lg:text-lg" />
                About Me
              </h2>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base break-words">
                {astrologer.bio || `Expert astrologer with ${astrologer.experienceYears || "5+"} years of experience. Specializing in providing accurate predictions and guidance for life's challenges.`}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
                <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#F7F3E9] rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaGraduationCap className="text-[#C06014] text-sm sm:text-base" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-[#003D33] text-sm sm:text-base">Education</h4>
                    <p className="text-gray-600 text-xs sm:text-sm truncate">{astrologer.education || "Masters in Vedic Astrology"}</p>
                  </div>
                </div>
                
                <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#F7F3E9] rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaLanguage className="text-[#C06014] text-sm sm:text-base" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-[#003D33] text-sm sm:text-base">Languages</h4>
                    <p className="text-gray-600 text-xs sm:text-sm truncate">{(astrologer.languages || ["English", "Hindi"]).join(", ")}</p>
                  </div>
                </div>
                
                <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#F7F3E9] rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaGlobe className="text-[#C06014] text-sm sm:text-base" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-[#003D33] text-sm sm:text-base">Gender</h4>
                    <p className="text-gray-600 text-xs sm:text-sm">{astrologer.gender || "Not specified"}</p>
                  </div>
                </div>
                
                <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#F7F3E9] rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaClock className="text-[#C06014] text-sm sm:text-base" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-[#003D33] text-sm sm:text-base">Response Time</h4>
                    <p className="text-gray-600 text-xs sm:text-sm">Within 5 minutes</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Expertise Section */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-[#B2C5B2]/60 shadow-md sm:shadow-lg p-4 sm:p-6">
              <h2 className="text-base sm:text-lg lg:text-xl font-bold text-[#003D33] mb-3 sm:mb-4 flex items-center gap-2">
                <GiSkills className="text-[#C06014] text-sm sm:text-base lg:text-lg" />
                Expertise & Specializations
              </h2>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {(astrologer.expertise || ["Vedic Astrology", "Horoscope Reading", "Numerology"]).map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-[#F7F3E9] to-[#E8E3CF] text-[#00695C] rounded-full text-xs sm:text-sm font-medium border border-[#B2C5B2]/40"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Achievements Section */}
            {astrologer.achievements && astrologer.achievements.length > 0 && (
              <div className="bg-white rounded-xl sm:rounded-2xl border border-[#B2C5B2]/60 shadow-md sm:shadow-lg p-4 sm:p-6">
                <h2 className="text-base sm:text-lg lg:text-xl font-bold text-[#003D33] mb-3 sm:mb-4 flex items-center gap-2">
                  <FaAward className="text-[#C06014] text-sm sm:text-base lg:text-lg" />
                  Achievements & Recognition
                </h2>
                <div className="space-y-2 sm:space-y-3">
                  {astrologer.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-start gap-2 sm:gap-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#F7F3E9] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[#C06014] text-xs">✓</span>
                      </div>
                      <p className="text-gray-700 text-sm sm:text-base">{achievement}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pricing Details */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-[#B2C5B2]/60 shadow-md sm:shadow-lg p-4 sm:p-6">
              <h2 className="text-base sm:text-lg lg:text-xl font-bold text-[#003D33] mb-3 sm:mb-4 flex items-center gap-2">
                <FaWallet className="text-[#C06014] text-sm sm:text-base lg:text-lg" />
                Service Pricing
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {["CHAT", "BOTH"].includes(astrologer.availability) && (
                  <div className="p-3 sm:p-4 bg-[#F7F3E9]/50 rounded-lg sm:rounded-xl border border-[#B2C5B2]/40">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-[#C06014] to-[#D47C3A] rounded-lg flex items-center justify-center flex-shrink-0">
                        <IoMdChatbubbles className="text-base sm:text-xl text-white" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-[#003D33] text-sm sm:text-base">Chat Session</h3>
                        <p className="text-[#00695C] text-xs sm:text-sm truncate">Text-based consultation</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xl sm:text-2xl font-bold text-[#C06014]">
                        ₹{astrologer.pricing?.chatPerMinute || astrologer.minuteRate || 50}
                      </span>
                      <span className="text-gray-600 text-sm sm:text-base"> / minute</span>
                    </div>
                  </div>
                )}
                
                {["CALL", "BOTH"].includes(astrologer.availability) && (
                  <div className="p-3 sm:p-4 bg-[#F7F3E9]/50 rounded-lg sm:rounded-xl border border-[#B2C5B2]/40">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-[#00695C] to-[#003D33] rounded-lg flex items-center justify-center flex-shrink-0">
                        <FaPhone className="text-base sm:text-xl text-white" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-[#003D33] text-sm sm:text-base">Voice Call</h3>
                        <p className="text-[#00695C] text-xs sm:text-sm truncate">Audio consultation</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xl sm:text-2xl font-bold text-[#C06014]">
                        ₹{astrologer.pricing?.callPerMinute || 100}
                      </span>
                      <span className="text-gray-600 text-sm sm:text-base"> / minute</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Info for Desktop */}
            <div className="hidden lg:block bg-white rounded-2xl border border-[#B2C5B2]/60 shadow-lg p-6">
              <h2 className="text-xl font-bold text-[#003D33] mb-4 flex items-center gap-2">
                <FaCalendarAlt className="text-[#C06014]" />
                Availability
              </h2>
              <div className="flex items-center gap-4">
         <div
  className={`px-4 py-2 rounded-lg font-medium ${
    isBusyNow
      ? "bg-red-100 text-red-700"
      : "bg-green-100 text-green-700"
  }`}
>
  {isBusyNow
    ? isBusyChat
      ? "Busy on Chat"
      : "Busy on Call"
    : "Available for Consultation"}
</div>

<div className="text-gray-600 flex items-center gap-3 flex-wrap">
  {canChat && (
    <span className="flex items-center gap-1">
      <FaComments className="text-[#C06014]" /> Chat
    </span>
  )}
  {canCall && (
    <span className="flex items-center gap-1">
      <FaPhone className="text-[#00695C]" /> Call
    </span>
  )}
  {canMeet && (
    <span className="flex items-center gap-1">
      <FaUserCheck className="text-purple-600" /> Meet
    </span>
  )}
</div>

              </div>
            </div>
          </div>
        </div>
      </div>
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