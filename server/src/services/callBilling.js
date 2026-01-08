import Call from "../models/Call.js";
import User from "../models/User.js";
import AstrologerEarning from "../models/AstrologerEarning.js";
import { getIO } from "./socket.js";

// Store active billing intervals for calls
const activeCallBillingIntervals = new Map();

/* ======================================================
   START BILLING FOR CALL
====================================================== */
export const startCallBilling = async (callId) => {
  try {
    const call = await Call.findById(callId)
      .populate('user', 'walletBalance')
      .populate('astrologer', '_id');

    if (!call || call.status !== "ACTIVE") {
      return;
    }

    // Calculate minutes elapsed
    const startedAt = call.startedAt || new Date();
    const now = new Date();
    const minutesElapsed = Math.max(
      1,
      Math.floor((now - startedAt) / (1000 * 60))
    );

    // Calculate amount to deduct
    const amountToDeduct = minutesElapsed * call.ratePerMinute;

    // Check user balance
    const user = await User.findById(call.user._id);
    
    if (user.walletBalance < amountToDeduct) {
      // Insufficient balance - end call immediately
      await endCallDueToInsufficientBalance(callId);
      return;
    }

    // Deduct from user wallet
    user.walletBalance -= amountToDeduct;
    await user.save();

    // Create earning record
    await AstrologerEarning.create({
      astrologer: call.astrologer._id,
      user: call.user._id,
      call: call._id,
      serviceType: "CALL",
      minutes: minutesElapsed,
      ratePerMinute: call.ratePerMinute,
      amount: amountToDeduct,
      isPaid: false
    });

    // Emit real-time updates
    const io = getIO();
    io.to(`call_${callId}`).emit("walletUpdated", {
      walletBalance: user.walletBalance,
      amountDeducted: amountToDeduct,
      minutesBilled: minutesElapsed
    });

    io.to(`user_${call.user._id}`).emit("walletUpdated", {
      walletBalance: user.walletBalance
    });

  } catch (err) {
    console.error("Call billing error for call", callId, ":", err.message);
  }
};

/* ======================================================
   END CALL DUE TO INSUFFICIENT BALANCE
====================================================== */
const endCallDueToInsufficientBalance = async (callId) => {
  try {
    const call = await Call.findById(callId)
      .populate('user', '_id')
      .populate('astrologer', '_id');

    if (!call) return;

    call.status = "ENDED";
    call.endedAt = new Date();
    call.endReason = "insufficient_balance";
    await call.save();

    // Mark astrologer as free
    await Astrologer.findByIdAndUpdate(call.astrologer._id, {
      isBusy: false
    });

    const io = getIO();
    
    // Notify both parties
    io.to(`call_${callId}`).emit("callEnded", {
      callId,
      endedBy: "system",
      reason: "Insufficient balance",
      totalMinutes: Math.floor((call.endedAt - call.startedAt) / (1000 * 60))
    });

    io.to(`user_${call.user._id}`).emit("callEnded", {
      callId,
      endedBy: "system",
      reason: "Insufficient balance"
    });

    io.to(`astrologer_${call.astrologer._id}`).emit("callEnded", {
      callId,
      endedBy: "system",
      reason: "User insufficient balance"
    });

    // Update astrologer status
    io.emit("astrologerStatusUpdate", {
      astrologerId: call.astrologer._id,
      isBusy: false
    });

    // Clear billing interval
    if (activeCallBillingIntervals.has(callId)) {
      clearInterval(activeCallBillingIntervals.get(callId));
      activeCallBillingIntervals.delete(callId);
    }

  } catch (err) {
    console.error("End call due to balance error:", err.message);
  }
};

/* ======================================================
   START BILLING INTERVAL FOR CALL
====================================================== */
export const startCallBillingInterval = (callId) => {
  // Clear any existing interval
  if (activeCallBillingIntervals.has(callId)) {
    clearInterval(activeCallBillingIntervals.get(callId));
  }

  // Start new interval (every minute)
  const interval = setInterval(() => {
    startCallBilling(callId);
  }, 60 * 1000);

  activeCallBillingIntervals.set(callId, interval);
};

/* ======================================================
   STOP BILLING INTERVAL FOR CALL
====================================================== */
export const stopCallBillingInterval = (callId) => {
  if (activeCallBillingIntervals.has(callId)) {
    clearInterval(activeCallBillingIntervals.get(callId));
    activeCallBillingIntervals.delete(callId);
  }
};

/* ======================================================
   GET ACTIVE BILLING CALLS
====================================================== */
export const getActiveBillingCalls = () => {
  return Array.from(activeCallBillingIntervals.keys());
};