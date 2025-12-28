"use client";
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import api from "../../lib/api";

const socket = io(process.env.NEXT_PUBLIC_API, {
  transports: ["websocket"],
});

export default function ChatPanel() {
  const astrologerId = localStorage.getItem("astrologer_id");

  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const messagesEndRef = useRef(null);

  /* ================= LOAD CHATS ================= */
  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      const res = await api.get(`/chat/astrologer/my/${astrologerId}`);
      setChats(res.data);
    } catch (err) {
      console.error(err.message);
    }
  };

  /* ================= OPEN CHAT ================= */
  const openChat = async (chat) => {
    if (chat.status !== "ACTIVE") return;

    setActiveChat(chat);
    socket.emit("joinChat", { chatId: chat._id });

    const res = await api.get(`/chat/messages/${chat._id}`);
    setMessages(res.data);
  };

  /* ================= ACCEPT CHAT ================= */
  const acceptChat = async (chatId) => {
  try {
    await api.post(`/chat/accept/${chatId}`);

    // optimistic UI update
    setChats((prev) =>
      prev.map((c) =>
        c._id === chatId ? { ...c, status: "ACTIVE" } : c
      )
    );
  } catch (err) {
    console.error(err.message);
  }
};


  /* ================= SEND MESSAGE ================= */
  const sendMessage = () => {
    if (!text.trim() || !activeChat) return;

    socket.emit("sendMessage", {
      chatId: activeChat._id,
      senderType: "astrologer",
      senderId: astrologerId,
      content: text,
    });

    setText("");
  };

  /* ================= SOCKET LISTENER ================= */
 useEffect(() => {
  if (!socket) return;

  const onMessage = (msg) => {
    if (msg.chat === activeChat?._id) {
      setMessages((prev) =>
        prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]
      );
    }
  };

  const onChatActivated = ({ chatId }) => {
    setChats((prev) =>
      prev.map((c) =>
        c._id === chatId ? { ...c, status: "ACTIVE" } : c
      )
    );
  };

  socket.on("newMessage", onMessage);
  socket.on("chatActivated", onChatActivated);

  return () => {
    socket.off("newMessage", onMessage);
    socket.off("chatActivated", onChatActivated);
  };
}, [activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  useEffect(() => {
  const onChatActivated = ({ chatId }) => {
    setChats((prev) =>
      prev.map((c) =>
        c._id === chatId
          ? { ...c, status: "ACTIVE" }
          : c
      )
    );
  };

  socket.on("chatActivated", onChatActivated);

  return () => {
    socket.off("chatActivated", onChatActivated);
  };
}, []);


  return (
    <div className="grid grid-cols-4 h-full">

      {/* LEFT – CHAT LIST */}
      <div className="border-r bg-white p-4 overflow-y-auto">
        <h2 className="font-bold mb-3">Chat Requests</h2>

        {chats.map((c) => (
          <div
            key={c._id}
            className={`p-3 mb-3 rounded border cursor-pointer ${
              c.status === "ACTIVE"
                ? "bg-green-50"
                : c.status === "WAITING"
                ? "bg-yellow-50"
                : "bg-gray-100"
            }`}
            onClick={() => openChat(c)}
          >
            <p className="font-semibold">
              User ID: {c.user?._id}
            </p>

            <p className="text-xs mt-1">
              Status: <b>{c.status}</b>
            </p>

            {c.status === "WAITING" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  acceptChat(c._id);
                }}
                className="mt-2 text-sm bg-green-600 text-white px-3 py-1 rounded"
              >
                Accept Chat
              </button>
            )}
          </div>
        ))}
      </div>

      {/* RIGHT – CHAT WINDOW */}
      <div className="col-span-3 flex flex-col bg-[#F7F3E9]">

        {/* MESSAGES */}
        <div className="flex-1 p-4 overflow-y-auto">
          {!activeChat && (
            <p className="text-center text-gray-500 mt-20">
              Select an active chat
            </p>
          )}

          {messages.map((m) => (
            <div key={m._id} className="mb-2">
              <b>{m.senderType === "astrologer" ? "You" : "User"}:</b>{" "}
              {m.content}
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT */}
        {activeChat && (
          <div className="p-4 border-t flex gap-2 bg-white">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1 border rounded px-3 py-2"
              placeholder="Reply…"
            />
            <button
              onClick={sendMessage}
              className="bg-[#00695C] text-white px-4 rounded"
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
