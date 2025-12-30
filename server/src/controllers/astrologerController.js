// controllers/astrologer.controller.js
import Astrologer from "../models/Astrologer.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import Chat from "../models/Chat.js";
import AstrologerEarning from "../models/AstrologerEarning.js";


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
      certificationTitle
    } = req.body;

    const astrologer = new Astrologer({
      fullName,
      email,
      phone,
      bio,
      gender,
      age,
      availability,
      pricing: {
        chatPerMinute,
        callPerMinute
      },
      experienceYears,
      education,
      expertise: JSON.parse(req.body.expertise),
      languages: JSON.parse(req.body.languages),
      achievements: req.body.achievements
        ? JSON.parse(req.body.achievements)
        : []
    });

    if (req.files?.profileImage) {
      astrologer.profileImageUrl = req.files.profileImage[0].path;
    }

    if (req.files?.certificationFile) {
      astrologer.certifications = [{
        title: certificationTitle,
        fileUrl: req.files.certificationFile[0].path
      }];
    }

    await astrologer.save();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Registration failed" });
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
    const astrologers = await Astrologer.find({ isApproved: true })
      .select("-password");

    
    // 🔥 Find all busy astrologers
    const activeChats = await Chat.find(
      { status: "ACTIVE" },
      "astrologer"
    );

    const busyAstrologerIds = new Set(
      activeChats.map((c) => c.astrologer.toString())
    );

    const finalList = astrologers.map((a) => ({
      ...a.toObject(),
      isBusy: busyAstrologerIds.has(a._id.toString()),
    }));
   
    res.json(finalList);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getAstrologerProfile = async (req, res) => {
  try {

    const astrologer = await Astrologer.findById(req.params.id)
      .select("-password");

    if (!astrologer) {
      return res.status(404).json({ success: false, message: "Astrologer not found" });
    }

    res.json({
      success: true,
      astrologer,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const getAstrologerStats = async (req, res) => {
  try {
    const astrologerId = req.params.id;

    // Earnings
    const earnings = await AstrologerEarning.find({ astrologer: astrologerId });

    const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayEarnings = earnings
      .filter(e => e.createdAt >= today)
      .reduce((sum, e) => sum + e.amount, 0);

    // Chats
    const activeChats = await Chat.countDocuments({
      astrologer: astrologerId,
      status: "ACTIVE",
    });

    const waitingChats = await Chat.countDocuments({
      astrologer: astrologerId,
      status: "WAITING",
    });

    res.json({
      success: true,
      stats: {
        totalEarnings,
        todayEarnings,
        activeChats,
        waitingChats,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
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
