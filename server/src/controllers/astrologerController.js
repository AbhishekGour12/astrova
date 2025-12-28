// controllers/astrologer.controller.js
import Astrologer from "../models/Astrologer.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import Chat from "../models/Chat.js";
export const registerAstrologer = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      age,
      gender,
      bio,
      expertise,
      languages,

      availability,
      chatPerMinute,
      callPerMinute,

      bankName,
      bankAccountNumber,
      ifsc,
    } = req.body;

    const astrologer = await Astrologer.create({
      fullName,
      email,
      phone,
      age,
      gender,
      bio,

      expertise: JSON.parse(expertise),
      languages: languages ? JSON.parse(languages) : ["English"],

      availability: availability || "CHAT",
      pricing: {
        chatPerMinute: Number(chatPerMinute) || 0,
        callPerMinute: Number(callPerMinute) || 0,
      },

      bankName,
      bankAccountNumber,
      ifsc,

      profileImageUrl: req.file
        ? `/uploads/products/${req.file.filename}`
        : "",

      isApproved: false,
    });

    res.status(201).json({
      success: true,
      message: "Astrologer registration submitted. Awaiting admin approval.",
      astrologerId: astrologer._id,
    });

  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
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