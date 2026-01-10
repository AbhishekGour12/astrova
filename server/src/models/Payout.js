import mongoose from "mongoose";

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
    type: String,
    enum: ["CREATED", "PROCESSING", "PROCESSED", "REVERSED", "FAILED", "QUEUED"],
    default: "CREATED"
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
    enum: ["IMPS", "NEFT", "RTGS", "UPI"],
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
  callEarnings: Number
}, {
  timestamps: true
});

const Payout = mongoose.models.Payout || mongoose.model("Payout", payoutSchema);
export default Payout;