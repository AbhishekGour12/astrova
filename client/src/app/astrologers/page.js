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
  FaCircle,
  FaSearch,
  FaFilter,
  FaUndo,
  FaChevronDown
} from "react-icons/fa";
import { useRouter, useSearchParams } from "next/navigation";
import api from "../lib/api";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import AstroProfileModal from "../components/AstroprofileModal";
import { useCall } from "../hooks/useCall";

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
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExpertise, setSelectedExpertise] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [experienceRange, setExperienceRange] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { startCall, isConnecting: callConnecting } = useCall(
    null,
    user ? `user_${user._id}` : null
  );

  // Initialize socket
  useEffect(() => {
    if (typeof window === "undefined") return;
    const newSocket = io(process.env.NEXT_PUBLIC_API, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on("astrologerStatusUpdate", ({ astrologerId, isBusy }) => {
      setAstrologers((prev) =>
        prev.map((astro) =>
          astro._id === astrologerId ? { ...astro, isBusy } : astro
        )
      );
    });

    socket.on("chatStarted", () => {
      fetchActiveChats();
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    socket.on("callActivated", (data) => {
      console.log("📞 Call activated via socket:", data);
      router.push(`/astrologers/call/${data.callId}`);
    });

    socket.on("callRejected", () => {
      toast.error("Call was rejected by astrologer");
    });

    socket.on("callMissed", () => {
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
      setAstrologers((prev) =>
        prev.map((astro) =>
          astro._id === astrologerId ? { ...astro, isAvailable } : astro
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
      if (!user) return;
      const response = await api.get("/chat/user/active");
      if (response.data.success) {
        setActiveChats(response.data.chats);
        const activeAstrologerIds = response.data.chats
          .filter((chat) => chat.status === "ACTIVE" || chat.status === "WAITING")
          .map((chat) => chat.astrologer?._id)
          .filter(Boolean);

        const resumeData = response.data.chats
          .filter((chat) => chat.status === "ACTIVE" || chat.status === "WAITING")
          .map((chat) => ({
            chatId: chat._id,
            astrologerId: chat.astrologer?._id,
            astrologerName: chat.astrologer?.fullName,
            status: chat.status,
            lastMessage: chat.lastMessage,
            updatedAt: chat.updatedAt,
          }));

        setResumeChats(resumeData);
        setAstrologers((prev) =>
          prev.map((astro) => ({
            ...astro,
            hasActiveChat: activeAstrologerIds.includes(astro._id),
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching active chats:", error);
    }
  }, [user]);

  useEffect(() => {
  const handleResize = () => {
    if (window.innerWidth >= 768) { // md breakpoint
      setIsFilterOpen(true);
    } else {
      setIsFilterOpen(false);
    }
  };
  handleResize(); // set initial state
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const astroPromise = api.get("/astrologer", {
        params: service !== "ALL" ? { service } : {},
      });
      const walletPromise = user ? api.get("/auth/wallet") : null;
      const [astroRes, walletRes] = await Promise.all([astroPromise, walletPromise]);
      setAstrologers(astroRes?.data || []);
      if (walletRes) {
        setWallet(walletRes.data?.balance || 0);
      }
      if (user) {
        await fetchActiveChats();
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to load astrologers");
    } finally {
      setLoading(false);
    }
  }, [service, user, fetchActiveChats]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!astrologers) return;
    const hasSeenModal = localStorage.getItem("astroProfileModalShown");
    if (!hasSeenModal && user) {
      setShowProfileModal(true);
    }
  }, [astrologers]);

  // Extract unique expertise and languages from astrologers for filter dropdowns
  const getAllExpertise = () => {
    const expertiseSet = new Set();
    astrologers.forEach(astro => {
      if (astro.expertise && Array.isArray(astro.expertise)) {
        astro.expertise.forEach(exp => expertiseSet.add(exp));
      }
    });
    return Array.from(expertiseSet).sort();
  };

  const getAllLanguages = () => {
    const langSet = new Set();
    astrologers.forEach(astro => {
      if (astro.languages && Array.isArray(astro.languages)) {
        astro.languages.forEach(lang => langSet.add(lang));
      }
    });
    return Array.from(langSet).sort();
  };

  // Filter astrologers based on search, expertise, languages, experience
  const filterAstrologers = (astroList) => {
    return astroList.filter(astro => {
      // Search by name
      if (searchTerm && !astro.fullName?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      // Filter by expertise
      if (selectedExpertise && (!astro.expertise || !astro.expertise.includes(selectedExpertise))) {
        return false;
      }
      // Filter by language
      if (selectedLanguage && (!astro.languages || !astro.languages.includes(selectedLanguage))) {
        return false;
      }
      // Filter by experience
      const exp = astro.experienceYears || 0;
      if (experienceRange === "0-2" && (exp < 0 || exp > 2)) return false;
      if (experienceRange === "3-5" && (exp < 3 || exp > 5)) return false;
      if (experienceRange === "6-10" && (exp < 6 || exp > 10)) return false;
      if (experienceRange === "10+" && exp < 10) return false;
      return true;
    });
  };

  const filteredAstrologers = filterAstrologers(astrologers);
  const onlineAstrologers = filteredAstrologers.filter((astro) => astro.isAvailable === true);
  const offlineAstrologers = filteredAstrologers.filter((astro) => astro.isAvailable === false);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedExpertise("");
    setSelectedLanguage("");
    setExperienceRange("all");
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleWalletRecharge = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login first");
      return;
    }
    const amount = prompt("Enter recharge amount (₹)");
    if (!amount || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    try {
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        toast.error("Razorpay SDK failed to load");
        return;
      }
      const orderRes = await api.post("/payment/create-order", {
        amount: Number(amount) * 100,
        phone: user?.phone,
      });
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: orderRes.data.amount,
        currency: "INR",
        name: "My Astrova",
        description: "Wallet Recharge",
        order_id: orderRes.data.id,
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
          handleback: true,
          backdropclose: false,
          zIndex: 999999,
        },
        config: {
          display: {
            blocks: {
              utp: {
                name: "UPI Apps",
                instruments: [{ method: "upi" }],
              },
            },
            sequence: ["block.utp"],
            preferences: { show_default_blocks: true },
          },
        },
        retry: {
          enabled: true,
          max_count: 3,
        },
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
      if (!user) {
        router.push("/Login");
        return;
      }
      const selectedAstro = astrologers.find((a) => a._id === astrologerId);
      const chatRate = selectedAstro?.pricing?.chatPerMinute || 50;
      if (wallet < chatRate) {
        toast.error(`Insufficient balance! You need at least ₹${chatRate} to start a chat.`);
        handleWalletRecharge();
        return;
      }
      toast.loading("Starting chat...", { id: "start-chat" });
      const response = await api.post("/chat/user/start", { astrologerId });
      toast.dismiss("start-chat");
      if (response.data.success) {
        toast.success("Chat request sent!");
        await fetchActiveChats();
        router.push(`/astrologers/chat/${response.data.chat._id}`);
        if (socket) {
          socket.emit("chatStarted", {
            chatId: response.data.chat._id,
            astrologerId,
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

  const getResumeChatForAstrologer = (astrologerId) => {
    return resumeChats.find((chat) => chat.astrologerId === astrologerId);
  };

  const handleStartCall = async (astrologerId) => {
    if (!user) {
      toast.error("Please login to start a call");
      router.push("/Login");
      return;
    }
    if (callConnecting) return;
    const selectedAstro = astrologers.find((a) => a._id === astrologerId);
    const callRate = selectedAstro?.pricing?.callPerMinute || 100;
    if (wallet < callRate) {
      toast.error(`Insufficient balance! You need ₹${callRate}.`);
      handleWalletRecharge();
      return;
    }
    try {
      toast.loading("Starting voice call...", { id: "start-call" });
      const callData = await startCall(astrologerId, "AUDIO");
      toast.dismiss("start-call");
      if (callData && callData._id) {
        toast.success("Request sent!");
        router.push(`/astrologers/call/${callData._id}`);
      }
    } catch (error) {
      toast.dismiss("start-call");
      console.error("Start call error:", error);
      if (error.response?.data?.message?.includes("already exists")) {
        const existingCallId = error.response.data.call?._id;
        if (existingCallId) {
          router.push(`/astrologers/call/${existingCallId}`);
        }
      } else {
        toast.error(error.response?.data?.message || "Failed to start call");
      }
    }
  };

  const canChat = (a) => ["CHAT", "BOTH", "ALL"].includes(a.availability);
  const canCall = (a) => ["CALL", "BOTH", "ALL"].includes(a.availability);
  const canMeet = (a) => ["MEET", "ALL"].includes(a.availability);

  const showChatBtn = (a) => (service === "CHAT" || service === "ALL") && canChat(a);
  const showCallBtn = (a) => (service === "CALL" || service === "ALL") && canCall(a);
  const showMeetBtn = (a) => (service === "MEET" || service === "ALL") && canMeet(a);

  const openMeetModal = (astrologer) => {
    if (!user) {
      toast.error("Please login first");
      return;
    }
    setSelectedAstrologer(astrologer);
    if (user) {
      setMeetForm((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
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
    setMeetForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMeetSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAstrologer) return;
    if (!meetForm.name.trim() || !meetForm.email.trim() || !meetForm.phone.trim()) {
      toast.error("Please fill all required fields");
      return;
    }
    setMeetLoading(true);
    try {
      const response = await api.post("/auth/meet-request", {
        astrologerId: selectedAstrologer._id,
        astrologerEmail: selectedAstrologer.email,
        astrologerName: selectedAstrologer.fullName,
        userName: meetForm.name,
        userEmail: meetForm.email,
        userPhone: meetForm.phone,
        message: meetForm.message,
        service: "MEET",
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

  // Astrologer Card Component with service filtering and offline grayish effect
  const AstrologerCard = ({ astrologer }) => {
    const resumeChat = getResumeChatForAstrologer(astrologer._id);
    const isOffline = !astrologer.isAvailable;
    const showChat = showChatBtn(astrologer);
    const showCall = showCallBtn(astrologer);
    const showMeet = showMeetBtn(astrologer);

    // Determine which price to show based on service
    const getPriceDisplay = () => {
      if (service === "CHAT" && showChat) {
        return `₹${astrologer.pricing?.chatPerMinute || 50}/min`;
      } else if (service === "CALL" && showCall) {
        return `₹${astrologer.pricing?.callPerMinute || 100}/min`;
      } else if (service === "MEET" && showMeet) {
        return "Book Meeting";
      } else {
        // For ALL service, show both if available, else whichever is available
        if (showChat && showCall) {
          return `Chat ₹${astrologer.pricing?.chatPerMinute || 50}/min | Call ₹${astrologer.pricing?.callPerMinute || 100}/min`;
        } else if (showChat) {
          return `Chat ₹${astrologer.pricing?.chatPerMinute || 50}/min`;
        } else if (showCall) {
          return `Call ₹${astrologer.pricing?.callPerMinute || 100}/min`;
        } else if (showMeet) {
          return "Book Meeting";
        }
        return "Contact";
      }
    };

    return (
      <div
        className={`
          w-full sm:w-[48%] md:w-[48%] lg:w-[31%]
          bg-white rounded-xl border border-gray-200
          shadow-sm hover:shadow-md transition-all
          flex p-2 items-center justify-between
          min-h-[160px] max-h-[160px]
          ${isOffline ? "opacity-70 grayscale bg-gray-100" : ""}
        `}
      >
        {/* LEFT - PROFILE */}
        <div className="grid justify-center w-[35%]">
          <img
            src={`${process.env.NEXT_PUBLIC_API}${astrologer.profileImageUrl}`}
            className="w-16 h-16 rounded-full object-cover"
            alt={astrologer.fullName}
          />
          <div className="text-xs mt-2">
            <div className="flex text-yellow-400 text-sm justify-center">
              {[...Array(5)].map((_, i) => (
                <span key={i}>
                  {i < Math.floor(astrologer.averageRating || 0) ? "★" : "☆"}
                </span>
              ))}
            </div>
            <p className="text-gray-500 text-[11px] mt-2 text-center">
              {astrologer.totalConsultations || 0} orders
            </p>
          </div>
        </div>

        {/* CENTER - DETAILS */}
        <div className="flex gap-2 flex-col w-[40%] px-2 overflow-hidden">
          <h3 className="font-semibold text-sm truncate">{astrologer.fullName}</h3>
          <p className="text-sm font-semibold text-gray-600 truncate">
            {(astrologer.expertise || []).slice(0, 2).join(", ")}
            {astrologer.expertise?.length > 2 && " ..."}
          </p>
          <p className="text-sm font-semibold text-gray-500 truncate">
            {(astrologer.languages || []).slice(0, 2).join(", ")}
            {astrologer.languages?.length > 2 && " ..."}
          </p>
          <p className="text-sm font-semibold text-gray-500">
            Exp: {astrologer.experienceYears || 5} Years
          </p>
          <p className="text-sm font-semibold text-green-600">
            {getPriceDisplay()}
          </p>
        </div>

        {/* RIGHT - ACTIONS */}
        <div className="flex flex-col items-end gap-2 w-[25%] h-full">
          <span
            className={`text-[10px] px-2 py-1 rounded-full ${
              astrologer.isBusyChat
                ? "bg-red-100 text-red-600"
                : "bg-green-100 text-green-600"
            }`}
          >
            {astrologer.isBusyChat ? "Busy" : "Available"}
          </span>
          <div className="grid justify-center w-full gap-2 items-center h-full">
          {resumeChat && (
            <button
              onClick={() => handleResumeChat(resumeChat.chatId)}
              className="text-[11px] px-2 py-1 bg-gray-100 rounded"
            >
              Resume
            </button>
          )}

          {showChat && !resumeChat && (
            <button
              disabled={!astrologer.isAvailable}
              onClick={() => handleStartChat(astrologer._id)}
              className="text-xs px-4 py-1.5 border border-green-500 text-green-600 rounded-md hover:bg-green-50"
            >
              Chat
            </button>
          )}

          {showCall && (
            <button
              onClick={() => handleStartCall(astrologer._id)}
              disabled={callConnecting || !astrologer.isAvailable}
              className="text-xs px-4 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              Call
            </button>
          )}

          {showMeet && (
            <button
              onClick={() => openMeetModal(astrologer)}
              className="text-xs px-4 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Book Meet
            </button>
          )}
          </div>
        </div>
      </div>
    );
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
            {resumeChats.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => router.push("/astrologers/chats")}
                  className="flex items-center gap-2 bg-gradient-to-r from-[#C06014] to-[#D47C3A] text-white px-4 py-2 rounded-full hover:from-[#D47C3A] hover:to-[#C06014] transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <FaHistory />
                  <span className="font-medium">Resume Chat{resumeChats.length > 1 ? "s" : ""}</span>
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
              className={`flex items-center gap-2 bg-gradient-to-r from-[#003D33] to-[#00695C] text-white px-4 py-2 rounded-full hover:from-[#00695C] hover:to-[#003D33] transition-all duration-300 shadow-md hover:shadow-lg ${
                user ? "" : "cursor-not-allowed opacity-50"
              }`}
            >
              <FaWallet className="text-lg" />
              <span className="font-medium">₹{wallet}</span>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">+</span>
            </button>
          </div>
        </div>

       {/* Enhanced Filter Section - Collapsible on Mobile */}
<div className="bg-white rounded-xl border border-[#B2C5B2] shadow-sm mb-6">
  {/* Filter Header - always visible */}
  <div className="p-3  md:pb-5">
    <div className="flex flex-wrap items-center justify-between gap-3  h-full">
      <div className="flex items-center gap-2">
        <FaFilter className="text-[#C06014]" />
        <h3 className="font-semibold text-[#003D33]">Filter Astrologers</h3>
      </div>
      <div className="flex items-center gap-3">
        {/* Show result count badge on mobile when collapsed */}
        {!isFilterOpen && (
          <span className="text-xs text-[#00695C] bg-[#F7F3E9] px-2 py-1 rounded-full md:hidden">
            {filteredAstrologers.length} found
          </span>
        )}
        {/* Clear filters button - shown only when filters active */}
        {(searchTerm || selectedExpertise || selectedLanguage || experienceRange !== "all") && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-sm text-[#C06014] hover:text-[#A84F12] transition-colors"
          >
            <FaUndo className="text-xs" />
            <span className="hidden sm:inline">Clear Filters</span>
          </button>
        )}
        {/* Toggle button - visible only on mobile */}
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="md:hidden p-2 -mr-2 text-[#003D33] hover:text-[#C06014] transition-colors"
          aria-label={isFilterOpen ? "Collapse filters" : "Expand filters"}
        >
          <FaChevronDown
            className={`transform transition-transform duration-200 ${
              isFilterOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>
    </div>
  </div>

  {/* Filter Content - collapsible on mobile, always visible on desktop */}
  <div
    className={`
      px-5 pb-5 transition-all duration-200 ease-in-out
      ${isFilterOpen ? "block" : "hidden md:block"}
    `}
  >
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Search by name */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaSearch className="text-gray-400 text-sm" />
        </div>
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border border-[#B2C5B2] rounded-lg focus:ring-2 focus:ring-[#C06014] focus:border-transparent outline-none text-sm"
        />
      </div>

      {/* Expertise dropdown */}
      <select
        value={selectedExpertise}
        onChange={(e) => setSelectedExpertise(e.target.value)}
        className="w-full px-3 py-2 border border-[#B2C5B2] rounded-lg focus:ring-2 focus:ring-[#C06014] focus:border-transparent outline-none text-sm bg-white"
      >
        <option value="">All Expertise</option>
        {getAllExpertise().map(exp => (
          <option key={exp} value={exp}>{exp}</option>
        ))}
      </select>

      {/* Language dropdown */}
      <select
        value={selectedLanguage}
        onChange={(e) => setSelectedLanguage(e.target.value)}
        className="w-full px-3 py-2 border border-[#B2C5B2] rounded-lg focus:ring-2 focus:ring-[#C06014] focus:border-transparent outline-none text-sm bg-white"
      >
        <option value="">All Languages</option>
        {getAllLanguages().map(lang => (
          <option key={lang} value={lang}>{lang}</option>
        ))}
      </select>

      {/* Experience range dropdown */}
      <select
        value={experienceRange}
        onChange={(e) => setExperienceRange(e.target.value)}
        className="w-full px-3 py-2 border border-[#B2C5B2] rounded-lg focus:ring-2 focus:ring-[#C06014] focus:border-transparent outline-none text-sm bg-white"
      >
        <option value="all">All Experience</option>
        <option value="0-2">0-2 Years</option>
        <option value="3-5">3-5 Years</option>
        <option value="6-10">6-10 Years</option>
        <option value="10+">10+ Years</option>
      </select>

      {/* Filter result count - hidden on mobile when collapsed, visible here when open */}
      <div className="flex items-center justify-center sm:justify-end">
        <span className="text-sm text-[#00695C] bg-[#F7F3E9] px-3 py-1.5 rounded-full">
          {filteredAstrologers.length} found
        </span>
      </div>
    </div>
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
                <h3 className="font-semibold text-[#003D33]">Continue Your Conversation</h3>
                <p className="text-sm text-[#00695C]">
                  You have {resumeChats.length} active chat{resumeChats.length > 1 ? "s" : ""}
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

      {/* Online Astrologers Section */}
      {onlineAstrologers.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <h2 className="text-xl font-bold text-[#003D33]">Online Astrologers</h2>
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
              {onlineAstrologers.length} Available
            </span>
          </div>
          <div className="max-w-8xl mx-auto px-4">
            <div className="flex flex-wrap gap-6 justify-start">
              {onlineAstrologers.map((astrologer) => (
                <AstrologerCard key={astrologer._id} astrologer={astrologer} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Offline Astrologers Section */}
      {offlineAstrologers.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <h2 className="text-xl font-bold text-[#003D33]">Offline Astrologers</h2>
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
              {offlineAstrologers.length} Unavailable
            </span>
          </div>
          <div className="max-w-8xl mx-auto px-4">
            <div className="flex flex-wrap gap-6 justify-start">
              {offlineAstrologers.map((astrologer) => (
                <AstrologerCard key={astrologer._id} astrologer={astrologer} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty State when no astrologers match filters */}
      {filteredAstrologers.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-[#F7F3E9] rounded-full flex items-center justify-center mx-auto mb-4">
            <FaUserCheck className="text-4xl text-[#B2C5B2]" />
          </div>
          <h3 className="text-xl font-semibold text-[#003D33] mb-2">No Astrologers Found</h3>
          <p className="text-[#00695C] max-w-md mx-auto">
            Try adjusting your filters or check back later for more astrologers.
          </p>
          <button
            onClick={clearFilters}
            className="mt-4 px-6 py-2 bg-[#C06014] text-white rounded-lg hover:bg-[#A84F12] transition-colors"
          >
            Clear Filters
          </button>
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
              <button onClick={closeMeetModal} className="text-gray-500 hover:text-gray-700 text-xl">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleMeetSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#00695C] mb-1">Your Name *</label>
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
                  <label className="block text-sm font-medium text-[#00695C] mb-1">Email Address *</label>
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
                  <label className="block text-sm font-medium text-[#00695C] mb-1">Phone Number *</label>
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
                  <label className="block text-sm font-medium text-[#00695C] mb-1">Message (Optional)</label>
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
                  ) : (
                    "Send Request"
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-4 text-center">
                The astrologer will receive your details and contact you to schedule the meeting
              </p>
            </form>
          </div>
        </div>
      )}

      {showProfileModal && <AstroProfileModal onClose={() => setShowProfileModal(false)} />}
    </div>
  );
}

export default function AstrologerList() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AstrologerContent />
    </Suspense>
  );
}