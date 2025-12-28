import mongoose from "mongoose";

// models/Message.js
const messageSchema = new mongoose.Schema(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true, // 🔥 IMPORTANT
    },
    senderType: {
      type: String,
      enum: ["user", "astrologer"],
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    content: String,
    seen: { type: Boolean, default: false },
  },
  { timestamps: true }
);


export const Message = mongoose.model("Message", messageSchema);
