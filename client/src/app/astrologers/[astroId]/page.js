"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import { chatAPI } from "../../lib/chat";
import Navbar from "../../components/Navbar";
import { FaCheck, FaCheckDouble, FaPaperclip } from "react-icons/fa";
import { IoIosSend } from "react-icons/io";
import api from "../../lib/api";

export default function ChatPage() {
  const { astroId } = useParams();
  const user = useSelector((state) => state.auth.user);

  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const graceTimerRef = useRef(null);
  const billingTimerRef = useRef(null);

  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const [wallet, setWallet] = useState(0);
  const [graceLeft, setGraceLeft] = useState(null);

  /* ================= WALLET ================= */
  const fetchWallet = async () => {
    try {
      const res = await api.get("/auth/wallet");
      setWallet(res.data?.balance || 0);
    } catch (err) {
      console.error(err.message);
    }
  };

  /* ================= SOCKET INIT ================= */
  useEffect(() => {
    fetchWallet();

    socketRef.current = io(process.env.NEXT_PUBLIC_API, {
      transports: ["websocket"],
    });

    return () => {
      socketRef.current?.disconnect();
      clearInterval(billingTimerRef.current);
      clearInterval(graceTimerRef.current);
    };
  }, []);

  /* ================= INIT / RESUME CHAT ================= */
  useEffect(() => {
    if (!astroId || !socketRef.current) return;

    const init = async () => {
      const c = await chatAPI.startChat(astroId);
      setChat(c);

      socketRef.current.emit("joinChat", { chatId: c._id });

      const msgs = await chatAPI.getMessages(c._id);
      setMessages(msgs);
    };

    init();
  }, [astroId]);

  /* ================= SOCKET EVENTS ================= */
  useEffect(() => {
    if (!socketRef.current) return;

    const onMessage = (msg) => {
      setMessages((prev) =>
        prev.find((m) => String(m._id) === String(msg._id))
          ? prev
          : [...prev, msg]
      );
    };

    const onChatActivated = ({ startedAt }) => {
      setChat((prev) =>
        prev ? { ...prev, status: "ACTIVE", startedAt } : prev
      );
    };

    const onWalletUpdate = (balance) => {
      setWallet(balance);
      setGraceLeft(null);
      clearInterval(graceTimerRef.current);
    };

    const onWalletEmpty = ({ graceSeconds }) => {
      setGraceLeft(graceSeconds);

      clearInterval(graceTimerRef.current);
      graceTimerRef.current = setInterval(() => {
        setGraceLeft((prev) => {
          if (prev <= 1) {
            clearInterval(graceTimerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };

    const onChatEnded = () => {
      setChat((prev) =>
        prev ? { ...prev, status: "ENDED" } : prev
      );
      clearInterval(billingTimerRef.current);
    };

    socketRef.current.on("newMessage", onMessage);
    socketRef.current.on("chatActivated", onChatActivated);
    socketRef.current.on("walletUpdate", onWalletUpdate);
    socketRef.current.on("walletEmpty", onWalletEmpty);
    socketRef.current.on("chatEnded", onChatEnded);

    return () => {
      socketRef.current.off("newMessage", onMessage);
      socketRef.current.off("chatActivated", onChatActivated);
      socketRef.current.off("walletUpdate", onWalletUpdate);
      socketRef.current.off("walletEmpty", onWalletEmpty);
      socketRef.current.off("chatEnded", onChatEnded);
    };
  }, []);

  /* ================= PER MINUTE BILLING (FINAL FIX) ================= */
  useEffect(() => {
    if (!chat || chat.status !== "ACTIVE") return;

    billingTimerRef.current = setInterval(() => {
      socketRef.current.emit("billMinute", {
        chatId: chat._id,
      });
    }, 60 * 1000);

    return () => clearInterval(billingTimerRef.current);
  }, [chat?.status]);

  /* ================= SEND MESSAGE ================= */
  const sendMessage = (e) => {
    e.preventDefault();
    if (!text.trim() || !chat || chat.status !== "ACTIVE" || graceLeft === 0)
      return;

    socketRef.current.emit("sendMessage", {
      chatId: chat._id,
      senderType: "user",
      senderId: user._id,
      content: text,
    });

    setText("");
  };

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ================= TIME LEFT ================= */
  const remainingMinutes =
    chat?.status === "ACTIVE" && chat?.ratePerMinute
      ? Math.floor(wallet / chat.ratePerMinute)
      : null;

  return (
    <div className="min-h-screen bg-[#F7F3E9]">
      <Navbar />

      <div className="max-w-5xl mx-auto mt-20 bg-white rounded-2xl shadow flex flex-col h-[80vh]">

        {/* HEADER */}
        <div className="p-4 border-b flex justify-between text-sm font-medium">
          <span>Wallet: ₹{wallet}</span>

          {chat?.status === "WAITING" && (
            <span className="text-orange-600">
              Waiting for astrologer to join…
            </span>
          )}

          {chat?.status === "ACTIVE" && (
            <span className="text-green-600">
              Remaining: {remainingMinutes} min
            </span>
          )}

          {graceLeft !== null && (
            <span className="text-red-600">
              Recharge within {graceLeft}s
            </span>
          )}
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m) => (
            <div
              key={m._id}
              className={`flex ${
                m.senderType === "user"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-2 rounded-xl max-w-[70%] text-sm ${
                  m.senderType === "user"
                    ? "bg-[#C06014] text-white"
                    : "bg-[#ECE5D3]"
                }`}
              >
                {m.content}
                <div className="text-[10px] text-right opacity-60 mt-1">
                  {m.seen ? <FaCheckDouble /> : <FaCheck />}
                </div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* INPUT */}
        <form onSubmit={sendMessage} className="flex gap-2 p-4 border-t">
          <FaPaperclip />
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={!chat || chat.status !== "ACTIVE" || graceLeft === 0}
            placeholder={
              chat?.status === "WAITING"
                ? "Waiting for astrologer…"
                : chat?.status === "ENDED"
                ? "Chat ended"
                : "Type your message…"
            }
            className="flex-1 border rounded-xl px-3 py-2"
          />
          <button
            disabled={!chat || chat.status !== "ACTIVE" || graceLeft === 0}
            className="bg-[#C06014] text-white px-4 rounded-xl"
          >
            <IoIosSend />
          </button>
        </form>
      </div>
    </div>
  );
}
