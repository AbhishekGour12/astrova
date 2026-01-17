import Chat from "../models/Chat.js";
import Astrologer from "../models/Astrologer.js";
import User from "../models/User.js";
import AstrologerEarning from "../models/AstrologerEarning.js";
import { Message } from "../models/Message.js";
import { getIO } from "../services/socket.js";
import { stopBillingInterval } from "../services/chatBilling.js";
/* ======================================================
   START CHAT
====================================================== */
export const startChat = async (req, res) => {
  try {
    const userId = req.user.id;
    const { astrologerId } = req.body;

    // Check if astrologer exists and is available
    const astrologer = await Astrologer.findById(astrologerId);
    if (!astrologer) {
      return res.status(404).json({ 
        success: false,
        message: "Astrologer not found" 
      });
    }

    // Check for existing active chat
    const existingChat = await Chat.findOne({
      user: userId,
      astrologer: astrologerId,
      status: { $in: ["WAITING", "ACTIVE"] }
    });

    if (existingChat) {
      return res.status(400).json({ 
        success: false,
        message: "Chat already exists",
        chat: existingChat
      });
    }

    // Create new chat
    const chat = await Chat.create({
      user: userId,
      astrologer: astrologerId,
      ratePerMinute: astrologer.pricing?.chatPerMinute || 50,
      status: "WAITING",
    
    });

    
    // Mark astrologer as busy
    astrologer.isBusy = true;
    await astrologer.save();

    // Populate chat for response
    const populatedChat = await Chat.findById(chat._id)
      .populate('user', 'username profileImageUrl')
      .populate('astrologer', 'fullName profileImageUrl');

    // Notify astrologer via socket
    const io = getIO();
    io.to(`astrologer_${astrologerId}`).emit("newChat", populatedChat);
    io.emit("astrologerStatusUpdate", {
      astrologerId,
      isBusy: true
    });

    res.status(201).json({
      success: true,
      chat: populatedChat
    });
  } catch (err) {
    console.error("Start chat error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to start chat" 
    });
  }
};

/* ======================================================
   ASTROLOGER → ACCEPT CHAT
====================================================== */
export const acceptChatByAstrologer = async (req, res) => {
  const { chatId, astrologerId } = req.params;
  console.log(chatId, astrologerId)
  try{

  const chat = await Chat.findById(chatId).populate("user");
  
  if (!chat) return res.status(404).json({ message: "Chat not found" });

  if (String(chat.astrologer) !== astrologerId)
    return res.status(403).json({ message: "Unauthorized" });

  if (chat.status !== "WAITING")
    return res.status(400).json({ message: "Chat already handled" });

  if (chat.user.walletBalance < chat.ratePerMinute)
    return res.status(400).json({ message: "Insufficient user balance" });

  chat.status = "ACTIVE";
  chat.startedAt = new Date();
  await chat.save();
  await AstrologerEarning.create({
  astrologer: chat.astrologer,
  user: chat.user._id,
  chat: chat._id,
  serviceType: "CHAT",
  minutes: 0,
  ratePerMinute: chat.ratePerMinute,
  amount: 0,
  isPaid: false
});


  const io = getIO();
   io.to(`user_${chat.user._id}`).emit("chatActivated", chat);
   
  io.to(`chat_${chat._id}`).emit("chatActivated", chat);
 await Astrologer.findByIdAndUpdate(astrologerId,{
  $inc: { totalConsultations: 1 } 
 })
  res.json({ success: true, chat });
}catch(err){
  console.log(err.message)
}
};


/* ======================================================
   SEND MESSAGE (USER)
====================================================== */
export const sendMessageByUser = async (req, res) => {
  try {
    const { chatId, content } = req.body;
    const userId = req.user.id;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ 
        success: false, 
        message: "Chat not found" 
      });
    }

    if (chat.status !== "ACTIVE") {
      return res.status(400).json({ 
        success: false, 
        message: "Chat is not active" 
      });
    }

    // Check if user is the owner of this chat
    if (chat.user.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: "Unauthorized" 
      });
    }

    // Create message
    const message = await Message.create({
      chat: chatId,
      senderType: "user",
      senderId: userId,
      content: content.trim()
    });

    // Populate the message
    const populatedMessage = await Message.findById(message._id)
      .populate("senderId", "name profileImageUrl");

    // Emit via socket
    const io = getIO();
    io.to(`chat_${chatId}`).emit("newMessage", populatedMessage);

    res.status(201).json({
      success: true,
      message: populatedMessage
    });
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to send message" 
    });
  }
};

