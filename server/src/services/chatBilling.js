import Chat from "../models/Chat.js";
import User from "../models/User.js";
import AstrologerEarning from "../models/AstrologerEarning.js";
import { getIO } from "./socket.js";

// Store active billing intervals
const activeBillingIntervals = new Map();
// Store last billing time for each chat
const lastBillingTimes = new Map();





/* ======================================================
   CHECK AND DEDUCT FOR ACTIVE MINUTE (CRITICAL FIX)
====================================================== */
export const checkAndDeductForMinute = async (chatId) => {
  try {
    const chat = await Chat.findById(chatId)
      .populate('user', 'walletBalance')
      .populate('astrologer', '_id');

    if (!chat || chat.status !== "ACTIVE") {
      return { success: false, reason: "Chat not active" };
    }

    // Get user and calculate amount
    const user = await User.findById(chat.user._id);
    const amountToDeduct = chat.ratePerMinute;

    // 🔥 CRITICAL FIX 1: Check balance BEFORE anything else
    console.log(`💰 Chat ${chatId}: Balance check - User: ₹${user.walletBalance}, Required: ₹${amountToDeduct}`);
    
    if (user.walletBalance < amountToDeduct) {
      // Check if already in grace period
      if (chat.graceUntil && new Date(chat.graceUntil) > new Date()) {
        console.log(`⏸️ Chat ${chatId} already in grace period, skipping`);
        return { success: false, reason: "Already in grace" };
      }
      
      // 🔥 Start grace period IMMEDIATELY (don't wait for billing cycle)
      console.log(`⚠️ INSUFFICIENT BALANCE for chat ${chatId}. Starting grace IMMEDIATELY...`);
      
      const graceUntil = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from NOW
      const now = new Date();
      
      chat.graceUntil = graceUntil;
      chat.graceStartedAt = now;
      chat.billingPausedAt = now;
      chat.lastWalletCheckAt = now;
      await chat.save();

      const io = getIO();
      const secondsRemaining = Math.floor((graceUntil - Date.now()) / 1000);
      
      io.to(`chat_${chatId}`).emit("gracePeriodStarted", {
        chatId,
        graceUntil: graceUntil,
        graceStartedAt: now,
        secondsRemaining: secondsRemaining,
        currentBalance: user.walletBalance,
        requiredAmount: amountToDeduct,
        message: "Insufficient balance detected"
      });
      
      io.to(`user_${chat.user._id}`).emit("gracePeriodStarted", {
        chatId,
        graceUntil: graceUntil,
        secondsRemaining: secondsRemaining,
        currentBalance: user.walletBalance
      });

      console.log(`⏸️ Grace period STARTED for chat ${chatId}. Remaining: ${secondsRemaining}s`);
      return { success: false, reason: "Insufficient balance, grace started" };
    }

    // 🔥 CRITICAL FIX 2: Check grace period AFTER balance check
    if (chat.graceUntil && new Date(chat.graceUntil) > new Date()) {
      console.log(`⏸️ Chat ${chatId} in grace period, skipping billing`);
      return { success: false, reason: "In grace period" };
    }

    // Check if grace period expired
    if (chat.graceUntil && new Date(chat.graceUntil) <= new Date()) {
      console.log(`❌ Grace period expired for chat ${chatId}`);
      await endChatDueToInsufficientBalance(chatId);
      return { success: false, reason: "Grace expired" };
    }

    const earning = await AstrologerEarning.findOne({ chat: chatId });
    if (!earning) {
      return { success: false, reason: "No earning record" };
    }

    // 🔥 Only bill if at least 60 seconds have passed since last billing
    const now = new Date();
    const lastBillingTime = lastBillingTimes.get(chatId) || chat.startedAt || now;
    const secondsSinceLastBilling = Math.floor((now - new Date(lastBillingTime)) / 1000);

    console.log(`⏰ Chat ${chatId}: ${secondsSinceLastBilling}s since last billing`);

    if (secondsSinceLastBilling < 60) {
      return { success: false, reason: "Not a full minute yet" };
    }

    // 🔥 DEDUCT FOR 1 MINUTE
    user.walletBalance -= amountToDeduct;
    await user.save();

    // Update earning (add 1 minute)
    earning.minutes += 1;
    earning.amount += amountToDeduct;
    earning.lastBilledAt = now;
    await earning.save();

    // Update chat active minutes
    chat.activeMinutes = (chat.activeMinutes || 0) + 1;
    chat.lastBillingAt = now;
    chat.lastWalletCheckAt = now;
    
    // 🔥 Clear grace period if it exists (user had enough balance)
    if (chat.graceUntil) {
      chat.graceUntil = null;
      chat.graceStartedAt = null;
      chat.billingPausedAt = null;
    }
    
    await chat.save();

    // Update in-memory tracking
    lastBillingTimes.set(chatId, now);

    // Emit updates
    const io = getIO();
    io.to(`chat_${chatId}`).emit("minuteBilled", {
      chatId,
      amount: amountToDeduct,
      minutes: 1,
      walletBalance: user.walletBalance,
      totalMinutes: earning.minutes,
      timestamp: now
    });

    io.to(`user_${chat.user._id}`).emit("walletUpdated", {
      walletBalance: user.walletBalance,
      amountDeducted: amountToDeduct,
      timestamp: now
    });

    console.log(`✅ Billed chat ${chatId}: ₹${amountToDeduct} for 1 minute. Balance: ₹${user.walletBalance}`);

    // 🔥 Check for low balance AFTER deduction
    if (user.walletBalance < amountToDeduct) {
      console.log(`⚠️ Warning: Low balance for next minute in chat ${chatId}`);
      io.to(`user_${chat.user._id}`).emit("lowBalanceWarning", {
        chatId,
        currentBalance: user.walletBalance,
        requiredForNextMinute: amountToDeduct,
        minutesLeft: Math.floor(user.walletBalance / chat.ratePerMinute)
      });
      
      // 🔥 CRITICAL: If balance is now 0 or negative, start grace immediately
      if (user.walletBalance <= 0) {
        console.log(`🔴 Balance reached 0 after billing. Starting grace...`);
        
        const graceUntil = new Date(Date.now() + 5 * 60 * 1000);
        chat.graceUntil = graceUntil;
        chat.graceStartedAt = now;
        chat.billingPausedAt = now;
        await chat.save();
        
        const secondsRemaining = Math.floor((graceUntil - Date.now()) / 1000);
        io.to(`chat_${chatId}`).emit("gracePeriodStarted", {
          chatId,
          graceUntil: graceUntil,
          secondsRemaining: secondsRemaining,
          currentBalance: user.walletBalance,
          message: "Balance reached zero"
        });
      }
    }

    return { 
      success: true, 
      amount: amountToDeduct, 
      balance: user.walletBalance,
      totalMinutes: earning.minutes
    };

  } catch (err) {
    console.error("❌ Billing error for chat", chatId, ":", err.message);
    return { success: false, reason: "Server error", error: err.message };
  }
};
/* ======================================================
   HANDLE WALLET RECHARGE (FIXED - No extra billing)
====================================================== */
export const handleWalletRecharge = async (chatId, amount, newBalance) => {
  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return { success: false, message: "Chat not found" };
    }

    console.log(`💰 Processing recharge for chat ${chatId}: ₹${amount}, new balance: ₹${newBalance}`);

    // If chat was in grace period, end it properly
    if (chat.graceUntil && new Date(chat.graceUntil) > new Date()) {
      const io = getIO();
      
      // Calculate paused time during grace
      let pausedDuration = 0;
      if (chat.graceStartedAt) {
        pausedDuration = Date.now() - new Date(chat.graceStartedAt).getTime();
        chat.totalPausedMs = (chat.totalPausedMs || 0) + pausedDuration;
        
        console.log(`⏸️ Chat ${chatId} was paused for ${Math.floor(pausedDuration/1000)}s during grace`);
      }

      // Clear grace period
      chat.graceUntil = null;
      chat.graceStartedAt = null;
      chat.billingPausedAt = null;
      chat.lastWalletCheckAt = new Date();
      
      // 🔥 CRITICAL: Reset last billing time to NOW to prevent immediate deduction
      lastBillingTimes.set(chatId, new Date());
      
      await chat.save();

      // Notify end of grace period
      io.to(`chat_${chatId}`).emit("gracePeriodEnded", {
        chatId,
        totalPausedTime: Math.floor(pausedDuration / 1000),
        newBalance: newBalance,
        message: "Wallet recharged. Billing will resume at next minute."
      });

      io.to(`user_${chat.user}`).emit("gracePeriodEnded", {
        chatId,
        newBalance: newBalance
      });

      console.log(`✅ Grace period ended for chat ${chatId}. Was paused for ${Math.floor(pausedDuration/1000)}s`);
    }

    return { 
      success: true, 
      message: "Recharge processed",
      chatId: chatId,
      newBalance: newBalance
    };

  } catch (err) {
    console.error("❌ Handle wallet recharge error:", err.message);
    return { success: false, message: err.message };
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

    // Get final earning
    const earning = await AstrologerEarning.findOne({ chat: chatId });
    let totalAmount = earning ? earning.amount : 0;
    let totalMinutes = earning ? earning.minutes : 0;

    chat.status = "ENDED";
    chat.endedAt = new Date();
    chat.endReason = "insufficient_balance";
    chat.totalMinutes = totalMinutes;
    chat.totalAmount = totalAmount;
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
      reason: "Insufficient balance - Grace period expired",
      totalMinutes: totalMinutes,
      totalAmount: totalAmount
    });

    io.to(`user_${chat.user._id}`).emit("chatEnded", {
      chatId,
      endedBy: "system",
      reason: "Insufficient balance",
      totalAmount: totalAmount
    });

    io.to(`astrologer_${chat.astrologer._id}`).emit("chatEnded", {
      chatId,
      endedBy: "system",
      reason: "User insufficient balance",
      totalAmount: totalAmount
    });

    // Update astrologer status
    io.emit("astrologerStatusUpdate", {
      astrologerId: chat.astrologer._id,
      isBusy: false
    });

    // Clear billing interval
    stopBillingInterval(chatId);

    console.log(`❌ Chat ${chatId} ended due to insufficient balance. Total: ${totalMinutes} min, ₹${totalAmount}`);

  } catch (err) {
    console.error("❌ End chat due to balance error:", err.message);
  }
};

