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
    lastBillingAt: Date,

    graceUntil: {
      type: Date,
      default: null
    },
    graceStartedAt: { 
      type: Date, 
      default: null 
    },
    
    // 🔥 CRITICAL: Track when billing was last paused/resumed
    billingPausedAt: {
      type: Date,
      default: null
    },
    
    totalPausedMs: { 
      type: Number, 
      default: 0 
    },
    
    // 🔥 Track active chat minutes (excluding grace period)
    activeMinutes: {
      type: Number,
      default: 0
    },
    
    // For accuracy
    lastWalletCheckAt: Date,
    
    totalMinutes: Number,
    totalAmount: Number,
    endReason: String,
  },
  { timestamps: true }
);

// Indexes for performance
chatSchema.index({ user: 1, astrologer: 1 }, { 
  unique: true, 
  partialFilterExpression: { status: { $ne: "ENDED" } } 
});
chatSchema.index({ graceUntil: 1 });
chatSchema.index({ status: 1, graceUntil: 1 });
chatSchema.index({ billingPausedAt: 1 });

export default mongoose.model("Chat", chatSchema);