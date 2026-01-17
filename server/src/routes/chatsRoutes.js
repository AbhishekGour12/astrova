import express from "express";
import {
  startChat,
  
  sendMessageByUser,
  sendMessageByAstrologer,
  markMessageAsSeen,
  endChatByUser,
  endChatByAstrologer,
  getMessages,
  getUserActiveChats,
  getAstrologerActiveChats,
  checkChatStatus,
  acceptChatByAstrologer,
 
  processChatRecharge
} from "../controllers/chatController.js";

import { authMiddleware, onlyUser } from "../middleware/authMiddleware.js";
import Chat from "../models/Chat.js";

const router = express.Router();

/* ================= USER ROUTES ================= */

// start chat
router.post("/user/start", authMiddleware, onlyUser, startChat);

// active chats
router.get("/user/active", authMiddleware, onlyUser, getUserActiveChats);

// send message
router.post("/user/message", authMiddleware, onlyUser, sendMessageByUser);

// seen
router.post("/user/message/seen/:messageId", authMiddleware, onlyUser, markMessageAsSeen);

// end chat
router.post("/user/end/:chatId", authMiddleware, onlyUser, endChatByUser);
// Add this route
router.post("/recharge/:chatId", authMiddleware, onlyUser, processChatRecharge);

/* ================= ASTROLOGER ROUTES ================= */

// accept chat
router.post("/astrologer/accept/:chatId/:astrologerId", acceptChatByAstrologer);

// active chats
router.get("/astrologer/active/:astrologerId", getAstrologerActiveChats);

// send message
router.post("/astrologer/message/:astrologerId", sendMessageByAstrologer);

// seen
router.post("/astrologer/message/seen/:messageId/:astrologerId", markMessageAsSeen);

// end chat
router.post("/astrologer/end/:chatId/:astrologerId", endChatByAstrologer);

/* ================= SHARED ================= */

router.get("/messages/:chatId", getMessages);
router.get("/status/:chatId", checkChatStatus);


router.get('/user/active-with-astrologer/:astrologerId', authMiddleware, onlyUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { astrologerId } = req.params;
    console.log(userId, astrologerId)
    const chat = await Chat.findOne({
      user: userId,
      astrologer: astrologerId,
      status: { $in: ["ACTIVE", "WAITING"] }
    });
    
    res.json({
      success: true,
      chat: chat || null
    });
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});


export default router;
