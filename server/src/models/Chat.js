// models/Chat.js
import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    astrologer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Astrologer",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["WAITING", "ACTIVE", "ENDED"],
      default: "WAITING",
      index: true,
    },

    ratePerMinute: {
      type: Number,
      required: true,
    },

    startedAt: Date,
    endedAt: Date,

    graceUntil: Date, // ⏱️ 5 min grace window
  },
  { timestamps: true }
);

// ❌ Prevent duplicate active/waiting chats
chatSchema.index(
  { user: 1, astrologer: 1 },
  { unique: true, partialFilterExpression: { status: { $ne: "ENDED" } } }
);

export default mongoose.model("Chat", chatSchema);
