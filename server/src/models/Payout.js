import mongoose from "mongoose";
import { type } from "os";

const payoutSchema = new mongoose.Schema({
  astrologer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Astrologer",
    required: true
  },
  payoutId: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: "INR"
  },
  status: {
    type: String
  },
  method: {
    type: String,
    default: "bank_transfer"
  },
  purpose: {
    type: String,
    default: "payout"
  },
  mode: {
    type: String,
    enum: ["IMPS", "NEFT", "RTGS", "UPI", "MANUAL"],
    default: "IMPS"
  },
  referenceId: String,
  utr: String,
  fees: Number,
  tax: Number,
  settledAt: Date,
  initiatedAt: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: Map,
    of: String
  },
  payoutType: {
    type: String,
    enum: ["WEEKLY", "MANUAL", "AUTO"],
    default: "WEEKLY"
  },
  weekStartDate: Date,
  weekEndDate: Date,
  totalEarnings: Number,
  totalSessions: Number,
  chatSessions: Number,
  callSessions: Number,
  chatEarnings: Number,
  callEarnings: Number,
  // Manual payment details
  manualPaymentDetails: {
    paymentDate: Date,
    paymentMode: String,
    transactionId: String,
    paidBy: {
      type: String,
    },
    screenshot: String,
    notes: String
  },
   // Linked earnings
  earningIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "AstrologerEarning"
  }],
  
},


 {
  timestamps: true
});
// Compound index for efficient queries
payoutSchema.index({ astrologer: 1, status: 1, createdAt: -1 });
payoutSchema.index({ weekStartDate: 1, weekEndDate: 1 });
payoutSchema.index({ payoutType: 1, status: 1 });

const Payout = mongoose.models.Payout || mongoose.model("Payout", payoutSchema);
export default Payout;