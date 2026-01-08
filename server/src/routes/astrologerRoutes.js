// routes/astrologer.routes.js
import express from "express";
import { astrologerLogin, getAllAstrologers, getAstrologerProfile, getAstrologerStats, registerAstrologer, sendOTP, toggleAstrologerAvailability, verifyOTP } from "../controllers/astrologerController.js";

import { uploadAstrologerFiles} from "../utils/multer.js";
import Chat from "../models/Chat.js";


const router = express.Router();

router.post("/register",  uploadAstrologerFiles.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "certificationFile", maxCount: 1 },
    {name: "verificationDocuments", maxCount: 5}
  ]), registerAstrologer);
router.post("/login", astrologerLogin);
router.get("/", getAllAstrologers)
// 🔥 NEW ROUTES (Dashboard)
router.get("/profile/:id",   getAstrologerProfile);
router.get("/stats/:id", getAstrologerStats);
router.post("/toggle-availability/:astrologerId",  toggleAstrologerAvailability);
router.get('/:id/stats', async (req, res) => {
  try {
    const astrologerId = req.params.id;
    
    // Get total sessions
    const totalSessions = await Chat.countDocuments({
      astrologer: astrologerId,
      status: "COMPLETED"
    });
    
    // Get satisfaction rate (you need to implement review system)
    const satisfactionRate = 98; // Placeholder
    
    res.json({
      success: true,
      stats: {
        totalSessions,
        satisfactionRate,
        responseTime: "Within 5 mins"
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP)
export default router;