/* ======================================================
   SEND MESSAGE (ASTROLOGER)
====================================================== */
export const sendMessageByAstrologer = async (req, res) => {
  try {
    const { chatId, content } = req.body;
    const { astrologerId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ 
        success: false, 
        message: "Chat not found" 
      });
    }

    if (chat.status !== "ACTIVE") {
      return res.status(400).json({ 
        success: false, 
        message: "Chat is not active" 
      });
    }

    // Check if astrologer is the owner of this chat
    if (chat.astrologer.toString() !== astrologerId) {
      return res.status(403).json({ 
        success: false, 
        message: "Unauthorized" 
      });
    }

    // Create message
    const message = await Message.create({
      chat: chatId,
      senderType: "astrologer",
      senderId: astrologerId,
      content: content.trim()
    });

    // Populate the message
    const populatedMessage = await Message.findById(message._id)
      .populate("senderId", "fullName profileImageUrl");

    // Emit via socket
    const io = getIO();
    io.to(`chat_${chatId}`).emit("newMessage", populatedMessage);

    res.status(201).json({
      success: true,
      message: populatedMessage
    });
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to send message" 
    });
  }
};
/* ======================================================
   MARK MESSAGE AS SEEN
====================================================== */
export const markMessageAsSeen = async (req, res) => {
  try {
    const { messageId } = req.params;
    
    const message = await Message.findByIdAndUpdate(
      messageId,
      { seen: true },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ 
        success: false,
        message: "Message not found" 
      });
    }

    // Emit socket event
    const io = getIO();
    io.to(`chat_${message.chat}`).emit("messageSeenUpdate", {
      messageId: message._id,
      seen: true
    });

    res.json({
      success: true,
      message
    });
  } catch (err) {
    console.error("Mark seen error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to mark message as seen" 
    });
  }
};
/* ======================================================
   END CHAT
====================================================== */
/* ======================================================
   END CHAT BY USER
====================================================== */
/* ======================================================
   END CHAT BY USER
====================================================== */
/* ======================================================
   END CHAT BY USER
====================================================== */
export const endChatByUser = async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user.id;

  const chat = await Chat.findById(chatId);
  if (!chat || String(chat.user) !== userId)
    return res.status(403).json({ message: "Unauthorized" });

  const startedAt = chat.startedAt || new Date();
  const endedAt = new Date();

  // 🔥 STEP 1: Calculate pending pause if chat ended DURING grace period
  let pendingPause = 0;
  if (chat.graceStartedAt) {
    pendingPause = endedAt - new Date(chat.graceStartedAt);
  }

  // 🔥 STEP 2: Calculate Active Duration
  // Formula: Total Time - (Saved Paused Time + Current Pending Pause)
  const totalDurationMs = (endedAt - startedAt);
  const totalPausedMs = (chat.totalPausedMs || 0) + pendingPause;
  
  // Ensure we don't get negative time
  const activeMs = Math.max(0, totalDurationMs - totalPausedMs);
  const activeSeconds = Math.floor(activeMs / 1000);

  let minutes = 0;
  let totalAmount = 0;

  // 🔥 STEP 3: Billing Calculation (Using Floor for exact minutes)
  if (activeSeconds >= 60) {
    minutes = Math.floor(activeSeconds / 60); 
    totalAmount = minutes * chat.ratePerMinute;
  }

  stopBillingInterval(chatId);

  // Handle Earnings Database Record
  if (totalAmount > 0) {
    await AstrologerEarning.findOneAndUpdate(
      { chat: chat._id },
      { minutes: minutes, amount: totalAmount }
    );
  } else {
    // If duration < 1 min active time, delete the 0 earning record
    await AstrologerEarning.findOneAndDelete({ chat: chat._id });
  }

  // Update Chat Status
  chat.status = "ENDED";
  chat.endedAt = endedAt;
  chat.totalMinutes = minutes;
  chat.totalAmount = totalAmount;
  
  // Cleanup flags
  chat.graceStartedAt = null; 
  // We keep totalPausedMs in DB for history
  
  await chat.save();

  await Astrologer.findByIdAndUpdate(chat.astrologer, { isBusy: false });

  const io = getIO();
  const socketData = {
    chatId,
    endedBy: "user",
    totalMinutes: minutes,
    totalAmount
  };

  io.to(`chat_${chatId}`).emit("chatEnded", socketData);
  io.to(`user_${chat.user._id}`).emit("chatEnded", socketData);
  io.to(`astrologer_${chat.astrologer}`).emit("chatEnded", socketData);

  io.emit("astrologerStatusUpdate", {
    astrologerId: chat.astrologer,
    isBusy: false
  });

  res.json({ success: true });
};

