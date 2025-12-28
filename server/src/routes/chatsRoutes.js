import express from "express";
import {
  startChat,
  getUserChats,
  getAstrologerChats,
  getMessages,
  acceptChat,
} from "../controllers/chatController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { attachIO } from "../middleware/attachIo.js";




const router = express.Router();

/* ================= USER ROUTES ================= */

// 🧠 Start / Resume chat
router.post("/start", authMiddleware, startChat);

// 📜 User → My chats
router.get("/my", authMiddleware, getUserChats);

// 🕓 Load messages of a chat
router.get("/messages/:chatId", authMiddleware, getMessages);

/* ================= ASTROLOGER ROUTES ================= */

/* ASTROLOGER */
router.get("/astrologer/my/:astrologerId", getAstrologerChats);
router.post("/accept/:chatId", attachIO, acceptChat);


// 🕓 Load messages (same endpoint)
router.get("/messages/:chatId", getMessages);

export default router;
