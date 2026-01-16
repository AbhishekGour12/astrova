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
  FaPhoneAlt,
  FaEdit,
  FaTrash,
  FaSpinner,
  FaPhoneSlash,
  FaRegStar,
  FaStarHalfAlt
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
  
  // Review State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    comment: "",
  });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [hasUserReviewed, setHasUserReviewed] = useState(false);
  const [userReview, setUserReview] = useState(null);

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

  const isBusyNow = (canChat && isBusyChat) || (canCall && isBusyCall);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile screen
  useEffect(() => {
    const token = localStorage.getItem("token") || ""
    if(!token){
      router.push("/")
    }
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
        
        // Set the calculated stats from backend
        if (astroRes.data.reviewStats) {
          setReviewStats(astroRes.data.reviewStats);
        }
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

  // Fetch reviews
  const fetchReviews = useCallback(async () => {
    try {
      setReviewsLoading(true);
      const response = await api.get(`/reviews/astrologer/${astroId}`);
      if (response.data.success) {
       
        setReviews(response.data.reviews || []);
        if (response.data.stats) {
          setReviewStats(prev => ({
            ...prev,
            ...response.data.stats
          }));
        }
        
        // Check if current user has already reviewed
        if (user) {
          const userReview = response.data.reviews?.find(review => review.user?._id === user._id);
          if (userReview) {
            setHasUserReviewed(true);
            setUserReview(userReview);
          } else {
            setHasUserReviewed(false);
            setUserReview(null);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setReviewsLoading(false);
    }
  }, [astroId, user]);

  // Check if user has consulted this astrologer before
  const checkUserConsultation = useCallback(async () => {
    if (!user) return;
    
    try {
      // You can add a simple check here if needed
      // For now, we'll allow any logged in user to review
    } catch (error) {
      console.error("Error checking user consultation:", error);
    }
  }, [user, astroId]);

  useEffect(() => {
    fetchAstrologerData();
    fetchReviews();
    checkUserConsultation();
  }, [fetchAstrologerData, fetchReviews, checkUserConsultation]);

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

    // Listen for review updates
    socket.on("reviewAdded", ({ astrologerId }) => {
      if (astrologerId === astroId) {
        fetchReviews();
        fetchAstrologerData(); // Refresh astrologer data to update rating
      }
    });

    socket.on("reviewUpdated", ({ astrologerId }) => {
      if (astrologerId === astroId) {
        fetchReviews();
        fetchAstrologerData();
      }
    });

    socket.on("reviewDeleted", ({ astrologerId }) => {
      if (astrologerId === astroId) {
        fetchReviews();
        fetchAstrologerData();
      }
    });

    return () => {
      socket.off("astrologerStatusUpdate");
      socket.off("chatStarted");
      socket.off("reviewAdded");
      socket.off("reviewUpdated");
      socket.off("reviewDeleted");
    };
  }, [socket, astroId, fetchReviews, fetchAstrologerData]);

  // Review Functions
  const openReviewModal = () => {
    if (!user) {
      toast.error("Please login to submit a review");
      router.push("/login");
      return;
    }
    
    if (hasUserReviewed && userReview) {
      // If user already reviewed, pre-fill with their existing review for editing
      setReviewForm({
        rating: userReview.rating,
        comment: userReview.comment || "",
      });
    } else {
      setReviewForm({
        rating: 0,
        comment: "",
      });
    }
    
    setShowReviewModal(true);
  };

  const closeReviewModal = () => {
    setShowReviewModal(false);
    setReviewForm({
      rating: 0,
      comment: "",
    });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (!reviewForm.rating || reviewForm.rating < 1 || reviewForm.rating > 5) {
      toast.error("Please select a rating between 1 and 5 stars");
      return;
    }

    setReviewLoading(true);

    try {
      let response;
      
      if (hasUserReviewed && userReview) {
        // Update existing review
        response = await api.put(`/reviews/${userReview._id}`, {
          rating: reviewForm.rating,
          comment: reviewForm.comment.trim()
        });
        
        if (response.data.success) {
          toast.success("Review updated successfully!");
        }
      } else {
        // Submit new review directly for astrologer
        response = await api.post('/reviews/user/submit', {
          astrologerId: astroId,
          rating: reviewForm.rating,
          comment: reviewForm.comment.trim()
        });
        
        if (response.data.success) {
          toast.success("Review submitted successfully!");
        }
      }
      
      if (response.data.success) {
        closeReviewModal();
        
        // Refresh reviews and astrologer data
        fetchReviews();
        fetchAstrologerData();
        
        // Emit socket event
        if (socket) {
          if (hasUserReviewed) {
            socket.emit("reviewUpdated", { astrologerId: astroId });
          } else {
            socket.emit("reviewAdded", { astrologerId: astroId });
          }
        }
      } else {
        toast.error(response.data.message || "Failed to submit review");
      }
    } catch (error) {
      console.error("Review submission error:", error);
      toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setReviewLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      const response = await api.delete(`/reviews/${reviewId}`);
      if (response.data.success) {
        toast.success("Review deleted successfully!");
        fetchReviews();
        fetchAstrologerData();
        
        if (socket) {
          socket.emit("reviewDeleted", { astrologerId: astroId });
        }
      }
    } catch (error) {
      console.error("Delete review error:", error);
      toast.error(error.response?.data?.message || "Failed to delete review");
    }
  };

  const renderStars = (rating, size = "text-base") => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={`${size} ${
              star <= rating
                ? "text-yellow-500 fill-current"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

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
      <div className="sticky top-0 z-50 bg-white border-b border-[#B2C5B2] shadow-sm lg:static lg:bg-transparent lg:border-none lg:shadow-none">
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
                <div className="sm:flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 bg-[#F7F3E9] rounded-full">
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
              <div className="flex justify-end top-3 right-3 sm:top-4 sm:right-4 z-10">
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
                    <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 lg:bottom-4 lg:right-4 bg-[#C06014] text-white p-1 sm:p-1.5 lg:p-2 rounded-full shadow-lg">
                      <FaCheckCircle className="text-xs sm:text-sm lg:text-base" />
                    </div>
                  )}
                </div>
                
                <h1 className="font-serif font-bold text-lg sm:text-xl lg:text-2xl text-[#003D33] mt-3 sm:mt-4 lg:mt-6 break-words px-2">
                  {astrologer.fullName}
                </h1>
                
                <div className="flex items-center justify-center gap-1 sm:gap-2 mt-2 sm:mt-3 lg:mt-4">
                  <div className="flex text-[#FFB74D]">
                    {renderStars(reviewStats.averageRating, "text-sm sm:text-base lg:text-xl")}
                  </div>
                  <span className="text-sm sm:text-base lg:text-lg font-bold text-[#C06014]">
                    {reviewStats?.averageRating || "New"}
                  </span>
                  <span className="text-gray-500 text-xs sm:text-sm hidden sm:inline">
                    ({reviewStats.totalReviews || 0} reviews)
                  </span>
                </div>
                <div className="text-gray-500 text-xs sm:hidden mt-1">
                  {reviewStats.totalReviews || 0} reviews
                </div>
                
                {/* Review Button */}
                {user && (
                  <button
                    onClick={openReviewModal}
                    className="mt-4 px-4 py-2 bg-gradient-to-r from-[#C06014] to-[#D47C3A] text-white rounded-full text-sm font-medium hover:from-[#D47C3A] hover:to-[#C06014] transition-all"
                  >
                    {hasUserReviewed ? "Edit Your Review" : "Write a Review"}
                  </button>
                )}
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

            {/* Rating Distribution Section */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-[#B2C5B2]/60 shadow-md sm:shadow-lg p-4 sm:p-6">
              <h2 className="text-base sm:text-lg lg:text-xl font-bold text-[#003D33] mb-3 sm:mb-4 flex items-center gap-2">
                <FaStar className="text-[#C06014] text-sm sm:text-base lg:text-lg" />
                Customer Reviews
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Overall Rating */}
                <div className="bg-[#F7F3E9]/50 rounded-xl p-4 sm:p-6 text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-[#C06014] mb-2">
                    {reviewStats.averageRating}
                  </div>
                  <div className="flex justify-center mb-2">
                    {renderStars(reviewStats.averageRating, "text-xl")}
                  </div>
                  <div className="text-gray-600 text-sm">
                    {reviewStats.totalReviews} reviews
                  </div>
                </div>
                
                {/* Rating Breakdown */}
                <div className="lg:col-span-2">
                  <h3 className="font-semibold text-[#003D33] mb-3">Rating Breakdown</h3>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const count = reviewStats.ratingDistribution[rating] || 0;
                      const percentage = reviewStats.totalReviews > 0 ? (count / reviewStats.totalReviews) * 100 : 0;
                      return (
                        <div key={rating} className="flex items-center gap-2">
                          <div className="w-16 sm:w-20 text-sm text-gray-600 flex items-center gap-1">
                            {rating} <FaStar className="text-yellow-500 text-xs" />
                          </div>
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-yellow-500 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <div className="w-10 text-sm text-gray-600 text-right">
                            {count}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              {/* Write Review Button */}
              {user && (
                <button
                  onClick={openReviewModal}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#C06014] to-[#D47C3A] text-white rounded-lg font-medium hover:from-[#D47C3A] hover:to-[#C06014] transition-all flex items-center justify-center gap-2"
                >
                  <FaEdit />
                  {hasUserReviewed ? "Edit Your Review" : "Write a Review"}
                </button>
              )}
              
              {!user && (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-3">Login to write a review</p>
                  <button
                    onClick={() => router.push("/login")}
                    className="px-6 py-2 bg-[#F7F3E9] border border-[#B2C5B2] rounded-full text-sm hover:bg-[#E8E3CF] transition-colors"
                  >
                    Login / Sign Up
                  </button>
                </div>
              )}
            </div>

            {/* Reviews List */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-[#B2C5B2]/60 shadow-md sm:shadow-lg p-4 sm:p-6">
              <h2 className="text-base sm:text-lg lg:text-xl font-bold text-[#003D33] mb-4 flex items-center gap-2">
                <FaComments className="text-[#C06014] text-sm sm:text-base lg:text-lg" />
                Recent Reviews
              </h2>
              
              {reviewsLoading ? (
                <div className="flex justify-center py-8">
                  <FaSpinner className="animate-spin text-2xl text-[#C06014]" />
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaStar className="text-2xl text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No Reviews Yet</h3>
                  <p className="text-gray-500">Be the first to review this astrologer</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review._id} className="border-b border-gray-100 pb-4 last:border-0">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#F7F3E9] rounded-full flex items-center justify-center">
                            {review.user?.profileImageUrl ? (
                              <img
                                src={`${process.env.NEXT_PUBLIC_API}${review.user.profileImageUrl}`}
                                alt={review.user.name}
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              <FaUser className="text-[#C06014]" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-[#003D33]">{review.user?.username || "Anonymous"}</h4>
                            <div className="flex items-center gap-1">
                              {renderStars(review.rating, "text-sm")}
                              <span className="text-xs text-gray-500 ml-1">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {review.serviceType && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            review.serviceType === 'CHAT' 
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {review.serviceType}
                          </span>
                        )}
                      </div>
                      
                      {review.comment && (
                        <p className="text-gray-700 mt-2 pl-13">{review.comment}</p>
                      )}
                      
                      {/* Action buttons for user's own reviews */}
                      {user && review.user?._id === user._id && (
                        <div className="flex justify-end mt-2 gap-3">
                          <button
                            onClick={() => {
                              setUserReview(review);
                              openReviewModal();
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            <FaEdit className="text-xs" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteReview(review._id)}
                            className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
                          >
                            <FaTrash className="text-xs" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
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

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#003D33] flex items-center gap-2">
                <FaStar className="text-[#C06014]" />
                {hasUserReviewed ? "Edit Your Review" : "Write a Review"}
              </h3>
              <button
                onClick={closeReviewModal}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleReviewSubmit}>
              {/* Star Rating */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#00695C] mb-3">
                  Your Rating *
                </label>
                <div className="flex items-center justify-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                      className="text-3xl focus:outline-none"
                    >
                      <FaStar
                        className={star <= reviewForm.rating ? "text-yellow-500 fill-current" : "text-gray-300"}
                      />
                    </button>
                  ))}
                </div>
                <div className="text-center mt-2 text-sm text-gray-600">
                  {reviewForm.rating === 0 ? "Select a rating" : `${reviewForm.rating} out of 5 stars`}
                </div>
              </div>
              
              {/* Comment */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#00695C] mb-2">
                  Your Review (Optional)
                </label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                  rows="4"
                  className="w-full px-3 py-2.5 border border-[#B2C5B2] rounded-lg focus:ring-2 focus:ring-[#C06014] focus:border-transparent outline-none resize-none"
                  placeholder="Share your experience with this astrologer..."
                  maxLength={500}
                />
                <div className="text-right text-xs text-gray-500 mt-1">
                  {reviewForm.comment.length}/500 characters
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeReviewModal}
                  className="flex-1 py-3 border border-[#B2C5B2] text-[#00695C] rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewLoading || !reviewForm.rating}
                  className="flex-1 py-3 bg-gradient-to-r from-[#C06014] to-[#D47C3A] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {reviewLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <FaSpinner className="animate-spin" />
                      {hasUserReviewed ? "Updating..." : "Submitting..."}
                    </span>
                  ) : hasUserReviewed ? "Update Review" : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}