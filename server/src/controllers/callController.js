import Call from "../models/Call.js";
import Astrologer from "../models/Astrologer.js";
import User from "../models/User.js";
import AstrologerEarning from "../models/AstrologerEarning.js";
import { getIO } from "../services/socket.js";
import { startCallBillingInterval, stopCallBillingInterval } from "../services/callBilling.js";
import { generateZegoToken } from "../services/zegoService.js";
import mongoose from "mongoose";
/* ======================================================
   START CALL (USER INITIATES)
====================================================== */
export const startCall = async (req, res) => {
  try {
    const userId = req.user.id;
    const { astrologerId, callType = "AUDIO" } = req.body;

    // Check if astrologer exists and is available
    const astrologer = await Astrologer.findById(astrologerId);
    if (!astrologer) {
      return res.status(404).json({ 
        success: false,
        message: "Astrologer not found" 
      });
    }

    if (astrologer.isBusy) {
      return res.status(400).json({ 
        success: false,
        message: "Astrologer is currently busy" 
      });
    }

    // Check for existing active/waiting call
    const existingCall = await Call.findOne({
      user: userId,
      astrologer: astrologerId,
      status: { $in: ["WAITING", "ACTIVE"] }
    });

    if (existingCall) {
      return res.status(400).json({ 
        success: false,
        message: "Call already exists",
        call: existingCall
      });
    }

    // Check user wallet balance for minimum 1 minute
    const user = await User.findById(userId);
    const ratePerMinute = astrologer.pricing?.callPerMinute || 100;
    
    if (user.walletBalance < ratePerMinute) {
      return res.status(400).json({ 
        success: false,
        message: "Insufficient balance to start call" 
      });
    }

    // Generate Zego room ID
    const zegoRoomId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create call record
    const call = await Call.create({
      user: userId,
      astrologer: astrologerId,
      callType: callType,
      ratePerMinute: ratePerMinute,
      zegoRoomId: zegoRoomId,
      peerDetails: {
        userPeerId: `user_${userId}`,
        astroPeerId: `astrologer_${astrologerId}`
      },
      status: "WAITING"
    });

    // Mark astrologer as busy
    astrologer.isBusy = true;
    await astrologer.save();

    // Populate call for response
    const populatedCall = await Call.findById(call._id)
      .populate('user', 'name profileImageUrl')
      .populate('astrologer', 'fullName profileImageUrl pricing');

    // Notify astrologer via socket
    const io = getIO();
    io.to(`astrologer_${astrologerId}`).emit("incomingCall", {
      call: populatedCall,
      type: callType,
      zegoRoomId: zegoRoomId,
      timestamp: new Date()
    });

    io.emit("astrologerStatusUpdate", {
      astrologerId,
      isBusy: true
    });

    // Set timeout for missed call (60 seconds)
    setTimeout(async () => {
      const callCheck = await Call.findById(call._id);
      if (callCheck && callCheck.status === "WAITING") {
        await markMissedCall(call._id);
      }
    }, 60000);

    res.status(201).json({
      success: true,
      call: populatedCall,
      zegoRoomId: zegoRoomId
    });
  } catch (err) {
    console.log("Start call error:", err.message);
    res.status(500).json({ 
      success: false,
      message: "Failed to start call" 
    });
  }
};

