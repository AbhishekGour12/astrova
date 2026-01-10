
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
      .populate("user", "walletBalance")
      .populate("astrologer", "_id");

    if (!call || call.status !== "ACTIVE") return;

    // find earning record
    const earning = await AstrologerEarning.findOne({ call: callId });
    if (!earning) return;

    const user = await User.findById(call.user._id);

    // check balance for 1 minute only
    if (user.walletBalance < call.ratePerMinute) {
      await endCallDueToInsufficientBalance(callId);
      return;
    }

    // Deduct wallet for 1 minute
    user.walletBalance -= call.ratePerMinute;
    await user.save();

    // Update earning
    earning.minutes += 1;
    earning.amount += call.ratePerMinute;
    await earning.save();

    const io = getIO();

    io.to(`call_${callId}`).emit("walletUpdated", {
      walletBalance: user.walletBalance,
      minutes: earning.minutes,
      totalAmount: earning.amount
    });

    io.to(`user_${call.user._id}`).emit("walletUpdated", {
      walletBalance: user.walletBalance
    });

  } catch (err) {
    console.error("Call billing error:", err.message);
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
