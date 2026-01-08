// models/AstrologerEarning.js
import mongoose from "mongoose";

const astrologerEarningSchema = new mongoose.Schema(
  {
    astrologer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Astrologer",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },
    call:{
      type : mongoose.Schema.Types.ObjectId,
      ref : "Call"
    },
    // CHAT / CALL
    serviceType: {
      type: String,
      enum: ["CHAT", "CALL"],
      required: true,
    },

    minutes: {
      type: Number,
      required: true,
    },

    ratePerMinute: {
      type: Number,
      required: true,
    },
   
    amount: {
      type: Number,
      required: true,
    },

    // PAYOUT STATUS
    isPaid: {
      type: Boolean,
      default: false,
    },

    payoutBatchId: {
      type: String, // weekly batch id
    },

    payoutDate: {
      type: Date,
    },
    notes:{
      type: String
    }
  },
  { timestamps: true }
);

export default mongoose.model("AstrologerEarning", astrologerEarningSchema);
