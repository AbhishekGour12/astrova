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

  const bottomRef = useRef(null);

  useEffect(() => {
    if (!astrologerId) return;

    socket.emit("joinAstrologer", { astrologerId });

    api
      .get(`/chat/astrologer/my/${astrologerId}`)
      .then((r) => setChats(r.data));

    socket.on("newChat", (chat) =>
      setChats((p) => [chat, ...p])
    );

    socket.on("chatActivated", (chat) =>
      setChats((p) =>
        p.map((c) => (c._id === chat._id ? chat : c))
      )
    );

    socket.on("newMessage", (msg) => {
      if (msg.chat === activeChat?._id) {
        setMessages((p) =>
          p.some((m) => m._id === msg._id) ? p : [...p, msg]
        );
      }
    });

    return () => {
      socket.off("newChat");
      socket.off("chatActivated");
      socket.off("newMessage");
    };
  }, [activeChat, astrologerId]);

  const acceptChat = async (chatId) => {
    await api.post(`/chat/accept/${chatId}`);
  };

  const openChat = async (chat) => {
    if (chat.status !== "ACTIVE") return;

    setActiveChat(chat);
    socket.emit("joinChat", { chatId: chat._id });

    const res = await api.get(`/chat/messages/${chat._id}`);
    setMessages(res.data);
  };

  const sendMessage = () => {
    if (!text) return;

    socket.emit("sendMessage", {
      chatId: activeChat._id,
      senderType: "astrologer",
      senderId: astrologerId,
      content: text,
    });

    setText("");
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="grid grid-cols-4 h-full">
      <div className="border-r p-4 bg-white">
        <h2 className="font-bold mb-3">Chats</h2>

        {chats.map((c) => (
          <div
            key={c._id}
            className="p-3 mb-2 border rounded cursor-pointer"
            onClick={() => openChat(c)}
          >
            Status: {c.status}
            {c.status === "WAITING" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  acceptChat(c._id);
                }}
                className="block mt-2 bg-green-600 text-white px-2 py-1 rounded"
              >
                Accept
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="col-span-3 flex flex-col">
        <div className="flex-1 p-4 overflow-y-auto">
          {messages.map((m) => (
            <div key={m._id} className="mb-2">
              <b>{m.senderType === "astrologer" ? "You" : "User"}:</b>{" "}
              {m.content}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {activeChat && (
          <div className="p-3 border-t flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1 border px-3 py-2 rounded"
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
