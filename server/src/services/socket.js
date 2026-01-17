import { Server } from "socket.io";
import { startBillingInterval, stopBillingInterval } from "./chatBilling.js";
import { Message } from "../models/Message.js";
import Call from "../models/Call.js";
import Astrologer from "../models/Astrologer.js"; // Add this import
import Chat from "../models/Chat.js";

let io;

// Simple in-memory cache for active calls (optional, for better performance)
const activeCallCache = new Map();

// Helper to get call from database (fallback if not in cache)
const getCallData = async (callId) => {
  try {
    // First check cache
    if (activeCallCache.has(callId)) {
      return activeCallCache.get(callId);
    }
    
    // If not in cache, fetch from database
    const call = await Call.findById(callId)
      .populate('user', '_id name')
      .populate('astrologer', '_id fullName');
    
    if (call) {
      // Cache for 5 minutes
      activeCallCache.set(callId, call);
      setTimeout(() => activeCallCache.delete(callId), 300000);
    }
    
    return call;
  } catch (error) {
    console.error("Error fetching call data:", error);
    return null;
  }
};

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ["websocket", "polling"],
    pingTimeout: 60000,
    pingInterval: 25000
  });

  io.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.id);
    // In socket.js, add these event handlers inside io.on("connection"):

// Listen for wallet recharge events
socket.on("walletRecharged", async ({ callId, amount, newBalance }) => {
  try {
    console.log(`💰 Wallet recharged for call ${callId}: ₹${amount}, new balance: ₹${newBalance}`);
    
    const call = await Call.findById(callId);
    if (!call) return;
    
    // Emit wallet update to all concerned
    io.to(`call_${callId}`).emit("walletUpdated", {
      walletBalance: newBalance,
      amountAdded: amount,
      message: "Wallet recharged successfully",
      timestamp: new Date()
    });
    
    io.to(`user_${call.user}`).emit("walletUpdated", {
      walletBalance: newBalance
    });
    
  } catch (err) {
    console.error("Wallet recharged socket error:", err);
  }
});

// Listen for manual balance check requests
socket.on("checkBalance", async ({ callId }) => {
  try {
    const call = await Call.findById(callId)
      .populate('user', 'walletBalance');
    
    if (!call) return;
    
    // Send current balance to user
    socket.emit("balanceUpdate", {
      callId,
      walletBalance: call.user.walletBalance,
      ratePerMinute: call.ratePerMinute,
      minutesLeft: Math.floor(call.user.walletBalance / call.ratePerMinute)
    });
    
  } catch (err) {
    console.error("Check balance socket error:", err);
  }
});
       // 🔥 1. When Grace Period Starts -> Record the Timestamp
    socket.on("gracePeriodTriggered", async ({ chatId }) => {
      try {
        console.log(`⏸️ Grace period started for chat ${chatId}`);
        await Chat.findByIdAndUpdate(chatId, { 
          graceStartedAt: new Date() 
        });
      } catch (err) {
        console.error("Error handling grace start:", err);
      }
    });

    // 🔥 2. When Grace Period Ends -> Calculate Duration & Add to Total Paused
    socket.on("gracePeriodEnded", async ({ chatId }) => {
      try {
        const chat = await Chat.findById(chatId);
        
        if (chat && chat.graceStartedAt) {
          const now = new Date();
          const graceStart = new Date(chat.graceStartedAt);
          
          // Calculate how long it was paused (in milliseconds)
          const pauseDuration = now - graceStart;
          
          console.log(`▶️ Grace period ended. Paused for: ${pauseDuration}ms`);

          // Update DB: Add to totalPausedMs and clear start time
          await Chat.findByIdAndUpdate(chatId, {
            $inc: { totalPausedMs: pauseDuration },
            graceStartedAt: null
          });
        }
      } catch (err) {
        console.error("Error handling grace end:", err);
      }
    });

    // In socket.js, add this to the connection handler:

