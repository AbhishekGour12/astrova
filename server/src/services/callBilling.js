
import Call from "../models/Call.js";
import User from "../models/User.js";
import AstrologerEarning from "../models/AstrologerEarning.js";
import { getIO } from "./socket.js";

// Store active billing intervals for calls
const activeCallBillingIntervals = new Map();

/* ======================================================
   START BILLING FOR CALL (FIXED WITH SOCKET EVENTS)
====================================================== */
export const startCallBilling = async (callId) => {
  try {
    const call = await Call.findById(callId)
      .populate("user", "walletBalance")
      .populate("astrologer", "_id");

    if (!call || call.status !== "ACTIVE") {
      console.log(`❌ Call ${callId} not active, skipping billing`);
      return;
    }

    // find earning record
    const earning = await AstrologerEarning.findOne({ call: callId });
    if (!earning) {
      console.log(`❌ No earning record found for call ${callId}`);
      return;
    }

    const user = await User.findById(call.user._id);

    // check balance for 1 minute only
    if (user.walletBalance < call.ratePerMinute) {
      console.log(`⚠️ Insufficient balance: ₹${user.walletBalance} < ₹${call.ratePerMinute}`);
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

    // 🔥 CRITICAL FIX: Emit detailed wallet update events
    const billingData = {
      callId,
      walletBalance: user.walletBalance,
      amountDeducted: call.ratePerMinute,
      minutes: earning.minutes,
      totalAmount: earning.amount,
      timestamp: new Date()
    };

    console.log(`✅ Billed call ${callId}: ₹${call.ratePerMinute} deducted. New balance: ₹${user.walletBalance}`);

    // Emit to call room
    io.to(`call_${callId}`).emit("walletUpdated", billingData);
    
    // Emit to user specifically
    io.to(`user_${call.user._id}`).emit("walletUpdated", {
      walletBalance: user.walletBalance,
      amountDeducted: call.ratePerMinute,
      timestamp: new Date()
    });

    // 🔥 ALSO EMIT minuteBilled event for frontend tracking
    io.to(`call_${callId}`).emit("minuteBilled", {
      callId,
      amount: call.ratePerMinute,
      minutes: 1,
      walletBalance: user.walletBalance,
      totalMinutes: earning.minutes,
      timestamp: new Date()
    });

    // 🔥 Check for low balance warning AFTER deduction
    if (user.walletBalance < call.ratePerMinute) {
      console.log(`⚠️ Low balance warning for call ${callId}: ₹${user.walletBalance} left`);
      
      const minutesLeft = Math.floor(user.walletBalance / call.ratePerMinute);
      
      io.to(`user_${call.user._id}`).emit("lowBalanceWarning", {
        callId,
        currentBalance: user.walletBalance,
        requiredForNextMinute: call.ratePerMinute,
        minutesLeft: minutesLeft,
        message: `Only ₹${user.walletBalance} left. ${minutesLeft} minute(s) remaining.`
      });
    }

  } catch (err) {
    console.error("❌ Call billing error:", err.message);
  }
};

/* ======================================================
   END CALL DUE TO INSUFFICIENT BALANCE (FIXED)
====================================================== */
const endCallDueToInsufficientBalance = async (callId) => {
  try {
    const call = await Call.findById(callId)
      .populate('user', '_id name')
      .populate('astrologer', '_id fullName');

    if (!call) {
      console.log(`❌ Call ${callId} not found for ending due to insufficient balance`);
      return;
    }

    console.log(`❌ Ending call ${callId} due to insufficient balance`);

    // Calculate total minutes and amount
    const startedAt = call.startedAt || new Date();
    const endedAt = new Date();
    const diffMs = endedAt - startedAt;
    const diffSeconds = Math.floor(diffMs / 1000);
    
    let minutes = 0;
    let totalAmount = 0;
    
    if (diffSeconds >= 60) {
      minutes = Math.floor(diffSeconds / 60);
      totalAmount = minutes * call.ratePerMinute;
    }

    // Update call
    call.status = "ENDED";
    call.endedAt = endedAt;
    call.totalMinutes = minutes;
    call.totalAmount = totalAmount;
    call.endReason = "insufficient_balance";
    await call.save();

    // Update earning if any
    if (totalAmount > 0) {
      await AstrologerEarning.findOneAndUpdate(
        { call: call._id },
        { minutes: minutes, amount: totalAmount }
      );
    }

    // Mark astrologer as free
    await Astrologer.findByIdAndUpdate(call.astrologer._id, {
      isBusy: false
    });

    const io = getIO();
    
    // Notify both parties
    const endData = {
      callId,
      endedBy: "system",
      reason: "Insufficient balance",
      totalMinutes: minutes,
      totalAmount: totalAmount,
      timestamp: new Date()
    };

    io.to(`call_${callId}`).emit("callEnded", endData);
    io.to(`user_${call.user._id}`).emit("callEnded", endData);
    io.to(`astrologer_${call.astrologer._id}`).emit("callEnded", endData);

    // 🔥 ALSO EMIT insufficient balance event
    io.to(`user_${call.user._id}`).emit("insufficientBalance", {
      callId,
      currentBalance: 0,
      requiredAmount: call.ratePerMinute,
      message: "Call ended due to insufficient balance"
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

    console.log(`✅ Call ${callId} ended due to insufficient balance. Total: ${minutes} min, ₹${totalAmount}`);

  } catch (err) {
    console.error("❌ End call due to balance error:", err.message);
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

  console.log(`▶️ Starting billing interval for call ${callId}`);

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
    console.log(`⏹️ Stopped billing interval for call ${callId}`);
  }
};

/* ======================================================
   GET ACTIVE BILLING CALLS
====================================================== */
export const getActiveBillingCalls = () => {
  return Array.from(activeCallBillingIntervals.keys());
};

/* ======================================================
   MANUAL BALANCE CHECK (For frontend to call)
====================================================== */
export const checkCallBalance = async (callId) => {
  try {
    const call = await Call.findById(callId)
      .populate('user', 'walletBalance')
      .populate('astrologer', '_id');
    
    if (!call) return null;
    
    return {
      callId,
      walletBalance: call.user.walletBalance,
      ratePerMinute: call.ratePerMinute,
      minutesLeft: Math.floor(call.user.walletBalance / call.ratePerMinute),
      isSufficient: call.user.walletBalance >= call.ratePerMinute
    };
  } catch (err) {
    console.error("Check call balance error:", err);
    return null;
  }
};
