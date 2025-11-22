"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPaperclip,
  FaSmile,
  FaUserAstronaut,
  FaStar,
  FaSpinner,
  FaPhone,
  FaVideo,
  FaCheckDouble,
  FaCheck,
} from "react-icons/fa";
import { IoIosSend } from "react-icons/io";
import { BsStars } from "react-icons/bs";
import Navbar from "../components/Navbar";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedAstrologer, setSelectedAstrologer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const astrologers = [
    {
      id: 1,
      name: "Master Raj",
      specialty: "Vedic Astrology & Spiritual Healing",
      status: "online",
      profilePic:
        "https://images.unsplash.com/photo-1544717305-2782549b5136?w=100",
      rating: 4.9,
      experience: "20+ years",
    },
    {
      id: 2,
      name: "Priya Sharma",
      specialty: "Love & Relationships",
      status: "online",
      profilePic:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100",
      rating: 4.8,
      experience: "15+ years",
    },
  ];

  const sampleMessages = [
    {
      id: 1,
      content:
        "Namaste! I sense you're seeking cosmic guidance. How may I assist you today? 🌙",
      timestamp: new Date(),
      seen: true,
      sender: {
        role: "astrologer",
        profilePic:
          "https://images.unsplash.com/photo-1544717305-2782549b5136?w=100",
      },
    },
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleStartChat = (astro) => {
    setSelectedAstrologer(astro);
    setMessages(sampleMessages);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const sentMessage = {
      id: Date.now(),
      content: newMessage,
      timestamp: new Date(),
      seen: false,
      sender: {
        role: "user",
        profilePic:
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
      },
    };
    setMessages([...messages, sentMessage]);
    setNewMessage("");

    setIsLoading(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          content:
            "The universe is aligning. I can feel strong energy around you. 💫",
          timestamp: new Date(),
          seen: true,
          sender: {
            role: "astrologer",
            profilePic:
              selectedAstrologer?.profilePic ||
              "https://images.unsplash.com/photo-1544717305-2782549b5136?w=100",
          },
        },
      ]);
      setIsLoading(false);
    }, 1500);
  };

  const formatTime = (ts) =>
    new Date(ts).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F3E9] via-[#ECE5D3] to-[#F7F3E9]">
      <Navbar />

      <div className="container mx-auto px-4 py-6 max-w-7xl mt-16">
        <h1 className="text-3xl font-bold text-center mb-6 text-[#003D33]">
          Sacred Conversations
        </h1>

        <div
          className="
          grid grid-cols-1 lg:grid-cols-4 gap-6
          h-[80vh]
          md:h-[78vh]
          lg:h-[calc(100vh-200px)]
          overflow-hidden"
        >
          {/* Astrologers List */}
          <div className="bg-[#ECE5D3] rounded-3xl p-5 border shadow-md overflow-y-auto">
            <h2 className="text-xl font-bold mb-5 text-[#003D33] flex items-center gap-2">
              <FaUserAstronaut className="text-[#C06014]" />
              Divine Guides
            </h2>

            {astrologers.map((astro) => (
              <div
                key={astro.id}
                onClick={() => handleStartChat(astro)}
                className={`cursor-pointer p-4 mb-4 rounded-xl transition border-2 shadow-sm ${
                  selectedAstrologer?.id === astro.id
                    ? "bg-[#C06014] text-white border-[#C06014]"
                    : "bg-white text-[#003D33] border-[#B2C5B2]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={astro.profilePic}
                    className="w-12 h-12 rounded-full border-2 border-[#C06014]"
                  />
                  <div>
                    <p className="font-semibold">{astro.name}</p>
                    <p className="text-sm opacity-80">{astro.specialty}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Chat Box */}
          <div className="lg:col-span-3 bg-white rounded-3xl border flex flex-col shadow-lg overflow-hidden">
            {!selectedAstrologer ? (
              <div className="flex-1 flex items-center justify-center text-center p-6">
                <BsStars className="text-5xl text-[#C06014] mb-4" />
                <p className="text-[#003D33] font-medium">
                  Select an astrologer to begin your sacred journey ✨
                </p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="p-4 border-b flex gap-3 bg-[#ECE5D3] items-center">
                  <img
                    src={selectedAstrologer.profilePic}
                    className="w-12 h-12 rounded-full border-2 border-[#C06014]"
                  />
                  <div>
                    <p className="font-bold text-[#003D33]">
                      {selectedAstrologer.name}
                    </p>
                    <p className="text-sm text-[#00695C] opacity-80">
                      {selectedAstrologer.specialty}
                    </p>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto custom-scroll p-4 space-y-5 bg-gradient-to-b from-[#F7F3E9] to-[#ECE5D3] min-h-0">
                  <AnimatePresence>
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${
                          msg.sender.role === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`flex gap-2 max-w-[75%] ${
                            msg.sender.role === "user"
                              ? "flex-row-reverse"
                              : "flex-row"
                          }`}
                        >
                          <img
                            src={msg.sender.profilePic}
                            className="w-8 h-8 rounded-full border border-[#C06014]"
                          />
                          <div
                            className={`p-3 rounded-2xl shadow-md ${
                              msg.sender.role === "user"
                                ? "bg-gradient-to-r from-[#b85a14] to-[#d77a3a] text-white"
                                : "bg-white/90 border border-[#d3cab5]"
                            }`}
                          >
                            <p className="text-sm leading-snug">
                              {msg.content}
                            </p>
                            <span className="block text-[10px] mt-1 opacity-60">
                              {formatTime(msg.timestamp)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {isLoading && (
                    <div className="flex justify-start">
                      <FaSpinner className="animate-spin text-[#C06014]" />
                    </div>
                  )}

                  <div ref={messagesEndRef}></div>
                </div>

                {/* INPUT */}
                <form
                  onSubmit={handleSendMessage}
                  className="flex gap-2 items-center px-3 py-3 sm:px-5 sm:py-4 bg-white/80 backdrop-blur-md border-t flex-shrink-0 shadow-[0_-6px_10px_rgba(0,0,0,0.05)]"
                >
                  <button
                    type="button"
                    className="p-2 rounded-xl bg-[#ECE5D3] text-[#003D33]"
                  >
                    <FaPaperclip />
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type something cosmic..."
                    className="flex-1 bg-[#F7F3E9] px-4 py-3 rounded-2xl border focus:ring-2 focus:ring-[#C06014] outline-none text-sm"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-[#C06014] text-white p-3 rounded-xl"
                  >
                    <IoIosSend />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