socket.on("requestImmediateGrace", async ({ chatId, userId, currentBalance }) => {
  try {
    console.log(`⚠️ Immediate grace requested for chat ${chatId}, balance: ₹${currentBalance}`);
    
    const chat = await Chat.findById(chatId);
    if (!chat || chat.status !== "ACTIVE") return;
    
    // Check if already in grace
    if (chat.graceUntil && new Date(chat.graceUntil) > new Date()) {
      return; // Already in grace
    }
    
    // Start grace period immediately
    const graceUntil = new Date(Date.now() + 5 * 60 * 1000);
    chat.graceUntil = graceUntil;
    chat.graceStartedAt = new Date();
    chat.billingPausedAt = new Date();
    await chat.save();
    
    // Calculate remaining seconds
    const secondsRemaining = Math.floor((graceUntil - Date.now()) / 1000);
    
    // Emit grace period started
    socket.to(`chat_${chatId}`).emit("gracePeriodStarted", {
      chatId,
      graceUntil: graceUntil,
      secondsRemaining: secondsRemaining,
      currentBalance: currentBalance,
      message: "Chat paused due to insufficient balance"
    });
    
    socket.to(`user_${userId}`).emit("gracePeriodStarted", {
      chatId,
      graceUntil: graceUntil,
      secondsRemaining: secondsRemaining
    });
    
    console.log(`⏸️ Immediate grace started for chat ${chatId}. Remaining: ${secondsRemaining}s`);
    
  } catch (err) {
    console.error("Immediate grace error:", err);
  }
});

