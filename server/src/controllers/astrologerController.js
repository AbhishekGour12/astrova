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


const otpStore = new Map();
export const registerAstrologer = async (req, res) => {
  try {
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
      ifsc
    } = req.body;

    /* ================= BASIC VALIDATION ================= */
    if (!fullName || !email || !phone || !bio)
      return res.status(400).json({ message: "Missing required fields" });

    if (!/^[6-9]\d{9}$/.test(phone))
      return res.status(400).json({ message: "Invalid phone number" });

    const exists = await Astrologer.findOne({
      $or: [{ email }, { phone }]
    });
    if (exists)
      return res.status(400).json({ message: "Astrologer already registered" });

    /* ================= SERVICE-BASED VALIDATION ================= */
    if (["CHAT", "BOTH", "ALL"].includes(availability) && !chatPerMinute)
      return res.status(400).json({ message: "Chat rate required" });

    if (["CALL", "BOTH", "ALL"].includes(availability) && !callPerMinute)
      return res.status(400).json({ message: "Call rate required" });

    /* ================= FILE HANDLING ================= */
    const profileImage =
      req.files?.profileImage?.[0]?.filename;

    if (!profileImage)
      return res.status(400).json({ message: "Profile image required" });

    const certifications = [];
    if (req.files?.certificationFile?.[0]) {
      certifications.push({
        title: certificationTitle || "Certification",
        fileUrl: `/uploads/products/${req.files.certificationFile[0].filename}`
      });
    }

    const verificationDocuments =
      req.files?.verificationDocuments?.map(
        (f) => `/uploads/products/${f.filename}`
      ) || [];

    /* ================= CREATE ASTROLOGER ================= */
    const astrologer = new Astrologer({
      fullName,
      email,
      phone,
      bio,
      gender,
      age,
      availability,
      pricing: {
        chatPerMinute: Number(chatPerMinute || 0),
        callPerMinute: Number(callPerMinute || 0)
      },
      experienceYears,
      education,
      expertise: JSON.parse(req.body.expertise),
      languages: JSON.parse(req.body.languages),
      achievements: achievements ? JSON.parse(achievements) : [],
      bankName,
      bankAccountNumber,
      ifsc,
      profileImageUrl: `/uploads/products/${profileImage}`,
      certifications,
      verificationDocuments
    });

    await astrologer.save();

    res.json({
      success: true,
      message: "Registration submitted for admin approval"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Registration failed"
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
    const astrologerId = new mongoose.Types.ObjectId(req.params.id);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const earnings = await AstrologerEarning.aggregate([
      {
        $match: { astrologer: astrologerId }
      },

      // Create a single session id for chat or call
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

      // One row per chat/call
      {
        $group: {
          _id: "$sessionId",
          serviceType: { $first: "$serviceType" },
          totalForSession: { $max: "$amount" },
          createdAt: { $max: "$createdAt" }
        }
      },

      // Global totals
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
          },

          callEarnings: {
            $sum: {
              $cond: [
                { $eq: ["$serviceType", "CALL"] },
                "$totalForSession",
                0
              ]
            }
          },

          chatEarnings: {
            $sum: {
              $cond: [
                { $eq: ["$serviceType", "CHAT"] },
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
      todayEarnings: 0,
      callEarnings: 0,
      chatEarnings: 0
    };

    const activeChats = await Chat.countDocuments({
      astrologer: astrologerId,
      status: "ACTIVE"
    });

    const waitingChats = await Chat.countDocuments({
      astrologer: astrologerId,
      status: "WAITING"
    });

    res.json({
      success: true,
      stats: {
        ...stats,
        activeChats,
        waitingChats
      }
    });

  } catch (err) {
    console.error("Astrologer stats error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load stats"
    });
  }
};



export const toggleAstrologerAvailability = async (req, res) => {
  try {
    const {astrologerId} =  req.params;

    const astrologer = await Astrologer.findById(astrologerId);
    
    if (!astrologer) {
      return res.status(404).json({ success: false, message: "Astrologer not found" });
    }

    astrologer.isAvailable = !astrologer.isAvailable;
    await astrologer.save();

    res.json({
      success: true,
      isAvailable: astrologer.isAvailable,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



export const sendOTP = async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ success: false, message: "Phone required" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000);

  otpStore.set(phone, {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
  });

  
     // Country code (91)
const countryCode = phone.substring(1, 3);

// Mobile number
const mobile = phone.substring(3);

    // 3️⃣ Send SMS via CPaaS API
const response = await axios.get (`https://cpaas.socialteaser.com/restapi/request.php?authkey=6aa45940ce7d45f2&mobile=${mobile}&country_code=${countryCode}&sid=29289&name=Twinkle&otp=${otp}` );
      

  res.json({ success: true, message: "OTP sent successfully" });
};

export const verifyOTP = async (req, res) => {
  const { phone, otp } = req.body;

  const record = otpStore.get(phone);
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

  otpStore.delete(phone);
  res.json({ success: true, message: "Phone verified" });
};
