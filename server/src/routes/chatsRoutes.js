import express from "express";
import {
  startChat,
  getUserChats,
  sendMessage,
  getMessages,
} from "../controllers/chatController.js";

const router = express.Router();

// 🧠 Create or Get Chat between user & astrologer
router.post("/start", startChat);

// 📜 Get all chats of a particular user (user or astrologer)
router.get("/user/:userId", getUserChats);

// 💬 Send a message
router.post("/message/send", sendMessage);

// 🕓 Get all messages of a specific chat
router.get("/message/:chatId", getMessages);

export default router;