socket.on("graceExpired", async ({ chatId }) => {
  try {
    console.log(`❌ Grace expired for chat ${chatId}`);
    
    const chat = await Chat.findById(chatId);
    if (!chat) return;
    
    // End chat due to grace expiration
    chat.status = "ENDED";
    chat.endedAt = new Date();
    chat.endReason = "grace_period_expired";
    await chat.save();
    
    // Emit chat ended
    socket.to(`chat_${chatId}`).emit("chatEnded", {
      chatId,
      endedBy: "system",
      reason: "Grace period expired",
      totalAmount: 0
    });
    
  } catch (err) {
    console.error("Grace expired error:", err);
  }
});
    // User joins
    socket.on("joinUser", ({ userId }) => {
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined`);
    });

    // Astrologer joins
    socket.on("joinAstrologer", ({ astrologerId }) => {
      socket.join(`astrologer_${astrologerId}`);
      console.log(`Astrologer ${astrologerId} joined`);
    });

    // Join chat room
    socket.on("joinChat", ({ chatId }) => {
      socket.join(`chat_${chatId}`);
      console.log(`Socket joined chat ${chatId}`);
    });
     socket.on("astrologerAvailabilityChanged", async ({ astrologerId, isAvailable }) => {
      try {
        console.log(`🔄 Astrologer ${astrologerId} availability changed to: ${isAvailable ? 'Online' : 'Offline'}`);
        
        // Update database
        await Astrologer.findByIdAndUpdate(
          astrologerId,
          { isAvailable },
          { new: true }
        );
        
        // Broadcast to all connected clients
        io.emit("astrologerAvailabilityChanged", {
          astrologerId,
          isAvailable,
          timestamp: new Date()
        });
        
        // Notify specific rooms
        io.to(`astrologer_${astrologerId}`).emit("availabilityUpdated", {
          isAvailable,
          timestamp: new Date()
        });
        
        console.log(`✅ Availability update broadcast for astrologer ${astrologerId}`);
      } catch (error) {
        console.error("Error updating astrologer availability:", error);
      }
    });


    // User joins call room
    socket.on("joinCallRoom", ({ callId, userId }) => {
      if (!callId || !userId) {
        console.log("❌ Missing callId or userId for joinCallRoom");
        return;
      }
      
      // Check if already in room
      if (socket.rooms.has(`call_${callId}`)) {
        console.log(`⚠️ User ${userId} already in call room ${callId}`);
        return;
      }
      
      socket.join(`call_${callId}`);
      socket.join(`user_${userId}`);
      console.log(`✅ User ${userId} joined call room ${callId}`);
    });

    // Astrologer joins call room
    socket.on("astrologerJoinCallRoom", async ({ callId, astrologerId }) => {
      if (!callId || !astrologerId) {
        console.log("❌ Missing callId or astrologerId for astrologerJoinCallRoom");
        return;
      }
      
      // Check if already in room
      if (socket.rooms.has(`call_${callId}`)) {
        console.log(`⚠️ Astrologer ${astrologerId} already in call room ${callId}`);
        return;
      }
      
      socket.join(`call_${callId}`);
      socket.join(`astrologer_${astrologerId}`);
      console.log(`✅ Astrologer ${astrologerId} joined call room ${callId}`);
      
      // Get call data to find user
      try {
        const call = await getCallData(callId);
        if (call && call.user && call.user._id) {
          // Notify user that astrologer joined
          io.to(`user_${call.user._id}`).emit("astrologerJoinedCall", {
            astrologerId,
            astrologerName: call.astrologer?.fullName || "Astrologer",
            callId,
            timestamp: new Date()
          });
        }
        
        // Also notify all in call room
        socket.to(`call_${callId}`).emit("astrologerJoinedCall", {
          astrologerId,
          callId,
          timestamp: new Date()
        });
        
      } catch (error) {
        console.error("Error in astrologerJoinCallRoom:", error);
      }
    });

    // Forward callActivated events (for redundancy)
    socket.on("forwardCallActivated", ({ callId, data }) => {
      console.log(`📢 Forwarding callActivated for call ${callId}`);
      socket.to(`call_${callId}`).emit("callActivated", data);
    });

    // Handle incoming call notifications
    socket.on("incomingCallNotification", ({ astrologerId, callData }) => {
      console.log(`📞 Forwarding incoming call to astrologer ${astrologerId}`);
      io.to(`astrologer_${astrologerId}`).emit("incomingCall", {
        call: callData,
        timestamp: new Date()
      });
    });

    // Send message
    socket.on("sendMessage", async (data) => {
      try {
        const { chatId, senderType, senderId, content } = data;
        
        const recipientRoom = senderType === "user" 
          ? `astrologer_${data.astrologerId}`
          : `user_${data.userId}`;
        
        if (recipientRoom) {
          io.to(recipientRoom).emit("newMessageNotification", {
            chatId,
            message: content,
            senderType
          });
        }
      } catch (err) {
        console.error("Socket send message error:", err);
      }
    });

    // Typing indicator
    socket.on("typing", ({ chatId, senderId, senderRole, isTyping }) => {
      socket.to(`chat_${chatId}`).emit("typingUpdate", {
        senderId,
        senderRole,
        isTyping
      });
    });

    // Message seen
    socket.on("messageSeen", ({ chatId, messageId }) => {
      Message.findByIdAndUpdate(messageId, { seen: true }, { new: true })
        .then(updatedMessage => {
          io.to(`chat_${chatId}`).emit("messageSeenUpdate", {
            messageId: updatedMessage._id,
            seen: true,
            updatedAt: updatedMessage.updatedAt
          });
        })
        .catch(err => console.error("Error marking message as seen:", err));
    });

    // Chat billing events
    socket.on("chatStarted", ({ chatId }) => {
      startBillingInterval(chatId);
    });

    socket.on("chatEnded", ({ chatId }) => {
      stopBillingInterval(chatId);
    });

    // Zego call events
    socket.on("joinZegoCall", ({ callId, userId, roomId }) => {
      socket.join(`call_${callId}`);
      socket.join(`zego_room_${roomId}`);
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined Zego call room ${roomId}`);
      
      socket.to(`call_${callId}`).emit("zegoUserJoined", { 
        userId,
        roomId 
      });
    });

    socket.on("joinAstrologerZegoCall", ({ callId, astrologerId, roomId }) => {
      socket.join(`call_${callId}`);
      socket.join(`zego_room_${roomId}`);
      socket.join(`astrologer_${astrologerId}`);
      console.log(`Astrologer ${astrologerId} joined Zego call room ${roomId}`);
      
      socket.to(`call_${callId}`).emit("zegoAstrologerJoined", { 
        astrologerId,
        roomId 
      });
    });

    // Zego quality events
    socket.on("zegoCallQuality", ({ callId, quality, userId, astrologerId }) => {
      socket.to(`call_${callId}`).emit("zegoCallQualityUpdate", { 
        userId,
        astrologerId,
        quality 
      });
    });

    socket.on("zegoToggleAudio", ({ callId, isMuted, userId, astrologerId }) => {
      socket.to(`call_${callId}`).emit("zegoAudioToggled", { 
        userId,
        astrologerId,
        isMuted 
      });
    });

    socket.on("zegoParticipantLeft", ({ callId, userId, astrologerId, roomId }) => {
      socket.to(`call_${callId}`).emit("zegoParticipantDisconnected", {
        userId,
        astrologerId,
        roomId,
        timestamp: new Date()
      });
    });

    socket.on("zegoParticipantRejoined", ({ callId, userId, astrologerId, roomId }) => {
      socket.to(`call_${callId}`).emit("zegoParticipantReconnected", {
        userId,
        astrologerId,
        roomId,
        timestamp: new Date()
      });
    });

    // WebRTC signaling (if needed)
    socket.on("callSignal", ({ callId, signal, to }) => {
      socket.to(`call_${callId}`).emit("callSignal", { 
        signal, 
        from: socket.id 
      });
    });

    socket.on("iceCandidate", ({ callId, candidate, to }) => {
      socket.to(`call_${callId}`).emit("iceCandidate", { 
        candidate, 
        from: socket.id 
      });
    });

    // Call control events
    socket.on("toggleAudio", ({ callId, isMuted, userId, astrologerId }) => {
      socket.to(`call_${callId}`).emit("audioToggled", { 
        userId,
        astrologerId,
        isMuted 
      });
    });

    socket.on("toggleVideo", ({ callId, isVideoOff, userId, astrologerId }) => {
      socket.to(`call_${callId}`).emit("videoToggled", { 
        userId,
        astrologerId,
        isVideoOff 
      });
    });

    // Call heartbeat (keep alive)
    socket.on("callHeartbeat", ({ callId, userId, astrologerId }) => {
      socket.emit("callHeartbeatAck", { 
        timestamp: Date.now(),
        userId,
        astrologerId 
      });
    });

    // Call recording
    socket.on("callRecording", ({ callId, isRecording, userId, astrologerId }) => {
      socket.to(`call_${callId}`).emit("callRecordingUpdate", { 
        userId,
        astrologerId,
        isRecording 
      });
    });

    // Screen sharing
    socket.on("screenShare", ({ callId, isSharing, userId, astrologerId }) => {
      socket.to(`call_${callId}`).emit("screenShareUpdate", { 
        userId,
        astrologerId,
        isSharing 
      });
    });

    // Call billing events
    socket.on("callStarted", ({ callId }) => {
      const { startCallBillingInterval } = require("./services/callBilling.js");
      startCallBillingInterval(callId);
    });

    socket.on("callEnded", ({ callId }) => {
      const { stopCallBillingInterval } = require("./services/callBilling.js");
      stopCallBillingInterval(callId);
      // Clear from cache
      activeCallCache.delete(callId);
    });

    // Temporary disconnection handling
    socket.on("leftCallTemporarily", ({ callId, userId, astrologerId }) => {
      socket.to(`call_${callId}`).emit("participantLeftTemporarily", {
        userId,
        astrologerId,
        timestamp: new Date()
      });
    });

    socket.on("rejoinedCall", ({ callId, userId, astrologerId }) => {
      socket.to(`call_${callId}`).emit("participantRejoined", {
        userId,
        astrologerId,
        timestamp: new Date()
      });
    });

    // Network quality
    socket.on("networkQuality", ({ callId, quality, userId, astrologerId }) => {
      socket.to(`call_${callId}`).emit("networkQualityUpdate", {
        userId,
        astrologerId,
        quality
      });
    });

    // Zego participant joined (explicit event for tracking)
    socket.on("zegoParticipantJoined", ({ roomId, userId, astrologerId, callId }) => {
      console.log(`🔊 Zego participant joined: user=${userId}, astrologer=${astrologerId}, room=${roomId}`);
      
      // Notify both participants
      if (userId) {
        socket.to(`user_${userId}`).emit("zegoParticipantJoined", {
          roomId,
          astrologerId,
          timestamp: new Date()
        });
      }
      
      if (astrologerId) {
        socket.to(`astrologer_${astrologerId}`).emit("zegoParticipantJoined", {
          roomId,
          userId,
          timestamp: new Date()
        });
      }
      
      // Also emit to call room
      socket.to(`call_${callId}`).emit("zegoParticipantJoined", {
        roomId,
        userId,
        astrologerId,
        timestamp: new Date()
      });
    });
     // User ended call
