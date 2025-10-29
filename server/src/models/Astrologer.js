import mongoose from "mongoose";

const AstrologerProfileSchema =  new mongoose.Schema({
    // This ID links the profile to the User (regardless of role: User, Admin, or Astrologer)
    userId: { type: String, required: true, unique: true, ref: 'User' }, 
    
    // Core Profile
    bio: { type: String, required: true },
    expertise: { type: [String], required: true }, // e.g., ['Vedic', 'Tarot', 'Numerology']
    languages: { type: [String], default: ['English'] },
    
    // Marketplace Metrics (Phase 2)
    hourlyRate: { type: Number, default: 0 }, 
    isApproved: { type: Boolean, default: false }, // Only true for marketplace astrologers
    averageRating: { type: Number, default: 0 },
    totalConsultations: { type: Number, default: 0 },

    // Content Customization (Phase 1/2 Requirement: UPLOAD QUOTES/IMAGES)
    customQuotes: { type: [String] }, // For display on profile page
    profileImageUrl: { type: String },
    bankName:{type: String},
    bankAccountNumber: {type: Number},
    ifsc: {type: String}

    // For profile image

});

const Astrologer = mongoose.model("astrologer", AstrologerProfileSchema);

export default Astrologer;
