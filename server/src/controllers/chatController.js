import Chat  from "../models/Chat.js";
import { Message } from "../models/Message.js";

// 🧠 Create or Get Chat
export const startChat = async (req, res) => {
  const { userId, astrologerId } = req.body;

  try {
    let chat = await Chat.findOne({
      participants: { $all: [userId, astrologerId] },
    });

    if (!chat) {
      chat = await Chat.create({ participants: [userId, astrologerId] });
    }

    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📜 Get all chats of a particular user
export const getUserChats = async (req, res) => {
  const { userId } = req.params;

  try {
    const chats = await Chat.find({ participants: { $in: [userId] } })
      .populate("participants", "name role profilePic")
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 💬 Send a message
export const sendMessage = async (req, res) => {
  const { chatId, senderId, content } = req.body;

  try {
    const message = await Message.create({ chatId, senderId, content });

    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: content,
      lastMessageTime: Date.now(),
    });

    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🕓 Get all messages of a specific chat
export const getMessages = async (req, res) => {
  const { chatId } = req.params;

  try {
    const messages = await Message.find({ chatId })
      .populate("senderId", "name role profilePic")
      .sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
