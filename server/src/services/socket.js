// socket.js
import { Server } from "socket.io";
import Chat from "../models/Chat.js";
import User from "../models/User.js";
import { Message } from "../models/Message.js";
import AstrologerEarning from "../models/AstrologerEarning.js";
import Astrologer from "../models/Astrologer.js";

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.id);

    /* ================= JOIN CHAT ================= */
    socket.on("joinChat", ({ chatId }) => {
      if (!chatId) return;
      socket.join(chatId);
    });

    /* ================= SEND MESSAGE (SINGLE HANDLER) ================= */
    socket.on("sendMessage", async ({ chatId, senderType, senderId, content }) => {
      try {
        if (!chatId || !content?.trim()) return;

        const chat = await Chat.findById(chatId);
        if (!chat) return;

        // 🔒 Duplicate protection (1 sec window)
        const exists = await Message.findOne({
          chat: chatId,
          senderId,
          content,
          createdAt: { $gte: new Date(Date.now() - 1000) },
        });

        if (exists) return;

        const message = await Message.create({
          chat: chatId,
          senderType,
          senderId,
          content,
          seen: false,
        });

        chat.lastMessage = content;
        chat.lastMessageTime = new Date();
        await chat.save();

        io.to(chatId).emit("newMessage", message);
      } catch (err) {
        console.error("❌ sendMessage error:", err.message);
      }
    });

    /* ================= MARK SEEN ================= */
    socket.on("markSeen", async ({ chatId, viewerType }) => {
      try {
        if (!chatId || !viewerType) return;

        await Message.updateMany(
          {
            chat: chatId,
            senderType: viewerType === "user" ? "astrologer" : "user",
            seen: false,
          },
          { seen: true }
        );

        io.to(chatId).emit("messagesSeen");
      } catch (err) {
        console.error("❌ markSeen error:", err.message);
      }
    });

    /* ================= PER-MINUTE BILLING (SERVER SIDE ONLY) ================= */
 socket.on("billMinute", async ({ chatId }) => {
  if (!chatId) return;

  const chat = await Chat.findById(chatId);
  if (!chat || chat.status !== "ACTIVE") return;

  const user = await User.findById(chat.user);
  if (!user) return;

  // 💸 Wallet empty → grace
  if (user.walletBalance < chat.ratePerMinute) {
    if (!chat.graceUntil) {
      chat.graceUntil = new Date(Date.now() + 5 * 60 * 1000);
      await chat.save();

      io.to(chatId).emit("walletEmpty", { graceSeconds: 300 });
    }
    return;
  }

  // ⏱ Grace expired
  if (chat.graceUntil && Date.now() > chat.graceUntil.getTime()) {
    chat.status = "ENDED";
    chat.endedAt = new Date();
    chat.graceUntil = null;
    await chat.save();

    io.to(chatId).emit("chatEnded");
    return;
  }

  // 💰 Deduct wallet
  user.walletBalance -= chat.ratePerMinute;
  await user.save();

  chat.graceUntil = null;
  await chat.save();

  await AstrologerEarning.create({
    astrologer: chat.astrologer,
    user: chat.user,
    chat: chat._id,
    serviceType: "CHAT",
    minutes: 1,
    ratePerMinute: chat.ratePerMinute,
    amount: chat.ratePerMinute,
  });

  io.to(chatId).emit("walletUpdate", user.walletBalance);
});


    /* ================= END CHAT ================= */
    socket.on("endChat", async ({ chatId }) => {
      try {
        if (!chatId) return;

       await Chat.findByIdAndUpdate(chatId, {
  status: "ENDED",
  endedAt: new Date(),
  graceUntil: null,
});


        io.to(chatId).emit("chatEnded");
      } catch (err) {
        console.error("❌ endChat error:", err.message);
      }
    });

    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected:", socket.id);
    });
  });
};
