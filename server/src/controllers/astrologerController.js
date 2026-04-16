// controllers/astrologer.controller.js
import Astrologer from "../models/Astrologer.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import Chat from "../models/Chat.js";
import AstrologerEarning from "../models/AstrologerEarning.js";
import Call from "../models/Call.js";
import axios from "axios";
import mongoose from "mongoose";
import Review from "../models/Review.js";
import { getIO } from "../services/socket.js";


const otpStore = new Map();
export const registerAstrologer = async (req, res) => {
  try {
    // Parse text fields (sent as JSON strings from frontend)
    const {
      fullName,
      email,
      phone,
      bio,
      gender,
      age,
      availability,
      chatPerMinute,
      callPerMinute,
      experienceYears,
      education,
      certificationTitle,
      achievements,
      bankName,
      bankAccountNumber,
      ifsc,
      expertise,      // JSON string
      languages       // JSON string
    } = req.body;

    // 1. Phone number cleaning and validation
    let cleanedPhone = phone.replace(/\D/g, "");
    if (cleanedPhone.length === 12 && cleanedPhone.startsWith("91")) {
      cleanedPhone = `+${cleanedPhone}`;
    } else if (cleanedPhone.length === 10) {
      cleanedPhone = `+91${cleanedPhone}`;
    } else {
      return res.status(400).json({ message: "Please enter a valid 10-digit phone number" });
    }
    const finalPhoneRegex = /^\+91[6-9]\d{9}$/;
    if (!finalPhoneRegex.test(cleanedPhone)) {
      return res.status(400).json({ message: "Invalid Indian phone number" });
    }

    // Required fields check
    if (!fullName || !email || !phone || !bio)
      return res.status(400).json({ message: "Missing required fields" });

    // Check existing astrologer
    const exists = await Astrologer.findOne({
      $or: [{ email: email }, { phone: cleanedPhone }]
    });
    if (exists)
      return res.status(400).json({ message: "Email or phone already registered" });

    // Service-based validation
    if (["CHAT", "BOTH", "ALL"].includes(availability) && !chatPerMinute)
      return res.status(400).json({ message: "Chat rate required" });
    if (["CALL", "BOTH", "ALL"].includes(availability) && !callPerMinute)
      return res.status(400).json({ message: "Call rate required" });

    // ========== USE PROCESSED FILES FROM MIDDLEWARE ==========
    const files = req.processedAstrologerFiles || {};

    if (!files.profileImage)
      return res.status(400).json({ message: "Profile image required" });

    // Certifications (already an array of objects with title, fileUrl, uploadedAt)
    let certifications = [];
    if (files.certifications && files.certifications.length) {
      certifications = files.certifications.map((cert, index) => ({
        title: cert.title || (certificationTitle ? `${certificationTitle} ${index + 1}` : `Certification ${index + 1}`),
        fileUrl: cert.fileUrl,
        uploadedAt: cert.uploadedAt || new Date(),
        mimetype: cert.mimetype
      }));
    }

    // Verification documents (array of file paths)
    const verificationDocuments = files.verificationDocuments || [];

    // Parse JSON fields
    let parsedExpertise = [];
    let parsedLanguages = [];
    let parsedAchievements = [];
    try {
      parsedExpertise = expertise ? JSON.parse(expertise) : [];
      parsedLanguages = languages ? JSON.parse(languages) : [];
      parsedAchievements = achievements ? JSON.parse(achievements) : [];
    } catch (err) {
      return res.status(400).json({ message: "Invalid JSON format for expertise/languages/achievements" });
    }

    // Create astrologer
    const astrologer = new Astrologer({
      fullName,
      email,
      phone: cleanedPhone,
      bio,
      gender,
      age: age ? Number(age) : undefined,
      availability,
      pricing: {
        chatPerMinute: Number(chatPerMinute || 0),
        callPerMinute: Number(callPerMinute || 0)
      },
      experienceYears: Number(experienceYears) || 0,
      education,
      expertise: parsedExpertise,
      languages: parsedLanguages,
      achievements: parsedAchievements,
      bankName,
      bankAccountNumber,
      ifsc,
      profileImageUrl: files.profileImage,      // Already WebP path from middleware
      certifications,
      verificationDocuments,
      isApproved: false   // Pending admin approval
    });

    await astrologer.save();

    res.json({
      success: true,
      message: "Registration submitted for admin approval"
    });

  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Registration failed"
    });
  }
};




export const astrologerLogin = async (req, res) => {
  const { email, password } = req.body;
  
  const astrologer = await Astrologer.findOne({ email });
  console.log(astrologer)
  if (!astrologer || !astrologer.isApproved)
    return res.status(401).json({ message: "Account not approved" });


  const isMatch = await bcrypt.compare(password, astrologer.password);
  if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { id: astrologer._id, role: "astrologer" },
    process.env.JWT_SECRET || "123456",
    { expiresIn: "7d" }
  );

  res.json({
    token,
    astrologer: {
      id: astrologer._id,
      name: astrologer.fullName,
      role: "astrologer"
    }
  });
};