socket.on("userEndedCall", ({ callId, userId, astrologerId }) => {
  console.log(`👋 User ${userId} ended call ${callId}`);
  
  // Notify astrologer
  if (astrologerId) {
    io.to(`astrologer_${astrologerId}`).emit("userEndedCall", {
      callId,
      userId,
      timestamp: new Date()
    });
  }
  // Astrologer ended call
socket.on("astrologerEndedCall", ({ callId, astrologerId, userId }) => {
  console.log(`👋 Astrologer ${astrologerId} ended call ${callId}`);
  
  // Notify user
  if (userId) {
    io.to(`user_${userId}`).emit("callEndedByAstrologer", {
      callId,
      astrologerId,
      timestamp: new Date()
    });
  }
  
  // Also emit general call ended event
  io.to(`call_${callId}`).emit("callEnded", {
    callId,
    endedBy: "astrologer",
    timestamp: new Date()
  });
});
  // Also emit general call ended event
  io.to(`call_${callId}`).emit("callEnded", {
    callId,
    endedBy: "user",
    timestamp: new Date()
  });
});
    // Disconnect handler
    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected:", socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

// Helper functions for real-time updates
export const notifyAstrologerStatus = (astrologerId, isBusy) => {
  if (io) {
    io.emit("astrologerStatusUpdate", {
      astrologerId,
      isBusy
    });
  }
};

