import { Server } from "socket.io";
import { startBillingInterval, stopBillingInterval } from "./chatBilling.js";
import { Message } from "../models/Message.js"; // Add this import


let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ["websocket", "polling"]
  });

  io.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.id);

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
    socket.on("astrologerJoinCallRoom", ({ callId, astrologerId }) => {
  socket.join(`call_${callId}`);
  socket.join(`astrologer_${astrologerId}`);
  console.log(`Astrologer ${astrologerId} joined call room ${callId}`);
  
  // Notify user that astrologer joined
  socket.to(`call_${callId}`).emit("astrologerJoinedCall", {
    astrologerId,
    callId,
    timestamp: new Date()
  });
});
   

    // Send message (Remove the temporary message creation here)
    socket.on("sendMessage", async (data) => {
      try {
        const { chatId, senderType, senderId, content } = data;
        
        // DON'T create temporary message here - let the API handle it
        // The API will save to DB and then emit the actual message
        
        // Just forward the request to the appropriate recipient
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
    senderRole, // "user" | "astrologer"
    isTyping
  });
});


    // Message seen
    socket.on("messageSeen", ({ chatId, messageId }) => {
      // Update in database
      Message.findByIdAndUpdate(messageId, { seen: true }, { new: true })
        .then(updatedMessage => {
          // Emit to both participants
          io.to(`chat_${chatId}`).emit("messageSeenUpdate", {
            messageId: updatedMessage._id,
            seen: true,
            updatedAt: updatedMessage.updatedAt
          });
        })
        .catch(err => console.error("Error marking message as seen:", err));
    });

    // Chat started - start billing
    socket.on("chatStarted", ({ chatId }) => {
      startBillingInterval(chatId);
    });

    // Chat ended - stop billing
    socket.on("chatEnded", ({ chatId }) => {
      stopBillingInterval(chatId);
    });

    // User joins call room
socket.on("joinZegoCall", ({ callId, userId, roomId }) => {
  socket.join(`call_${callId}`);
  socket.join(`zego_room_${roomId}`);
  socket.join(`user_${userId}`);
  console.log(`User ${userId} joined Zego call room ${roomId}`);
  
  // Emit user joined event to astrologer
  socket.to(`call_${callId}`).emit("zegoUserJoined", { 
    userId,
    roomId 
  });
});

// Astrologer joins call room
socket.on("joinAstrologerZegoCall", ({ callId, astrologerId, roomId }) => {
  socket.join(`call_${callId}`);
  socket.join(`zego_room_${roomId}`);
  socket.join(`astrologer_${astrologerId}`);
  console.log(`Astrologer ${astrologerId} joined Zego call room ${roomId}`);
  
  // Emit astrologer joined event to user
  socket.to(`call_${callId}`).emit("zegoAstrologerJoined", { 
    astrologerId,
    roomId 
  });
});

// Zego call quality events
socket.on("zegoCallQuality", ({ callId, quality, userId, astrologerId }) => {
  socket.to(`call_${callId}`).emit("zegoCallQualityUpdate", { 
    userId,
    astrologerId,
    quality 
  });
});

// Zego mute/unmute events
socket.on("zegoToggleAudio", ({ callId, isMuted, userId, astrologerId }) => {
  socket.to(`call_${callId}`).emit("zegoAudioToggled", { 
    userId,
    astrologerId,
    isMuted 
  });
});

// Zego participant left (for reconnection handling)
socket.on("zegoParticipantLeft", ({ callId, userId, astrologerId, roomId }) => {
  socket.to(`call_${callId}`).emit("zegoParticipantDisconnected", {
    userId,
    astrologerId,
    roomId,
    timestamp: new Date()
  });
});

// Zego participant rejoined
socket.on("zegoParticipantRejoined", ({ callId, userId, astrologerId, roomId }) => {
  socket.to(`call_${callId}`).emit("zegoParticipantReconnected", {
    userId,
    astrologerId,
    roomId,
    timestamp: new Date()
  });
});
  // User joins call room