/* ======================================================
   END CHAT BY ASTROLOGER
====================================================== */
export const endChatByAstrologer = async (req, res) => {
  const { chatId, astrologerId } = req.params;

  const chat = await Chat.findById(chatId);
  if (!chat || String(chat.astrologer) !== astrologerId)
    return res.status(403).json({ message: "Unauthorized" });

  const startedAt = chat.startedAt || new Date();
  const endedAt = new Date();

  // 🔥 STEP 1: Calculate pending pause
  let pendingPause = 0;
  if (chat.graceStartedAt) {
    pendingPause = endedAt - new Date(chat.graceStartedAt);
  }

  // 🔥 STEP 2: Calculate Active Duration
  const totalDurationMs = (endedAt - startedAt);
  const totalPausedMs = (chat.totalPausedMs || 0) + pendingPause;
  
  const activeMs = Math.max(0, totalDurationMs - totalPausedMs);
  const activeSeconds = Math.floor(activeMs / 1000);

  let minutes = 0;
  let totalAmount = 0;

  // 🔥 STEP 3: Billing Calculation
  if (activeSeconds >= 60) {
    minutes = Math.floor(activeSeconds / 60);
    totalAmount = minutes * chat.ratePerMinute;
  }

  stopBillingInterval(chatId);

  if (totalAmount > 0) {
    await AstrologerEarning.findOneAndUpdate(
      { chat: chat._id },
      { minutes: minutes, amount: totalAmount }
    );
  } else {
    await AstrologerEarning.findOneAndDelete({ chat: chat._id });
  }

  chat.status = "ENDED";
  chat.endedAt = endedAt;
  chat.totalMinutes = minutes;
  chat.totalAmount = totalAmount;
  chat.graceStartedAt = null;
  await chat.save();

  await Astrologer.findByIdAndUpdate(astrologerId, { isBusy: false });

  const io = getIO();
  const socketData = {
    chatId,
    endedBy: "astrologer",
    totalMinutes: minutes,
    totalAmount
  };

  io.to(`chat_${chatId}`).emit("chatEnded", socketData);
  io.to(`user_${chat.user._id}`).emit("chatEnded", socketData);
  io.to(`astrologer_${chat.astrologer}`).emit("chatEnded", socketData);

  io.emit("astrologerStatusUpdate", {
    astrologerId: chat.astrologer,
    isBusy: false
  });

  res.json({ success: true });
};

/* ======================================================
   GET MESSAGES
====================================================== */

export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    const messages = await Message.find({ chat: chatId })
      .populate("senderId", "name fullName profileImageUrl")
      .sort({ createdAt: 1 });

    return res.json({
      success: true,
      messages
    });
  } catch (err) {
    console.error("Get messages error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to get messages"
    });
  }
};


/* ======================================================
   GET USER ACTIVE CHATS
====================================================== */
export const getUserActiveChats = async (req, res) => {
  try {
    const userId = req.user.id;

    const chats = await Chat.find({
      user: userId,
      status: { $in: ["WAITING", "ACTIVE"] }
    })
    .populate('astrologer', 'fullName profileImageUrl bio pricing')
    .sort({ updatedAt: -1 });

    res.json({
      success: true,
      chats
    });
  } catch (err) {
    console.error("Get user chats error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to get chats" 
    });
  }
};

