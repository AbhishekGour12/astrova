import Chat from "../models/Chat.js";
import Astrologer from "../models/Astrologer.js";
import User from "../models/User.js";
import { Message } from "../models/Message.js";

/* ======================================================
   USER → START CHAT (WAITING)
====================================================== */
export const startChat = async (req, res) => {
  try {
    const userId = req.user.id;
    const { astrologerId } = req.body;

    const astrologer = await Astrologer.findById(astrologerId);
    if (!astrologer)
      return res.status(404).json({ message: "Astrologer not found" });

    // 🔒 Prevent duplicate WAITING / ACTIVE chat
    let chat = await Chat.findOne({
      user: userId,
      astrologer: astrologerId,
      status: { $ne: "ENDED" },
    });

    if (!chat) {
      chat = await Chat.create({
        user: userId,
        astrologer: astrologerId,
        ratePerMinute: astrologer.pricing.chatPerMinute,
        status: "WAITING",
      });
    }

    res.json(chat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ======================================================
   ASTROLOGER → ACCEPT CHAT (ACTIVE)
====================================================== */
export const acceptChat = async (req, res) => {
  const { chatId } = req.params;

  const chat = await Chat.findById(chatId);
  if (!chat) {
    return res.status(404).json({ message: "Chat not found" });
  }

  if (chat.status !== "WAITING") {
    return res.status(400).json({ message: "Chat already handled" });
  }

  chat.status = "ACTIVE";
  chat.startedAt = new Date();
  await chat.save();

  // ✅ NOW req.io EXISTS
  req.io.to(chat._id.toString()).emit("chatActivated", {
    chatId: chat._id,
    startedAt: chat.startedAt,
  });

  res.json({ success: true, chat });
};



/* ======================================================
   USER → MY CHATS
====================================================== */
export const getUserChats = async (req, res) => {
  try {
    const chats = await Chat.find({ user: req.user.id })
      .populate("astrologer", "fullName profileImageUrl")
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ======================================================
   ASTROLOGER → MY CHATS (WAITING + ACTIVE)
====================================================== */
export const getAstrologerChats = async (req, res) => {
  try {
    const { astrologerId } = req.params;

    const chats = await Chat.find({
      astrologer: astrologerId,
      status: { $in: ["WAITING", "ACTIVE"] },
    })
      .populate("user", "name profileImageUrl")
      .sort({ createdAt: -1 });

    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ======================================================
   LOAD CHAT MESSAGES
====================================================== */
export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      chat: req.params.chatId,
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ======================================================
   END CHAT (MANUAL / SYSTEM)
====================================================== */
export const endChat = async (chatId) => {
  await Chat.findByIdAndUpdate(chatId, {
    status: "ENDED",
    endedAt: new Date(),
    graceUntil: null,
  });
};
