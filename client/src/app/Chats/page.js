"use client"
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPaperPlane, 
  FaUserAstronaut, 
  FaMoon, 
  FaSun,
  FaStar,
  FaVideo,
  FaPhone,
  FaEllipsisV,
  FaSmile,
  FaPaperclip,
  FaCheckDouble,
  FaCheck,
  FaRegClock,
  FaLeaf,
  FaGem,
  FaSeedling,
  FaMountain,
  FaSpinner
} from 'react-icons/fa';
import { IoIosSend } from 'react-icons/io';
import { BsStars } from 'react-icons/bs';

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedAstrologer, setSelectedAstrologer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState(null);
  const messagesEndRef = useRef(null);

  // Sample astrologers data matching your theme
  const astrologers = [
    {
      id: 1,
      name: "Master Raj",
      specialty: "Vedic Astrology & Spiritual Healing",
      status: "online",
      profilePic: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=100",
      rating: 4.9,
      experience: "20+ years",
      description: "Expert in Vedic astrology and spiritual guidance"
    },
    {
      id: 2,
      name: "Priya Sharma",
      specialty: "Love & Relationships",
      status: "online",
      profilePic: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100",
      rating: 4.8,
      experience: "15+ years",
      description: "Specialized in relationship astrology and compatibility"
    },
    {
      id: 3,
      name: "Dr. Arjun",
      specialty: "Career & Life Purpose",
      status: "offline",
      profilePic: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
      rating: 4.7,
      experience: "12+ years",
      description: "Career guidance and life path analysis"
    }
  ];

  // Sample initial messages with spiritual tone
  const sampleMessages = [
    {
      id: 1,
      senderId: 1,
      content: "Namaste! I sense you're seeking cosmic guidance. The stars have aligned for our connection today. How may I assist you on your spiritual journey? 🌙",
      timestamp: new Date(Date.now() - 3600000),
      seen: true,
      sender: {
        name: "Master Raj",
        role: "astrologer",
        profilePic: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=100"
      }
    },
    {
      id: 2,
      senderId: 2,
      content: "Thank you for accepting my consultation. I've been feeling disconnected from my life's purpose and would appreciate your cosmic insights.",
      timestamp: new Date(Date.now() - 1800000),
      seen: true,
      sender: {
        name: "You",
        role: "user",
        profilePic: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
      }
    },
    {
      id: 3,
      senderId: 1,
      content: "I understand this feeling of disconnection. Let me consult your birth chart and the current planetary positions to provide clarity on your soul's journey. The universe has messages for you today. ✨",
      timestamp: new Date(Date.now() - 1200000),
      seen: true,
      sender: {
        name: "Master Raj",
        role: "astrologer",
        profilePic: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=100"
      }
    }
  ];

  useEffect(() => {
    // Get astrologer ID from URL params or props
    const urlParams = new URLSearchParams(window.location.search);
    const astrologerId = urlParams.get('astrologerId');
    
    if (astrologerId) {
      const astrologer = astrologers.find(a => a.id === parseInt(astrologerId));
      if (astrologer) {
        handleStartChat(astrologer);
      }
    } else {
      setMessages(sampleMessages);
    }
    
    scrollToBottom();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleStartChat = async (astrologer) => {
    setIsLoading(true);
    setSelectedAstrologer(astrologer);
    
    // Simulate API call to start chat
    try {
      // const response = await fetch('/api/chat/start', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     userId: 'current-user-id',
      //     astrologerId: astrologer.id
      //   })
      // });
      // const chat = await response.json();
      // setChatId(chat._id);
      
      // Get messages for this chat
      // const messagesResponse = await fetch(`/api/message/${chat._id}`);
      // const chatMessages = await messagesResponse.json();
      // setMessages(chatMessages);
      
      // Simulate API delay
      setTimeout(() => {
        setChatId('chat-' + astrologer.id);
        setMessages(sampleMessages);
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Error starting chat:', error);
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedAstrologer) return;

    const messageData = {
      id: Date.now(),
      senderId: 2, // Current user ID
      content: newMessage,
      timestamp: new Date(),
      seen: false,
      sender: {
        name: "You",
        role: "user",
        profilePic: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
      }
    };

    setMessages(prev => [...prev, messageData]);
    setNewMessage('');

    // Simulate API call to send message
    try {
      // await fetch('/api/message/send', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     chatId,
      //     senderId: 2,
      //     content: newMessage
      //   })
      // });
    } catch (error) {
      console.error('Error sending message:', error);
    }

    // Simulate astrologer reply with spiritual tone
    setTimeout(() => {
      const spiritualReplies = [
        "I feel your energy through your words. The cosmos is speaking about your situation... 🌟",
        "Thank you for sharing this with me. Let me consult the celestial patterns for your guidance... ✨",
        "The universe is aligning to provide you with clarity. I sense important revelations coming your way... 🌙",
        "Your spiritual journey is unfolding beautifully. The stars have meaningful insights for you today... 💫"
      ];
      
      const randomReply = spiritualReplies[Math.floor(Math.random() * spiritualReplies.length)];
      
      const reply = {
        id: Date.now() + 1,
        senderId: selectedAstrologer.id,
        content: randomReply,
        timestamp: new Date(),
        seen: false,
        sender: {
          name: selectedAstrologer.name,
          role: "astrologer",
          profilePic: selectedAstrologer.profilePic
        }
      };
      setMessages(prev => [...prev, reply]);
    }, 3000);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const FloatingElements = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating Leaves */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`leaf-${i}`}
          className="absolute text-[#00695C]/20"
          initial={{ 
            scale: 0,
            opacity: 0,
            rotate: 0
          }}
          animate={{ 
            y: [0, -100, -200],
            x: [0, Math.random() * 100 - 50, 0],
            scale: [0, 1, 0],
            opacity: [0, 0.3, 0],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 10
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            fontSize: `${12 + Math.random() * 16}px`
          }}
        >
          <FaLeaf />
        </motion.div>
      ))}
      
      {/* Floating Stars */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute text-[#C06014]/20"
          initial={{ 
            scale: 0,
            opacity: 0
          }}
          animate={{ 
            y: [0, -80, -160],
            scale: [0, 1, 0],
            opacity: [0, 0.4, 0]
          }}
          transition={{
            duration: 6 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 8
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            fontSize: `${6 + Math.random() * 10}px`
          }}
        >
          <FaStar />
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F3E9] via-[#ECE5D3] to-[#F7F3E9] text-[#003D33]">
      <FloatingElements />
      
      {/* Sacred Earth Background Elements */}
      <div className="absolute top-10 left-10 w-24 h-24 bg-[#C06014] rounded-full opacity-10 blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-20 h-20 bg-[#00695C] rounded-full opacity-10 blur-lg animate-pulse delay-1000"></div>
      <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-[#003D33] rounded-full opacity-5 blur-md animate-pulse delay-500"></div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#C06014] to-[#D47C3A] rounded-full flex items-center justify-center shadow-lg">
              <FaSeedling className="text-white text-xl" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#003D33] to-[#00695C] bg-clip-text text-transparent">
              Sacred Conversations
            </h1>
          </div>
          <p className="text-xl text-[#00695C] opacity-80 max-w-2xl mx-auto">
            Connect with enlightened astrologers for personalized cosmic guidance and spiritual wisdom
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[80vh] max-h-[800px]">
          {/* Astrologers List - Sacred Earth Theme */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1 bg-[#ECE5D3] rounded-3xl p-6 border border-[#B2C5B2] shadow-lg"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-[#003D33]">
              <div className="w-10 h-10 bg-[#C06014] rounded-full flex items-center justify-center">
                <FaUserAstronaut className="text-white text-lg" />
              </div>
              Divine Guides
            </h2>
            
            <div className="space-y-4">
              {astrologers.map((astrologer) => (
                <motion.div
                  key={astrologer.id}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${
                    selectedAstrologer?.id === astrologer.id
                      ? 'bg-[#C06014] border-[#C06014] shadow-lg shadow-[#C06014]/30 text-white'
                      : 'bg-white border-[#B2C5B2] hover:border-[#C06014] hover:shadow-md'
                  }`}
                  onClick={() => handleStartChat(astrologer)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={astrologer.profilePic}
                        alt={astrologer.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-[#C06014]"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                        astrologer.status === 'online' ? 'bg-green-500' : 'bg-amber-500'
                      }`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold truncate ${
                        selectedAstrologer?.id === astrologer.id ? 'text-white' : 'text-[#003D33]'
                      }`}>
                        {astrologer.name}
                      </h3>
                      <p className={`text-sm truncate ${
                        selectedAstrologer?.id === astrologer.id ? 'text-white/90' : 'text-[#00695C]'
                      }`}>
                        {astrologer.specialty}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`flex text-xs ${
                          selectedAstrologer?.id === astrologer.id ? 'text-amber-200' : 'text-amber-500'
                        }`}>
                          <FaStar className="text-xs" />
                          <span className="ml-1">{astrologer.rating}</span>
                        </div>
                        <span className={`text-xs ${
                          selectedAstrologer?.id === astrologer.id ? 'text-white/70' : 'text-[#00695C]/70'
                        }`}>
                          {astrologer.experience}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Spiritual Quote */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-6 p-4 bg-white/50 rounded-2xl border border-[#B2C5B2]"
            >
              <p className="text-sm text-[#00695C] italic text-center">
                "The stars whisper secrets to those who listen with their soul" 
                <span className="block text-xs mt-1 text-[#C06014]">- Ancient Wisdom</span>
              </p>
            </motion.div>
          </motion.div>

          {/* Chat Area - Sacred Earth Theme */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-3 flex flex-col bg-white rounded-3xl border border-[#B2C5B2] shadow-lg overflow-hidden"
          >
            {selectedAstrologer ? (
              <>
                {/* Chat Header */}
                <div className="p-6 border-b border-[#B2C5B2] bg-gradient-to-r from-[#ECE5D3] to-[#F7F3E9]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img
                          src={selectedAstrologer.profilePic}
                          alt={selectedAstrologer.name}
                          className="w-14 h-14 rounded-full object-cover border-2 border-[#C06014] shadow-md"
                        />
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                          selectedAstrologer.status === 'online' ? 'bg-green-500' : 'bg-amber-500'
                        }`}></div>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-[#003D33]">{selectedAstrologer.name}</h3>
                        <p className="text-[#00695C] opacity-80 flex items-center gap-2">
                          <span>{selectedAstrologer.specialty}</span>
                          <span className="w-1 h-1 bg-[#C06014] rounded-full"></span>
                          <span className={`font-semibold ${
                            selectedAstrologer.status === 'online' ? 'text-green-600' : 'text-amber-600'
                          }`}>
                            {selectedAstrologer.status === 'online' ? 'Available' : 'Meditating'}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-3 rounded-2xl bg-[#ECE5D3] hover:bg-[#C06014] hover:text-white transition-all duration-300 border border-[#B2C5B2]"
                      >
                        <FaVideo className="text-lg" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-3 rounded-2xl bg-[#ECE5D3] hover:bg-[#C06014] hover:text-white transition-all duration-300 border border-[#B2C5B2]"
                      >
                        <FaPhone className="text-lg" />
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-[#F7F3E9] to-[#ECE5D3] messages-container">
                  <AnimatePresence>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className={`flex ${message.sender.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex gap-3 max-w-[70%] ${message.sender.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                          <img
                            src={message.sender.profilePic}
                            alt={message.sender.name}
                            className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-[#C06014]"
                          />
                          <div className={`rounded-2xl p-4 relative shadow-sm ${
                            message.sender.role === 'user'
                              ? 'bg-gradient-to-r from-[#C06014] to-[#D47C3A] rounded-br-none text-white'
                              : 'bg-white border border-[#B2C5B2] rounded-bl-none text-[#003D33]'
                          }`}>
                            <p className="text-[15px] leading-relaxed">{message.content}</p>
                            <div className={`flex items-center gap-2 mt-2 text-xs ${
                              message.sender.role === 'user' ? 'text-white/80 justify-end' : 'text-[#00695C]/70'
                            }`}>
                              <span>{formatTime(message.timestamp)}</span>
                              {message.sender.role === 'user' && (
                                message.seen ? (
                                  <FaCheckDouble className="text-blue-300" />
                                ) : (
                                  <FaCheck className="text-white/60" />
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="flex gap-3 max-w-[70%]">
                        <img
                          src={selectedAstrologer.profilePic}
                          alt={selectedAstrologer.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-[#C06014]"
                        />
                        <div className="bg-white border border-[#B2C5B2] rounded-2xl rounded-bl-none p-4">
                          <div className="flex items-center gap-2 text-[#00695C]">
                            <FaSpinner className="animate-spin text-[#C06014]" />
                            <span className="text-sm">{selectedAstrologer.name} is consulting the stars...</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-6 border-t border-[#B2C5B2] bg-white">
                  <form onSubmit={handleSendMessage} className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      className="p-3 rounded-2xl bg-[#ECE5D3] hover:bg-[#C06014] hover:text-white transition-all duration-300 border border-[#B2C5B2] flex-shrink-0"
                    >
                      <FaPaperclip className="text-lg" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      className="p-3 rounded-2xl bg-[#ECE5D3] hover:bg-[#C06014] hover:text-white transition-all duration-300 border border-[#B2C5B2] flex-shrink-0"
                    >
                      <FaSmile className="text-lg" />
                    </motion.button>
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Share your thoughts with the cosmos..."
                        className="w-full bg-[#F7F3E9] border border-[#B2C5B2] rounded-2xl px-4 py-3 text-[#003D33] placeholder-[#00695C]/60 focus:outline-none focus:ring-2 focus:ring-[#C06014] focus:border-transparent transition-all duration-300"
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      disabled={!newMessage.trim()}
                      className={`p-3 rounded-2xl flex-shrink-0 transition-all duration-300 ${
                        newMessage.trim()
                          ? 'bg-gradient-to-r from-[#C06014] to-[#D47C3A] text-white shadow-lg shadow-[#C06014]/30 hover:shadow-[#C06014]/50'
                          : 'bg-[#ECE5D3] text-[#00695C]/40 cursor-not-allowed border border-[#B2C5B2]'
                      }`}
                    >
                      <IoIosSend className="text-xl" />
                    </motion.button>
                  </form>
                </div>
              </>
            ) : (
              /* Welcome State - Sacred Earth Theme */
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-[#F7F3E9] to-[#ECE5D3]">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: "spring" }}
                  className="w-40 h-40 bg-gradient-to-br from-[#C06014] to-[#D47C3A] rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-[#C06014]/30 relative"
                >
                  <div className="absolute inset-0 rounded-full bg-[url('https://images.unsplash.com/photo-1542736667-4dafd4b0e6d9?w=200')] bg-cover bg-center opacity-20"></div>
                  <BsStars className="text-white text-6xl" />
                </motion.div>
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="text-4xl font-bold mb-6 bg-gradient-to-r from-[#003D33] to-[#00695C] bg-clip-text text-transparent"
                >
                  Sacred Conversations Await
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="text-xl text-[#00695C] max-w-2xl mb-8 leading-relaxed"
                >
                  Choose a divine guide from our enlightened astrologers to begin your personalized cosmic journey. 
                  Share your questions and receive spiritual wisdom rooted in ancient astrology.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="flex flex-wrap justify-center gap-6 text-[#00695C]"
                >
                  {[
                    { icon: FaGem, text: "Expert Astrologers", color: "text-[#C06014]" },
                    { icon: FaLeaf, text: "Spiritual Guidance", color: "text-[#00695C]" },
                    { icon: FaMountain, text: "Confidential & Safe", color: "text-[#003D33]" },
                    { icon: FaStar, text: "24/7 Cosmic Support", color: "text-[#C06014]" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2 bg-white/60 px-4 py-2 rounded-2xl border border-[#B2C5B2]">
                      <item.icon className={`text-lg ${item.color}`} />
                      <span className="font-medium">{item.text}</span>
                    </div>
                  ))}
                </motion.div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        .messages-container {
          scrollbar-width: thin;
          scrollbar-color: #C06014 #ECE5D3;
        }
        
        .messages-container::-webkit-scrollbar {
          width: 8px;
        }
        
        .messages-container::-webkit-scrollbar-track {
          background: #ECE5D3;
          border-radius: 4px;
        }
        
        .messages-container::-webkit-scrollbar-thumb {
          background: #C06014;
          border-radius: 4px;
        }
        
        .messages-container::-webkit-scrollbar-thumb:hover {
          background: #D47C3A;
        }
      `}</style>
    </div>
  );
};

export default ChatPage;