"use client";
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import apiAstrologer from "../../lib/apiAstrologer";
import toast from "react-hot-toast";
import {
  FaComments,
  FaUser,
  FaClock,
  FaCheck,
  FaTimes,
  FaPaperPlane,
  FaWallet,
  FaBell,
  FaEllipsisV,
  FaCheckDouble,
  FaInfoCircle,
  FaVenusMars,
  FaCalendarAlt,
  FaBriefcase,
  FaHeart,
  FaBirthdayCake,
  FaMapMarkedAlt
} from "react-icons/fa";
import CryptoJS from "crypto-js"
// --- ENCRYPTION HELPERS ---
const SECRET_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "my-secret-astro-key"; // Use env var in production

const encryptData = (data) => {
  try {
    return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
  } catch (e) {
    console.error("Encryption failed", e);
    return null;
  }
};

const decryptData = (ciphertext) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (e) {
    console.error("Decryption failed", e);
    return null;
  }
};
export default function ChatDashboard() {
  const [astrologer, setAstrologer] = useState(null);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState();
  const [messages, setMessages] = useState([]);
  const activeChatRef = useRef(null);

  const [newMessage, setNewMessage] = useState("");
  const [stats, setStats] = useState({
    totalEarnings: 0,
    todayEarnings: 0,
    activeChats: 0,
    waitingChats: 0
  });
  
 // const [isTyping, setIsTyping] = useState(false);
  const [userTyping, setUserTyping] = useState(false);

const [userProfileInfo, setUserProfileInfo] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Initialize socket
  useEffect(() => {
    const astrologerId = localStorage.getItem("astrologer_id");
    if (!astrologerId) {
      window.location.href = "/astrologer/login";
      return;
    }

    const socket = io(process.env.NEXT_PUBLIC_API, {
      transports: ["websocket", "polling"],
      query: { astrologerId }
    });

    socketRef.current = socket;

    // Socket event handlers
    socket.on("connect", () => {
      console.log("Astrologer socket connected");
      socket.emit("joinAstrologer", { astrologerId });
    });

    socket.on("newChat", (chat) => {
      setChats(prev => [chat, ...prev]);
      setStats(prev => ({
        ...prev,
        waitingChats: prev.waitingChats + 1
      }));
      
     toast.success(
  `New chat request from ${
    typeof chat.user === "object" ? chat.user.username : "User"
  }`,
  { duration: 5000 }
);

    });

    // In both user chat and astrologer dashboard
socket.on("newMessage", (message) => {
  setMessages(prev => {
    const exists = prev.some(m => m._id === message._id);
    if (exists) return prev;
    return [...prev, message];
  });

  // 🔥 ADD THIS (VERY IMPORTANT)
  if (
    activeChat &&
    message.senderType === "user" &&
    !message.seen
  ) {
    socketRef.current.emit("messageSeen", {
      chatId: activeChat._id,
      messageId: message._id
    });
  }

  setTimeout(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, 100);
});

// Handle message seen updates
socket.on("messageSeenUpdate", ({ messageId, seen }) => {
  setMessages(prev =>
    prev.map(msg =>
      msg._id === messageId ? { ...msg, seen } : msg
    )
  );
});

 socket.on("typingUpdate", ({ senderRole, isTyping }) => {
  if (senderRole === "user") {
    setUserTyping(isTyping);
  }
});


    socket.on("chatEnded", ({ chatId, endedBy, reason }) => {
      console.log(chatId)
      setChats(prev => prev.filter(chat => chat._id !== chatId));
      setActiveChat(null)
      if (activeChat?._id === chatId) {
        setActiveChat(null);
        setMessages([]);
        toast.info(`Chat ended by ${endedBy}: ${reason}`);
      }
      
      if (endedBy === "system" && reason.includes("balance")) {
        toast.warning("User's balance was insufficient");
      }
    });

    socket.on("walletRecharged", ({ chatId, amount }) => {
      if (activeChat?._id === chatId) {
        toast.success(`User recharged ₹${amount}`);
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);


  useEffect(() => {
  activeChatRef.current = activeChat;
}, [activeChat]);

  const loadInitialData = async () => {
    try {
      const astrologerId = localStorage.getItem("astrologer_id");
      
      const [profileRes, chatsRes, statsRes] = await Promise.all([
       apiAstrologer.get(`/astrologer/profile/${astrologerId}`),
       apiAstrologer.get(`/chat/astrologer/active/${astrologerId}`),
       apiAstrologer.get(`/astrologer/stats/${astrologerId}`)
      ]);

      if (profileRes.data.success) {
        setAstrologer(profileRes.data.astrologer);
      }

      if (chatsRes.data.success) {
        setChats(chatsRes.data.chats);
        
      }

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }
    } catch (error) {
      console.error("Load data error:", error);
      toast.error("Failed to load dashboard data");
    }
  };

  // Accept chat
  const acceptChat = async (chatId) => {
    try {
      const astrologerId = localStorage.getItem("astrologer_id")
      const response = await apiAstrologer.post(`/chat/astrologer/accept/${chatId}/${astrologerId}`);
      
      if (response.data.success) {
        const updatedChat = response.data.chat;
       
        
        setChats(prev =>
          prev.map(chat =>
            chat._id === chatId ? updatedChat : chat
          )
        );
        
        setStats(prev => ({
          ...prev,
          waitingChats: Math.max(0, prev.waitingChats - 1),
          activeChats: prev.activeChats + 1
        }));
        
        toast.success("Chat accepted!");
        
        // Join chat room
        socketRef.current.emit("joinChat", { chatId });
        
        // Start billing
        socketRef.current.emit("chatStarted", { chatId });
      }
    } catch (error) {
      console.error("Accept chat error:", error);
      toast.error("Failed to accept chat");
    }
  };

  // Open chat
  const openChat = async (chat) => {
    if (chat.status !== "ACTIVE") return;
    
    setActiveChat(chat);
    setMessages([]);
    setUserProfileInfo(null); // Reset first to avoid showing old data

    // 1. Check LocalStorage for Encrypted Profile
    const storageKey = `astro_profile_${chat.user?._id || chat.user}`;
    const storedEncryptedData = localStorage.getItem(storageKey);

    if (storedEncryptedData) {
      const decryptedData = decryptData(storedEncryptedData);
      if (decryptedData) {
        console.log("Loaded profile from encrypted storage");
        setUserProfileInfo(decryptedData);
      }
    }
    
    try {
      socketRef.current.emit("joinChat", { chatId: chat._id });

      const response = await apiAstrologer.get(`/chat/messages/${chat._id}`);
      if (response.data.success) {
        setMessages(response.data.messages);
        
        // Mark messages as seen
       response.data.messages.forEach(msg => {
  if (msg.senderType === "user" && !msg.seen) {
    socketRef.current.emit("messageSeen", {
      chatId: chat._id,
      messageId: msg._id
    });
  }
});

      }
      

       if (chat.user && chat.user.astroProfile) {
        setUserProfileInfo(chat.user.astroProfile);
        localStorage.setItem(storageKey, encryptData(chat.user.astroProfile));
      } else {
        // Try to fetch user profile from API
        try {
          const userProfileRes = await apiAstrologer.get(`/user/profile/${chat.user._id}`);
          if (userProfileRes.data.success && userProfileRes.data.astroProfile) {
            setUserProfileInfo(userProfileRes.data.astroProfile);
            localStorage.setItem(storageKey, encryptData(chat.user.astroProfile));
          }
        } catch (error) {
          console.log("Could not fetch user profile:", error);
        }
      }
    } catch (error) {
      console.error("Open chat error:", error);
    }
  };
// Format birth details
  const formatBirthDetails = (birthDetails) => {
    if (!birthDetails) return "Not provided";
    
    const { day, month, year, hour, minute } = birthDetails;
    return `${day}/${month}/${year} at ${hour}:${minute.toString().padStart(2, '0')}`;
  };

  // Format birth place
  const formatBirthPlace = (birthPlace) => {
    if (!birthPlace) return "Not provided";
    
    const { city, state, country } = birthPlace;
    return `${city}, ${state}, ${country}`;
  };

  // Format problem areas
  const formatProblemAreas = (problemAreas) => {
    if (!problemAreas) return "Not specified";
    
    const areas = [];
    if (problemAreas.love) areas.push("Love");
    if (problemAreas.career) areas.push("Career");
    if (problemAreas.health) areas.push("Health");
    if (problemAreas.marriage) areas.push("Marriage");
    if (problemAreas.finance) areas.push("Finance");
    
    return areas.length > 0 ? areas.join(", ") : "Not specified";
  };

  // 🔥 FORCE mark user messages as seen when astrologer opens chat
useEffect(() => {
  if (!activeChat || !socketRef.current) return;

  messages.forEach(msg => {
    if (msg.senderType === "user" && !msg.seen) {
      socketRef.current.emit("messageSeen", {
        chatId: activeChat._id,
        messageId: msg._id
      });
    }
  });
}, [activeChat?._id, messages]);

  // Send message
  const sendMessage = async (e) => {
  e.preventDefault();
  if (!newMessage.trim() || !activeChat) return;
  const astrologerId = localStorage.getItem("astrologer_id")
  
  try {
    const messageData = {
      chatId: activeChat._id,
      content: newMessage.trim()
    };

    // ONLY send via API - let the API handle socket emission
    await apiAstrologer.post(`/chat/astrologer/message/${astrologerId}`, messageData);

    setNewMessage("");
    
    // Clear typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  } catch (error) {
    console.error("Send message error:", error);
    toast.error("Failed to send message");
  }
};
  // End chat
  const endChat = async () => {
    if (!activeChat || !window.confirm("End this chat?")) return;
    const astrologerId = localStorage.getItem("astrologer_id")
    try {
      await apiAstrologer.post(`/chat/astrologer/end/${activeChat._id}/${astrologerId}`);
      toast.success("Chat ended");
      
      setChats(prev => prev.filter(chat => chat._id !== activeChat._id));
      // Clean up storage on end
      if(activeChat.user?._id) {
         localStorage.removeItem(`astro_profile_${activeChat.user._id}`);
      }
      setActiveChat(false);
      setMessages([]);
      setUserProfileInfo(null)
    } catch (error) {
      console.error("End chat error:", error);
      toast.error("Failed to end chat");
    }
  };

  // Handle typing
  const handleTyping = (e) => {
  setNewMessage(e.target.value);

  if (!activeChat) return;

  socketRef.current.emit("typing", {
    chatId: activeChat._id,
    senderId: astrologer._id,
    senderRole: "astrologer",
    isTyping: true
  });

  if (typingTimeoutRef.current) {
    clearTimeout(typingTimeoutRef.current);
  }

  typingTimeoutRef.current = setTimeout(() => {
    socketRef.current.emit("typing", {
      chatId: activeChat._id,
      senderId: astrologer._id,
      senderRole: "astrologer",
      isTyping: false
    });
  }, 1000);
};


  useEffect(() => {
  if (activeChat && socketRef.current) {
    socketRef.current.emit("joinChat", {
      chatId: activeChat._id
    });
  }
}, [activeChat?._id]);


  // Toggle availability
  const toggleAvailability = async () => {
    try {
       const astrologerId = localStorage.getItem("astrologer_id")
      const response = await apiAstrologer.post(`/astrologer/toggle-availability/${astrologerId}`, {
        isAvailable: !astrologer.isAvailable
      });
      
      if (response.data.success) {
        setAstrologer(prev => ({
          ...prev,
          isAvailable: !prev.isAvailable
        }));
        
        toast.success(
          astrologer.isAvailable 
            ? "You are now offline" 
            : "You are now available"
        );
      }
    } catch (error) {
      console.error("Toggle availability error:", error);
    }
  };

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!astrologer) {
    return (
      <div className="min-h-screen bg-[#F7F3E9] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#C06014] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-[#003D33]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F3E9]">
      {/* Header 
      <div className="bg-white border-b border-[#B2C5B2]">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#C06014] to-[#D47C3A] flex items-center justify-center text-white text-lg font-bold">
                  {astrologer.fullName?.charAt(0) || "A"}
                </div>
                <div>
                  <h1 className="font-bold text-[#003D33] text-lg">
                    {astrologer.fullName}
                  </h1>
                  <div className="flex items-center gap-2 text-sm">
                    <span className={`px-2 py-0.5 rounded-full ${
                      astrologer.isAvailable
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {astrologer.isAvailable ? "🟢 Online" : "🔴 Offline"}
                    </span>
                    <span className="text-[#00695C]">
                      Rating: {astrologer.averageRating?.toFixed(1) || "5.0"}
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={toggleAvailability}
                className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                  astrologer.isAvailable
                    ? "bg-red-100 text-red-600 hover:bg-red-200"
                    : "bg-green-100 text-green-600 hover:bg-green-200"
                }`}
              >
                {astrologer.isAvailable ? "Go Offline" : "Go Online"}
              </button>
            </div>
            
            <div className="flex items-center gap-6">
              {/* Stats 
              <div className="hidden md:flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#C06014]">
                    ₹{stats.todayEarnings}
                  </div>
                  <div className="text-xs text-[#00695C]">Today</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#003D33]">
                    {stats.activeChats}
                  </div>
                  <div className="text-xs text-[#00695C]">Active</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#003D33]">
                    {stats.waitingChats}
                  </div>
                  <div className="text-xs text-[#00695C]">Waiting</div>
                </div>
              </div>
              
              <button className="p-2 hover:bg-[#F7F3E9] rounded-full">
                <FaBell className="text-[#00695C]" />
              </button>
            </div>
          </div>
        </div>
      </div>
*/}
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar - Chat List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-[#B2C5B2] overflow-hidden">
              <div className="p-4 border-b border-[#B2C5B2]">
                <h2 className="font-bold text-[#003D33] flex items-center gap-2">
                  <FaComments />
                  <span>Active Chats ({chats.length})</span>
                </h2>
              </div>
              
              <div className="divide-y divide-[#F7F3E9] max-h-[70vh] overflow-y-auto">
                {chats.map(chat => (
                  <div
                    key={chat._id}
                    className={`p-4 cursor-pointer transition-colors ${
                      activeChat?._id === chat._id
                        ? "bg-[#F7F3E9]"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => openChat(chat)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#00695C] to-[#003D33] flex items-center justify-center text-white text-xs">
                          {chat.user?.username?.charAt(0) || "U"}
                        </div>
                        <div>
                          <h3 className="font-medium text-[#003D33] text-sm">
                            {chat.user?.username || "User"}
                          </h3>
                          <div className="flex items-center gap-1">
                            <span className={`w-2 h-2 rounded-full ${
                              chat.status === "ACTIVE" 
                                ? "bg-green-500" 
                                : "bg-yellow-500"
                            }`}></span>
                            <span className="text-xs text-gray-500">
                              {chat.status === "ACTIVE" ? "Active" : "Waiting"}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#F7F3E9] text-[#00695C]">
                          ₹{chat.ratePerMinute}/min
                        </span>
                        {chat.status === "WAITING" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              acceptChat(chat._id);
                            }}
                            className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600"
                          >
                            <FaCheck className="text-xs" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      Started: {new Date(chat.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                ))}
                
                {chats.length === 0 && (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-[#F7F3E9] rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaComments className="text-2xl text-[#B2C5B2]" />
                    </div>
                    <p className="text-gray-500">No active chats</p>
                    <p className="text-sm text-gray-400 mt-1">
                      New chat requests will appear here
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Quick Stats 
            <div className="mt-6 bg-white rounded-2xl border border-[#B2C5B2] p-4">
              <h3 className="font-bold text-[#003D33] mb-3">Today's Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Earnings</span>
                  <span className="font-medium text-[#C06014]">
                    ₹{stats.todayEarnings}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Chats</span>
                  <span className="font-medium text-[#003D33]">
                    {chats.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Rating</span>
                  <span className="font-medium text-[#00695C]">
                    {astrologer.averageRating?.toFixed(1) || "5.0"} ⭐
                  </span>
                </div>
              </div>
            </div>
            */}

          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-[#B2C5B2] h-[75vh] overflow-hidden flex flex-col">
              {activeChat  ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-[#B2C5B2] flex items-center justify-between bg-[#F7F3E9]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#00695C] to-[#003D33] flex items-center justify-center text-white">
                        <FaUser />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#003D33]">
                          {activeChat.user?.username || "User"}
                        </h3>
                        {userProfileInfo && (
                              <button
                                onClick={() => setShowProfileModal(!showProfileModal)}
                                className="flex items-center gap-1 text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full hover:bg-blue-200"
                              >
                                <FaInfoCircle className="text-xs" />
                                <span>View Astro Profile</span>
                              </button>
                            )}
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-[#00695C]">
                            Rate: ₹{activeChat.ratePerMinute}/min
                          </span>
                         {userTyping && (
  <span className="text-[#C06014] text-sm">
    User is typing...
  </span>
)}

                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button className="px-4 py-2 bg-[#00695C] text-white rounded-lg text-sm font-medium hover:bg-[#005247]">
                        Call User
                      </button>
                      <button
                        onClick={endChat}
                        className="px-4 py-2 bg-red-100 text-red-600 rounded-lg text-sm font-medium hover:bg-red-200"
                      >
                        End Chat
                      </button>
                    </div>
                  </div>
                  {/* Quick Profile Summary - Always visible */}
                    {userProfileInfo && (
                      <div className="mt-3 p-3 pt-3 border-t border-[#B2C5B2]">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          <div className="flex items-center gap-1">
                            <FaVenusMars className="text-gray-500" />
                            <span className="text-sm">{userProfileInfo.gender || "Not specified"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FaCalendarAlt className="text-gray-500" />
                            <span className="text-sm">
                              {userProfileInfo.dateOfBirth 
                                ? new Date(userProfileInfo.dateOfBirth).toLocaleDateString()
                                : "No DOB"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FaBriefcase className="text-gray-500" />
                            <span className="text-sm">{userProfileInfo.occupation || "Not specified"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FaHeart className="text-gray-500" />
                            <span className="text-sm">{userProfileInfo.maritalStatus || "Not specified"}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-white to-[#F7F3E9]/30">
                    {messages.map((message) => (
                      <div
                        key={message._id}
                        className={`flex ${
                          message.senderType === "astrologer" 
                            ? "justify-end" 
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl p-3 ${
                            message.senderType === "astrologer"
                              ? "bg-gradient-to-r from-[#00695C] to-[#003D33] text-white rounded-br-none"
                              : "bg-[#F7F3E9] text-[#003D33] border border-[#B2C5B2] rounded-bl-none"
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{message.content}</p>
                          <div className="flex items-center justify-between mt-1 text-xs opacity-70">
                            <span>
                              {new Date(message.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            {message.senderType === "astrologer" && (
                              <span>
                                {message.seen ? (
                                  <FaCheckDouble className="text-blue-300" />
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

                  {/* Input Area */}
                  <div className="p-4 border-t border-[#B2C5B2] bg-white">
                    <form onSubmit={sendMessage} className="flex gap-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={handleTyping}
                        placeholder="Type your message here..."
                        className="flex-1 border border-[#B2C5B2] rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00695C]"
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="w-12 h-12 bg-gradient-to-r from-[#00695C] to-[#003D33] text-white rounded-full flex items-center justify-center hover:from-[#003D33] hover:to-[#00695C] disabled:opacity-50"
                      >
                        <FaPaperPlane />
                      </button>
                    </form>
                    
                    {/* Chat Info */}
                    <div className="mt-3 text-center text-sm text-gray-500">
                      <div className="flex items-center justify-center gap-4">
                        <span>Chat Active</span>
                        <span>•</span>
                        <span>Rate: ₹{activeChat.ratePerMinute}/min</span>
                        <span>•</span>
                        <button className="text-[#C06014] hover:underline">
                          View Chat History
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                  <div className="w-24 h-24 bg-[#F7F3E9] rounded-full flex items-center justify-center mb-6">
                    <FaComments className="text-4xl text-[#B2C5B2]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#003D33] mb-2">
                    Select a Chat
                  </h3>
                  <p className="text-gray-500 text-center max-w-md">
                    Choose a chat from the sidebar to start messaging. 
                    New chat requests will appear automatically.
                  </p>
                  
                 
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {showProfileModal && userProfileInfo && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50 sticky top-0">
              <h4 className="font-bold text-[#003D33] text-lg">Astrological Profile</h4>
              <button
                onClick={() => setShowProfileModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal */}
                  <div className="space-y-3">
                     <h5 className="font-semibold text-[#C06014] uppercase text-xs tracking-wider border-b pb-1">Personal Info</h5>
                     <div className="space-y-2 text-sm text-gray-700">
                        <p><span className="font-medium">Name:</span> {userProfileInfo.fullName}</p>
                        <p><span className="font-medium">Gender:</span> {userProfileInfo.gender}</p>
                        <p><span className="font-medium">Occupation:</span> {userProfileInfo.occupation}</p>
                        <p><span className="font-medium">Marital:</span> {userProfileInfo.maritalStatus}</p>
                     </div>
                  </div>
                  
                  {/* Birth */}
                  <div className="space-y-3">
                     <h5 className="font-semibold text-[#C06014] uppercase text-xs tracking-wider border-b pb-1">Birth Info</h5>
                     <div className="space-y-2 text-sm text-gray-700">
                        <p className="flex items-center gap-2"><FaBirthdayCake className="text-gray-400"/> {new Date(userProfileInfo.dateOfBirth).toLocaleDateString()}</p>
                        {userProfileInfo.birthDetails && (
                           <>
                             <p className="flex items-center gap-2"><FaCalendarAlt className="text-gray-400"/> {userProfileInfo.birthDetails.day}/{userProfileInfo.birthDetails.month}/{userProfileInfo.birthDetails.year}</p>
                             <p className="flex items-center gap-2"><FaUser className="text-gray-400"/> Time: {userProfileInfo.birthDetails.hour}:{userProfileInfo.birthDetails.minute}</p>
                           </>
                        )}
                        <p className="flex items-center gap-2"><FaMapMarkedAlt className="text-gray-400"/> {formatBirthPlace(userProfileInfo.birthPlace)}</p>
                     </div>
                  </div>
               </div>

               {/* Problem Areas */}
               {userProfileInfo.problemAreas && (
                 <div>
                    <h5 className="font-semibold text-[#C06014] uppercase text-xs tracking-wider border-b pb-1 mb-3">Concern Areas</h5>
                    <div className="flex flex-wrap gap-2">
                       {Object.entries(userProfileInfo.problemAreas).map(([key, value]) => 
                          value && <span key={key} className="px-3 py-1 bg-[#F7F3E9] text-[#003D33] rounded-full text-sm capitalize border border-[#B2C5B2]">{key}</span>
                       )}
                    </div>
                 </div>
               )}
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 bg-yellow-50 text-yellow-800 text-xs text-center border-t border-yellow-100">
               ⚠️ Birth details are crucial for chart calculation. Ensure accuracy.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}