export const getAllAstrologers = async (req, res) => {
  try {
    const { service = "ALL" } = req.query;

    /* ===============================
       BASE FILTER (Availability)
    =============================== */
    let filter = { isApproved: true };

    if (service === "CHAT") {
      filter.availability = { $in: ["CHAT", "BOTH", "ALL"] };
    }

    if (service === "CALL") {
      filter.availability = { $in: ["CALL", "BOTH", "ALL"] };
    }

    if (service === "MEET") {
      filter.availability = { $in: ["MEET", "ALL"] };
    }

    // service === "ALL" → no availability filter

    /* ===============================
       FETCH DATA + RATINGS (Aggregation)
    =============================== */
    const astrologers = await Astrologer.aggregate([
      // 1. Apply your existing filters
      { $match: filter },

      // 2. Join with Reviews collection
      {
        $lookup: {
          from: "reviews", // Must match your MongoDB collection name (usually lowercase plural)
          localField: "_id",
          foreignField: "astrologer",
          as: "reviewsData"
        }
      },

      // 3. Calculate Average Rating & Count
      {
        $addFields: {
          totalReviews: { $size: "$reviewsData" },
          averageRating: {
            $cond: {
              if: { $gt: [{ $size: "$reviewsData" }, 0] },
              then: { $avg: "$reviewsData.rating" },
              else: 0 // Default if no reviews
            }
          }
        }
      },

      // 4. Remove heavy reviews array & sensitive info
      {
        $project: {
          reviewsData: 0,
          password: 0,
          __v: 0
        }
      },

      // 5. Optional: Sort by Rating (High to Low)
      { $sort: { averageRating: -1 } }
    ]);

    /* ===============================
       BUSY LOGIC (Existing Code)
    =============================== */

    let busyChatAstrologerIds = new Set();
    let busyCallAstrologerIds = new Set();

    // CHAT busy (skip for MEET-only page)
    if (service !== "MEET") {
      const activeChats = await Chat.find(
        { status: "ACTIVE" },
        "astrologer"
      );
      activeChats.forEach(c =>
        busyChatAstrologerIds.add(c.astrologer.toString())
      );
    }

    // CALL busy (skip for MEET-only page)
    if (service !== "MEET") {
      const activeCalls = await Call.find(
        { status: "ACTIVE" },
        "astrologer"
      );
      activeCalls.forEach(c =>
        busyCallAstrologerIds.add(c.astrologer.toString())
      );
    }

    /* ===============================
       FINAL RESPONSE
    =============================== */
    const finalList = astrologers.map(a => {
      const id = a._id.toString();

      return {
        ...a, // Note: Removed .toObject() because aggregation already returns plain objects

        // Chat busy only if astrologer supports chat
        isBusyChat:
          ["CHAT", "BOTH", "ALL"].includes(a.availability) &&
          busyChatAstrologerIds.has(id),

        // Call busy only if astrologer supports call
        isBusyCall:
          ["CALL", "BOTH", "ALL"].includes(a.availability) &&
          busyCallAstrologerIds.has(id),

        // Unified busy flag (frontend friendly)
        isBusy:
          service === "MEET"
            ? false
            : busyChatAstrologerIds.has(id) ||
              busyCallAstrologerIds.has(id),
      };
    });

    res.json(finalList);
  } catch (err) {
    console.error("getAllAstrologers error:", err);
    res.status(500).json({ message: "Failed to fetch astrologers" });
  }
};

