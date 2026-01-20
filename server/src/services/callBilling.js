import Call from "../models/Call.js";
import User from "../models/User.js";
import AstrologerEarning from "../models/AstrologerEarning.js";
import Astrologer from "../models/Astrologer.js";
import { getIO } from "../services/socket.js";

// Store active billing intervals for calls
const activeCallBillingIntervals = new Map();

/* ======================================================
   START BILLING FOR CALL (Periodic Check)
====================================================== */
export const startCallBilling = async (callId) => {
  try {
    const call = await Call.findById(callId)
      .populate("user", "walletBalance")
      .populate("astrologer", "_id");

    if (!call || call.status !== "ACTIVE") {
      stopCallBillingInterval(callId); // Safety check
      return;
    }

    const user = await User.findById(call.user._id);
    const ratePerMinute = call.ratePerMinute;

    // 1. CHECK BALANCE BEFORE DEDUCTING
    if (user.walletBalance < ratePerMinute) {
      console.log(`⚠️ Insufficient balance: ₹${user.walletBalance} < ₹${ratePerMinute}`);
      await endCallDueToInsufficientBalance(callId);
      return;
    }

    // 2. DEDUCT MONEY
    user.walletBalance -= ratePerMinute;
    await user.save();

    // 3. UPDATE EARNINGS
    let earning = await AstrologerEarning.findOne({ call: callId });
    if (earning) {
      earning.minutes += 1;
      earning.amount += ratePerMinute;
      await earning.save();
    }

    const io = getIO();

    // 4. EMIT UPDATES
    const billingData = {
      callId,
      walletBalance: user.walletBalance,
      amountDeducted: ratePerMinute,
      timestamp: new Date()
    };

    io.to(`call_${callId}`).emit("walletUpdated",{
      walletBalance: user.walletBalance, // Updated balance sent here
      callId});
    io.to(`user_${call.user._id}`).emit("walletUpdated", user.walletBalance);

    // 5. LOW BALANCE WARNING (If next minute is impossible)
    if (user.walletBalance < ratePerMinute) {
     const warningData = {
        message: "Your balance is low. Call will disconnect automatically in 1 minute.",
        currentBalance: user.walletBalance,
        ratePerMinute: ratePerMinute
      };

      io.to(`user_${call.user._id}`).emit("lowBalanceWarning", warningData);
      io.to(`call_${callId}`).emit("lowBalanceWarning", warningData);
    }

  } catch (err) {
    console.error("❌ Call billing error:", err.message);
  }
};

/* ======================================================
   END CALL DUE TO INSUFFICIENT BALANCE
====================================================== */
const endCallDueToInsufficientBalance = async (callId) => {
  try {
    // 1. STOP BILLING IMMEDIATELY
    stopCallBillingInterval(callId);

    const call = await Call.findById(callId);
    if (!call || call.status === "ENDED") return;

    // 2. UPDATE DB
    call.status = "ENDED";
    call.endReason = "insufficient_balance";
    call.endedAt = new Date();
    await call.save();

    await Astrologer.findByIdAndUpdate(call.astrologer, { isBusy: false });

    // 3. NOTIFY FRONTEND - CRITICAL STEP
    const io = getIO();
    const endData = {
      callId,
      endedBy: "system",
      reason: "insufficient_balance",
      message: "Call ended due to low balance"
    };

    // Emit to specific rooms to ensure delivery
    io.to(`call_${callId}`).emit("forceDisconnect", endData); // Specific event for frontend to listen to
    io.to(`user_${call.user}`).emit("forceDisconnect", endData);
    io.to(`astrologer_${call.astrologer}`).emit("callEnded", endData);

    // Update global status
    io.emit("astrologerStatusUpdate", {
      astrologerId: call.astrologer,
      isBusy: false
    });

  } catch (err) {
    console.error("❌ End call balance error:", err.message);
  }
};

export const startCallBillingInterval = (callId) => {
  if (activeCallBillingIntervals.has(callId)) {
    clearInterval(activeCallBillingIntervals.get(callId));
  }
  // Run immediately first? No, usually after 1 min. 
  // But if you want prepaid logic, check immediately.
  // For now, standard interval:
  const interval = setInterval(() => {
    startCallBilling(callId);
  }, 60000); // 60 seconds

  activeCallBillingIntervals.set(callId, interval);
};

export const stopCallBillingInterval = (callId) => {
  if (activeCallBillingIntervals.has(callId)) {
    clearInterval(activeCallBillingIntervals.get(callId));
    activeCallBillingIntervals.delete(callId);
  }
};