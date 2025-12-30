import Chat from "../models/Chat.js";
import User from "../models/User.js";
import { Message } from "../models/Message.js";
import AstrologerEarning from "../models/AstrologerEarning.js";
import { getIO } from "./socket.js";

export const initChatHandlers = () => {
  const io = getIO();

  io.on("connection", (socket) => {

    /* MESSAGE */
    socket.on("sendMessage", async ({ chatId, senderType, senderId, content }) => {
      if (!content) return;

      const msg = await Message.create({
        chat: chatId,
        senderType,
        senderId,
        content,
        seen: false,
      });

      io.to(`chat_${chatId}`).emit("newMessage", msg);
    });

  });
};

/* ⏱ SERVER-SIDE BILLING (BEST PRACTICE) */
setInterval(async () => {
  const chats = await Chat.find({ status: "ACTIVE" });

  for (const chat of chats) {
    const user = await User.findById(chat.user);
    if (!user) continue;

    const io = getIO();

    if (user.walletBalance < chat.ratePerMinute) {
      io.to(`chat_${chat._id}`).emit("walletEmpty", { graceSeconds: 300 });
      continue;
    }

    user.walletBalance -= chat.ratePerMinute;
    await user.save();

    await AstrologerEarning.create({
      astrologer: chat.astrologer,
      user: chat.user,
      chat: chat._id,
      serviceType: "CHAT",
      minutes: 1,
      amount: chat.ratePerMinute,
    });

    io.to(`chat_${chat._id}`).emit("walletUpdate", user.walletBalance);
  }
}, 60 * 1000);