/* ======================================================
   GET ASTROLOGER ACTIVE CHATS
====================================================== */
export const getAstrologerActiveChats = async (req, res) => {
  const { astrologerId } = req.params;

  const chats = await Chat.find({
    astrologer: astrologerId,
    status: { $in: ["WAITING", "ACTIVE"] }
  }).populate("user", "name profileImageUrl");

  res.json({ success: true, chats });
};


/* ======================================================
   CHECK CHAT STATUS
====================================================== */
export const checkChatStatus = async (req, res) => {
  try {
    const { chatId } = req.params;
    console.log(chatId)
    
    const chat = await Chat.findById(chatId)
      .populate('user', 'name walletBalance')
      .populate('astrologer', 'fullName profileImageUrl isBusy');

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.json({
      success: true,
      chat
    });
  } catch (err) {
    console.error("Check chat status error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to check chat status" 
    });
  }
};

/* ======================================================
   HANDLE WALLET RECHARGE DURING CHAT
====================================================== */
export const handleChatRecharge = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { amount, newBalance } = req.body;
    const userId = req.user.id;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ 
        success: false, 
        message: "Chat not found" 
      });
    }

    // Verify user owns this chat
    if (String(chat.user) !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: "Unauthorized" 
      });
    }

    // If chat was in grace period, end it
    if (chat.graceUntil) {
      // Calculate paused time
      let totalPausedMs = 0;
      if (chat.graceStartedAt) {
        totalPausedMs = Date.now() - new Date(chat.graceStartedAt).getTime();
        chat.totalPausedMs = (chat.totalPausedMs || 0) + totalPausedMs;
      }

      // Clear grace period
      chat.graceUntil = null;
      chat.graceStartedAt = null;
      chat.lastBillingAt = new Date(); // Resume billing from now
      await chat.save();

      // Notify via socket
      const io = getIO();
      io.to(`chat_${chatId}`).emit("gracePeriodEnded", {
        chatId,
        totalPausedTime: Math.floor(totalPausedMs / 1000),
        message: "Wallet recharged successfully"
      });

      console.log(`✅ Grace period ended for chat ${chatId} after recharge`);
    }

    res.json({
      success: true,
      message: "Recharge processed successfully",
      chat
    });

  } catch (err) {
    console.error("Handle chat recharge error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to process recharge" 
    });
  }
};


/* ======================================================
   PROCESS RECHARGE DURING CHAT
====================================================== */
export const processChatRecharge = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { amount, newBalance } = req.body;
    const userId = req.user.id;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ 
        success: false, 
        message: "Chat not found" 
      });
    }

    // Verify user owns this chat
    if (String(chat.user) !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: "Unauthorized" 
      });
    }

    console.log(`💰 Processing recharge for chat ${chatId}: ₹${amount}, new balance: ₹${newBalance}`);

    // If chat was in grace period, end it
    if (chat.graceUntil && new Date(chat.graceUntil) > new Date()) {
      // Calculate paused time during grace
      let pausedDuration = 0;
      if (chat.graceStartedAt) {
        pausedDuration = Date.now() - new Date(chat.graceStartedAt).getTime();
        chat.totalPausedMs = (chat.totalPausedMs || 0) + pausedDuration;
      }

      // Clear grace period
      chat.graceUntil = null;
      chat.graceStartedAt = null;
      chat.billingPausedAt = null;
      chat.lastWalletCheckAt = new Date();
      await chat.save();

      // Notify via socket
      const io = getIO();
      io.to(`chat_${chatId}`).emit("gracePeriodEnded", {
        chatId,
        totalPausedTime: Math.floor(pausedDuration / 1000),
        newBalance: newBalance,
        message: "Recharge successful. Chat resumed."
      });

      console.log(`✅ Grace ended for chat ${chatId} after recharge. Paused for ${Math.floor(pausedDuration/1000)}s`);
    }

    res.json({
      success: true,
      message: "Recharge processed successfully",
      chat: chat
    });

  } catch (err) {
    console.error("❌ Process chat recharge error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to process recharge" 
    });
  }
};