/* ======================================================
   ASTROLOGER → ACCEPT CALL
====================================================== */
export const acceptCallByAstrologer = async (req, res) => {
  try {
    const { callId, astrologerId } = req.params;
   
    const call = await Call.findById(callId)
      .populate("user", "walletBalance name")
      .populate("astrologer", "fullName");
   

    if (!call) {
      return res.status(404).json({ 
        success: false,
        message: "Call not found" 
      });
    }

    if (String(call.astrologer._id) !== astrologerId) {
      return res.status(403).json({ 
        success: false,
        message: "Unauthorized" 
      });
    }

    if (call.status !== "WAITING") {
      return res.status(400).json({ 
        success: false,
        message: "Call already handled" 
      });
    }

    // Check user balance
    if (call.user.walletBalance < call.ratePerMinute) {
      // Mark call as missed due to insufficient balance
      call.status = "MISSED";
      call.endReason = "insufficient_balance";
      await call.save();

      // Free astrologer
      await Astrologer.findByIdAndUpdate(astrologerId, { isBusy: false });

      const io = getIO();
      io.emit("astrologerStatusUpdate", {
        astrologerId,
        isBusy: false
      });
     
      return res.status(400).json({ 
        success: false,
        message: "User has insufficient balance" 
      });
    }

    // Update call status to ACTIVE
    call.status = "ACTIVE";
    call.startedAt = new Date();
    await call.save();
    // CREATE earning record only once when call becomes ACTIVE
await AstrologerEarning.create({
  astrologer: call.astrologer._id,
  user: call.user._id,
  call: call._id,
  serviceType: "CALL",
  minutes: 0,
  ratePerMinute: call.ratePerMinute,
  amount: 0,
  isPaid: false
});


    // Start billing interval
    startCallBillingInterval(callId);

    // Emit socket events
    const io = getIO();
    // 1. Emit to the call room
    io.to(`call_${callId}`).emit("callActivated", {
      callId: call._id,
      zegoRoomId: call.zegoRoomId,
      callType: call.callType,
      astrologerId: astrologerId,
      userId: call.user._id,
      timestamp: new Date()
    });

    // 2. Emit to the user specifically
    io.to(`user_${call.user._id}`).emit("callActivated", {
      callId: call._id,
      zegoRoomId: call.zegoRoomId,
      callType: call.callType,
      astrologerId: astrologerId,
      timestamp: new Date()
    });
    // 3. Emit to astrologer specifically
    io.to(`astrologer_${astrologerId}`).emit("callActivated", {
      callId: call._id,
      zegoRoomId: call.zegoRoomId,
      callType: call.callType,
      userId: call.user._id,
      timestamp: new Date()
    });

    // 4. Notify user that astrologer joined
    io.to(`call_${callId}`).emit("astrologerJoinedCall", {
      astrologerId: astrologerId,
      callId: call._id,
      timestamp: new Date()
    });

    // 5. Update astrologer status for all users
    io.emit("astrologerStatusUpdate", {
      astrologerId,
      isBusy: true
    });
    
     console.log(`✅ Call ${callId} activated. Emitted socket events to user ${call.user._id} and astrologer ${astrologerId}`);


    res.json({ 
      success: true, 
      call: call,
      zegoRoomId: call.zegoRoomId
    });
  } catch (err) {
    console.log("Accept call error:", err.message);
    res.status(500).json({ 
      success: false,
      message: "Failed to accept call" 
    });
  }
};

/* ======================================================
   REJECT CALL BY ASTROLOGER
====================================================== */
export const rejectCallByAstrologer = async (req, res) => {
  try {
    const { callId, astrologerId } = req.params;

    const call = await Call.findById(callId);
    if (!call) {
      return res.status(404).json({ 
        success: false,
        message: "Call not found" 
      });
    }

    if (String(call.astrologer) !== astrologerId) {
      return res.status(403).json({ 
        success: false,
        message: "Unauthorized" 
      });
    }

    if (call.status !== "WAITING") {
      return res.status(400).json({ 
        success: false,
        message: "Call already handled" 
      });
    }

    // Update call status
    call.status = "REJECTED";
    call.endReason = "rejected";
    await call.save();

    // Free astrologer
    await Astrologer.findByIdAndUpdate(astrologerId, { isBusy: false });

    // Notify user
    const io = getIO();
    io.to(`user_${call.user}`).emit("callRejected", {
      callId: call._id,
      reason: "Astrologer rejected the call"
    });

    io.emit("astrologerStatusUpdate", {
      astrologerId,
      isBusy: false
    });

    res.json({ 
      success: true,
      message: "Call rejected successfully" 
    });
  } catch (err) {
    console.error("Reject call error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to reject call" 
    });
  }
};

