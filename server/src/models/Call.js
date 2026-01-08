import mongoose from "mongoose";

const callSchema = new mongoose.Schema(
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
    zegoRoomId: { // Changed from hmsRoomId
      type: String,
      index: true,
    },
    status: {
      type: String,
      enum: ["WAITING", "ACTIVE", "ENDED", "MISSED", "REJECTED"],
      default: "WAITING",
      index: true,
    },
    callType: {
      type: String,
      enum: ["AUDIO", "VIDEO"],
      default: "AUDIO",
    },
    ratePerMinute: {
      type: Number,
      required: true,
    },
    startedAt: Date,
    endedAt: Date,
    totalMinutes: Number,
    totalAmount: Number,
    peerDetails: {
      userPeerId: String,    // Zego user ID for user
      astroPeerId: String,   // Zego user ID for astrologer
    },
    endReason: {
      type: String,
      enum: ["user_ended", "astrologer_ended", "missed", "rejected", "error", "insufficient_balance"],
    },
  },
  { timestamps: true }
);

// Prevent duplicate active/waiting calls
callSchema.index(
  { user: 1, astrologer: 1 },
  { unique: true, partialFilterExpression: { status: { $in: ["WAITING", "ACTIVE"] } } }
);

export default mongoose.model("Call", callSchema);