export const getAstrologerProfile = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Fetch Astrologer
    const astrologer = await Astrologer.findById(id).select("-password");
    if (!astrologer) {
      return res.status(404).json({ success: false, message: "Astrologer not found" });
    }

    // 2. Fetch All Reviews (Just fields needed for calculation)
    const reviews = await Review.find({ astrologer: id }).select("rating");

    // 3. Calculate Average & Breakdown Manually
    const totalReviews = reviews.length;
    let averageRating = 0;
    
    // Initialize breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    if (totalReviews > 0) {
      const sum = reviews.reduce((acc, curr) => {
        // Count distribution
        const r = Math.round(curr.rating); // Ensure integer for key
        ratingDistribution[r] = (ratingDistribution[r] || 0) + 1;
        return acc + curr.rating;
      }, 0);
      
      averageRating = (sum / totalReviews).toFixed(1); // e.g., "4.5"
    }

    res.json({
      success: true,
      astrologer,
      reviewStats: {
        totalReviews,
        averageRating,
        ratingDistribution // Send the breakdown (e.g., 5 star: 10, 4 star: 2)
      }
    });

  } catch (err) {
    console.error("Profile Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
export const getAstrologerStats = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing Astrologer ID"
      });
    }
    
    const astrologerId = new mongoose.Types.ObjectId(id);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch earnings stats
    const earnings = await AstrologerEarning.aggregate([
      {
        $match: { astrologer: astrologerId }
      },
      {
        $project: {
          amount: 1,
          createdAt: 1,
          serviceType: 1,
          sessionId: {
            $cond: [
              { $eq: ["$serviceType", "CALL"] },
              "$call",
              "$chat"
            ]
          }
        }
      },
      {
        $group: {
          _id: "$sessionId",
          serviceType: { $first: "$serviceType" },
          totalForSession: { $max: "$amount" },
          createdAt: { $max: "$createdAt" }
        }
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: "$totalForSession" },
          todayEarnings: {
            $sum: {
              $cond: [
                { $gte: ["$createdAt", today] },
                "$totalForSession",
                0
              ]
            }
          }
        }
      }
    ]);

    const stats = earnings[0] || {
      totalEarnings: 0,
      todayEarnings: 0
    };

    // Get chat stats
    const activeChats = await Chat.countDocuments({
      astrologer: astrologerId,
      status: "ACTIVE"
    });

    const waitingChats = await Chat.countDocuments({
      astrologer: astrologerId,
      status: "WAITING"
    });

    // Get call stats - ADD THIS
    const waitingCalls = await Call.countDocuments({
      astrologer: astrologerId,
      status: "WAITING"
    });

    const activeCalls = await Call.countDocuments({
      astrologer: astrologerId,
      status: "ACTIVE"
    });

    res.json({
      success: true,
      stats: {
        ...stats,
        activeChats,
        waitingChats,
        waitingCalls,  // Add this
        activeCalls    // Add this
      }
    });

  } catch (err) {
    console.log("Astrologer stats error:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to load stats"
    });
  }
};



export const toggleAstrologerAvailability = async (req, res) => {
  try {
    const {astrologerId} =  req.params;
    const io = getIO()
    const astrologer = await Astrologer.findById(astrologerId);
    
    if (!astrologer) {
      return res.status(404).json({ success: false, message: "Astrologer not found" });
    }

    astrologer.isAvailable = !astrologer.isAvailable;
    await astrologer.save();
   
     if (io) {
      io.emit('astrologerAvailabilityChanged', {
         astrologerId,
         isAvailable: astrologer.isAvailable,
         name: astrologer.fullName
       });
     }
    res.json({
      success: true,
       message: `Successfully ${astrologer.isAvailable ? 'online' : 'offline'}`,
      isAvailable: astrologer.isAvailable,
      astrologer: {
        id: astrologer._id,
        fullName: astrologer.fullName,
        isAvailable: astrologer.isAvailable
      }
      
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const sendOTP = async (req, res) => {
  let { phone } = req.body;
try{
  if (!phone) return res.status(500).json({ success: false, message: "Phone required" });

  // 1. Strip and Clean
  let cleaned = phone.replace(/\D/g, "");
  let tenDigitNumber = "";

  if (cleaned.length === 10) {
    tenDigitNumber = cleaned;
  } else if (cleaned.length === 12 && cleaned.startsWith("91")) {
    tenDigitNumber = cleaned.substring(2);
  } else {
    return res.status(400).json({ success: false, message: "Invalid mobile number length" });
  }

  // 2. VALIDATION: Check if it starts with 6, 7, 8, or 9
  if (!/^[6-9]/.test(tenDigitNumber)) {
    return res.status(400).json({ success: false, message: "Invalid Indian mobile number (Must start with 6-9)" });
  }

  const normalizedPhone = `+91${tenDigitNumber}`;

  // 3. Database Check
  const user = await Astrologer.findOne({ phone: normalizedPhone });
  
  if (user) {
    return res.status(400).json({ success: false, message: "Phone number already registered" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStore.set(normalizedPhone, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

  
    // Note: CPaaS API uses '91' for countryCode and the '10-digit' for mobile
    await axios.get(
      `https://cpaas.socialteaser.com/restapi/request.php?authkey=6aa45940ce7d45f2&mobile=${tenDigitNumber}&country_code=91&sid=29289&name=Twinkle&otp=${otp}`
    );
    res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.log(error)
    res.status(400).json({ success: false, message: error.message || "Failed to send OTP" });
  }
};

export const verifyOTP = async (req, res) => {
  const { phone, otp } = req.body;
 const normalizedPhone = `+91${phone}`;
  const record = otpStore.get(normalizedPhone);
  
  if (!record) {
    return res.status(400).json({ success: false, message: "OTP expired or not found" });
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(phone);
    return res.status(400).json({ success: false, message: "OTP expired" });
  }
  
  if (record.otp.toString() !== otp.toString()) {
    return res.status(400).json({ success: false, message: "Invalid OTP" });
  }

  otpStore.delete(normalizedPhone);
  res.json({ success: true, message: "Phone verified" });
};
