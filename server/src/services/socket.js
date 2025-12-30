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

    // Disconnect
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

export const notifyNewChat = (astrologerId, chat) => {
  if (io) {
    io.to(`astrologer_${astrologerId}`).emit("newChat", chat);
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