/* ======================================================
   END CALL BY USER
====================================================== */
export const endCallByUser = async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = req.user.id;

    const call = await Call.findById(callId);
    if (!call) {
      return res.status(404).json({ 
        success: false,
        message: "Call not found" 
      });
    }

    if (String(call.user) !== userId) {
      return res.status(403).json({ 
        success: false,
        message: "Unauthorized" 
      });
    }

    // Calculate total minutes and amount
    const startedAt = call.startedAt || new Date();
    const endedAt = new Date();
    const minutes = Math.max(
      1,
      Math.ceil((endedAt - startedAt) / (1000 * 60))
    );

    const totalAmount = minutes * call.ratePerMinute;

    // Update call
    call.status = "ENDED";
    call.endedAt = endedAt;
    call.totalMinutes = minutes;
    call.totalAmount = totalAmount;
    call.endReason = "user_ended";
    await call.save();

    // Stop billing interval
    stopCallBillingInterval(callId);

    // Create earning record
    if (totalAmount > 0) {
      await AstrologerEarning.findOneAndUpdate(
  { call: call._id },
  {
    minutes: minutes,
    amount: totalAmount
  }
);

    }

    // Free astrologer
    await Astrologer.findByIdAndUpdate(call.astrologer, { isBusy: false });

    // Send real-time notifications
    const io = getIO();
    
    io.to(`call_${callId}`).emit("callEnded", {
      callId,
      endedBy: "user",
      totalMinutes: minutes,
      totalAmount
    });

    io.to(`user_${call.user}`).emit("callEnded", {
      callId,
      endedBy: "user",
      totalMinutes: minutes,
      totalAmount
    });

    io.to(`astrologer_${call.astrologer}`).emit("callEnded", {
      callId,
      endedBy: "user",
      totalMinutes: minutes,
      totalAmount
    });

    // Update astrologer status for all users
    io.emit("astrologerStatusUpdate", {
      astrologerId: call.astrologer,
      isBusy: false
    });

    res.json({ 
      success: true,
      call: call
    });
  } catch (err) {
    console.error("End call by user error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to end call" 
    });
  }
};

/* ======================================================
   END CALL BY ASTROLOGER
====================================================== */
export const endCallByAstrologer = async (req, res) => {
  try {
    const { callId, astrologerId } = req.params;

    const call = await Call.findById(callId);
    if (!call) {
      return res.status(404).json({ 
        success: false,
        message: "Call not found" 
      });
    }

    if (String(call.astrologer) !== astrologerId) {
      return res.status(403).json({ 
        success: false,
        message: "Unauthorized" 
      });
    }

    // Calculate total minutes and amount
    const startedAt = call.startedAt || new Date();
    const endedAt = new Date();
    const minutes = Math.max(
      1,
      Math.ceil((endedAt - startedAt) / (1000 * 60))
    );

    const totalAmount = minutes * call.ratePerMinute;

    // Update call
    call.status = "ENDED";
    call.endedAt = endedAt;
    call.totalMinutes = minutes;
    call.totalAmount = totalAmount;
    call.endReason = "astrologer_ended";
    await call.save();

    // Stop billing interval
    stopCallBillingInterval(callId);

    // Create earning record
    if (totalAmount > 0) {
      await AstrologerEarning.findOneAndUpdate(
  { call: call._id },
  {
    minutes: minutes,
    amount: totalAmount
  }
);

    }

    // Free astrologer
    await Astrologer.findByIdAndUpdate(astrologerId, { isBusy: false });

    // Send real-time notifications
    const io = getIO();
    
    io.to(`call_${callId}`).emit("callEnded", {
      callId,
      endedBy: "astrologer",
      totalMinutes: minutes,
      totalAmount
    });

    io.to(`user_${call.user}`).emit("callEnded", {
      callId,
      endedBy: "astrologer",
      totalMinutes: minutes,
      totalAmount
    });

    io.to(`astrologer_${call.astrologer}`).emit("callEnded", {
      callId,
      endedBy: "astrologer",
      totalMinutes: minutes,
      totalAmount
    });

    // Update astrologer status for all users
    io.emit("astrologerStatusUpdate", {
      astrologerId: call.astrologer,
      isBusy: false
    });

    res.json({ 
      success: true,
      call: call
    });
  } catch (err) {
    console.error("End call by astrologer error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to end call" 
    });
  }
};

