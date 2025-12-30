import Chat from "../models/Chat.js";
import User from "../models/User.js";
import AstrologerEarning from "../models/AstrologerEarning.js";
import { getIO } from "./socket.js";

// Store active billing intervals
const activeBillingIntervals = new Map();

/* ======================================================
   START BILLING FOR CHAT
====================================================== */
export const startChatBilling = async (chatId) => {
  try {
    const chat = await Chat.findById(chatId)
      .populate('user', 'walletBalance')
      .populate('astrologer', '_id');

    if (!chat || chat.status !== "ACTIVE") {
      return;
    }

    // Calculate minutes elapsed
    const startedAt = chat.startedAt || new Date();
    const now = new Date();
    const minutesElapsed = Math.max(
      1,
      Math.floor((now - startedAt) / (1000 * 60))
    );

    // Calculate amount to deduct
    const amountToDeduct = minutesElapsed * chat.ratePerMinute;

    // Check user balance
    const user = await User.findById(chat.user._id);
    
    if (user.walletBalance < amountToDeduct) {
      // Start grace period (5 minutes)
      if (!chat.graceUntil) {
        chat.graceUntil = new Date(Date.now() + 5 * 60 * 1000);
        await chat.save();

        const io = getIO();
        io.to(`chat_${chatId}`).emit("gracePeriodStarted", {
          graceUntil: chat.graceUntil,
          secondsRemaining: 300
        });
        io.to(`user_${chat.user._id}`).emit("insufficientBalance", {
          requiredAmount: amountToDeduct,
          currentBalance: user.walletBalance,
          graceUntil: chat.graceUntil
        });
      } else if (chat.graceUntil < new Date()) {
        // Grace period expired - end chat
        await endChatDueToInsufficientBalance(chatId);
        return;
      }
      
      return;
    }

    // Reset grace period if balance is sufficient
    if (chat.graceUntil) {
      chat.graceUntil = null;
      await chat.save();
      
      const io = getIO();
      io.to(`chat_${chatId}`).emit("gracePeriodEnded");
    }

    // Deduct from user wallet
    user.walletBalance -= amountToDeduct;
    await user.save();

    // Create earning record
    await AstrologerEarning.create({
      astrologer: chat.astrologer._id,
      user: chat.user._id,
      chat: chat._id,
      serviceType: "CHAT",
      minutes: minutesElapsed,
      ratePerMinute: chat.ratePerMinute,
      amount: amountToDeduct,
      isPaid: false
    });

    // Emit real-time updates
    const io = getIO();
    io.to(`chat_${chatId}`).emit("walletUpdated", {
      walletBalance: user.walletBalance,
      amountDeducted: amountToDeduct,
      minutesBilled: minutesElapsed
    });

    io.to(`user_${chat.user._id}`).emit("walletUpdated", {
      walletBalance: user.walletBalance
    });

  } catch (err) {
    console.error("Billing error for chat", chatId, ":", err.message);
  }
};

/* ======================================================
   END CHAT DUE TO INSUFFICIENT BALANCE
====================================================== */
const endChatDueToInsufficientBalance = async (chatId) => {
  try {
    const chat = await Chat.findById(chatId)
      .populate('user', '_id')
      .populate('astrologer', '_id');

    if (!chat) return;

    chat.status = "ENDED";
    chat.endedAt = new Date();
    chat.endReason = "insufficient_balance";
    await chat.save();

    // Mark astrologer as free
    await Astrologer.findByIdAndUpdate(chat.astrologer._id, {
      isBusy: false
    });

    const io = getIO();
    
    // Notify both parties
    io.to(`chat_${chatId}`).emit("chatEnded", {
      chatId,
      endedBy: "system",
      reason: "Insufficient balance",
      totalMinutes: Math.floor((chat.endedAt - chat.startedAt) / (1000 * 60))
    });

    io.to(`user_${chat.user._id}`).emit("chatEnded", {
      chatId,
      endedBy: "system",
      reason: "Insufficient balance"
    });

    io.to(`astrologer_${chat.astrologer._id}`).emit("chatEnded", {
      chatId,
      endedBy: "system",
      reason: "User insufficient balance"
    });

    // Update astrologer status
    io.emit("astrologerStatusUpdate", {
      astrologerId: chat.astrologer._id,
      isBusy: false
    });

    // Clear billing interval
    if (activeBillingIntervals.has(chatId)) {
      clearInterval(activeBillingIntervals.get(chatId));
      activeBillingIntervals.delete(chatId);
    }

  } catch (err) {
    console.error("End chat due to balance error:", err.message);
  }
};

/* ======================================================
   START BILLING INTERVAL FOR CHAT
====================================================== */
export const startBillingInterval = (chatId) => {
  // Clear any existing interval
  if (activeBillingIntervals.has(chatId)) {
    clearInterval(activeBillingIntervals.get(chatId));
  }

  // Start new interval (every minute)
  const interval = setInterval(() => {
    startChatBilling(chatId);
  }, 60 * 1000);

  activeBillingIntervals.set(chatId, interval);
};

/* ======================================================
   STOP BILLING INTERVAL FOR CHAT
====================================================== */
export const stopBillingInterval = (chatId) => {
  if (activeBillingIntervals.has(chatId)) {
    clearInterval(activeBillingIntervals.get(chatId));
    activeBillingIntervals.delete(chatId);
  }
};

/* ======================================================
   GET ACTIVE BILLING CHATS
====================================================== */
export const getActiveBillingChats = () => {
  return Array.from(activeBillingIntervals.keys());
};