export const notifyAstrologerCallStatus = (astrologerId, isBusyCall) => {
  if (io) {
    io.emit("astrologerCallStatusUpdate", {
      astrologerId,
      isBusyCall,
      timestamp: new Date()
    });
  }
};

export const notifyNewChat = (astrologerId, chat) => {
  if (io) {
    io.to(`astrologer_${astrologerId}`).emit("newChat", chat);
  }
};

export const notifyNewCall = (astrologerId, call) => {
  if (io) {
    io.to(`astrologer_${astrologerId}`).emit("incomingCall", {
      call,
      timestamp: new Date(),
      userName: call.user?.name || "User"
    });
  }
};

export const notifyCallActivated = async (callId, callData) => {
  if (io) {
    console.log(`📢 Emitting callActivated for call ${callId}`);
    
    // Cache the call
    activeCallCache.set(callId, callData);
    
    // Emit to call room
    io.to(`call_${callId}`).emit("callActivated", {
      callId: callData._id,
      zegoRoomId: callData.zegoRoomId,
      callType: callData.callType,
      astrologerId: callData.astrologer?._id,
      userId: callData.user?._id,
      call: callData,
      timestamp: new Date()
    });
    
    // Also emit specifically to user and astrologer
    if (callData.user?._id) {
      io.to(`user_${callData.user._id}`).emit("callActivated", {
        callId: callData._id,
        zegoRoomId: callData.zegoRoomId,
        callType: callData.callType,
        astrologerId: callData.astrologer?._id,
        userId: callData.user._id,
        call: callData,
        timestamp: new Date()
      });
    }
    
    if (callData.astrologer?._id) {
      io.to(`astrologer_${callData.astrologer._id}`).emit("callActivated", {
        callId: callData._id,
        zegoRoomId: callData.zegoRoomId,
        callType: callData.callType,
        astrologerId: callData.astrologer._id,
        userId: callData.user?._id,
        call: callData,
        timestamp: new Date()
      });
    }
  }
};

export const notifyCallEnded = async (callId, endedBy, data = {}) => {
  if (io) {
    console.log(`📢 Emitting callEnded for call ${callId} ended by ${endedBy}`);
    
    // Clear from cache
    activeCallCache.delete(callId);
    
    // Get call data for notifications
    const call = await getCallData(callId);
    
    // Emit to call room
    io.to(`call_${callId}`).emit("callEnded", {
      callId,
      endedBy,
      ...data,
      timestamp: new Date()
    });
    
    // Emit to specific participants
    if (call?.user?._id) {
      io.to(`user_${call.user._id}`).emit("callEnded", {
        callId,
        endedBy,
        ...data,
        timestamp: new Date()
      });
    }
    
    if (call?.astrologer?._id) {
      io.to(`astrologer_${call.astrologer._id}`).emit("callEnded", {
        callId,
        endedBy,
        ...data,
        timestamp: new Date()
      });
    }
  }
};

export const notifyChatActivated = (chatId, chat) => {
  if (io) {
    io.to(`chat_${chatId}`).emit("chatActivated", chat);
    if (chat.user) {
      io.to(`user_${chat.user}`).emit("chatActivated", chat);
    }
  }
};

export const emitNewMessage = (message) => {
  if (io) {
    io.to(`chat_${message.chat}`).emit("newMessage", message);
    
    const recipientRoom = message.senderType === "user" 
      ? `astrologer_${message.astrologerId}`
      : `user_${message.userId}`;
    
    if (recipientRoom) {
      io.to(recipientRoom).emit("newMessageNotification", {
        chatId: message.chat,
        messageId: message._id,
        content: message.content,
        senderType: message.senderType
      });
    }
  }
};