/* ======================================================
   GET ACTIVE CALL FOR USER
====================================================== */
export const getUserActiveCall = async (req, res) => {
  try {
    const userId = req.user.id;

    const call = await Call.findOne({
      user: userId,
      status: { $in: ["WAITING", "ACTIVE"] }
    })
    .populate('astrologer', 'fullName profileImageUrl bio pricing callType');
     
    res.json({
      success: true,
      call: call || null
    });
  } catch (err) {
    console.error("Get user active call error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to get active call" 
    });
  }
};

/* ======================================================
   GET ACTIVE CALL FOR ASTROLOGER
====================================================== */
export const getAstrologerActiveCall = async (req, res) => {
  try {
    const { astrologerId } = req.params;
   
    const call = await Call.findOne({
      astrologer: astrologerId,
      status: { $in: ["WAITING", "ACTIVE"] }
    })
    //const call1 = await Call.find();

    console.log(astrologerId, call)
    res.json({
      success: true,
      call: call || null
    });
  } catch (err) {
    console.error("Get astrologer active call error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to get active call" 
    });
  }
};

/* ======================================================
   GET CALL STATUS
====================================================== */
export const getCallStatus = async (req, res) => {
  try {
    const { callId } = req.params;
    
    const call = await Call.findById(callId)
      .populate('user', 'name walletBalance')
      .populate('astrologer', 'fullName profileImageUrl isBusy callType');

    if (!call) {
      return res.status(404).json({ 
        success: false,
        message: "Call not found" 
      });
    }

    res.json({
      success: true,
      call: call
    });
  } catch (err) {
    console.error("Get call status error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to get call status" 
    });
  }
};

/* ======================================================
   MARK MISSED CALL (AUTO)
====================================================== */
export const markMissedCall = async (callId) => {
  try {
    const call = await Call.findById(callId);
    if (!call || call.status !== "WAITING") return;

    // Check if call is older than 60 seconds
    const now = new Date();
    const callAge = (now - call.createdAt) / 1000; // in seconds
    
    if (callAge > 60) { // 1 minute timeout
      call.status = "MISSED";
      call.endReason = "missed";
      await call.save();

      // Free astrologer
      await Astrologer.findByIdAndUpdate(call.astrologer, { isBusy: false });

      // Notify user
      const io = getIO();
      io.to(`user_${call.user}`).emit("callMissed", {
        callId: call._id,
        reason: "Astrologer didn't answer"
      });

      io.emit("astrologerStatusUpdate", {
        astrologerId: call.astrologer,
        isBusy: false
      });
    }
  } catch (err) {
    console.error("Mark missed call error:", err);
  }
};

/* ======================================================
   GET ZEGO TOKEN
   */
export const getZegoToken = async (req, res) => {
  try {
    const { roomId, userId, userName } = req.body;
    const appId = Number(process.env.ZEGO_APP_ID || "1531051351");

    if (!roomId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Room ID and User ID required"
      });
    }

    const token = generateZegoToken({
      appId,
      serverSecret: process.env.ZEGO_SERVER_SECRET || "1514a5e9c7fadddfbf79230b40e58b7b",
      roomId,
      userId,
      userName: userName || `User_${userId}`
    });

    res.json({
      success: true,
      appId: appId,
      token,
      roomId,
      userId,
      userName: userName || `User_${userId}`
    });
  } catch (err) {
    console.error("Zego token error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to generate Zego token" 
    });
  }
};

