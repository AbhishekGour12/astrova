import mongoose from "mongoose";

const AstrologerProfileSchema = new mongoose.Schema({
  /* ================= BASIC INFO ================= */
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true, unique: true },

  age: Number,
  gender: { type: String, enum: ["Male", "Female", "Other"] },

  password: { type: String },

  /* ================= PROFILE ================= */
  bio: { type: String, required: true },

  expertise: { type: [String], required: true },
  languages: { type: [String], default: ["English", "Hindi"] },

  /* ================= EXPERIENCE ================= */
  experienceYears: { type: Number, default: 0 },
  education: String,
  achievements: { type: [String], default: [] },

  /* ================= CERTIFICATIONS ================= */
  certifications: [
    {
      title: String,
      fileUrl: String,
      uploadedAt: { type: Date, default: Date.now }
    }
  ],

  verificationDocuments: [{ type: String }],

  profileImageUrl: String,

  /* ================= AVAILABILITY ================= */
  availability: {
    type: String,
    enum: ["CHAT", "CALL", "BOTH", "MEET", "ALL"],
    default: "CHAT"
  },

  /* ================= PRICING ================= */
  pricing: {
    chatPerMinute: { type: Number, default: 0 },
    callPerMinute: { type: Number, default: 0 }
  },

  /* ================= STATUS ================= */
  isApproved: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  isAvailable: { type: Boolean, default: false },

  /* ================= BANK ================= */
  bankName: String,
  bankAccountNumber: String,
  ifsc: String,

  /* ================= EARNINGS ================= */
  totalEarnings: { type: Number, default: 0 },
  pendingEarnings: { type: Number, default: 0 },
  paidEarnings: { type: Number, default: 0 },

}, { timestamps: true });

export default mongoose.model("Astrologer", AstrologerProfileSchema);