socket.on("joinCallRoom", ({ callId, userId }) => {
  socket.join(`call_${callId}`);
  socket.join(`user_${userId}`);
  console.log(`User ${userId} joined call room ${callId}`);
  
  // Emit user joined event to astrologer
  socket.to(`call_${callId}`).emit("userJoinedCall", { userId });
});

// Astrologer joins call room
socket.on("joinAstrologerCallRoom", ({ callId, astrologerId }) => {
  socket.join(`call_${callId}`);
  socket.join(`astrologer_${astrologerId}`);
  console.log(`Astrologer ${astrologerId} joined call room ${callId}`);
  
  // Emit astrologer joined event to user
  socket.to(`call_${callId}`).emit("astrologerJoinedCall", { astrologerId });
});

// Call signaling for WebRTC (if using direct WebRTC instead of 100ms)
socket.on("callSignal", ({ callId, signal, to }) => {
  socket.to(`call_${callId}`).emit("callSignal", { 
    signal, 
    from: socket.id 
  });
});

// ICE candidate exchange
socket.on("iceCandidate", ({ callId, candidate, to }) => {
  socket.to(`call_${callId}`).emit("iceCandidate", { 
    candidate, 
    from: socket.id 
  });
});

// Mute/Unmute events
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

// Call quality events
socket.on("callQuality", ({ callId, quality, userId, astrologerId }) => {
  socket.to(`call_${callId}`).emit("callQualityUpdate", { 
    userId,
    astrologerId,
    quality 
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

// Call recording events
socket.on("callRecording", ({ callId, isRecording, userId, astrologerId }) => {
  socket.to(`call_${callId}`).emit("callRecordingUpdate", { 
    userId,
    astrologerId,
    isRecording 
  });
});

// Screen sharing events
socket.on("screenShare", ({ callId, isSharing, userId, astrologerId }) => {
  socket.to(`call_${callId}`).emit("screenShareUpdate", { 
    userId,
    astrologerId,
    isSharing 
  });
});

// Call started - start billing
socket.on("callStarted", ({ callId }) => {
  const { startCallBillingInterval } = require("./services/callBilling.js");
  startCallBillingInterval(callId);
});

// Call ended - stop billing
socket.on("callEnded", ({ callId }) => {
  const { stopCallBillingInterval } = require("./services/callBilling.js");
  stopCallBillingInterval(callId);
});

// User/astrologer left call but didn't end it (page refresh)
socket.on("leftCallTemporarily", ({ callId, userId, astrologerId }) => {
  socket.to(`call_${callId}`).emit("participantLeftTemporarily", {
    userId,
    astrologerId,
    timestamp: new Date()
  });
});

// User/astrologer rejoined call
socket.on("rejoinedCall", ({ callId, userId, astrologerId }) => {
  socket.to(`call_${callId}`).emit("participantRejoined", {
    userId,
    astrologerId,
    timestamp: new Date()
  });
});

// Network quality events
socket.on("networkQuality", ({ callId, quality, userId, astrologerId }) => {
  socket.to(`call_${callId}`).emit("networkQualityUpdate", {
    userId,
    astrologerId,
    quality
  });
});
  

    // Disconnect
    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected:", socket.id);
      // Clean up if user was in a call
      
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
      timestamp: new Date()
    });
  }
};

// In socket.js, add logging for callActivated emission:

export const notifyCallActivated = (callId, call) => {
  if (io) {
    console.log(`📢 Emitting callActivated for call ${callId}`, {
      callId,
      zegoRoomId: call.zegoRoomId,
      userId: call.user?._id,
      astrologerId: call.astrologer?._id
    });
    
    io.to(`call_${callId}`).emit("callActivated", {
      call,
      timestamp: new Date()
    });
    
    if (call.user) {
      console.log(`📢 Emitting callActivated to user ${call.user}`);
      io.to(`user_${call.user}`).emit("callActivated", {
        call,
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

// New function to emit messages after they're saved to DB
export const emitNewMessage = (message) => {
  if (io) {
    io.to(`chat_${message.chat}`).emit("newMessage", message);
    
    // Also notify the recipient if they're not in the chat room
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