/* ======================================================
   GET CALL DETAILS WITH TOKEN
====================================================== */
export const getCallDetailsWithToken = async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = req.user?.id;
    const { astrologerId } = req.query;
    
    const call = await Call.findById(callId)
      .populate('user', 'name profileImageUrl')
      .populate('astrologer', 'fullName profileImageUrl pricing');
    
    if (!call) {
      return res.status(404).json({ 
        success: false,
        message: "Call not found" 
      });
    }

    // Generate Zego token based on who's requesting
    let token = null;
    let peerId = null;
    let userName = null;

    if (userId && String(call.user._id) === userId) {
      peerId = `user_${userId}`;
      userName = call.user.name;
    } else if (astrologerId && String(call.astrologer._id) === astrologerId) {
      peerId = `astrologer_${astrologerId}`;
      userName = call.astrologer.fullName;
    } else {
      return res.status(403).json({ 
        success: false,
        message: "Unauthorized" 
      });
    }

    // Generate Zego token
    token = generateZegoToken({
      appId: Number(process.env.ZEGO_APP_ID || "1531051351"),
      serverSecret: process.env.ZEGO_SERVER_SECRET || "1514a5e9c7fadddfbf79230b40e58b7b",
      roomId: call.zegoRoomId,
      userId: peerId,
      userName: userName
    });

    res.json({
      success: true,
      call: call,
      token: token,
      appId: Number(process.env.ZEGO_APP_ID || "1531051351"),
      roomId: call.zegoRoomId,
      peerId: peerId,
      userName: userName,
      callType: call.callType
    });
  } catch (err) {
    console.error("Get call details with token error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to get call details" 
    });
  }
};

/* ======================================================
   END CALL (UTILITY FUNCTION)
====================================================== */
export const endCall = async (callId, endedBy) => {
  try {
    const call = await Call.findById(callId);
    if (!call) return;

    stopCallBillingInterval(callId);

    call.status = "ENDED";
    call.endedAt = new Date();
    call.endReason = `${endedBy}_ended`;
    await call.save();

    await Astrologer.findByIdAndUpdate(call.astrologer, { isBusy: false });

    const io = getIO();
    io.to(`call_${callId}`).emit("callEnded", { 
      callId,
      endedBy: endedBy 
    });
    
    return true;
  } catch (error) {
    console.error("End call utility error:", error);
    return false;
  }
};


export const getAstrologerCallHistory = async (req, res) => {
  try {
    const { astrologerId, limit = 10, page = 1 } = req.query;
    console.log(astrologerId, limit, page)

    if (!astrologerId) {
      return res.status(400).json({
        success: false,
        message: "astrologerId is required",
      });
    }

    const parsedLimit = parseInt(limit);
    const parsedPage = parseInt(page);
    const skip = (parsedPage - 1) * parsedLimit;

    const calls = await Call.find({ astrologer: astrologerId })
      .populate("user", "fullName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit)
      .lean();


    const totalCalls = await Call.countDocuments({
      astrologer: astrologerId,
    });

    res.status(200).json({
      success: true,
      page: parsedPage,
      limit: parsedLimit,
      totalCalls,
      totalPages: Math.ceil(totalCalls / parsedLimit),
      calls: calls,
    });
  } catch (error) {
    console.error("Astrologer Call History Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch call history",
    });
  }
};


// In callController.js, add these functions:

/* ======================================================
   GET WAITING CALLS FOR ASTROLOGER
====================================================== */
export const getAstrologerWaitingCalls = async (req, res) => {
  try {
    const { astrologerId } = req.params;
    
    const waitingCalls = await Call.find({
      astrologer: astrologerId,
      status: "WAITING"
    })
    .populate('user', 'name profileImageUrl')
    .populate('astrologer', 'fullName profileImageUrl pricing')
    .sort({ createdAt: -1 })
    .limit(10); // Limit to 10 most recent waiting calls

    res.json({
      success: true,
      calls: waitingCalls || []
    });
  } catch (err) {
    console.error("Get astrologer waiting calls error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to get waiting calls" 
    });
  }
};

/* ======================================================
   GET ALL ACTIVE/WAITING CALLS FOR ASTROLOGER
====================================================== */
export const getAstrologerAllPendingCalls = async (req, res) => {
  try {
    const { astrologerId } = req.params;
    
    const pendingCalls = await Call.find({
      astrologer: astrologerId,
      status: { $in: ["WAITING", "ACTIVE"] }
    })
    .populate('user', 'name profileImageUrl')
    .populate('astrologer', 'fullName profileImageUrl pricing')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      calls: pendingCalls || []
    });
  } catch (err) {
    console.error("Get astrologer pending calls error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to get pending calls" 
    });
  }
};