/* ======================================================
   START BILLING INTERVAL (Every 60 seconds)
====================================================== */
export const startBillingInterval = (chatId) => {
  // Clear any existing interval
  if (activeBillingIntervals.has(chatId)) {
    clearInterval(activeBillingIntervals.get(chatId));
  }

  console.log(`▶️ Starting billing interval for chat ${chatId}`);

  // Start new interval (check every 60 seconds)
  const interval = setInterval(async () => {
    try {
      const result = await checkAndDeductForMinute(chatId);
      if (!result.success) {
        console.log(`⏸️ Billing skipped for chat ${chatId}: ${result.reason}`);
      }
    } catch (err) {
      console.error(`❌ Billing interval error for chat ${chatId}:`, err.message);
    }
  }, 60 * 1000);

  activeBillingIntervals.set(chatId, interval);
};

/* ======================================================
   STOP BILLING INTERVAL
====================================================== */
export const stopBillingInterval = (chatId) => {
  if (activeBillingIntervals.has(chatId)) {
    clearInterval(activeBillingIntervals.get(chatId));
    activeBillingIntervals.delete(chatId);
    lastBillingTimes.delete(chatId);
    console.log(`⏹️ Stopped billing interval for chat ${chatId}`);
  }
};

/* ======================================================
   GET CHAT BILLING STATUS
====================================================== */
export const getChatBillingStatus = async (chatId) => {
  try {
    const chat = await Chat.findById(chatId);
    if (!chat) return null;

    const isInGrace = chat.graceUntil && new Date(chat.graceUntil) > new Date();
    const graceSecondsRemaining = isInGrace 
      ? Math.max(0, Math.floor((new Date(chat.graceUntil) - Date.now()) / 1000))
      : 0;

    return {
      chatId,
      isActive: chat.status === "ACTIVE",
      isInGrace: isInGrace,
      graceSecondsRemaining: graceSecondsRemaining,
      graceUntil: chat.graceUntil,
      lastBillingAt: chat.lastBillingAt,
      activeMinutes: chat.activeMinutes || 0,
      totalPausedMs: chat.totalPausedMs || 0
    };
  } catch (err) {
    console.error("Get chat billing status error:", err);
    return null;
  }
};