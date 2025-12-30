import mongoose from "mongoose";
import { type } from "os";

const AstrologerProfileSchema = new mongoose.Schema(
  {
    /* ================= BASIC INFO ================= */
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true, unique: true },

    age: Number,
    gender: { type: String, enum: ["Male", "Female", "Other"] },

    // Password will be auto-generated after admin approval
    password: { type: String },

    /* ================= PROFILE ================= */
    bio: { type: String, required: true },

    // ✅ MUST BE ARRAY
    expertise: {
      type: [String],
      required: true,
      enum: ["Vedic", "Tarot", "Numerology", "Palmistry", "Vastu", "KP"]
    },

    languages: {
      type: [String],
      default: ["English", "Hindi"]
    },

    /* ================= PRICING ================= */
    minuteRate: { type: Number, default: 0 },

    /* ================= STATUS ================= */
    isAdmin: { type: Boolean, default: false }, // ✅ MAIN ADMIN ASTROLOGER
    isApproved: { type: Boolean, default: false },

    averageRating: { type: Number, default: 0 },
    totalConsultations: { type: Number, default: 0 },

    /* ================= CUSTOMIZATION ================= */
    customQuotes: { type: [String], default: [] },
    profileImageUrl: { type: String },

    /* ================= BANK DETAILS ================= */
    bankName: { type: String },
    bankAccountNumber: { type: String },
    ifsc: { type: String },
    idAdmin:{type: Boolean, default: false},

    /* ================= RAZORPAY X ================= */
    razorpayContactId: String,        // ❌ Admin ke liye null
    razorpayFundAccountId: String,    // ❌ Admin ke liye null

    /* ================= AVAILABILITY ================= */
availability: {
  type: String,
  enum: ["CHAT", "CALL", "BOTH"],
  default: "CHAT"
},

/* ================= PRICING ================= */
pricing: {
  chatPerMinute: { type: Number, default: 0 },
  callPerMinute: { type: Number, default: 0 }
},

// ADD inside AstrologerProfileSchema

/* ================= EARNINGS SUMMARY ================= */
totalEarnings: {
  type: Number,
  default: 0, // lifetime earnings
},

pendingEarnings: {
  type: Number,
  default: 0, // not yet paid
},

paidEarnings: {
  type: Number,
  default: 0, // already paid
},
isAvailable:{
  type: Boolean,
  default: false
}

  },
  { timestamps: true }
);

export default mongoose.model("Astrologer", AstrologerProfileSchema);
